"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameHandlers = registerGameHandlers;
const utils_1 = require("../utils");
const gameService_1 = require("../../services/gameService");
function registerGameHandlers(io, socket, games) {
    socket.on("playCard", (payload) => handlePlayCard(io, socket, games, payload));
    socket.on("passTurn", (payload) => handlePassTurn(io, socket, games, payload));
    socket.on("requestState", (payload) => handleRequestState(socket, games, payload));
}
function handlePlayCard(io, socket, games, payload) {
    const { gameId, clientRequestId, card, action, playerName } = payload;
    const session = games.get(gameId);
    if (!session) {
        socket.emit("error", { message: "Partie introuvable" });
        return;
    }
    let player = session.players.find((candidate) => candidate.id === socket.id);
    if (!player && playerName) {
        player = session.players.find((candidate) => candidate.name === playerName);
        if (player) {
            player.id = socket.id;
            socket.join(gameId);
        }
    }
    if (!player) {
        socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
        return;
    }
    if (session.game.state.currentPlayer !== player.slot) {
        socket.emit("invalidMove", {
            clientRequestId,
            reason: "Ce n'est pas votre tour",
        });
        return;
    }
    const result = session.game.playCard(player.slot, card, action);
    if (!result.success) {
        socket.emit("invalidMove", {
            clientRequestId,
            reason: result.error,
        });
        return;
    }
    io.to(gameId).emit("moveApplied", {
        clientRequestId,
        playerId: socket.id,
        playerSlot: player.slot,
        cardPlayed: card,
        events: result.events,
        newStateSummary: {
            currentPlayer: session.game.state.currentPlayer,
            pawns: session.game.state.pawns,
        },
    });
    const newHand = session.game.state.players[player.slot].hand;
    socket.emit("cardsDealt", { hand: newHand });
    if (result.events?.some((event) => event.type === "roundRedistribution")) {
        const redistributionEvent = result.events?.find((event) => event.type === "roundRedistribution");
        if (redistributionEvent) {
            session.players.forEach((player, index) => {
                const hand = redistributionEvent.hands[index];
                io.to(player.id).emit("cardsRedistributed", { hand });
            });
        }
    }
    const winner = (0, utils_1.checkVictory)(session.game);
    if (winner !== null) {
        session.status = "finished";
        session.game.state.status = "finished";
        session.game.state.winnerTeam = winner;
        // Sauvegarder le résultat en base de données
        (0, gameService_1.saveGameResult)(gameId, winner, session).catch((error) => {
            console.error("Erreur lors de la sauvegarde du résultat:", error);
        });
        io.to(gameId).emit("gameEnded", {
            gameId,
            winnerTeam: winner,
            winnerPlayers: session.players
                .filter((candidate) => candidate.team === winner)
                .map((candidate) => candidate.name),
        });
    }
}
function handlePassTurn(io, socket, games, payload) {
    const { gameId, card, playerName } = payload;
    const session = games.get(gameId);
    if (!session) {
        socket.emit("error", { message: "Partie introuvable" });
        return;
    }
    let player = session.players.find((candidate) => candidate.id === socket.id);
    if (!player && playerName) {
        player = session.players.find((candidate) => candidate.name === playerName);
        if (player) {
            player.id = socket.id;
            socket.join(gameId);
        }
    }
    if (!player) {
        socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
        return;
    }
    if (session.game.state.currentPlayer !== player.slot) {
        socket.emit("error", { message: "Ce n'est pas votre tour" });
        return;
    }
    const result = session.game.passTurn(player.slot, card);
    if (!result.success) {
        socket.emit("error", { message: result.error || "Impossible de passer le tour" });
        return;
    }
    io.to(gameId).emit("turnPassed", {
        playerSlot: player.slot,
        playerName: player.name,
        cardDiscarded: card,
        events: result.events,
        newStateSummary: {
            currentPlayer: session.game.state.currentPlayer,
            pawns: session.game.state.pawns,
        },
    });
    const newHand = session.game.state.players[player.slot].hand;
    socket.emit("cardsDealt", { hand: newHand });
    if (result.events?.some((event) => event.type === "roundRedistribution")) {
        const redistributionEvent = result.events?.find((event) => event.type === "roundRedistribution");
        if (redistributionEvent) {
            session.players.forEach((player, index) => {
                const hand = redistributionEvent.hands[index];
                io.to(player.id).emit("cardsRedistributed", { hand });
            });
        }
    }
    const winner = (0, utils_1.checkVictory)(session.game);
    if (winner !== null) {
        session.status = "finished";
        session.game.state.status = "finished";
        session.game.state.winnerTeam = winner;
        // Sauvegarder le résultat en base de données
        (0, gameService_1.saveGameResult)(gameId, winner, session).catch((error) => {
            console.error("Erreur lors de la sauvegarde du résultat:", error);
        });
        io.to(gameId).emit("gameEnded", {
            gameId,
            winnerTeam: winner,
            winnerPlayers: session.players
                .filter((candidate) => candidate.team === winner)
                .map((candidate) => candidate.name),
        });
    }
}
function handleRequestState(socket, games, payload) {
    const { gameId, playerName } = payload;
    const session = games.get(gameId);
    if (!session) {
        socket.emit("error", { message: "Partie introuvable" });
        return;
    }
    let player = session.players.find((candidate) => candidate.id === socket.id);
    if (!player && playerName) {
        player = session.players.find((candidate) => candidate.name === playerName);
        if (player) {
            player.id = socket.id;
            socket.join(gameId);
        }
    }
    if (!player) {
        socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
        return;
    }
    socket.emit("gameState", {
        gameState: session.game.state,
        players: session.players,
        hand: session.game.state.players[player.slot].hand,
        mySlot: player.slot,
        myPlayerName: player.name,
    });
}
