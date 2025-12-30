"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateGameSession = getOrCreateGameSession;
exports.assignSlot = assignSlot;
exports.checkVictory = checkVictory;
const TockGame_1 = require("../game/TockGame");
function getOrCreateGameSession(games, gameId, hostId) {
    const existing = games.get(gameId);
    if (existing) {
        return existing;
    }
    const game = new TockGame_1.TockGame(4);
    const session = {
        game,
        players: [],
        status: "waiting",
        hostId,
    };
    games.set(gameId, session);
    return session;
}
function assignSlot(players) {
    const usedSlots = players.map((p) => p.slot);
    for (let i = 0; i < 4; i += 1) {
        if (!usedSlots.includes(i)) {
            return i;
        }
    }
    return 0;
}
function checkVictory(game) {
    const teams = [0, 1];
    for (const team of teams) {
        const teamPlayers = game.state.players.filter((player) => player.team === team);
        const teamPawns = game.state.pawns.filter((pawn) => teamPlayers.some((player) => player.slot === pawn.player));
        const allFinished = teamPawns.every((pawn) => pawn.location.type === "FINISHED");
        if (allFinished && teamPawns.length === 8) {
            return team;
        }
    }
    return null;
}
