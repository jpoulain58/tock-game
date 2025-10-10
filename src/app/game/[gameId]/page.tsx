"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Board from "../../../components/Board";
import Hand from "../../../components/Hand";
import { useGameStore, Pawn, PawnLocation } from "../../../store/gameStore";
import type { Card } from "../../../store/gameStore";
import { calculateAnimationPath, calculateStepInterval } from "../../../utils/animationHelper";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const {
    socket,
    gameState,
    myHand,
    myPlayerSlot,
    selectedCard,
    selectedPawn,
    events,
    animatingPawns,
    displayedCard,
    setSocket,
    setGameId,
    setGameState,
    setMyHand,
    setMyPlayerSlot,
    addEvent,
    setSelectedCard,
    setSelectedPawn,
    setAnimatingPawn,
    setDisplayedCard,
  } = useGameStore();

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [localPlayerSlot, setLocalPlayerSlot] = useState<number | null>(null);
  const [showPassTurnModal, setShowPassTurnModal] = useState(false);
  const [cardToDiscard, setCardToDiscard] = useState<Card | null>(null);
  const [highlightedPositions, setHighlightedPositions] = useState<Array<{type: 'RING' | 'HOME', idx: number}>>([]);
  const [wantsToExit, setWantsToExit] = useState<boolean | null>(null);

  console.log("🎨 === RENDER GamePage ===");
  console.log("📍 myPlayerSlot (store):", myPlayerSlot);
  console.log("📍 localPlayerSlot (state):", localPlayerSlot);
  console.log("🎮 gameState:", gameState?.currentPlayer);

  useEffect(() => {
    console.log("🔄 useEffect de la page de jeu - Début");

    const storedName = localStorage.getItem("playerName") || "Joueur";
    setPlayerName(storedName);

    let activeSocket: Socket;
    let isNewSocket = false;

    if (socket && socket.connected) {
      console.log("♻️ Réutilisation de la socket existante du lobby");
      activeSocket = socket;
      setGameId(gameId);
      const playerName = localStorage.getItem("playerName") || "";
      activeSocket.emit("requestState", { gameId, playerName });
    } else {
      
      console.log("🔌 Création d'une nouvelle socket pour la page de jeu");
      isNewSocket = true;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
      activeSocket = io(socketUrl);
      setSocket(activeSocket);
    setGameId(gameId);

      activeSocket.on("connect", () => {
        console.log("✅ Connecté au serveur de jeu");
        
        const playerName = localStorage.getItem("playerName") || "";
        
        console.log(`📞 Envoi de requestState - gameId: ${gameId}, playerName: ${playerName}`);
        activeSocket.emit("requestState", { gameId, playerName });
      });
    }

    const handleGameState = (data: { 
      gameState: any; 
      players: any[]; 
      hand: Card[];
      mySlot?: number;
      myPlayerName?: string;
    }) => {
      console.log("🎮 ========== GAME STATE REÇU ==========");
      console.log("📦 Data complète:", data);
      console.log("🎯 Mon slot reçu:", data.mySlot);
      console.log("👤 Mon nom:", data.myPlayerName);
      console.log("🔌 Socket ID:", activeSocket.id);
      console.log("👥 Joueurs:", data.players);
      
      setGameState(data.gameState);
      setMyHand(data.hand);

      if (data.mySlot !== undefined && data.mySlot !== null) {
        console.log(`✅ ✅ ✅ ASSIGNATION DU SLOT: ${data.mySlot}`);
        setMyPlayerSlot(data.mySlot);
        setLocalPlayerSlot(data.mySlot);
        console.log(`💾 Slot enregistré dans le store ET le state local: ${data.mySlot}`);

        setTimeout(() => {
          console.log("🔍 Vérification après 100ms:");
          console.log("   - Store myPlayerSlot:", myPlayerSlot);
          console.log("   - Local slot:", localPlayerSlot);
        }, 100);
      } else {
        
        console.warn("⚠️ Pas de mySlot dans la réponse, fallback sur socket.id");
        const myPlayer = data.players.find(p => p.id === activeSocket.id);
      if (myPlayer) {
          console.log(`⚠️ Slot trouvé via fallback: ${myPlayer.slot}`);
        setMyPlayerSlot(myPlayer.slot);
          setLocalPlayerSlot(myPlayer.slot);
        } else {
          console.error("❌ ERREUR: Impossible de trouver mon joueur !");
          console.error("   - Socket ID cherché:", activeSocket.id);
          console.error("   - IDs disponibles:", data.players.map(p => p.id));
        }
      }
      console.log("🎮 =====================================");
    };

    const handleGameStarted = (data: { gameId: string; gameState: any }) => {
      console.log("🎮 Partie démarrée", data);
      console.log("🔄 currentPlayer initial:", data.gameState.currentPlayer);
      setGameState(data.gameState);

      const playerName = localStorage.getItem("playerName") || "";
      activeSocket.emit("requestState", { gameId, playerName });
    };

    const handleCardsDealt = (data: { hand: Card[] }) => {
      console.log("Cartes reçues", data);
      console.log("📇 Nombre de cartes:", data.hand.length);
      setMyHand(data.hand);
    };

    const handleMoveApplied = (data: {
      clientRequestId: string;
      playerId: string;
      playerSlot: number;
      cardPlayed: Card;
      events: any[];
      newStateSummary: any;
      playerName?: string;
    }) => {
      console.log("✅ ========== MOVE APPLIED REÇU ==========");
      console.log("📤 Carte jouée:", data.cardPlayed);
      console.log("👤 Joueur (slot):", data.playerSlot);
      console.log("🔄 Tour suivant (nouveau currentPlayer):", data.newStateSummary.currentPlayer);
      console.log("📍 Nouveaux pions:", data.newStateSummary.pawns);
      console.log("📊 Événements:", data.events);

      setDisplayedCard({
        card: data.cardPlayed,
        playerName: data.playerName || `Joueur ${data.playerSlot + 1}`,
        timestamp: Date.now()
      });

      setTimeout(() => {
        setDisplayedCard(null);
      }, 2000);

      const moveEvents = data.events.filter((e: any) => 
        e.type === "move" || e.type === "sevenMove" || e.type === "backward"
      );
      
      if (moveEvents.length > 0 && gameState) {
        
        let delay = 0;
        moveEvents.forEach((event: any, index: number) => {
          setTimeout(() => {
            const pawn = gameState.pawns.find(p => p.id === event.pawnId);
            if (pawn && event.from && event.to) {
              animatePawnMove(
                event.pawnId,
                event.from,
                event.to,
                event.steps || 1,
                pawn.player, 
                index === moveEvents.length - 1 
              );
            }
          }, delay);
          delay += (event.steps || 1) * 300 + 200; 
        });

        setTimeout(() => {
          setGameState(prevState => {
            if (!prevState) return prevState;
            return {
              ...prevState,
              currentPlayer: data.newStateSummary.currentPlayer,
              pawns: data.newStateSummary.pawns,
            };
          });

          data.events.forEach((event: any) => {
            addEvent(event);
          });

          setSelectedCard(null);
          setSelectedPawn(null);
        }, delay);
      } else {
        
        setGameState(prevState => {
          if (!prevState) return prevState;
          return {
            ...prevState,
            currentPlayer: data.newStateSummary.currentPlayer,
            pawns: data.newStateSummary.pawns,
          };
        });
        
        data.events.forEach((event: any) => {
          addEvent(event);
        });
        
        setSelectedCard(null);
        setSelectedPawn(null);
      }
      
      console.log("✅ ========================================");
    };

    const animatePawnMove = (
      pawnId: string,
      from: PawnLocation,
      to: PawnLocation,
      steps: number,
      playerSlot: number,
      isLast: boolean
    ) => {
      const path = calculateAnimationPath(from, to, steps, playerSlot);
      const interval = calculateStepInterval(path.length);
      
      console.log(`🎬 Animation pion ${pawnId}: ${path.length} étapes`);
      
      let currentStep = 0;
      
      const animate = () => {
        if (currentStep < path.length) {
          
          setGameState(prevState => {
            if (!prevState) return prevState;
            const newPawns = prevState.pawns.map(p => 
              p.id === pawnId ? { ...p, location: path[currentStep] } : p
            );
            return { ...prevState, pawns: newPawns };
          });

          setAnimatingPawn(pawnId, {
            pawnId,
            currentStep: currentStep + 1,
            totalSteps: path.length,
            path
          });
          
          currentStep++;
          setTimeout(animate, interval);
        } else {
          
          setAnimatingPawn(pawnId, null);
        }
      };
      
      animate();
    };

    const handleInvalidMove = (data: { clientRequestId: string; reason: string }) => {
      console.error("Mouvement invalide", data);
      alert(`Mouvement invalide : ${data.reason}`);
    };

    const handleGameEnded = (data: { gameId: string; winnerTeam: number; winnerPlayers: string[] }) => {
      console.log("Partie terminée", data);
      alert(`Partie terminée ! Équipe ${data.winnerTeam} a gagné : ${data.winnerPlayers.join(", ")}`);
    };

    const handleChatMessage = (data: { playerId: string; playerName: string; message: string; timestamp: number }) => {
      setChatMessages(prev => [...prev, data]);
    };

    const handleError = (data: { message: string }) => {
      console.error("Erreur", data);
      alert(data.message);
    };

    const handleTurnPassed = (data: { playerSlot: number; playerName: string; cardDiscarded?: any; events: any[]; newStateSummary: any }) => {
      console.log("⏭️ ========== TURN PASSED REÇU ==========");
      console.log("👤 Joueur qui a passé:", data.playerName, "(slot", data.playerSlot + ")");
      console.log("🎴 Carte défaussée:", data.cardDiscarded);
      console.log("🔄 Nouveau currentPlayer:", data.newStateSummary.currentPlayer);
      console.log("📍 Nouveaux pions:", data.newStateSummary.pawns);

      setGameState(prevState => {
        if (!prevState) {
          console.error("❌ Pas de gameState pour mettre à jour !");
          return prevState;
        }
        
        const newState = {
          ...prevState,
          currentPlayer: data.newStateSummary.currentPlayer,
          pawns: data.newStateSummary.pawns,
        };
        console.log("💾 Ancien currentPlayer:", prevState.currentPlayer);
        console.log("💾 Nouveau currentPlayer:", newState.currentPlayer);
        console.log("🔄 Mise à jour du gameState après turnPassed");
        return newState;
      });

      data.events?.forEach(event => {
        addEvent(event);
      });

      addEvent({ 
        type: "turnPassed", 
        playerName: data.playerName,
        cardDiscarded: data.cardDiscarded 
      });
      console.log("✅ ========================================");
    };

    activeSocket.on("gameState", handleGameState);
    activeSocket.on("gameStarted", handleGameStarted);
    activeSocket.on("cardsDealt", handleCardsDealt);
    activeSocket.on("moveApplied", handleMoveApplied);
    activeSocket.on("invalidMove", handleInvalidMove);
    activeSocket.on("gameEnded", handleGameEnded);
    activeSocket.on("chatMessage", handleChatMessage);
    activeSocket.on("turnPassed", handleTurnPassed);
    activeSocket.on("error", handleError);

    console.log("🔄 useEffect de la page de jeu - Event listeners attachés");

    return () => {
      console.log("🧹 Cleanup de la page de jeu");
      
      activeSocket.off("gameState", handleGameState);
      activeSocket.off("gameStarted", handleGameStarted);
      activeSocket.off("cardsDealt", handleCardsDealt);
      activeSocket.off("moveApplied", handleMoveApplied);
      activeSocket.off("invalidMove", handleInvalidMove);
      activeSocket.off("gameEnded", handleGameEnded);
      activeSocket.off("chatMessage", handleChatMessage);
      activeSocket.off("turnPassed", handleTurnPassed);
      activeSocket.off("error", handleError);

      if (isNewSocket && activeSocket) {
        console.log("🔌 Fermeture de la socket créée par la page de jeu");
        activeSocket.close();
      } else {
        console.log("♻️ Socket du lobby conservée");
      }
    };
  }, []); 

  const handleCardSelect = (card: Card) => {
    console.log("🎴 Carte sélectionnée:", card);
    setSelectedCard(card);
    
    setSelectedPawn(null);
    setHighlightedPositions([]);
    
    if (card.rank === "A" || card.rank === "K") {
      const shouldExit = confirm("Voulez-vous sortir un pion de la base ?");
      setWantsToExit(shouldExit);
      console.log(`💭 Choix pour ${card.rank}: ${shouldExit ? "Sortie" : "Mouvement"}`);
    } else {
      setWantsToExit(null);
    }
  };

  const handlePassTurn = () => {
    if (!cardToDiscard) {
      return;
    }

    const currentSlot = localPlayerSlot !== null ? localPlayerSlot : myPlayerSlot;
    
    if (!socket || !gameState || currentSlot === null) {
      console.error("❌ Impossible de passer le tour:", { socket: !!socket, gameState: !!gameState, currentSlot });
      return;
    }

    if (gameState.currentPlayer !== currentSlot) {
      return;
    }

    const playerName = localStorage.getItem("playerName") || "";
    
    socket.emit("passTurn", {
      gameId,
      playerId: socket.id,
      card: cardToDiscard,
      playerName,
    });

    console.log("⏭️ Tour passé", `(carte défaussée: ${cardToDiscard.rank}${cardToDiscard.suit})`);

    setShowPassTurnModal(false);
    setCardToDiscard(null);
    setSelectedCard(null);
    setSelectedPawn(null);
    setWantsToExit(null);
  };

  const calculatePossiblePositions = (pawn: Pawn, card: Card): Array<{type: 'RING' | 'HOME', idx: number}> => {
    if (!gameState) return [];
    
    const positions: Array<{type: 'RING' | 'HOME', idx: number}> = [];
    const currentSlot = localPlayerSlot !== null ? localPlayerSlot : myPlayerSlot;
    if (currentSlot === null) return [];

    const HOME_ENTRIES = [71, 18, 54, 36]; 
    const RING_SIZE = 72;

    const stepsMap: Record<string, number> = {
      '2': 2, '3': 3, '6': 6, '8': 8, '9': 9, '10': 10, 'Q': 12, 'K': 13, 'A': 1, '5': 5
    };

    if (pawn.location.type === "BASE") {

      return [];
    }

    if (pawn.location.type === "HOME") {
      const steps = card.rank === "7" ? 7 : stepsMap[card.rank];
      if (steps) {
        const newIdx = pawn.location.idx + steps;
        if (newIdx <= 3) {
          positions.push({ type: 'HOME', idx: newIdx });
        }
      }
      return positions;
    }

    if (pawn.location.type === "RING") {
      const steps = stepsMap[card.rank];
      if (steps) {
        const homeEntry = HOME_ENTRIES[currentSlot];
        let foundHome = false;

        for (let i = 1; i <= steps; i++) {
          const nextIdx = (pawn.location.idx + i) % RING_SIZE;
          if (nextIdx === homeEntry && !foundHome) {
            foundHome = true;
            const stepsAfterHome = steps - i;
            if (stepsAfterHome === 0) {
              
              positions.push({ type: 'RING', idx: homeEntry });
            } else {
              
              const homeIdx = stepsAfterHome - 1;
              if (homeIdx <= 3) {
                positions.push({ type: 'HOME', idx: homeIdx });
              }
            }
            break;
          }
        }
        
        if (!foundHome) {
          
          const finalIdx = (pawn.location.idx + steps) % RING_SIZE;
          positions.push({ type: 'RING', idx: finalIdx });
        }
      }

      if (card.rank === "4") {
        const backIdx = (pawn.location.idx - 4 + RING_SIZE) % RING_SIZE;
        positions.push({ type: 'RING', idx: backIdx });
      }

      if (card.rank === "7") {
        const homeEntry = HOME_ENTRIES[currentSlot];
        let foundHome = false;
        
        for (let i = 1; i <= 7; i++) {
          const nextIdx = (pawn.location.idx + i) % RING_SIZE;
          if (nextIdx === homeEntry && !foundHome) {
            foundHome = true;
            const stepsAfterHome = 7 - i;
            if (stepsAfterHome === 0) {
              positions.push({ type: 'RING', idx: homeEntry });
            } else {
              const homeIdx = stepsAfterHome - 1;
              if (homeIdx <= 3) {
                positions.push({ type: 'HOME', idx: homeIdx });
              }
            }
            break;
          }
        }
        
        if (!foundHome) {
          const finalIdx = (pawn.location.idx + 7) % RING_SIZE;
          positions.push({ type: 'RING', idx: finalIdx });
        }
      }
    }

    return positions;
  };

  const handlePawnClick = (pawn: Pawn) => {
    console.log("🎯 Clic sur pion:", pawn.id);
    
    if (!selectedCard) {
      alert("Sélectionnez d'abord une carte !");
      return;
    }

    const currentSlot = localPlayerSlot !== null ? localPlayerSlot : myPlayerSlot;

    if (pawn.player !== currentSlot) {
      alert("Ce n'est pas votre pion !");
      return;
    }

    if (gameState && gameState.currentPlayer !== currentSlot) {
      alert("Ce n'est pas votre tour !");
      return;
    }

    if (wantsToExit === true && pawn.location.type === "BASE" && (selectedCard.rank === "A" || selectedCard.rank === "K")) {
      if (!socket) return;
      
      const action = { type: "exit", pawnId: pawn.id };
      const clientRequestId = `${socket.id}-${Date.now()}`;
      const playerName = localStorage.getItem("playerName") || "";
      
      socket.emit("playCard", {
        gameId,
        playerId: socket.id,
        clientRequestId,
        card: selectedCard,
        action,
        playerName,
      });

      console.log("✅ Sortie de pion jouée directement", { card: selectedCard, action });

      setSelectedCard(null);
      setSelectedPawn(null);
      setHighlightedPositions([]);
      setWantsToExit(null);
      return;
    }

    if (wantsToExit === true && pawn.location.type !== "BASE") {
      alert("Ce pion n'est pas en base ! Sélectionnez un pion dans votre réserve.");
          return;
        }

    if (wantsToExit === false && pawn.location.type === "BASE") {
      alert("Vous avez choisi de ne pas sortir. Sélectionnez un pion sur le plateau.");
          return;
        }

    setSelectedPawn(pawn);
    
    const possiblePositions = calculatePossiblePositions(pawn, selectedCard);
    console.log("📍 Positions possibles:", possiblePositions);
    setHighlightedPositions(possiblePositions);
  };

  const handlePositionClick = (position: {type: 'RING' | 'HOME', idx: number}) => {
    console.log("🎯 Clic sur position:", position);
    
    if (!selectedCard || !selectedPawn || !socket || !gameState) {
      return;
    }

    const currentSlot = localPlayerSlot !== null ? localPlayerSlot : myPlayerSlot;
    
    if (currentSlot === null || gameState.currentPlayer !== currentSlot) {
      return;
    }

    const action = selectedCard.rank === "7" 
      ? { moves: [{ pawnId: selectedPawn.id, steps: 7 }] }
      : { pawnId: selectedPawn.id };

    const clientRequestId = `${socket.id}-${Date.now()}`;
    const playerName = localStorage.getItem("playerName") || "";
    
    socket.emit("playCard", {
      gameId,
      playerId: socket.id,
      clientRequestId,
      card: selectedCard,
      action,
      playerName,
    });

    console.log("✅ Carte jouée", { card: selectedCard, action, destination: position });

    setSelectedCard(null);
    setSelectedPawn(null);
    setHighlightedPositions([]);
    setWantsToExit(null);
  };

  const handleSendChat = () => {
    if (!socket || !chatInput.trim()) return;
    
    socket.emit("chat", {
      gameId,
      playerId: socket.id,
      message: chatInput,
    });
    
    setChatInput("");
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Chargement de la partie...</p>
        </div>
      </div>
    );
  }

  const effectiveSlot = localPlayerSlot !== null ? localPlayerSlot : myPlayerSlot;
  const isMyTurn = gameState.currentPlayer === effectiveSlot;

  const playerColors = [
    { color: '#2563eb', name: 'Bleu', bg: 'bg-blue-600', text: 'text-blue-600' },
    { color: '#dc2626', name: 'Rouge', bg: 'bg-red-600', text: 'text-red-600' },
    { color: '#16a34a', name: 'Vert', bg: 'bg-green-600', text: 'text-green-600' },
    { color: '#fb923c', name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' }
  ];

  const myColor = effectiveSlot !== null ? playerColors[effectiveSlot] : null;

  console.log("🎨 RENDU - effectiveSlot:", effectiveSlot, "myColor:", myColor);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Partie Tock
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>Vous êtes le Joueur {effectiveSlot !== null ? effectiveSlot + 1 : "?"}</span>
                {myColor && (
                  <>
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-700" style={{ backgroundColor: myColor.color }}></span>
                    <span className={`font-bold ${myColor.text}`}>{myColor.name}</span>
                  </>
                )}
                <span>- Équipe {effectiveSlot !== null ? (effectiveSlot % 2 === 0 ? "A" : "B") : "?"}</span>
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${isMyTurn ? "text-green-600" : "text-gray-600"}`}>
                {isMyTurn ? "🟢 Votre tour" : `⏳ Tour du Joueur ${gameState.currentPlayer + 1}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cartes restantes: {gameState.deck.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {}
          <div className="lg:col-span-2 space-y-4">
            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <Board 
                src="/board.png" 
                highlightedPositions={highlightedPositions}
                onPawnClick={handlePawnClick}
                onPositionClick={handlePositionClick}
              />
            </div>

            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Votre main
              </h2>
              <Hand hand={myHand} onSelect={handleCardSelect} selectedCard={selectedCard} />
              {isMyTurn ? (
                <div className="mt-4 space-y-2">
                  {}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      📋 Comment jouer :
                    </p>
                    <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                      <li className={selectedCard ? "font-bold" : ""}>
                        Sélectionnez une carte {selectedCard && "✓"} {selectedCard && (selectedCard.rank === "A" || selectedCard.rank === "K") && wantsToExit !== null && `(${wantsToExit ? "Sortie" : "Mouvement"})`}
                      </li>
                      <li className={selectedCard && !selectedPawn ? "font-bold" : selectedPawn ? "line-through" : ""}>
                        Cliquez sur un pion {selectedPawn && "✓"}
                      </li>
                      <li className={selectedPawn ? "font-bold" : ""}>
                        {wantsToExit === true ? "Sortie automatique !" : "Cliquez sur une case verte"}
                      </li>
                    </ol>
                  </div>
                  <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                    💡 Astuce : Le 5 et le Valet peuvent toujours être joués (sur n'importe quel pion)
                  </p>
                  <button
                    onClick={() => {
                      setCardToDiscard(myHand[0] || null);
                      setShowPassTurnModal(true);
                    }}
                    className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    ⏭️ Passer mon tour
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Attendez votre tour pour jouer
                </p>
              )}
            </div>
          </div>

          {}
          <div className="space-y-4">
            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Joueurs
              </h2>
              <div className="space-y-2">
                {gameState.players.map((player: any, index: number) => {
                  const playerColor = playerColors[index];
                  return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === gameState.currentPlayer
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-block w-5 h-5 rounded-full border-2 border-gray-700" 
                            style={{ backgroundColor: playerColor.color }}
                          ></span>
                      <div>
                            <p className="font-medium text-gray-800 dark:text-white flex items-center gap-1">
                              <span className={`font-bold ${playerColor.text}`}>{playerColor.name}</span>
                              <span className="text-xs text-gray-500">Joueur {index + 1}</span>
                              {index === myPlayerSlot && <span className="text-xs">(Vous)</span>}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Équipe {player.team === 0 ? "A" : "B"}
                        </p>
                          </div>
                      </div>
                      {index === gameState.currentPlayer && (
                        <span className="text-2xl">👈</span>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Événements
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.slice(-10).reverse().map((event, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <p className="text-gray-800 dark:text-white">
                      {event.type === "move" && `Pion ${event.pawnId} déplacé`}
                      {event.type === "capture" && `Pion ${event.capturedPawnId} capturé !`}
                      {event.type === "teleport" && `Téléportation vers ${event.to}`}
                      {event.type === "exit" && `Pion ${event.pawnId} sorti de la base`}
                    </p>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Aucun événement pour le moment
                  </p>
                )}
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Chat
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {msg.playerName}:
                    </span>{" "}
                    <span className="text-gray-800 dark:text-white">{msg.message}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleSendChat}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
          >
            Quitter la partie
          </button>
        </div>
      </div>

      {}
      {showPassTurnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            {}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Passer mon tour
              </h3>
              <button
                onClick={() => {
                  setShowPassTurnModal(false);
                  setCardToDiscard(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Choisissez une carte à défausser :
            </p>

            {}
            <div className="mb-6">
              <select
                value={cardToDiscard?.id || ""}
                onChange={(e) => {
                  const card = myHand.find(c => c.id === e.target.value);
                  setCardToDiscard(card || null);
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {myHand.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.rank}{card.suit}
                  </option>
                ))}
              </select>
            </div>

            {}
            <button
              onClick={handlePassTurn}
              disabled={!cardToDiscard}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Défausser et passer le tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
