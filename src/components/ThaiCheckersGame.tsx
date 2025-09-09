'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GameState, Position, Move, AIRecommendation, Piece } from '@/types/game'
import { createInitialBoard, getPossibleMovesForPiece, getPossibleMoves, makeMove as makeMoveOnBoard, isGameOver } from '@/lib/gameLogic'
import { getBestMove, getAllPossibleMovesWithScores } from '@/lib/minimax'
import GameBoard from './GameBoard'
import AIAssistant from './AIAssistant'
import ChatBot from './ChatBot'

export default function ThaiCheckersGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createInitialBoard(),
    currentPlayer: 'black', // Black starts (player at bottom)
    selectedPosition: null,
    possibleMoves: [],
    gameOver: false,
    winner: null,
    mandatoryCapture: false,
    penaltyPiece: null
  }))
  
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [animatingMove, setAnimatingMove] = useState<Move | null>(null)
  const [capturedPieces, setCapturedPieces] = useState<Position[]>([])
  const [promotingPiece, setPromotingPiece] = useState<Position | null>(null)
  const [aiProcessing, setAiProcessing] = useState(false)
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get AI recommendations when it's the player's turn
  useEffect(() => {
    if (!gameState.gameOver && gameState.currentPlayer === 'black' && showRecommendations) {
      setIsCalculating(true)
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        const recommendations = getAllPossibleMovesWithScores(gameState.board, 'black', 4)
        setAiRecommendations(recommendations.slice(0, 5)) // Show top 5 moves
        setIsCalculating(false)
      }, 100)
    }
  }, [gameState.board, gameState.currentPlayer, gameState.gameOver, showRecommendations])

  const makeMove = useCallback((move: Move) => {
    // Start animation
    setAnimatingMove(move)
    
    // Highlight captured pieces if any
    if (move.captures && move.captures.length > 0) {
      setCapturedPieces(move.captures)
    }
    
    // Get current state for the piece check
    const piece = gameStateRef.current.board[move.from.row][move.from.col]
    const willPromote = piece && piece.type === 'man' && (
      (piece.player === 'red' && move.to.row === 7) ||
      (piece.player === 'black' && move.to.row === 0)
    )
    
    // Apply move after animation delay
    setTimeout(() => {
      const currentState = gameStateRef.current
      const newBoard = makeMoveOnBoard(currentState.board, move)
      const nextPlayer = currentState.currentPlayer === 'red' ? 'black' : 'red'
      const gameStatus = isGameOver(newBoard, nextPlayer)

      setGameState({
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPosition: null,
        possibleMoves: [],
        gameOver: gameStatus.gameOver,
        winner: gameStatus.winner,
        mandatoryCapture: false,
        penaltyPiece: null
      })
      
      // Clear animations immediately
      setAnimatingMove(null)
      setCapturedPieces([])
      
      // Show promotion animation if needed
      if (willPromote) {
        setPromotingPiece(move.to)
        setTimeout(() => setPromotingPiece(null), 1000)
      }
      
    }, 600) // Animation duration
  }, [])

  // Use ref to store current game state for AI
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

  // Create refs for AI processing state
  const aiProcessingRef = useRef(aiProcessing)
  aiProcessingRef.current = aiProcessing
  
  const animatingMoveRef = useRef(animatingMove)
  animatingMoveRef.current = animatingMove

  // Separate effect to handle AI moves - only triggered when currentPlayer or gameOver changes
  useEffect(() => {
    console.log('AI useEffect triggered:', {
      currentPlayer: gameState.currentPlayer,
      gameOver: gameState.gameOver
    })
    
    // Use setTimeout to check conditions after state has settled
    const checkAIMove = setTimeout(() => {
      const currentState = gameStateRef.current
      const isProcessing = aiProcessingRef.current
      const isAnimating = animatingMoveRef.current
      
      if (currentState.currentPlayer === 'red' && !currentState.gameOver && !isProcessing && !isAnimating) {
        console.log('AI turn started - setting up timeout')
        setAiProcessing(true)
        
        const aiTimeoutId = setTimeout(() => {
          console.log('AI timeout executed - making move')
          const gameState = gameStateRef.current
          const aiRecommendation = getBestMove(gameState.board, 'red', 6)
          if (aiRecommendation) {
            console.log('AI found move:', aiRecommendation.move)
            makeMove(aiRecommendation.move)
          } else {
            console.log('AI found no valid moves')
          }
          setAiProcessing(false)
        }, 1500)

        aiTimeoutRef.current = aiTimeoutId
      }
    }, 100) // Small delay to let animations settle
    
    return () => clearTimeout(checkAIMove)
  }, [gameState.currentPlayer, gameState.gameOver])

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (animatingMove || aiProcessing) return

    setGameState(prevState => {
      if (prevState.gameOver) return prevState

      const clickedPosition = { row, col }
      const piece = prevState.board[row][col]

      // If clicking on own piece, select it
      if (piece && piece.player === prevState.currentPlayer) {
        const possibleMoves = getPossibleMovesForPiece(prevState.board, clickedPosition)
        const allPlayerMoves = getPossibleMoves(prevState.board, prevState.currentPlayer)
        const hasCaptures = allPlayerMoves.some(move => move.captures && move.captures.length > 0)
        
        // If there are captures available but this piece can't capture, show warning
        if (hasCaptures && !possibleMoves.some(move => move.captures && move.captures.length > 0)) {
          // This piece cannot capture, but captures are mandatory
          return {
            ...prevState,
            selectedPosition: clickedPosition,
            possibleMoves: [], // No moves allowed for non-capturing pieces when captures are available
            mandatoryCapture: true
          }
        }
        
        return {
          ...prevState,
          selectedPosition: clickedPosition,
          possibleMoves,
          mandatoryCapture: hasCaptures
        }
      }

      // If a piece is selected and clicking on a valid move destination
      if (prevState.selectedPosition) {
        const validMove = prevState.possibleMoves.find(
          move => move.to.row === row && move.to.col === col
        )

        if (validMove) {
          // Make the move immediately without setTimeout
          makeMove(validMove)
          return {
            ...prevState,
            selectedPosition: null,
            possibleMoves: []
          }
        } else {
          // Deselect if clicking on invalid square
          return {
            ...prevState,
            selectedPosition: null,
            possibleMoves: []
          }
        }
      }

      return prevState
    })
  }, [animatingMove, aiProcessing, makeMove])

  const resetGame = useCallback(() => {
    // Clear any pending AI timeout
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }
    
    // Reset all states
    setAiProcessing(false)
    setAnimatingMove(null)
    setCapturedPieces([])
    setPromotingPiece(null)
    setAiRecommendations([])
    
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'black',
      selectedPosition: null,
      possibleMoves: [],
      gameOver: false,
      winner: null,
      mandatoryCapture: false,
      penaltyPiece: null
    })
  }, [])

  const makeAIMove = useCallback(async () => {
    if (gameState.currentPlayer !== 'red' || gameState.gameOver) return

    setIsCalculating(true)
    
    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      const aiRecommendation = getBestMove(gameState.board, 'red', 6)
      if (aiRecommendation) {
        makeMove(aiRecommendation.move)
      }
      setIsCalculating(false)
    }, 100)
  }, [gameState, makeMove])

  const toggleRecommendations = useCallback(() => {
    setShowRecommendations(prev => !prev)
  }, [])

  // Function to serialize board state for AI
  const serializeBoardForAI = useCallback((board: (Piece | null)[][]): string => {
    let boardString = "กระดาน 8x8 (มุมซ้ายบน = A8, มุมขวาล่าง = H1):\n"
    boardString += "   A B C D E F G H\n"
    
    for (let row = 0; row < 8; row++) {
      boardString += `${8 - row}  `
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col]
        if (piece) {
          if (piece.type === 'king') {
            boardString += piece.player === 'red' ? 'R♔' : 'B♔'
          } else {
            boardString += piece.player === 'red' ? 'r●' : 'b●'
          }
        } else if ((row + col) % 2 === 1) {
          boardString += ' ○' // playable empty square
        } else {
          boardString += ' ■' // non-playable square
        }
        boardString += ' '
      }
      boardString += `${8 - row}\n`
    }
    
    boardString += "   A B C D E F G H\n"
    boardString += "\nสัญลักษณ์: r●=หมากแดงธรรมดา, R♔=หมากราชาแดง, b●=หมากดำธรรมดา, B♔=หมากราชาดำ, ○=ช่องว่าง, ■=ช่องไม่เล่น"
    
    return boardString
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 justify-center">
        {/* Left sidebar placeholder for balance */}
        <div className="lg:w-80 flex-shrink-0"></div>

        {/* Center game board - always centered */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="mb-4 text-center">
            <div className="text-xl font-semibold text-gray-700 mb-2">
              ผู้เล่นปัจจุบัน: {gameState.currentPlayer === 'red' ? 'แดง (AI)' : 'ดำ (คุณ)'}
            </div>
            {gameState.mandatoryCapture && !gameState.gameOver && (
              <div className="text-lg font-bold text-red-600 mb-2 animate-pulse">
                ⚠️ บังคับกิน! ต้องกินหมากศัตรูเท่านั้น ไม่อย่างนั้นจะโดนหักขา! ⚠️
              </div>
            )}
            {gameState.gameOver && (
              <div className="text-2xl font-bold text-green-600 mb-2">
                ผู้ชนะ: {gameState.winner === 'red' ? 'แดง (AI)' : 'ดำ (คุณ)'}! 🎉
              </div>
            )}
          </div>

          <GameBoard
            board={gameState.board}
            selectedPosition={gameState.selectedPosition}
            possibleMoves={gameState.possibleMoves}
            onSquareClick={handleSquareClick}
            recommendedMoves={showRecommendations ? aiRecommendations.slice(0, 3) : []}
            animatingMove={animatingMove}
            capturedPieces={capturedPieces}
            promotingPiece={promotingPiece}
          />

          <div className="mt-4 flex gap-4">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              เริ่มเกมใหม่
            </button>
            
            {gameState.currentPlayer === 'black' && !gameState.gameOver && (
              <button
                onClick={toggleRecommendations}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  showRecommendations 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {showRecommendations ? 'ซ่อนคำแนะนำ' : 'แสดงคำแนะนำ AI'}
              </button>
            )}
          </div>
        </div>

        {/* Right sidebar for AI recommendations */}
        <div className="lg:w-80 flex-shrink-0">
          {showRecommendations && gameState.currentPlayer === 'black' && !gameState.gameOver && (
            <AIAssistant
              recommendations={aiRecommendations}
              isCalculating={isCalculating}
              onMoveSelect={makeMove}
            />
          )}
        </div>
      </div>
      
      {/* Floating ChatBot with game context */}
      <ChatBot 
        gameContext={{
          currentPlayer: gameState.currentPlayer === 'red' ? 'แดง (AI)' : 'ดำ (คุณ)',
          recommendations: aiRecommendations,
          gameBoard: serializeBoardForAI(gameState.board),
          gamePhase: gameState.gameOver ? 'จบเกม' : 
            (gameState.mandatoryCapture ? 'ต้องบังคับกิน' : 'เล่นปกติ'),
          lastMove: animatingMove ? 
            `จาก ${String.fromCharCode(65 + animatingMove.from.col)}${8 - animatingMove.from.row} ไป ${String.fromCharCode(65 + animatingMove.to.col)}${8 - animatingMove.to.row}` :
            undefined
        }}
      />
    </div>
  )
}