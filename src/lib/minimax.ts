import { Move, Player, AIRecommendation, Piece } from '@/types/game'
import { getPossibleMoves, makeMove, evaluateBoard, isGameOver } from './gameLogic'

export function getBestMove(
  board: (Piece | null)[][],
  player: Player,
  depth: number = 6
): AIRecommendation | null {
  const result = minimax(board, depth, -Infinity, Infinity, true, player)
  
  if (result.move) {
    return {
      move: result.move,
      score: result.score,
      depth
    }
  }
  
  return null
}

interface MinimaxResult {
  score: number
  move: Move | null
}

function minimax(
  board: (Piece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player
): MinimaxResult {
  const gameStatus = isGameOver(board, maximizingPlayer ? player : getOpponent(player))
  
  if (depth === 0 || gameStatus.gameOver) {
    return {
      score: evaluateBoard(board, player),
      move: null
    }
  }
  
  const currentPlayer = maximizingPlayer ? player : getOpponent(player)
  const possibleMoves = getPossibleMoves(board, currentPlayer)
  
  if (possibleMoves.length === 0) {
    return {
      score: maximizingPlayer ? -Infinity : Infinity,
      move: null
    }
  }
  
  let bestMove: Move | null = null
  
  if (maximizingPlayer) {
    let maxEval = -Infinity
    
    for (const move of possibleMoves) {
      const newBoard = makeMove(board, move)
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, player)
      
      if (evaluation.score > maxEval) {
        maxEval = evaluation.score
        bestMove = move
      }
      
      alpha = Math.max(alpha, evaluation.score)
      if (beta <= alpha) {
        break // Alpha-beta pruning
      }
    }
    
    return { score: maxEval, move: bestMove }
  } else {
    let minEval = Infinity
    
    for (const move of possibleMoves) {
      const newBoard = makeMove(board, move)
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, player)
      
      if (evaluation.score < minEval) {
        minEval = evaluation.score
        bestMove = move
      }
      
      beta = Math.min(beta, evaluation.score)
      if (beta <= alpha) {
        break // Alpha-beta pruning
      }
    }
    
    return { score: minEval, move: bestMove }
  }
}

function getOpponent(player: Player): Player {
  return player === 'red' ? 'black' : 'red'
}

export function getAllPossibleMovesWithScores(
  board: (Piece | null)[][],
  player: Player,
  depth: number = 4
): AIRecommendation[] {
  const possibleMoves = getPossibleMoves(board, player)
  const recommendations: AIRecommendation[] = []
  
  for (const move of possibleMoves) {
    const newBoard = makeMove(board, move)
    const evaluation = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player)
    
    recommendations.push({
      move,
      score: evaluation.score,
      depth
    })
  }
  
  // Sort by score (best moves first)
  return recommendations.sort((a, b) => b.score - a.score)
}