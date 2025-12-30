import { create } from "zustand";
import { Socket } from "socket.io-client";
import type { Card, GameState, GameEvent, PawnAnimation, CardDisplay } from "@/types";

interface GameStore {
  socket: Socket | null;
  gameId: string | null;
  gameState: GameState | null;
  myHand: Card[];
  myPlayerSlot: number | null;
  events: GameEvent[];
  selectedCard: Card | null;
  selectedPawn: Pawn | null;
  animatingPawns: Map<string, PawnAnimation>;
  displayedCard: CardDisplay | null;
  
  setSocket: (socket: Socket) => void;
  setGameId: (gameId: string) => void;
  setGameState: (gameState: GameState | ((prevState: GameState | null) => GameState | null)) => void;
  setMyHand: (hand: Card[]) => void;
  setMyPlayerSlot: (slot: number) => void;
  addEvent: (event: GameEvent) => void;
  clearEvents: () => void;
  setSelectedCard: (card: Card | null) => void;
  setSelectedPawn: (pawn: Pawn | null) => void;
  setAnimatingPawn: (pawnId: string, animation: PawnAnimation | null) => void;
  setDisplayedCard: (cardDisplay: CardDisplay | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  socket: null,
  gameId: null,
  gameState: null,
  myHand: [],
  myPlayerSlot: null,
  events: [],
  selectedCard: null,
  selectedPawn: null,
  animatingPawns: new Map(),
  displayedCard: null,

  setSocket: (socket) => set({ socket }),
  setGameId: (gameId) => set({ gameId }),
  setGameState: (gameState) => set((state) => ({
    gameState: typeof gameState === 'function' ? gameState(state.gameState) : gameState
  })),
  setMyHand: (hand) => set({ myHand: hand }),
  setMyPlayerSlot: (slot) => set({ myPlayerSlot: slot }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  clearEvents: () => set({ events: [] }),
  setSelectedCard: (card) => set({ selectedCard: card }),
  setSelectedPawn: (pawn) => set({ selectedPawn: pawn }),
  setAnimatingPawn: (pawnId, animation) => set((state) => {
    const newMap = new Map(state.animatingPawns);
    if (animation === null) {
      newMap.delete(pawnId);
    } else {
      newMap.set(pawnId, animation);
    }
    return { animatingPawns: newMap };
  }),
  setDisplayedCard: (cardDisplay) => set({ displayedCard: cardDisplay }),
  reset: () => set({
    socket: null,
    gameId: null,
    gameState: null,
    myHand: [],
    myPlayerSlot: null,
    events: [],
    selectedCard: null,
    selectedPawn: null,
    animatingPawns: new Map(),
    displayedCard: null,
  }),
}));

