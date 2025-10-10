"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Player = {
  id: string;
  name: string;
  slot: number;
  team: number;
  isReady: boolean;
};

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    
    const storedName = localStorage.getItem("playerName") || "";
    console.log("📝 Nom récupéré du localStorage:", storedName);
    setPlayerName(storedName);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log("🔌 Connexion au serveur:", socketUrl);
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connecté au serveur socket, ID:", newSocket.id);

      if (storedName && storedName.trim()) {
        console.log("🚀 Auto-join avec le nom:", storedName);
        console.log("🎮 Game ID:", gameId);
        
        newSocket.emit("joinGame", { 
          gameId, 
          playerId: newSocket.id,
          playerName: storedName
        });
        
        setIsJoined(true);
        console.log("✅ Commande joinGame envoyée");
      } else {
        console.log("⚠️ Pas de nom stocké, affichage du formulaire");
      }
    });

    newSocket.on("playerJoined", (data: { gameId: string; players: Player[]; hostId?: string }) => {
      console.log("👥 Player joined", data);
      console.log("👤 Joueurs dans la room:", data.players.length);
      console.log("🎯 Je suis l'hôte ?", data.hostId === newSocket.id);
      
      setPlayers(data.players);

      if (data.hostId && data.hostId === newSocket.id) {
        console.log("👑 Je suis confirmé comme hôte");
        setIsHost(true);
      }
    });

    newSocket.on("playerLeft", (data: { gameId: string; players: Player[] }) => {
      console.log("Player left", data);
      setPlayers(data.players);
    });

    newSocket.on("teamChanged", (data: { gameId: string; players: Player[]; hostId?: string }) => {
      console.log("Team changed", data);
      setPlayers(data.players);
      
      if (data.hostId && data.hostId === newSocket.id) {
        setIsHost(true);
      }
    });

    newSocket.on("readyChanged", (data: { gameId: string; players: Player[]; hostId?: string }) => {
      console.log("Ready changed", data);
      setPlayers(data.players);
      
      if (data.hostId && data.hostId === newSocket.id) {
        setIsHost(true);
      }
    });

    newSocket.on("gameStarted", (data: { gameId: string; gameState: any }) => {
      console.log("Game started", data);
      
      router.push(`/game/${gameId}`);
    });

    newSocket.on("error", (data: { message: string }) => {
      console.error("❌ Erreur reçue du serveur:", data.message);
      setError(data.message);
      alert(`Erreur: ${data.message}`);
    });

    return () => {

      if (newSocket && !window.location.pathname.includes('/game/')) {
        console.log("🚪 Fermeture de la socket (quitte le lobby)");
        newSocket.emit("leaveGame", { gameId, playerId: newSocket.id });
        newSocket.close();
      }
    };
  }, [gameId, router]);

  const handleJoinGame = () => {
    if (!socket || !playerName.trim()) {
      alert("Veuillez entrer votre nom");
      return;
    }

    const isFirstPlayer = players.length === 0;
    setIsHost(isFirstPlayer);

    socket.emit("joinGame", { 
      gameId, 
      playerId: socket.id,
      playerName
    });
    
    setIsJoined(true);
  };

  const handleStartGame = () => {
    if (!socket) return;
    
    if (players.length < 4) {
      alert("Il faut 4 joueurs pour commencer la partie");
      return;
    }

    const allReady = players.every(p => p.isReady);
    if (!allReady) {
      alert("Tous les joueurs doivent être prêts !");
      return;
    }

    const teamACount = players.filter(p => p.team === 0).length;
    const teamBCount = players.filter(p => p.team === 1).length;
    if (teamACount !== 2 || teamBCount !== 2) {
      alert("Il faut 2 joueurs par équipe (Équipe A et Équipe B)");
      return;
    }

    socket.emit("startGame", { gameId, playerId: socket.id });
  };

  const handleChangeTeam = (newTeam: number) => {
    if (!socket) return;
    socket.emit("changeTeam", { gameId, playerId: socket.id, newTeam });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit("toggleReady", { gameId, playerId: socket.id });
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    alert("ID de partie copié dans le presse-papiers !");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Lobby de partie
        </h1>

        {}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID de la partie</p>
              <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white break-all">
                {gameId}
              </p>
            </div>
            <button
              onClick={copyGameId}
              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              Copier
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {!isJoined ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Votre nom
              </label>
              <input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre nom"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === "Enter" && handleJoinGame()}
              />
            </div>
            <button
              onClick={handleJoinGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
            >
              Rejoindre la partie
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {}
            <div className="grid grid-cols-2 gap-6">
              {}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center justify-between">
                  Équipe A
                  <span className="text-sm font-normal">
                    ({players.filter(p => p.team === 0).length}/2)
                  </span>
                </h2>
                <div className="space-y-2">
                  {players.filter(p => p.team === 0).map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg ${
                        player.isReady
                          ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                          : "bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {player.name}
                          </p>
                          {player.id === socket?.id && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                              Vous
                            </span>
                          )}
                        </div>
                        {player.isReady && (
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                            ✓ Prêt
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {players.filter(p => p.team === 0).length < 2 && (
                    <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400 text-sm">
                      En attente d'un joueur...
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4">
                <h2 className="text-lg font-bold text-red-700 dark:text-red-300 mb-3 flex items-center justify-between">
                  Équipe B
                  <span className="text-sm font-normal">
                    ({players.filter(p => p.team === 1).length}/2)
                  </span>
                </h2>
                <div className="space-y-2">
                  {players.filter(p => p.team === 1).map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg ${
                        player.isReady
                          ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                          : "bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {player.name}
                          </p>
                          {player.id === socket?.id && (
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                              Vous
                            </span>
                          )}
                        </div>
                        {player.isReady && (
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                            ✓ Prêt
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {players.filter(p => p.team === 1).length < 2 && (
                    <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400 text-sm">
                      En attente d'un joueur...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Vos contrôles
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleChangeTeam(0)}
                  disabled={players.find(p => p.id === socket?.id)?.team === 0 || 
                           players.filter(p => p.team === 0).length >= 2}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
                >
                  Rejoindre Équipe A
                </button>
                <button
                  onClick={() => handleChangeTeam(1)}
                  disabled={players.find(p => p.id === socket?.id)?.team === 1 || 
                           players.filter(p => p.team === 1).length >= 2}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
                >
                  Rejoindre Équipe B
                </button>
                <button
                  onClick={handleToggleReady}
                  className={`flex-1 font-semibold py-2 px-4 rounded-lg transition ${
                    players.find(p => p.id === socket?.id)?.isReady
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {players.find(p => p.id === socket?.id)?.isReady ? "❌ Annuler" : "✓ Prêt"}
                </button>
              </div>
            </div>

            {}
            <div className="flex gap-4">
              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={
                    players.length < 4 || 
                    !players.every(p => p.isReady) ||
                    players.filter(p => p.team === 0).length !== 2 ||
                    players.filter(p => p.team === 1).length !== 2
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition disabled:cursor-not-allowed"
                >
                  🚀 Démarrer la partie
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Quitter
              </button>
            </div>

            {}
            {players.length < 4 && (
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⏳ En attente de {4 - players.length} joueur(s) supplémentaire(s)
                </p>
              </div>
            )}
            
            {players.length === 4 && !players.every(p => p.isReady) && (
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ⏳ En attente que tous les joueurs soient prêts
                </p>
              </div>
            )}

            {players.length === 4 && players.every(p => p.isReady) && 
             (players.filter(p => p.team === 0).length !== 2 || players.filter(p => p.team === 1).length !== 2) && (
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  ⚠️ Il faut 2 joueurs par équipe pour démarrer
                </p>
              </div>
            )}

            {!isHost && players.length === 4 && players.every(p => p.isReady) &&
             players.filter(p => p.team === 0).length === 2 && players.filter(p => p.team === 1).length === 2 && (
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Prêt à démarrer ! En attente de l'hôte...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

