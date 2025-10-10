import { Server } from "socket.io";
import { createServer } from "http";
import { TockGame } from "../game/TockGame";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const games = new Map<string, {
  game: TockGame;
  players: Array<{
    id: string;
    name: string;
    slot: number;
    team: number;
    isReady: boolean;
  }>;
  status: "waiting" | "started" | "finished";
  hostId: string;
}>();

io.on("connection", (socket) => {
  console.log(`Client connecté: ${socket.id}`);

  socket.on("createGame", (data: { gameId: string; playerName: string }) => {
    const { gameId, playerName } = data;
    
    if (games.has(gameId)) {
      socket.emit("error", { message: "Cette partie existe déjà" });
      return;
    }

    const game = new TockGame(4);
    games.set(gameId, {
      game,
      players: [],
      status: "waiting",
      hostId: socket.id,
    });

    socket.join(gameId);
    console.log(`Partie créée: ${gameId} par ${socket.id}`);
    
    socket.emit("gameCreated", { gameId });
  });

  socket.on("joinGame", (data: { gameId: string; playerId: string; playerName: string }) => {
    const { gameId, playerName } = data;
    let gameData = games.get(gameId);

    if (!gameData) {
      const game = new TockGame(4);
      gameData = {
        game,
        players: [],
        status: "waiting",
        hostId: socket.id,
      };
      games.set(gameId, gameData);
      console.log(`Partie ${gameId} créée automatiquement par ${playerName}`);
    }

    if (gameData.status !== "waiting") {
      socket.emit("error", { message: "La partie a déjà commencé" });
      return;
    }

    if (gameData.players.length >= 4) {
      socket.emit("error", { message: "La partie est complète" });
      return;
    }

    if (gameData.players.find(p => p.id === socket.id)) {
      socket.emit("error", { message: "Vous êtes déjà dans cette partie" });
      return;
    }

    const isHost = gameData.players.length === 0;
    const teamACount = gameData.players.filter(p => p.team === 0).length;
    const teamBCount = gameData.players.filter(p => p.team === 1).length;
    const defaultTeam = isHost ? 0 : (teamACount <= teamBCount ? 0 : 1);

    const usedSlots = gameData.players.map(p => p.slot);
    let slot = 0;
    for (let i = 0; i < 4; i++) {
      if (!usedSlots.includes(i)) {
        slot = i;
        break;
      }
    }

    gameData.players.push({
      id: socket.id,
      name: playerName,
      slot,
      team: defaultTeam,
      isReady: false,
    });

    socket.join(gameId);
    console.log(`${playerName} (${socket.id}) a rejoint la partie ${gameId} - Slot ${slot}, Équipe ${defaultTeam === 0 ? 'A' : 'B'}${isHost ? ' (HÔTE)' : ''}`);

    io.to(gameId).emit("playerJoined", {
      gameId,
      players: gameData.players,
      hostId: gameData.hostId,
    });
  });

  socket.on("changeTeam", (data: { gameId: string; playerId: string; newTeam: number }) => {
    const { gameId, newTeam } = data;
    const gameData = games.get(gameId);

    if (!gameData) {
      socket.emit("error", { message: "Partie introuvable" });
      return;
    }

    if (gameData.status !== "waiting") {
      socket.emit("error", { message: "Impossible de changer d'équipe pendant la partie" });
      return;
    }

    const player = gameData.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
      return;
    }

    const teamCount = gameData.players.filter(p => p.team === newTeam && p.id !== socket.id).length;
    if (teamCount >= 2) {
      socket.emit("error", { message: "Cette équipe est complète (2 joueurs max)" });
      return;
    }

    player.team = newTeam;
    player.isReady = false; 

    console.log(`${player.name} a changé pour l'équipe ${newTeam === 0 ? 'A' : 'B'}`);

    io.to(gameId).emit("teamChanged", {
      gameId,
      players: gameData.players,
      hostId: gameData.hostId,
    });
  });

  socket.on("toggleReady", (data: { gameId: string; playerId: string }) => {
    const { gameId } = data;
    const gameData = games.get(gameId);

    if (!gameData) {
      socket.emit("error", { message: "Partie introuvable" });
      return;
    }

    if (gameData.status !== "waiting") {
      socket.emit("error", { message: "La partie a déjà commencé" });
      return;
    }

    const player = gameData.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
      return;
    }

    player.isReady = !player.isReady;

    console.log(`${player.name} est ${player.isReady ? 'prêt' : 'non prêt'}`);

    io.to(gameId).emit("readyChanged", {
      gameId,
      players: gameData.players,
      hostId: gameData.hostId,
    });
  });

  socket.on("leaveGame", (data: { gameId: string; playerId: string }) => {
    const { gameId } = data;
    const gameData = games.get(gameId);

    if (!gameData) return;

    gameData.players = gameData.players.filter(p => p.id !== socket.id);
    socket.leave(gameId);

    if (gameData.players.length === 0) {
      games.delete(gameId);
      console.log(`Partie ${gameId} supprimée (aucun joueur)`);
    } else {
      
      io.to(gameId).emit("playerLeft", {
        gameId,
        players: gameData.players,
      });
    }
  });

  socket.on("startGame", (data: { gameId: string; playerId: string }) => {
    const { gameId } = data;
    const gameData = games.get(gameId);

    if (!gameData) {
      socket.emit("error", { message: "Partie introuvable" });
      return;
    }

    if (gameData.hostId !== socket.id) {
      socket.emit("error", { message: "Seul l'hôte peut démarrer la partie" });
      return;
    }

    if (gameData.players.length !== 4) {
      socket.emit("error", { message: "Il faut 4 joueurs pour commencer" });
      return;
    }

    const allReady = gameData.players.every(p => p.isReady);
    if (!allReady) {
      socket.emit("error", { message: "Tous les joueurs doivent être prêts" });
      return;
    }

    const teamACount = gameData.players.filter(p => p.team === 0).length;
    const teamBCount = gameData.players.filter(p => p.team === 1).length;
    if (teamACount !== 2 || teamBCount !== 2) {
      socket.emit("error", { message: "Il faut 2 joueurs par équipe (Équipe A et Équipe B)" });
      return;
    }

    const teamAPlayers = gameData.players.filter(p => p.team === 0);
    const teamBPlayers = gameData.players.filter(p => p.team === 1);
    
    teamAPlayers[0].slot = 0;
    teamAPlayers[1].slot = 2;
    teamBPlayers[0].slot = 1;
    teamBPlayers[1].slot = 3;

    gameData.game.state.players.forEach((player, index) => {
      const socketPlayer = gameData.players.find(p => p.slot === index);
      if (socketPlayer) {
        player.team = socketPlayer.team;
      }
    });

    gameData.status = "started";
    gameData.game.state.status = "started";

    io.to(gameId).emit("gameStarted", {
      gameId,
      gameState: gameData.game.state,
    });

    gameData.players.forEach((player) => {
      const hand = gameData.game.state.players[player.slot].hand;
      io.to(player.id).emit("cardsDealt", { hand });
    });

    console.log(`Partie ${gameId} démarrée avec les équipes:`, {
      teamA: teamAPlayers.map(p => p.name),
      teamB: teamBPlayers.map(p => p.name)
    });
  });

  socket.on("playCard", (data: {
    gameId: string;
    playerId: string;
    clientRequestId: string;
    card: any;
    action: any;
    playerName?: string;
  }) => {
    const { gameId, clientRequestId, card, action, playerName } = data;
    console.log(`🎴 playCard reçu - Carte: ${card.rank}${card.suit}, Action:`, action);
    
    const gameData = games.get(gameId);

    if (!gameData) {
      socket.emit("error", { message: "Partie introuvable" });
      return;
    }

    let player = gameData.players.find(p => p.id === socket.id);

    if (!player && playerName) {
      console.log(`🔄 Reconnexion de ${playerName} lors d'un playCard`);
      player = gameData.players.find(p => p.name === playerName);
      
      if (player) {
        
        player.id = socket.id;
        socket.join(gameId);
        console.log(`✅ ${playerName} reconnecté pour jouer`);
      }
    }
    
    if (!player) {
      console.error(`❌ Joueur non trouvé dans la partie`);
      socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
      return;
    }

    console.log(`👤 Joueur: ${player.name} (slot ${player.slot}), Tour actuel: ${gameData.game.state.currentPlayer}`);

    if (gameData.game.state.currentPlayer !== player.slot) {
      console.error(`❌ Ce n'est pas le tour de ${player.name} (slot ${player.slot}), c'est le tour du slot ${gameData.game.state.currentPlayer}`);
      socket.emit("invalidMove", {
        clientRequestId,
        reason: "Ce n'est pas votre tour",
      });
      return;
    }

    console.log(`🎮 Application de la carte ${card.rank}${card.suit} pour ${player.name}...`);

    const result = gameData.game.playCard(player.slot, card, action);

    if (!result.success) {
      console.error(`❌ Échec de l'application:`, result.error);
      socket.emit("invalidMove", {
        clientRequestId,
        reason: result.error,
      });
      return;
    }

    console.log(`✅ Carte appliquée avec succès ! Tour suivant: ${gameData.game.state.currentPlayer}`);
    console.log(`📊 Événements générés:`, result.events);

    io.to(gameId).emit("moveApplied", {
      clientRequestId,
      playerId: socket.id,
      playerSlot: player.slot,
      cardPlayed: card,
      events: result.events,
      newStateSummary: {
        currentPlayer: gameData.game.state.currentPlayer,
        pawns: gameData.game.state.pawns,
      },
    });

    console.log(`📤 moveApplied envoyé à tous les joueurs de la room ${gameId}`);

    const newHand = gameData.game.state.players[player.slot].hand;
    socket.emit("cardsDealt", { hand: newHand });
    console.log(`🎴 Nouvelle main envoyée à ${player.name}: ${newHand.length} cartes`);

    const winner = checkVictory(gameData.game);
    if (winner !== null) {
      gameData.status = "finished";
      gameData.game.state.status = "finished";
      gameData.game.state.winnerTeam = winner;

      io.to(gameId).emit("gameEnded", {
        gameId,
        winnerTeam: winner,
        winnerPlayers: gameData.players.filter(p => p.team === winner).map(p => p.name),
      });
    }
  });

  socket.on("passTurn", (data: {
    gameId: string;
    playerId: string;
    card?: any;
    playerName?: string;
  }) => {
    const { gameId, card, playerName } = data;
    const gameData = games.get(gameId);

    if (!gameData) {
      socket.emit("error", { message: "Partie introuvable" });
      return;
    }

    let player = gameData.players.find(p => p.id === socket.id);

    if (!player && playerName) {
      console.log(`🔄 Reconnexion de ${playerName} lors d'un passTurn`);
      player = gameData.players.find(p => p.name === playerName);
      
      if (player) {
        player.id = socket.id;
        socket.join(gameId);
        console.log(`✅ ${playerName} reconnecté pour passer son tour`);
      }
    }
    
    if (!player) {
      socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
      return;
    }

    if (gameData.game.state.currentPlayer !== player.slot) {
      socket.emit("error", { message: "Ce n'est pas votre tour" });
      return;
    }

    const result = gameData.game.passTurn(player.slot, card);

    if (!result.success) {
      socket.emit("error", { message: result.error || "Impossible de passer le tour" });
      return;
    }

    console.log(`⏭️ ${player.name} a passé son tour${card ? ' (carte défaussée: ' + card.rank + card.suit + ')' : ''}`);
    console.log(`🔄 Nouveau currentPlayer après passTurn: ${gameData.game.state.currentPlayer}`);

    io.to(gameId).emit("turnPassed", {
      playerSlot: player.slot,
      playerName: player.name,
      cardDiscarded: card,
      events: result.events,
      newStateSummary: {
        currentPlayer: gameData.game.state.currentPlayer,
        pawns: gameData.game.state.pawns,
      },
    });

    console.log(`📤 turnPassed envoyé à tous les joueurs de la room ${gameId} avec currentPlayer=${gameData.game.state.currentPlayer}`);

    const newHand = gameData.game.state.players[player.slot].hand;
    socket.emit("cardsDealt", { hand: newHand });

    const winner = checkVictory(gameData.game);
    if (winner !== null) {
      gameData.status = "finished";
      gameData.game.state.status = "finished";
      gameData.game.state.winnerTeam = winner;

      io.to(gameId).emit("gameEnded", {
        gameId,
        winnerTeam: winner,
        winnerPlayers: gameData.players.filter(p => p.team === winner).map(p => p.name),
      });
    }
  });

  socket.on("requestState", (data: { gameId: string; playerName?: string }) => {
    const { gameId, playerName } = data;
    console.log(`📞 requestState reçu - gameId: ${gameId}, playerName: ${playerName}, socket: ${socket.id}`);
    
    const gameData = games.get(gameId);

    if (!gameData) {
      console.log(`❌ Partie ${gameId} introuvable`);
      socket.emit("error", { message: "Partie introuvable" });
      return;
    }

    console.log(`✅ Partie trouvée, joueurs dans la room:`, gameData.players.map(p => `${p.name} (${p.id})`));

    let player = gameData.players.find(p => p.id === socket.id);
    console.log(`🔍 Joueur trouvé par socket.id:`, player ? player.name : 'NON TROUVÉ');

    if (!player && playerName) {
      console.log(`🔄 Tentative de reconnexion par nom: ${playerName}`);
      player = gameData.players.find(p => p.name === playerName);
      
      if (player) {
        
        const oldSocketId = player.id;
        player.id = socket.id;
        socket.join(gameId);
        console.log(`✅ ${playerName} reconnecté - ancien: ${oldSocketId.substring(0, 8)}..., nouveau: ${socket.id.substring(0, 8)}...`);
        console.log(`🎮 Slot assigné: ${player.slot}, Équipe: ${player.team}`);
      } else {
        console.log(`❌ Joueur avec le nom "${playerName}" non trouvé dans:`, gameData.players.map(p => p.name));
      }
    }
    
    if (!player) {
      console.log(`❌ ERREUR: Impossible de trouver le joueur`);
      socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
      return;
    }

    console.log(`📤 Envoi de gameState à ${player.name} (slot ${player.slot})`);
    socket.emit("gameState", {
      gameState: gameData.game.state,
      players: gameData.players,
      hand: gameData.game.state.players[player.slot].hand,
      mySlot: player.slot,
      myPlayerName: player.name,
    });
  });

  socket.on("chat", (data: { gameId: string; playerId: string; message: string }) => {
    const { gameId, message } = data;
    const gameData = games.get(gameId);

    if (!gameData) return;

    const player = gameData.players.find(p => p.id === socket.id);
    if (!player) return;

    io.to(gameId).emit("chatMessage", {
      playerId: socket.id,
      playerName: player.name,
      message,
      timestamp: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`Client déconnecté: ${socket.id}`);

    games.forEach((gameData, gameId) => {
      const playerIndex = gameData.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        gameData.players.splice(playerIndex, 1);
        
        if (gameData.players.length === 0) {
          games.delete(gameId);
          console.log(`Partie ${gameId} supprimée (aucun joueur)`);
        } else {
          io.to(gameId).emit("playerLeft", {
            gameId,
            players: gameData.players,
          });
        }
      }
    });
  });
});

function checkVictory(game: TockGame): number | null {
  const teams = [0, 1];
  
  for (const team of teams) {
    const teamPlayers = game.state.players.filter(p => p.team === team);
    const teamPawns = game.state.pawns.filter(p => 
      teamPlayers.some(tp => tp.slot === p.player)
    );

    const allFinished = teamPawns.every(pawn => pawn.location.type === "FINISHED");
    
    if (allFinished && teamPawns.length === 8) { 
      return team;
    }
  }
  
  return null;
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
});

