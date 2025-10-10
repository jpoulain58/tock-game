import { Server, Socket } from "socket.io";
import { TockGame } from "../game/TockGame";

type GameRoom = {
  game: TockGame;
  players: { id: string; slot: number }[];
};

const games: Record<string, GameRoom> = {};

export function registerGameHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("createGame", ({ playerId }, cb) => {
      const gameId = crypto.randomUUID();
      const game = new TockGame(4);
      games[gameId] = { game, players: [{ id: playerId, slot: 0 }] };
      socket.join(gameId);
      cb({ gameId });
      io.to(gameId).emit("gameCreated", { gameId });
    });

    socket.on("joinGame", ({ gameId, playerId }, cb) => {
      const room = games[gameId];
      if (!room || room.players.length >= 4) return cb({ error: "Invalid game" });
      const slot = room.players.length;
      room.players.push({ id: playerId, slot });
      socket.join(gameId);
      cb({ ok: true });
      io.to(gameId).emit("playerJoined", { gameId, players: room.players });
    });

    socket.on("startGame", ({ gameId }, cb) => {
      const room = games[gameId];
      if (!room) return cb({ error: "Invalid game" });
      room.game.state.status = "started";
      io.to(gameId).emit("gameStarted", { gameState: room.game.state });
      cb({ ok: true });
    });

    socket.on("playCard", ({ gameId, playerId, clientRequestId, card, action, playerName }, cb) => {
      const room = games[gameId];
      if (!room) return cb({ error: "Invalid game" });
      const slot = room.players.find(p => p.id === playerId)?.slot;
      if (slot === undefined) return cb({ error: "Player not in game" });
      const result = room.game.playCard(slot, card, action);
      if (!result.success) return cb({ error: result.error });
      io.to(gameId).emit("moveApplied", { 
        clientRequestId, 
        playerId, 
        playerSlot: slot,
        cardPlayed: card, 
        events: result.events, 
        newStateSummary: room.game.state,
        playerName: playerName || `Joueur ${slot + 1}`
      });
      cb({ ok: true });
    });

    socket.on("requestState", ({ gameId }, cb) => {
      const room = games[gameId];
      if (!room) return cb({ error: "Invalid game" });
      cb({ gameState: room.game.state });
    });
  });
}
