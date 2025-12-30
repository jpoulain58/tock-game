import { TockGame } from "../game/TockGame";
import { GameSession, GamesRegistry, PlayerState } from "./types";

export function getOrCreateGameSession(
  games: GamesRegistry,
  gameId: string,
  hostId: string
): GameSession {
  const existing = games.get(gameId);
  if (existing) {
    return existing;
  }

  const game = new TockGame(4);
  const session: GameSession = {
    game,
    players: [],
    status: "waiting",
    hostId,
  };
  games.set(gameId, session);
  return session;
}

export function assignSlot(players: PlayerState[]): number {
  const usedSlots = players.map((p) => p.slot);
  for (let i = 0; i < 4; i += 1) {
    if (!usedSlots.includes(i)) {
      return i;
    }
  }
  return 0;
}

export function checkVictory(game: TockGame): number | null {
  const teams = [0, 1];
  for (const team of teams) {
    const teamPlayers = game.state.players.filter((player) => player.team === team);
    const teamPawns = game.state.pawns.filter((pawn) =>
      teamPlayers.some((player) => player.slot === pawn.player)
    );

    const allFinished = teamPawns.every((pawn) => pawn.location.type === "FINISHED");
    if (allFinished && teamPawns.length === 8) {
      return team;
    }
  }

  return null;
}


