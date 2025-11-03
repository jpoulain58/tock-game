"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TockGame = void 0;
const RING_SIZE = 72;
const STARTS = [2, 20, 56, 38];
const HOME_ENTRIES = [71, 18, 54, 36];
const TELEPORTERS = [];
const TELEPORTER_PAIRS = {};
class TockGame {
    constructor(playerCount = 4) {
        this.state = this.initGame(playerCount);
    }
    initGame(playerCount) {
        const deck = this.generateDeck();
        const players = [];
        for (let i = 0; i < playerCount; i++) {
            players.push({
                slot: i,
                team: i % 2,
                hand: [],
            });
        }
        const pawns = [];
        for (let i = 0; i < playerCount; i++) {
            for (let j = 0; j < 4; j++) {
                pawns.push({
                    id: `${i}-${j}`,
                    player: i,
                    index: j,
                    location: { type: 'BASE' },
                });
            }
        }
        const shuffled = this.shuffle(deck);
        const hands = [];
        for (let i = 0; i < playerCount; i++) {
            hands[i] = shuffled.splice(0, 5);
            players[i].hand = hands[i];
        }
        return {
            pawns,
            deck: shuffled,
            discard: [],
            players,
            currentPlayer: 0,
            status: 'started',
            moves: [],
        };
    }
    generateDeck() {
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suits = ['♠', '♥', '♦', '♣'];
        const deck = [];
        for (const rank of ranks) {
            for (const suit of suits) {
                deck.push({
                    id: `${rank}${suit}`,
                    rank,
                    suit,
                });
            }
        }
        return deck;
    }
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    getPawnAtRing(idx) {
        return this.state.pawns.find(p => p.location.type === "RING" && p.location.idx === idx);
    }
    getPawnAtHome(player, idx) {
        return this.state.pawns.find(p => p.location.type === "HOME" &&
            p.player === player &&
            p.location.idx === idx);
    }
    isPathBlocked(startIdx, steps, forward = true) {
        const direction = forward ? 1 : -1;
        for (let i = 1; i <= Math.abs(steps); i++) {
            const idx = (startIdx + direction * i + RING_SIZE) % RING_SIZE;
            if (this.getPawnAtRing(idx)) {
                return true;
            }
        }
        return false;
    }
    applyTeleporter(pawn) {
        if (pawn.location.type !== "RING")
            return { teleported: false };
        const currentIdx = pawn.location.idx;
        if (!TELEPORTERS.includes(currentIdx))
            return { teleported: false };
        const destIdx = TELEPORTER_PAIRS[currentIdx];
        const occupant = this.getPawnAtRing(destIdx);
        pawn.location.idx = destIdx;
        if (occupant && occupant.id !== pawn.id) {
            occupant.location = { type: "BASE" };
            return { teleported: true, capturedPawnId: occupant.id };
        }
        return { teleported: true };
    }
    capturePawnAt(idx, excludePawnId) {
        const pawn = this.getPawnAtRing(idx);
        if (pawn && pawn.id !== excludePawnId) {
            pawn.location = { type: "BASE" };
            return pawn.id;
        }
        return undefined;
    }
    stepForward(pawn, steps, playerSlot) {
        if (pawn.location.type === "BASE") {
            return { success: false, error: "Pion en base, utilisez une sortie" };
        }
        if (pawn.location.type === "FINISHED") {
            return { success: false, error: "Pion déjà arrivé" };
        }
        if (pawn.location.type === "HOME") {
            const newIdx = pawn.location.idx + steps;
            if (newIdx > 3) {
                return { success: false, error: "Dépassement de la case finale (atterrissage exact requis)" };
            }
            if (newIdx === 3) {
                return { success: true, finalLocation: { type: "FINISHED" } };
            }
            if (this.getPawnAtHome(playerSlot, newIdx)) {
                return { success: false, error: "Case HOME occupée par votre pion" };
            }
            return { success: true, finalLocation: { type: "HOME", idx: newIdx } };
        }
        let currentIdx = pawn.location.idx;
        const homeEntry = HOME_ENTRIES[playerSlot];
        let remainingSteps = steps;
        let passedHome = false;
        for (let i = 1; i <= steps; i++) {
            const nextIdx = (currentIdx + i) % RING_SIZE;
            if (nextIdx === homeEntry) {
                passedHome = true;
                const stepsToHome = i;
                const stepsAfterHome = steps - stepsToHome;
                if (stepsAfterHome === 0) {
                    return { success: true, finalLocation: { type: "RING", idx: homeEntry } };
                }
                const homeIdx = stepsAfterHome - 1;
                if (homeIdx > 3) {
                    return { success: false, error: "Dépassement de HOME[3]" };
                }
                if (homeIdx === 3) {
                    return { success: true, finalLocation: { type: "FINISHED" }, passedThroughHome: true };
                }
                if (this.getPawnAtHome(playerSlot, homeIdx)) {
                    return { success: false, error: "Case HOME occupée" };
                }
                return { success: true, finalLocation: { type: "HOME", idx: homeIdx }, passedThroughHome: true };
            }
        }
        const finalIdx = (currentIdx + steps) % RING_SIZE;
        return {
            success: true,
            finalLocation: { type: "RING", idx: finalIdx }
        };
    }
    stepBackward(pawn, steps, playerSlot) {
        if (pawn.location.type === "BASE" || pawn.location.type === "FINISHED") {
            return { success: false, error: "Impossible de reculer depuis BASE ou FINISHED" };
        }
        if (pawn.location.type === "HOME") {
            const newIdx = pawn.location.idx - steps;
            if (newIdx < 0) {
                const homeEntry = HOME_ENTRIES[playerSlot];
                const ringSteps = Math.abs(newIdx + 1);
                const finalRingIdx = (homeEntry - ringSteps + RING_SIZE) % RING_SIZE;
                return { success: true, finalLocation: { type: "RING", idx: finalRingIdx } };
            }
            if (this.getPawnAtHome(playerSlot, newIdx)) {
                return { success: false, error: "Case HOME occupée" };
            }
            return { success: true, finalLocation: { type: "HOME", idx: newIdx } };
        }
        const currentIdx = pawn.location.idx;
        const finalIdx = (currentIdx - steps + RING_SIZE) % RING_SIZE;
        return { success: true, finalLocation: { type: "RING", idx: finalIdx } };
    }
    exitPawn(pawn, playerSlot) {
        if (pawn.location.type !== "BASE") {
            return { success: false, error: "Le pion n'est pas en base" };
        }
        const startIdx = STARTS[playerSlot];
        const occupant = this.getPawnAtRing(startIdx);
        if (occupant) {
            if (occupant.player === playerSlot) {
                return { success: false, error: "Case de départ occupée par votre pion" };
            }
            occupant.location = { type: "BASE" };
            return { success: true, capturedPawnId: occupant.id };
        }
        return { success: true };
    }
    getPawnAt(location) {
        if (location.type === 'RING') {
            return this.getPawnAtRing(location.idx) || null;
        }
        else if (location.type === 'HOME') {
            const pawn = this.state.pawns.find(p => p.location.type === 'HOME' && p.location.idx === location.idx);
            return pawn || null;
        }
        return null;
    }
    canPlayAnyCard(playerSlot) {
        const player = this.state.players[playerSlot];
        for (const card of player.hand) {
            if (card.rank === "J") {
                const pawnsOnBoard = this.state.pawns.filter(p => p.location.type === "RING" || p.location.type === "HOME");
                if (pawnsOnBoard.length >= 2)
                    return true;
            }
            if (card.rank === "5") {
                const pawnsOnBoard = this.state.pawns.filter(p => p.location.type === "RING" || p.location.type === "HOME");
                if (pawnsOnBoard.length >= 1)
                    return true;
            }
            if (card.rank === "A" || card.rank === "K") {
                const hasPawnInBase = this.state.pawns.some(p => p.player === playerSlot && p.location.type === "BASE");
                if (hasPawnInBase) {
                    const startIdx = STARTS[playerSlot];
                    const occupant = this.getPawnAtRing(startIdx);
                    if (!occupant || occupant.player !== playerSlot) {
                        return true;
                    }
                }
                if (card.rank === "A") {
                    const playerPawnsOnBoard = this.state.pawns.filter(p => p.player === playerSlot && (p.location.type === "RING" || p.location.type === "HOME"));
                    if (playerPawnsOnBoard.length > 0)
                        return true;
                }
            }
            const playerPawnsOnBoard = this.state.pawns.filter(p => p.player === playerSlot && (p.location.type === "RING" || p.location.type === "HOME"));
            if (playerPawnsOnBoard.length > 0) {
                return true;
            }
        }
        return false;
    }
    passTurn(playerSlot, card) {
        if (this.state.status !== "started") {
            return { success: false, error: "La partie n'est pas démarrée" };
        }
        if (this.state.currentPlayer !== playerSlot) {
            return { success: false, error: "Ce n'est pas votre tour" };
        }
        const player = this.state.players[playerSlot];
        const events = [];
        if (card) {
            if (!player.hand.find(c => c.id === card.id)) {
                return { success: false, error: "Carte non présente dans votre main" };
            }
            player.hand = player.hand.filter(c => c.id !== card.id);
            this.state.discard.push(card);
            events.push({ type: "cardDiscarded", card });
            if (this.state.deck.length === 0 && this.state.discard.length > 1) {
                const lastCard = this.state.discard.pop();
                this.state.deck = this.shuffle(this.state.discard);
                this.state.discard = [lastCard];
            }
            if (this.state.deck.length > 0) {
                const newCard = this.state.deck.pop();
                player.hand.push(newCard);
                events.push({ type: "cardDrawn", playerSlot });
            }
        }
        events.push({ type: "turnPassed", playerSlot });
        this.state.currentPlayer = (this.state.currentPlayer + 1) % this.state.players.length;
        return { success: true, events };
    }
    playCard(playerSlot, card, action) {
        if (this.state.status !== "started") {
            return { success: false, error: "La partie n'est pas démarrée" };
        }
        if (this.state.currentPlayer !== playerSlot) {
            return { success: false, error: "Ce n'est pas votre tour" };
        }
        const player = this.state.players[playerSlot];
        if (!player.hand.find(c => c.id === card.id)) {
            return { success: false, error: "Carte non présente dans votre main" };
        }
        const events = [];
        const consumeCard = () => {
            const oldCurrentPlayer = this.state.currentPlayer;
            player.hand = player.hand.filter(c => c.id !== card.id);
            this.state.discard.push(card);
            events.push({ type: "cardDiscarded", card });
            if (this.state.deck.length === 0 && this.state.discard.length > 1) {
                const lastCard = this.state.discard.pop();
                this.state.deck = this.shuffle(this.state.discard);
                this.state.discard = [lastCard];
            }
            if (this.state.deck.length > 0) {
                const newCard = this.state.deck.pop();
                player.hand.push(newCard);
                events.push({ type: "cardDrawn", playerSlot });
            }
            this.state.currentPlayer = (this.state.currentPlayer + 1) % this.state.players.length;
            console.log(`🔄 consumeCard: Tour passé de ${oldCurrentPlayer} → ${this.state.currentPlayer}`);
        };
        if (card.rank === "J") {
            const { pawnAId, pawnBId } = action;
            const pawnA = this.state.pawns.find(p => p.id === pawnAId);
            const pawnB = this.state.pawns.find(p => p.id === pawnBId);
            if (!pawnA || !pawnB) {
                return { success: false, error: "Pions invalides pour le swap" };
            }
            if (pawnA.location.type === "BASE" || pawnB.location.type === "BASE") {
                return { success: false, error: "Impossible de swap un pion en base" };
            }
            const tempLocation = pawnA.location;
            pawnA.location = pawnB.location;
            pawnB.location = tempLocation;
            events.push({
                type: "swap",
                pawnAId,
                pawnBId,
                pawnANewLocation: pawnA.location,
                pawnBNewLocation: pawnB.location,
            });
            consumeCard();
            return { success: true, events };
        }
        if (card.rank === "A") {
            if (action.type === "exit") {
                const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
                if (!pawn)
                    return { success: false, error: "Pion invalide" };
                const exitResult = this.exitPawn(pawn, playerSlot);
                if (!exitResult.success)
                    return { success: false, error: exitResult.error };
                pawn.location = { type: "RING", idx: STARTS[playerSlot] };
                events.push({ type: "exit", pawnId: pawn.id, position: STARTS[playerSlot] });
                if (exitResult.capturedPawnId) {
                    events.push({ type: "capture", capturedPawnId: exitResult.capturedPawnId });
                }
                consumeCard();
                return { success: true, events };
            }
            else if (action.type === "move") {
                const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
                if (!pawn)
                    return { success: false, error: "Pion invalide" };
                return this.handleNormalMove(pawn, 1, playerSlot, events, consumeCard);
            }
            return { success: false, error: "Action invalide pour As" };
        }
        if (card.rank === "K") {
            if (action.type === "exit") {
                const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
                if (!pawn)
                    return { success: false, error: "Pion invalide" };
                const exitResult = this.exitPawn(pawn, playerSlot);
                if (!exitResult.success)
                    return { success: false, error: exitResult.error };
                pawn.location = { type: "RING", idx: STARTS[playerSlot] };
                events.push({ type: "exit", pawnId: pawn.id, position: STARTS[playerSlot] });
                if (exitResult.capturedPawnId) {
                    events.push({ type: "capture", capturedPawnId: exitResult.capturedPawnId });
                }
                consumeCard();
                return { success: true, events };
            }
            else if (action.type === "move") {
                const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
                if (!pawn)
                    return { success: false, error: "Pion invalide" };
                return this.handleNormalMove(pawn, 13, playerSlot, events, consumeCard);
            }
            return { success: false, error: "Action invalide pour Roi" };
        }
        if (card.rank === "4") {
            const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
            if (!pawn)
                return { success: false, error: "Pion invalide" };
            if (pawn.location.type !== "RING" && pawn.location.type !== "HOME") {
                return { success: false, error: "Impossible de reculer ce pion" };
            }
            if (pawn.location.type === "RING") {
                if (this.isPathBlocked(pawn.location.idx, 4, false)) {
                    return { success: false, error: "Chemin bloqué" };
                }
            }
            const backResult = this.stepBackward(pawn, 4, playerSlot);
            if (!backResult.success)
                return { success: false, error: backResult.error };
            const oldLocation = pawn.location;
            pawn.location = backResult.finalLocation;
            events.push({
                type: "backward",
                pawnId: pawn.id,
                from: oldLocation,
                to: pawn.location,
                steps: 4,
            });
            if (pawn.location.type === "RING") {
                const capturedId = this.capturePawnAt(pawn.location.idx, pawn.id);
                if (capturedId) {
                    events.push({ type: "capture", capturedPawnId: capturedId });
                }
            }
            consumeCard();
            return { success: true, events };
        }
        if (card.rank === "7") {
            const { moves } = action;
            if (!moves || moves.length === 0) {
                return { success: false, error: "Aucun mouvement spécifié pour le 7" };
            }
            const totalSteps = moves.reduce((sum, m) => sum + m.steps, 0);
            if (totalSteps !== 7) {
                return { success: false, error: "La somme des mouvements doit être 7" };
            }
            if (moves.some((m) => m.steps <= 0)) {
                return { success: false, error: "Chaque mouvement doit être > 0" };
            }
            for (const move of moves) {
                const pawn = this.state.pawns.find(p => p.id === move.pawnId && p.player === playerSlot);
                if (!pawn)
                    return { success: false, error: `Pion ${move.pawnId} invalide` };
                if (pawn.location.type !== "RING" && pawn.location.type !== "HOME") {
                    return { success: false, error: "Le 7 nécessite des pions sur le plateau ou en HOME" };
                }
                const result = this.handleSevenMove(pawn, move.steps, playerSlot, events);
                if (!result.success) {
                    return { success: false, error: result.error };
                }
            }
            consumeCard();
            return { success: true, events };
        }
        if (card.rank === "5") {
            const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
            if (!pawn)
                return { success: false, error: "Pion invalide" };
            return this.handleNormalMove(pawn, 5, playerSlot, events, consumeCard);
        }
        const stepsMap = {
            '2': 2, '3': 3, '6': 6, '8': 8, '9': 9, '10': 10, 'Q': 12
        };
        if (card.rank in stepsMap) {
            const steps = stepsMap[card.rank];
            const pawn = this.state.pawns.find(p => p.id === action.pawnId && p.player === playerSlot);
            if (!pawn)
                return { success: false, error: "Pion invalide" };
            return this.handleNormalMove(pawn, steps, playerSlot, events, consumeCard);
        }
        return { success: false, error: "Carte non implémentée" };
    }
    handleNormalMove(pawn, steps, playerSlot, events, consumeCard) {
        if (pawn.location.type === "BASE") {
            return { success: false, error: "Pion en base, utilisez une sortie (A ou K)" };
        }
        if (pawn.location.type === "FINISHED") {
            return { success: false, error: "Pion déjà arrivé" };
        }
        if (pawn.location.type === "RING") {
            if (this.isPathBlocked(pawn.location.idx, steps)) {
                return { success: false, error: "Chemin bloqué par un autre pion" };
            }
        }
        const moveResult = this.stepForward(pawn, steps, playerSlot);
        if (!moveResult.success) {
            return { success: false, error: moveResult.error };
        }
        const oldLocation = pawn.location;
        pawn.location = moveResult.finalLocation;
        events.push({
            type: "move",
            pawnId: pawn.id,
            from: oldLocation,
            to: pawn.location,
            steps,
        });
        if (pawn.location.type === "RING") {
            const capturedId = this.capturePawnAt(pawn.location.idx, pawn.id);
            if (capturedId) {
                events.push({ type: "capture", capturedPawnId: capturedId });
            }
            const teleResult = this.applyTeleporter(pawn);
            if (teleResult.teleported) {
                events.push({
                    type: "teleport",
                    pawnId: pawn.id,
                    to: pawn.location.type === "RING" ? pawn.location.idx : null,
                });
                if (teleResult.capturedPawnId) {
                    events.push({ type: "teleportCapture", capturedPawnId: teleResult.capturedPawnId });
                }
            }
        }
        consumeCard();
        return { success: true, events };
    }
    handleSevenMove(pawn, steps, playerSlot, events) {
        if (pawn.location.type !== "RING" && pawn.location.type !== "HOME") {
            return { success: false, error: "Mouvement 7 invalide pour ce pion" };
        }
        if (pawn.location.type === "RING") {
            const startIdx = pawn.location.idx;
            const capturedPawns = [];
            for (let i = 1; i <= steps; i++) {
                const idx = (startIdx + i) % RING_SIZE;
                const capturedId = this.capturePawnAt(idx);
                if (capturedId) {
                    capturedPawns.push(capturedId);
                    events.push({ type: "sevenCapture", capturedPawnId: capturedId, atStep: i });
                }
            }
            const moveResult = this.stepForward(pawn, steps, playerSlot);
            if (!moveResult.success) {
                return { success: false, error: moveResult.error };
            }
            const oldLocation = pawn.location;
            pawn.location = moveResult.finalLocation;
            events.push({
                type: "sevenMove",
                pawnId: pawn.id,
                from: oldLocation,
                to: pawn.location,
                steps,
                capturedPawns,
            });
            if (pawn.location.type === "RING") {
                const teleResult = this.applyTeleporter(pawn);
                if (teleResult.teleported) {
                    events.push({
                        type: "teleport",
                        pawnId: pawn.id,
                        to: pawn.location.type === "RING" ? pawn.location.idx : null,
                    });
                    if (teleResult.capturedPawnId) {
                        events.push({ type: "teleportCapture", capturedPawnId: teleResult.capturedPawnId });
                    }
                }
            }
            return { success: true };
        }
        const moveResult = this.stepForward(pawn, steps, playerSlot);
        if (!moveResult.success) {
            return { success: false, error: moveResult.error };
        }
        const oldLocation = pawn.location;
        pawn.location = moveResult.finalLocation;
        events.push({
            type: "sevenMove",
            pawnId: pawn.id,
            from: oldLocation,
            to: pawn.location,
            steps,
        });
        return { success: true };
    }
}
exports.TockGame = TockGame;
