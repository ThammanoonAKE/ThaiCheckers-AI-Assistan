import { Piece, Position, Move, GameState, Player, PieceType } from '@/types/game'

export const BOARD_SIZE = 8

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  
  // Place red pieces (top 2 rows) - Thai Checkers style
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: 'man', player: 'red' }
      }
    }
  }
  
  // Place black pieces (bottom 2 rows) - Thai Checkers style
  for (let row = 6; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: 'man', player: 'black' }
      }
    }
  }
  
  return board
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE
}

export function isPlayableSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

export function getPossibleMoves(board: (Piece | null)[][], player: Player): Move[] {
  const allMoves: Move[] = []
  const captureMoves: Move[] = []
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece && piece.player === player) {
        const pieceMoves = getPossibleMovesForPiece(board, { row, col })
        allMoves.push(...pieceMoves)
        
        // Separate capture moves
        const pieceCaptureMoves = pieceMoves.filter(move => move.captures && move.captures.length > 0)
        captureMoves.push(...pieceCaptureMoves)
      }
    }
  }
  
  // MANDATORY CAPTURE: If there are capture moves available, MUST use them (Thai Checkers rule)
  return captureMoves.length > 0 ? captureMoves : allMoves
}

export function getPossibleMovesForPiece(board: (Piece | null)[][], from: Position): Move[] {
  const piece = board[from.row][from.col]
  if (!piece) return []
  
  const moves: Move[] = []
  const directions = getDirections(piece)
  
  // Check for captures first (mandatory in checkers)
  if (piece.type === 'king') {
    for (const [dRow, dCol] of directions) {
      // Kings can capture multiple steps away in Thai Checkers
      const captureMoves = checkKingCaptureInDirection(board, from, dRow, dCol)
      moves.push(...captureMoves)
    }
  } else {
    // Regular pieces can capture multiple times in all directions after first capture
    const captureMoves = checkRegularPieceContinuousCapture(board, from, 0, 0) // Pass dummy values since function handles all directions
    moves.push(...captureMoves)
  }
  
  // If no captures available, check regular moves
  if (moves.length === 0) {
    for (const [dRow, dCol] of directions) {
      if (piece.type === 'king') {
        // Kings can move multiple steps to edge of board
        const kingMoves = checkKingMovesInDirection(board, from, dRow, dCol)
        moves.push(...kingMoves)
      } else {
        const regularMove = checkRegularMoveInDirection(board, from, dRow, dCol)
        if (regularMove) {
          moves.push(regularMove)
        }
      }
    }
  }
  
  return moves
}

function getDirections(piece: Piece): [number, number][] {
  if (piece.type === 'king') {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  }
  
  // Regular pieces can only move forward
  if (piece.player === 'red') {
    return [[1, -1], [1, 1]] // Red moves down
  } else {
    return [[-1, -1], [-1, 1]] // Black moves up
  }
}

function checkCaptureInDirection(board: (Piece | null)[][], from: Position, dRow: number, dCol: number): Move | null {
  const piece = board[from.row][from.col]
  if (!piece) return null
  
  // In Thai Checkers, you can capture adjacent pieces directly
  const capturePosition = { row: from.row + dRow, col: from.col + dCol }
  const landOn = { row: from.row + 2 * dRow, col: from.col + 2 * dCol }
  
  if (!isValidPosition(capturePosition) || !isValidPosition(landOn)) return null
  
  const capturedPiece = board[capturePosition.row][capturePosition.col]
  const landOnPiece = board[landOn.row][landOn.col]
  
  // Can capture adjacent enemy piece and land ONLY on the square directly behind it
  if (capturedPiece && capturedPiece.player !== piece.player && !landOnPiece) {
    return {
      from,
      to: landOn, // Only one landing position - directly behind captured piece
      captures: [capturePosition]
    }
  }
  
  return null
}

// New function for regular pieces continuous capture in Thai Checkers
function checkRegularPieceContinuousCapture(board: (Piece | null)[][], from: Position, dRow: number, dCol: number): Move[] {
  const piece = board[from.row][from.col]
  if (!piece) return []
  
  return findAllCaptureSequences(board, from, piece, [], [])
}

// Helper function to find all possible capture sequences recursively
function findAllCaptureSequences(
  board: (Piece | null)[][],
  currentPos: Position,
  piece: Piece,
  capturedSoFar: Position[],
  visitedPositions: Position[]
): Move[] {
  const moves: Move[] = []
  
  // Get all possible directions for this piece type
  const directions = piece.type === 'king' 
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]  // Kings can move in all diagonal directions
    : piece.player === 'red' 
      ? [[1, -1], [1, 1]]  // Red pieces move down
      : [[-1, -1], [-1, 1]] // Black pieces move up
  
  // Regular pieces can only capture in their forward directions (same as movement)
  const finalDirections = directions  // Always use the piece's natural movement directions
  
  let hasCapture = false
  
  for (const [dRow, dCol] of finalDirections) {
    const capturePosition = { row: currentPos.row + dRow, col: currentPos.col + dCol }
    const landOn = { row: currentPos.row + 2 * dRow, col: currentPos.col + 2 * dCol }
    
    if (!isValidPosition(capturePosition) || !isValidPosition(landOn)) continue
    
    const capturedPiece = board[capturePosition.row][capturePosition.col]
    const landOnPiece = board[landOn.row][landOn.col]
    
    // Check if we can capture this piece
    if (capturedPiece && 
        capturedPiece.player !== piece.player && 
        !landOnPiece &&
        !capturedSoFar.some(pos => pos.row === capturePosition.row && pos.col === capturePosition.col) &&
        !visitedPositions.some(pos => pos.row === landOn.row && pos.col === landOn.col)) {
      
      hasCapture = true
      const newCaptured = [...capturedSoFar, capturePosition]
      const newVisited = [...visitedPositions, currentPos]
      
      // Add this capture as a possible move
      moves.push({
        from: visitedPositions[0] || currentPos,
        to: landOn,
        captures: newCaptured
      })
      
      // Recursively find more captures from the landing position
      const furtherMoves = findAllCaptureSequences(board, landOn, piece, newCaptured, newVisited)
      moves.push(...furtherMoves)
    }
  }
  
  return moves
}

function checkRegularMoveInDirection(board: (Piece | null)[][], from: Position, dRow: number, dCol: number): Move | null {
  const to = { row: from.row + dRow, col: from.col + dCol }
  
  if (!isValidPosition(to) || board[to.row][to.col]) return null
  
  return { from, to }
}

// New function for king moves in Thai Checkers - can move to any empty square in direction until edge
function checkKingMovesInDirection(board: (Piece | null)[][], from: Position, dRow: number, dCol: number): Move[] {
  const moves: Move[] = []
  let currentRow = from.row + dRow
  let currentCol = from.col + dCol
  
  while (isValidPosition({ row: currentRow, col: currentCol })) {
    if (board[currentRow][currentCol]) {
      // Hit a piece, stop here
      break
    }
    
    moves.push({
      from,
      to: { row: currentRow, col: currentCol }
    })
    
    currentRow += dRow
    currentCol += dCol
  }
  
  return moves
}

// Enhanced function for king captures in Thai Checkers with proper continuous capture
function checkKingCaptureInDirection(board: (Piece | null)[][], from: Position, dRow: number, dCol: number): Move[] {
  const piece = board[from.row][from.col]
  if (!piece) return []
  
  return findKingCaptureSequencesInDirection(board, from, dRow, dCol, piece, [])
}

// Simplified king capture sequence finder
function findKingCaptureSequencesInDirection(
  board: (Piece | null)[][],
  from: Position,
  dRow: number,
  dCol: number,
  piece: Piece,
  alreadyCaptured: Position[]
): Move[] {
  const allMoves: Move[] = []
  
  // Search along this direction for enemy pieces
  let currentRow = from.row + dRow
  let currentCol = from.col + dCol
  
  while (isValidPosition({ row: currentRow, col: currentCol })) {
    const targetPiece = board[currentRow][currentCol]
    
    if (targetPiece) {
      // Found a piece
      if (targetPiece.player !== piece.player && 
          !alreadyCaptured.some(cap => cap.row === currentRow && cap.col === currentCol)) {
        // Enemy piece we can capture
        const capturePos = { row: currentRow, col: currentCol }
        const landRow = currentRow + dRow
        const landCol = currentCol + dCol
        
        if (isValidPosition({ row: landRow, col: landCol }) && !board[landRow][landCol]) {
          // Can land behind captured piece
          const landPos = { row: landRow, col: landCol }
          const newCaptured = [...alreadyCaptured, capturePos]
          
          // Add this capture move
          allMoves.push({
            from,
            to: landPos,
            captures: newCaptured
          })
          
          // Create temporary board for continued search
          const tempBoard = board.map(row => [...row])
          newCaptured.forEach(cap => tempBoard[cap.row][cap.col] = null)
          tempBoard[from.row][from.col] = null
          tempBoard[landPos.row][landPos.col] = piece
          
          // Look for continued captures from landing position in all 4 directions
          const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
          for (const [nextDRow, nextDCol] of directions) {
            const continuedMoves = findKingCaptureSequencesInDirection(
              tempBoard, 
              landPos, 
              nextDRow, 
              nextDCol, 
              piece, 
              newCaptured
            )
            
            // Add continued captures that capture more pieces
            for (const contMove of continuedMoves) {
              if (contMove.captures && contMove.captures.length > newCaptured.length) {
                allMoves.push({
                  from,
                  to: contMove.to,
                  captures: contMove.captures
                })
              }
            }
          }
        }
        break // Stop after first enemy piece in this direction
      } else {
        // Our own piece or already captured - stop
        break
      }
    }
    
    // Continue to next square
    currentRow += dRow
    currentCol += dCol
  }
  
  return allMoves
}

export function makeMove(board: (Piece | null)[][], move: Move): (Piece | null)[][] {
  const newBoard = board.map(row => [...row])
  const piece = newBoard[move.from.row][move.from.col]
  
  if (!piece) return newBoard
  
  // Move piece
  newBoard[move.to.row][move.to.col] = piece
  newBoard[move.from.row][move.from.col] = null
  
  // Remove captured pieces
  if (move.captures) {
    for (const capture of move.captures) {
      newBoard[capture.row][capture.col] = null
    }
  }
  
  // Promote to king if reached end
  if (shouldPromoteToKing(piece, move.to)) {
    newBoard[move.to.row][move.to.col] = { ...piece, type: 'king' }
  }
  
  return newBoard
}

function shouldPromoteToKing(piece: Piece, position: Position): boolean {
  if (piece.type === 'king') return false
  
  if (piece.player === 'red' && position.row === BOARD_SIZE - 1) return true
  if (piece.player === 'black' && position.row === 0) return true
  
  return false
}

export function isGameOver(board: (Piece | null)[][], currentPlayer: Player): { gameOver: boolean; winner: Player | null } {
  const possibleMoves = getPossibleMoves(board, currentPlayer)
  
  if (possibleMoves.length === 0) {
    return { gameOver: true, winner: currentPlayer === 'red' ? 'black' : 'red' }
  }
  
  // Check if either player has no pieces left
  let redPieces = 0
  let blackPieces = 0
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece) {
        if (piece.player === 'red') redPieces++
        else blackPieces++
      }
    }
  }
  
  if (redPieces === 0) return { gameOver: true, winner: 'black' }
  if (blackPieces === 0) return { gameOver: true, winner: 'red' }
  
  return { gameOver: false, winner: null }
}

export function evaluateBoard(board: (Piece | null)[][], player: Player): number {
  let score = 0
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece) {
        let pieceValue = piece.type === 'king' ? 5 : 1
        
        // Add positional bonus
        if (piece.player === 'red') {
          pieceValue += row * 0.1 // Red pieces get bonus for advancing
        } else {
          pieceValue += (BOARD_SIZE - 1 - row) * 0.1 // Black pieces get bonus for advancing
        }
        
        if (piece.player === player) {
          score += pieceValue
        } else {
          score -= pieceValue
        }
      }
    }
  }
  
  return score
}