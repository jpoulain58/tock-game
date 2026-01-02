import { Server, Socket } from "socket.io";
import { getOrCreateGameSession, assignSlot } from "../utils";
import { GamesRegistry } from "../types";
import { TockGame } from "../../game/TockGame";
import { createGameInDB } from "../../services/gameService";

interface CreateGamePayload {
  gameId: string;
  playerName: string;
}

interface JoinGamePayload extends CreateGamePayload {
  playerId: string;
}

interface ChangeTeamPayload {
  gameId: string;
  playerId: string;
  newTeam: number;
}

interface ToggleReadyPayload {
  gameId: string;
  playerId: string;
}

interface LeaveGamePayload {
  gameId: string;
  playerId: string;
}

interface StartGamePayload {
  gameId: string;
  playerId: string;
}

export function registerLobbyHandlers(
  io: Server,
  socket: Socket,
  games: GamesRegistry
): void {
  socket.on("createGame", (payload: CreateGamePayload) =>
    handleCreateGame(io, socket, games, payload)
  );
  socket.on("joinGame", (payload: JoinGamePayload) =>
    handleJoinGame(io, socket, games, payload)
  );
  socket.on("changeTeam", (payload: ChangeTeamPayload) =>
    handleChangeTeam(io, socket, games, payload)
  );
  socket.on("toggleReady", (payload: ToggleReadyPayload) =>
    handleToggleReady(io, socket, games, payload)
  );
  socket.on("leaveGame", (payload: LeaveGamePayload) =>
    handleLeaveGame(io, socket, games, payload)
  );
  socket.on("startGame", (payload: StartGamePayload) =>
    handleStartGame(io, socket, games, payload)
  );
}

function handleCreateGame(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: CreateGamePayload
) {
  const { gameId } = payload;
  if (games.has(gameId)) {
    socket.emit("error", { message: "Cette partie existe déjà" });
    return;
  }

  getOrCreateGameSession(games, gameId, socket.id);
  socket.join(gameId);
  io.to(socket.id).emit("gameCreated", { gameId });
}

function handleJoinGame(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: JoinGamePayload
) {
  const { gameId, playerName } = payload;
  let session = games.get(gameId);

  if (!session) {
    session = {
      game: new TockGame(4),
      players: [],
      status: "waiting",
      hostId: socket.id,
    };
    games.set(gameId, session);
  }

  if (session.status !== "waiting") {
    socket.emit("error", { message: "La partie a déjà commencé" });
    return;
  }

  if (session.players.length >= 4) {
    socket.emit("error", { message: "La partie est complète" });
    return;
  }

  if (session.players.find((player) => player.id === socket.id)) {
    socket.emit("error", { message: "Vous êtes déjà dans cette partie" });
    return;
  }

  const isHost = session.players.length === 0;
  const teamACount = session.players.filter((player) => player.team === 0).length;
  const teamBCount = session.players.filter((player) => player.team === 1).length;
  const defaultTeam = isHost ? 0 : teamACount <= teamBCount ? 0 : 1;

  const slot = assignSlot(session.players);

  session.players.push({
    id: socket.id,
    name: playerName,
    slot,
    team: defaultTeam,
    isReady: false,
  });

  socket.join(gameId);
  io.to(gameId).emit("playerJoined", {
    gameId,
    players: session.players,
    hostId: session.hostId,
  });
}

function handleChangeTeam(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: ChangeTeamPayload
) {
  const { gameId, newTeam } = payload;
  const session = games.get(gameId);
  
  if (!session) {
    socket.emit("error", { message: "Partie introuvable" });
    return;
  }
  
  if (session.status !== "waiting") {
    socket.emit("error", { message: "Impossible de changer d'équipe pendant la partie" });
    return;
  }
  
  const player = session.players.find((candidate) => candidate.id === socket.id);
  if (!player) {
    socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
    return;
  }
  
  if (player.team === newTeam) {
    return;
  }
  
  const currentTeamCount = session.players.filter(
    (p) => p.team === newTeam && p.id !== socket.id
  ).length;
  
  if (currentTeamCount >= 2) {
    socket.emit("error", { message: "Cette équipe est complète (2 joueurs max)" });
    return;
  }

  player.team = newTeam;
  player.isReady = false;

  io.to(gameId).emit("teamChanged", {
    gameId,
    players: session.players,
    hostId: session.hostId,
  });
}

function handleToggleReady(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: ToggleReadyPayload
) {
  const { gameId } = payload;
  const session = games.get(gameId);
  if (!session) {
    socket.emit("error", { message: "Partie introuvable" });
    return;
  }
  if (session.status !== "waiting") {
    socket.emit("error", { message: "La partie a déjà commencé" });
    return;
  }
  const player = session.players.find((candidate) => candidate.id === socket.id);
  if (!player) {
    socket.emit("error", { message: "Vous n'êtes pas dans cette partie" });
    return;
  }

  player.isReady = !player.isReady;

  io.to(gameId).emit("readyChanged", {
    gameId,
    players: session.players,
    hostId: session.hostId,
  });
}

function handleLeaveGame(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: LeaveGamePayload
) {
  const { gameId } = payload;
  const session = games.get(gameId);
  if (!session) {
    return;
  }

  session.players = session.players.filter((player) => player.id !== socket.id);
  socket.leave(gameId);

  if (session.players.length === 0) {
    games.delete(gameId);
    return;
  }

  io.to(gameId).emit("playerLeft", {
    gameId,
    players: session.players,
  });
}

function handleStartGame(
  io: Server,
  socket: Socket,
  games: GamesRegistry,
  payload: StartGamePayload
) {
  const { gameId } = payload;
  const session = games.get(gameId);
  if (!session) {
    socket.emit("error", { message: "Partie introuvable" });
    return;
  }
  if (session.hostId !== socket.id) {
    socket.emit("error", { message: "Seul l'hôte peut démarrer la partie" });
    return;
  }
  if (session.players.length !== 4) {
    socket.emit("error", { message: "Il faut 4 joueurs pour commencer" });
    return;
  }
  const allReady = session.players.every((player) => player.isReady);
  if (!allReady) {
    socket.emit("error", { message: "Tous les joueurs doivent être prêts" });
    return;
  }
  const teamACount = session.players.filter((player) => player.team === 0).length;
  const teamBCount = session.players.filter((player) => player.team === 1).length;
  if (teamACount !== 2 || teamBCount !== 2) {
    socket.emit("error", {
      message: "Il faut 2 joueurs par équipe (Équipe A et Équipe B)",
    });
    return;
  }

  const teamAPlayers = session.players.filter((player) => player.team === 0);
  const teamBPlayers = session.players.filter((player) => player.team === 1);
  teamAPlayers[0].slot = 0;
  teamAPlayers[1].slot = 2;
  teamBPlayers[0].slot = 1;
  teamBPlayers[1].slot = 3;

  session.game.state.players.forEach((player, index) => {
    const socketPlayer = session.players.find((candidate) => candidate.slot === index);
    if (socketPlayer) {
      player.team = socketPlayer.team;
    }
  });

  session.status = "started";
  session.game.state.status = "started";

  // Sauvegarder la partie en base de données
  createGameInDB(gameId, socket.id, session).catch((error) => {
    console.error("Erreur lors de la sauvegarde de la partie:", error);
  });

  io.to(gameId).emit("gameStarted", {
    gameId,
    gameState: session.game.state,
  });

  session.players.forEach((player) => {
    const hand = session.game.state.players[player.slot].hand;
    io.to(player.id).emit("cardsDealt", { hand });
  });
}


