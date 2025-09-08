export type PieceType = 'man' | 'king'
export type Player = 'red' | 'black'

export interface Piece {
  type: PieceType
  player: Player
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  captures?: Position[]
}

export interface GameState {
  board: (Piece | null)[][]
  currentPlayer: Player
  selectedPosition: Position | null
  possibleMoves: Move[]
  gameOver: boolean
  winner: Player | null
  mandatoryCapture: boolean // True if player must capture
  penaltyPiece: Position | null // Piece to be removed for not capturing
}

export interface AIRecommendation {
  move: Move
  score: number
  depth: number
}