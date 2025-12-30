import { Server, Socket } from "socket.io";
import { GamesRegistry } from "../types";

interface ChatPayload {
  gameId: string;
  playerId: string;
  message: string;
}

export function registerMiscHandlers(
  io: Server,
  socket: Socket,
  games: GamesRegistry
): void {
  socket.on("chat", (payload: ChatPayload) => handleChat(io, socket, games, payload));
  socket.on("disconnect", () => handleDisconnect(io, socket, games));
}

function handleChat(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: ChatPayload
) {
  const { gameId, message } = payload;
  const session = games.get(gameId);
  if (!session) {
    return;
  }
  const player = session.players.find((candidate) => candidate.id === socket.id);
  if (!player) {
    return;
  }

  io.to(gameId).emit("chatMessage", {
    playerId: socket.id,
    playerName: player.name,
    message,
    timestamp: Date.now(),
  });
}

function handleDisconnect(io: Server, socket: Socket, games: GamesRegistry) {
  games.forEach((session, gameId) => {
    const playerIndex = session.players.findIndex((player) => player.id === socket.id);
    if (playerIndex === -1) {
      return;
    }

    session.players.splice(playerIndex, 1);
    if (session.players.length === 0) {
      games.delete(gameId);
      return;
    }

    io.to(gameId).emit("playerLeft", {
      gameId,
      players: session.players,
    });
  });
}


