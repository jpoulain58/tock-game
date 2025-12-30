export type PawnLocation =
  | { type: 'BASE' }
  | { type: 'RING', idx: number }
  | { type: 'HOME', idx: number }
  | { type: 'FINISHED' };

export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type CardSuit = '♠' | '♥' | '♦' | '♣';

export interface Card {
  id: string;
  rank: CardRank;
  suit: CardSuit;
}

export interface Pawn {
  id: string;
  player: number;
  index: number;
  location: PawnLocation;
}

export interface Player {
  slot: number;
  team: number;
  hand: Card[];
}

export interface GameState {
  pawns: Pawn[];
  deck: Card[];
  discard: Card[];
  players: Player[];
  currentPlayer: number;
  status: 'waiting' | 'started' | 'finished';
  moves: any[];
  winnerTeam?: number;
}

export interface GameEvent {
  type: string;
  [key: string]: any;
}

export interface PawnAnimation {
  pawnId: string;
  currentStep: number;
  totalSteps: number;
  path: PawnLocation[];
}

export interface CardDisplay {
  card: Card;
  playerName: string;
  timestamp: number;
}
