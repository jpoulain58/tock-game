"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMiscHandlers = registerMiscHandlers;
function registerMiscHandlers(io, socket, games) {
    socket.on("chat", (payload) => handleChat(io, socket, games, payload));
    socket.on("disconnect", () => handleDisconnect(io, socket, games));
}
function handleChat(io, socket, games, payload) {
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
function handleDisconnect(io, socket, games) {
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
