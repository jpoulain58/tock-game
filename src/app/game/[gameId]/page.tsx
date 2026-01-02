"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Board from "../../../components/Board";
import Hand from "../../../components/Hand";
import { useGameStore } from "@/hooks/gameStore";
import type { Card, Pawn, PawnLocation } from "@/types";
import { calculateAnimationPath, calculateStepInterval } from "@/lib/animationHelper";
import { RING_SIZE, HOME_ENTRIES } from "@/constants";

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
  const [sessionPlayers, setSessionPlayers] = useState<any[]>([]);
  const [showPassTurnModal, setShowPassTurnModal] = useState(false);
  const [cardToDiscard, setCardToDiscard] = useState<Card | null>(null);
  const [highlightedPositions, setHighlightedPositions] = useState<Array<{type: 'RING' | 'HOME', idx: number}>>([]);
  const [wantsToExit, setWantsToExit] = useState<boolean | null>(null);
  const [swapFirstPawn, setSwapFirstPawn] = useState<Pawn | null>(null);
  const [gameEndData, setGameEndData] = useState<{ winnerTeam: number; winnerPlayers: string[]; } | null>(null);


  useEffect(() => {

    const storedName = localStorage.getItem("playerName") || "Joueur";
    setPlayerName(storedName);

    let activeSocket: Socket;
    let isNewSocket = false;

    if (socket && socket.connected) {
      activeSocket = socket;
      setGameId(gameId);
      const playerName = localStorage.getItem("playerName") || "";
      activeSocket.emit("requestState", { gameId, playerName });
    } else {
      
      isNewSocket = true;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
      activeSocket = io(socketUrl);
      setSocket(activeSocket);
    setGameId(gameId);

      activeSocket.on("connect", () => {
        
        const playerName = localStorage.getItem("playerName") || "";
        
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
("📦 Data complète:", data);
("🎯 Mon slot reçu:", data.mySlot);
("👤 Mon nom:", data.myPlayerName);
("🔌 Socket ID:", activeSocket.id);
("👥 Joueurs:", data.players);
      
      setGameState(data.gameState);
      setMyHand(data.hand);
      setSessionPlayers(data.players || []);

      if (data.mySlot !== undefined && data.mySlot !== null) {
        setMyPlayerSlot(data.mySlot);
        setLocalPlayerSlot(data.mySlot);

        setTimeout(() => {
("   - Store myPlayerSlot:", myPlayerSlot);
("   - Local slot:", localPlayerSlot);
        }, 100);
      } else {
        
        const myPlayer = data.players.find(p => p.id === activeSocket.id);
      if (myPlayer) {
        setMyPlayerSlot(myPlayer.slot);
          setLocalPlayerSlot(myPlayer.slot);
        } else {
("   - Socket ID cherché:", activeSocket.id);
("   - IDs disponibles:", data.players.map(p => p.id));
        }
      }
    };

    const handleGameStarted = (data: { gameId: string; gameState: any }) => {
("🎮 Partie démarrée", data);
("🔄 currentPlayer initial:", data.gameState.currentPlayer);
      setGameState(data.gameState);

      const playerName = localStorage.getItem("playerName") || "";
      activeSocket.emit("requestState", { gameId, playerName });
    };

    const handleCardsDealt = (data: { hand: Card[] }) => {
("Cartes reçues", data);
("📇 Nombre de cartes:", data.hand.length);
      setMyHand(data.hand);
    };

    const handleCardsRedistributed = (data: { hand: Card[] }) => {
("Nouvelles cartes distribuées", data);
("📇 Nombre de cartes:", data.hand.length);
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
("📤 Carte jouée:", data.cardPlayed);
("👤 Joueur (slot):", data.playerSlot);
("🔄 Tour suivant (nouveau currentPlayer):", data.newStateSummary.currentPlayer);
("📍 Nouveaux pions:", data.newStateSummary.pawns);
("📊 Événements:", data.events);

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
            if (event.type === "cardsRedistributed" && event.playerSlot === getCurrentSlot()) {
              setMyHand([]);
              setTimeout(() => {
                setMyHand(event.handSize === 5 ? [] : []);
              }, 100);
            }
            addEvent(event);
          });

          setSelectedCard(null);
          setSelectedPawn(null);
          setSwapFirstPawn(null);
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
          if (event.type === "cardsRedistributed" && event.playerSlot === getCurrentSlot()) {
            setMyHand([]);
            setTimeout(() => {
              setMyHand(event.handSize === 5 ? [] : []);
            }, 100);
          }
          addEvent(event);
        });

        setSelectedCard(null);
        setSelectedPawn(null);
        setSwapFirstPawn(null);
      }
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
      alert(`Mouvement invalide : ${data.reason}`);
    };

    const handleGameEnded = (data: { gameId: string; winnerTeam: number; winnerPlayers: string[] }) => {
      setGameEndData({ winnerTeam: data.winnerTeam, winnerPlayers: data.winnerPlayers });
    };

    const handleChatMessage = (data: { playerId: string; playerName: string; message: string; timestamp: number }) => {
      setChatMessages(prev => [...prev, data]);
    };

    const handleError = (data: { message: string }) => {
("Erreur", data);
      alert(data.message);
    };

    const handleTurnPassed = (data: { playerSlot: number; playerName: string; cardDiscarded?: any; events: any[]; newStateSummary: any }) => {
("🎴 Carte défaussée:", data.cardDiscarded);
("🔄 Nouveau currentPlayer:", data.newStateSummary.currentPlayer);
("📍 Nouveaux pions:", data.newStateSummary.pawns);
("📊 Événements:", data.events);

      setGameState(prevState => {
        if (!prevState) {
          return prevState;
        }

        const newState = {
          ...prevState,
          currentPlayer: data.newStateSummary.currentPlayer,
          pawns: data.newStateSummary.pawns,
        };
("💾 Ancien currentPlayer:", prevState.currentPlayer);
("💾 Nouveau currentPlayer:", newState.currentPlayer);
        return newState;
      });

      data.events?.forEach(event => {
        if (event.type === "cardsRedistributed" && event.playerSlot === getCurrentSlot()) {
          setMyHand([]);
          setTimeout(() => {
            setMyHand(event.handSize === 5 ? [] : []);
          }, 100);
        }
        addEvent(event);
      });

      addEvent({
        type: "turnPassed",
        playerName: data.playerName,
        cardDiscarded: data.cardDiscarded
      });
    };

    activeSocket.on("gameState", handleGameState);
    activeSocket.on("gameStarted", handleGameStarted);
    activeSocket.on("cardsDealt", handleCardsDealt);
    activeSocket.on("cardsRedistributed", handleCardsRedistributed);
    activeSocket.on("moveApplied", handleMoveApplied);
    activeSocket.on("invalidMove", handleInvalidMove);
    activeSocket.on("gameEnded", handleGameEnded);
    activeSocket.on("chatMessage", handleChatMessage);
    activeSocket.on("turnPassed", handleTurnPassed);
    activeSocket.on("error", handleError);


    return () => {
      
      activeSocket.off("gameState", handleGameState);
      activeSocket.off("gameStarted", handleGameStarted);
      activeSocket.off("cardsDealt", handleCardsDealt);
      activeSocket.off("cardsRedistributed", handleCardsRedistributed);
      activeSocket.off("moveApplied", handleMoveApplied);
      activeSocket.off("invalidMove", handleInvalidMove);
      activeSocket.off("gameEnded", handleGameEnded);
      activeSocket.off("chatMessage", handleChatMessage);
      activeSocket.off("turnPassed", handleTurnPassed);
      activeSocket.off("error", handleError);

      if (isNewSocket && activeSocket) {
        activeSocket.close();
      } else {
      }
    };
  }, []); 

  useEffect(() => {
    if (!socket || sessionPlayers.length === 0) return;
    if (localPlayerSlot !== null && myPlayerSlot !== null) return;

    const match = sessionPlayers.find(
      (player: any) => player.id === socket.id || player.name === playerName
    );

    if (!match) {
      return;
    }

    if (localPlayerSlot === null) {
      setLocalPlayerSlot(match.slot);
    }
    if (myPlayerSlot === null) {
      setMyPlayerSlot(match.slot);
    }
  }, [socket, sessionPlayers, playerName, localPlayerSlot, myPlayerSlot, setMyPlayerSlot]);

  const getCurrentSlot = () => {
    if (localPlayerSlot !== null) return localPlayerSlot;
    if (myPlayerSlot !== null) return myPlayerSlot;

    const match = sessionPlayers.find(
      (player: any) => player.id === socket?.id || player.name === playerName
    );

    if (typeof match?.slot === "number") {
      return match.slot;
    }

    return null;
  };

  const handleCardSelect = (card: Card) => {
("🎴 Carte sélectionnée:", card);
    setSelectedCard(card);
    
    setSelectedPawn(null);
    setHighlightedPositions([]);
    
    if (card.rank === "A" || card.rank === "K") {
      const shouldExit = confirm("Voulez-vous sortir un pion de la base ?");
      setWantsToExit(shouldExit);
    } else {
      setWantsToExit(null);
    }
  setSwapFirstPawn(null);
  };

  const handlePassTurn = () => {
    if (!cardToDiscard) {
      return;
    }

    const currentSlot = getCurrentSlot();
    
    if (!socket || !gameState || currentSlot === null) {
("❌ Impossible de passer le tour:", { socket: !!socket, gameState: !!gameState, currentSlot });
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


    setShowPassTurnModal(false);
    setCardToDiscard(null);
    setSelectedCard(null);
    setSelectedPawn(null);
    setWantsToExit(null);
    setSwapFirstPawn(null);
  };

  const calculatePossiblePositions = (
    pawn: Pawn,
    card: Card,
    currentSlot: number | null
  ): Array<{type: 'RING' | 'HOME', idx: number}> => {
    if (!gameState || currentSlot === null) return [];
    
    const positions: Array<{type: 'RING' | 'HOME', idx: number}> = [];


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
        // Pour le 5, on utilise l'entrée HOME du pion, pas du joueur actuel
        const homeEntry = card.rank === "5" ? HOME_ENTRIES[pawn.player] : HOME_ENTRIES[currentSlot];
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
    if (!selectedCard) {
      alert("Sélectionnez d'abord une carte !");
      return;
    }

    const currentSlot = getCurrentSlot();

    if (currentSlot === null) {
      alert("Impossible d'identifier votre position joueur. Rafraîchissez la page.");
      return;
    }

    if (gameState && gameState.currentPlayer !== currentSlot) {
      alert("Ce n'est pas votre tour !");
      return;
    }

    if (selectedCard.rank === "J") {
      if (pawn.location.type === "BASE") {
        alert("Le valet ne peut pas échanger un pion encore en base.");
        return;
      }

      if (!swapFirstPawn) {
        setSwapFirstPawn(pawn);
        setSelectedPawn(pawn);
        setHighlightedPositions([]);
        return;
      }

      if (swapFirstPawn.id === pawn.id) {
        setSwapFirstPawn(null);
        setSelectedPawn(null);
        return;
      }

      if (!socket) return;

      const action = { pawnAId: swapFirstPawn.id, pawnBId: pawn.id };
      const clientRequestId = `${socket.id}-${Date.now()}`;
      const storingPlayerName = localStorage.getItem("playerName") || "";

      socket.emit("playCard", {
        gameId,
        playerId: socket.id,
        clientRequestId,
        card: selectedCard,
        action,
        playerName: storingPlayerName,
      });

      setSelectedCard(null);
      setSelectedPawn(null);
      setHighlightedPositions([]);
      setSwapFirstPawn(null);
      return;
    }

    // Le 5 peut bouger n'importe quel pion
    if (selectedCard.rank !== "5" && pawn.player !== currentSlot) {
      alert("Ce n'est pas votre pion !");
      return;
    }
    
    // Pour le 5, on vérifie que le pion est sur le plateau
    if (selectedCard.rank === "5" && (pawn.location.type === "BASE" || pawn.location.type === "FINISHED")) {
      alert("Ce pion ne peut pas être bougé !");
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


      setSelectedCard(null);
      setSelectedPawn(null);
      setHighlightedPositions([]);
      setWantsToExit(null);
      setSwapFirstPawn(null);
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
    
    const possiblePositions = calculatePossiblePositions(pawn, selectedCard, currentSlot);
    setHighlightedPositions(possiblePositions);
  };

  const handlePositionClick = (position: {type: 'RING' | 'HOME', idx: number}) => {
    
    if (!selectedCard || !selectedPawn || !socket || !gameState) {
      return;
    }

    if (selectedCard.rank === "J") {
      return;
    }

    const currentSlot = getCurrentSlot();
    
    if (currentSlot === null || gameState.currentPlayer !== currentSlot) {
      return;
    }

    let action;
    if (selectedCard.rank === "7") {
      action = { moves: [{ pawnId: selectedPawn.id, steps: 7 }] };
    } else if (selectedCard.rank === "A" || selectedCard.rank === "K") {
      action = { type: "move", pawnId: selectedPawn.id };
    } else {
      action = { pawnId: selectedPawn.id };
    }

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


    setSelectedCard(null);
    setSelectedPawn(null);
    setHighlightedPositions([]);
    setWantsToExit(null);
    setSwapFirstPawn(null);
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

  const effectiveSlot = getCurrentSlot();
  const isMyTurn = gameState.currentPlayer === effectiveSlot;

  const playerColors = [
    { color: '#1d4ed8', name: 'Bleu', bg: 'bg-blue-700', text: 'text-blue-700 dark:text-blue-400' },
    { color: '#b91c1c', name: 'Rouge', bg: 'bg-red-700', text: 'text-red-700 dark:text-red-400' },
    { color: '#15803d', name: 'Vert', bg: 'bg-green-700', text: 'text-green-700 dark:text-green-400' },
    { color: '#ea580c', name: 'Orange', bg: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400' }
  ];

  const myColor = effectiveSlot !== null ? playerColors[effectiveSlot] : null;

("🎨 RENDU - effectiveSlot:", effectiveSlot, "myColor:", myColor);

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
                  <div className="bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
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
                        ? "bg-green-200 dark:bg-green-900/30 border-2 border-green-600 dark:border-green-500 shadow-md"
                        : "bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
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
                      {event.type === "roundEnded" && "🎴 Tour terminé, distribution de nouvelles cartes !"}
                      {event.type === "swap" && `Pions ${event.pawnAId} et ${event.pawnBId} échangés`}
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

      {/* Victory Modal */}
      {gameEndData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="victory-modal glass rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center border-2 border-yellow-400">
            {/* Trophy Icon */}
            <div className="trophy-bounce w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              🎉 Victoire ! 🎉
            </h2>

            {/* Winner Info */}
            <div className="mb-6">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Équipe {gameEndData.winnerTeam === 0 ? "A" : "B"} a gagné !
              </p>
              <div className="glass rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Félicitations aux gagnants :</p>
                {gameEndData.winnerPlayers.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-2 mb-2">
                    <span className="sparkle text-2xl">⭐</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{player}</span>
                    <span className="sparkle text-2xl">⭐</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover-lift overflow-hidden"
              >
                <span className="relative z-10">Retour au Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 glass border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl hover-lift"
              >
                Accueil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
