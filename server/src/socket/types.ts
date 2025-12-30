import { TockGame } from "../game/TockGame";

export type GameStatus = "waiting" | "started" | "finished";

export interface PlayerState {
  id: string;
  name: string;
  slot: number;
  team: number;
  isReady: boolean;
}

export interface GameSession {
  game: TockGame;
  players: PlayerState[];
  status: GameStatus;
  hostId: string;
}

export type GamesRegistry = Map<string, GameSession>;


