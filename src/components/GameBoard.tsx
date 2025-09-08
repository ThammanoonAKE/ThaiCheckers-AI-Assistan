'use client'

import { Piece, Position, Move, AIRecommendation } from '@/types/game'
import { BOARD_SIZE, isPlayableSquare } from '@/lib/gameLogic'

interface GameBoardProps {
  board: (Piece | null)[][]
  selectedPosition: Position | null
  possibleMoves: Move[]
  onSquareClick: (row: number, col: number) => void
  recommendedMoves?: AIRecommendation[]
  animatingMove?: Move | null
  capturedPieces?: Position[]
  promotingPiece?: Position | null
}

export default function GameBoard({ 
  board, 
  selectedPosition, 
  possibleMoves, 
  onSquareClick,
  recommendedMoves = [],
  animatingMove = null,
  capturedPieces = [],
  promotingPiece = null
}: GameBoardProps) {
  const isSelected = (row: number, col: number): boolean => {
    return selectedPosition?.row === row && selectedPosition?.col === col
  }

  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(move => move.to.row === row && move.to.col === col)
  }

  const getRecommendationRank = (row: number, col: number): number => {
    const moveIndex = recommendedMoves.findIndex(rec => 
      rec.move.to.row === row && rec.move.to.col === col
    )
    return moveIndex >= 0 ? moveIndex + 1 : 0
  }

  const isRecommendedMove = (row: number, col: number): boolean => {
    return getRecommendationRank(row, col) > 0
  }

  const isAnimatingFrom = (row: number, col: number): boolean => {
    return animatingMove?.from.row === row && animatingMove?.from.col === col
  }

  const isAnimatingTo = (row: number, col: number): boolean => {
    return animatingMove?.to.row === row && animatingMove?.to.col === col
  }

  const isCaptured = (row: number, col: number): boolean => {
    return capturedPieces.some(pos => pos.row === row && pos.col === col)
  }

  const isPromoting = (row: number, col: number): boolean => {
    return promotingPiece?.row === row && promotingPiece?.col === col
  }

  const getSquareClassName = (row: number, col: number): string => {
    let className = "w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer transition-all duration-300 relative "
    
    if (isPlayableSquare(row, col)) {
      className += "bg-amber-800 "
      
      if (isAnimatingFrom(row, col)) {
        className += "ring-4 ring-yellow-400 bg-yellow-200 animate-pulse "
      } else if (isAnimatingTo(row, col)) {
        className += "ring-4 ring-green-400 bg-green-200 animate-pulse "
      } else if (isCaptured(row, col)) {
        className += "ring-4 ring-red-500 bg-red-300 animate-bounce "
      } else if (isSelected(row, col)) {
        className += "ring-4 ring-blue-400 ring-opacity-75 "
      } else if (isPossibleMove(row, col)) {
        className += "ring-2 ring-green-400 bg-amber-700 "
      } else if (isRecommendedMove(row, col)) {
        className += "ring-2 ring-purple-400 bg-amber-700 "
      }
      
      className += "hover:bg-amber-700 "
    } else {
      className += "bg-amber-100 "
    }
    
    return className
  }

  const renderPiece = (piece: Piece | null, row: number, col: number) => {
    if (!piece) return null

    const isKing = piece.type === 'king'
    let pieceClass = `w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-white shadow-lg transition-all duration-500 transform ${
      piece.player === 'red' 
        ? 'bg-red-500 border-red-700' 
        : 'bg-gray-800 border-gray-900'
    }`

    // Add animation classes
    if (isAnimatingFrom(row, col)) {
      pieceClass += ' scale-110 animate-pulse shadow-2xl ring-2 ring-yellow-400'
    } else if (isCaptured(row, col)) {
      pieceClass += ' animate-bounce scale-75 opacity-50'
    } else if (isPromoting(row, col)) {
      pieceClass += ' animate-spin scale-125 ring-4 ring-yellow-300 shadow-2xl'
    }

    return (
      <div className={pieceClass}>
        {isKing && <span className="text-yellow-300 animate-pulse">👑</span>}
        {isPromoting(row, col) && (
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 animate-ping opacity-75"></div>
        )}
      </div>
    )
  }

  const renderRecommendationBadge = (row: number, col: number) => {
    const rank = getRecommendationRank(row, col)
    if (rank === 0) return null

    return (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce">
        {rank}
      </div>
    )
  }

  const getSquareLabel = (row: number, col: number): string => {
    return `${String.fromCharCode(65 + col)}${8 - row}`
  }


  return (
    <div className="inline-block p-4 bg-amber-900 rounded-lg shadow-2xl">
      <div className="grid grid-cols-8 gap-1 bg-amber-950 p-2 rounded">
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => (
            <div
              key={`${row}-${col}`}
              className={getSquareClassName(row, col)}
              onClick={() => onSquareClick(row, col)}
            >
              {/* Square label at top-left corner */}
              <div className="absolute top-0 left-0 text-[10px] font-medium text-amber-200 bg-amber-900 bg-opacity-75 px-0.5 rounded-br">
                {getSquareLabel(row, col)}
              </div>
              
              {renderPiece(board[row][col], row, col)}
              {renderRecommendationBadge(row, col)}
              
              {isPossibleMove(row, col) && !board[row][col] && (
                <div className="w-4 h-4 bg-green-400 rounded-full opacity-75 animate-pulse"></div>
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 text-center text-amber-100 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded-full border border-gray-900"></div>
            <span>ดำ (คุณ)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border border-red-700"></div>
            <span>แดง (AI)</span>
          </div>
        </div>
        <div className="text-xs opacity-75">
          คลิกหมากเพื่อเลือก • จุดเขียว = ช่องที่เดินได้ • ขอบม่วง = คำแนะนำ AI<br/>
          เหลือง = เริ่มต้นการเดิน • เขียว = ปลายทาง • แดง = หมากที่ถูกกิน • ทอง = เลื่อนชั้น
        </div>
      </div>
    </div>
  )
}