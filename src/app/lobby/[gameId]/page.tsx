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
    setPlayerName(storedName);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const newSocket = io(socketUrl);
    setSocket(newSocket);


    newSocket.on("playerJoined", (data: { gameId: string; players: Player[]; hostId?: string }) => {
      setPlayers(data.players);

          const myPlayer = data.players.find(p => p.id === newSocket.id);
          if (myPlayer) {
                  setIsJoined(true);
                }

      if (data.hostId && data.hostId === newSocket.id) {
        setIsHost(true);
      }
    });

    newSocket.on("playerLeft", (data: { gameId: string; players: Player[] }) => {
      setPlayers(data.players);
    });

    newSocket.on("teamChanged", (data: { gameId: string; players: Player[]; hostId?: string }) => {
      setPlayers(data.players);
      
      if (data.hostId && data.hostId === newSocket.id) {
        setIsHost(true);
      }
    });

    newSocket.on("readyChanged", (data: { gameId: string; players: Player[]; hostId?: string }) => {
      setPlayers(data.players);
      
      if (data.hostId && data.hostId === newSocket.id) {
        setIsHost(true);
      }
    });

    newSocket.on("gameStarted", (data: { gameId: string; gameState: any }) => {
      
      router.push(`/game/${gameId}`);
    });

    newSocket.on("error", (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(""), 5000);
    });

    return () => {

      if (newSocket && !window.location.pathname.includes('/game/')) {
        newSocket.emit("leaveGame", { gameId, playerId: newSocket.id });
        newSocket.close();
      }
    };
  }, [gameId, router]);

  const handleJoinGame = () => {
    if (!socket || !playerName.trim()) {
      setError("Veuillez entrer votre nom");
      return;
    }

    const isFirstPlayer = players.length === 0;
    setIsHost(isFirstPlayer);

    socket.emit("joinGame", { 
      gameId, 
      playerId: socket.id,
      playerName
    });
    
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

  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="glass rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Salle d'attente
        </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Préparez-vous pour la bataille</p>
        </div>

        <div className="mb-6 glass p-5 rounded-2xl border border-gray-200 dark:border-gray-700 relative">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID de la partie</p>
              <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all">
                {gameId}
              </p>
            </div>
            <button
              onClick={copyGameId}
              className="ml-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm rounded-xl shadow hover-lift transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {/* Toast de copie */}
          {showCopiedToast && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass bg-green-50/90 dark:bg-green-900/90 border border-green-300 dark:border-green-700 px-4 py-2 rounded-xl shadow-lg animate-bounce z-10">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold text-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Copié !
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 glass p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!isJoined ? (
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Votre pseudo
              </label>
              <input
                id="name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre pseudo"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm"
                onKeyPress={(e) => e.key === "Enter" && handleJoinGame()}
              />
            </div>
            <button
              onClick={handleJoinGame}
              className="w-full group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover-lift overflow-hidden"
            >
              <span className="relative z-10">Rejoindre la partie</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl border-2 border-indigo-500/50 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                  Équipe A
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-full">
                    {players.filter(p => p.team === 0).length}/2
                  </span>
                </div>
                <div className="space-y-3">
                  {players.filter(p => p.team === 0).map((player) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-xl transition-all ${
                        player.isReady
                          ? "glass bg-green-50/50 dark:bg-green-900/20 border-2 border-green-500"
                          : "glass border-2 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {player.name}
                          </p>
                          {player.id === socket?.id && (
                            <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-md font-medium">
                              Vous
                            </span>
                          )}
                        </div>
                        {player.isReady && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Prêt
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {players.filter(p => p.team === 0).length < 2 && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">En attente...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass p-6 rounded-2xl border-2 border-pink-500/50 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-pink-700 dark:text-pink-300">
                  Équipe B
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-semibold rounded-full">
                    {players.filter(p => p.team === 1).length}/2
                  </span>
                </div>
                <div className="space-y-3">
                  {players.filter(p => p.team === 1).map((player) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-xl transition-all ${
                        player.isReady
                          ? "glass bg-green-50/50 dark:bg-green-900/20 border-2 border-green-500"
                          : "glass border-2 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {player.name}
                          </p>
                          {player.id === socket?.id && (
                            <span className="text-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white px-2 py-1 rounded-md font-medium">
                              Vous
                            </span>
                          )}
                        </div>
                        {player.isReady && (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Prêt
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {players.filter(p => p.team === 1).length < 2 && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">En attente...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Actions
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleChangeTeam(0)}
                  disabled={players.find(p => p.id === socket?.id)?.team === 0}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition hover-lift disabled:cursor-not-allowed text-sm"
                >
                  Équipe A
                </button>
                <button
                  onClick={() => handleChangeTeam(1)}
                  disabled={players.find(p => p.id === socket?.id)?.team === 1}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition hover-lift disabled:cursor-not-allowed text-sm"
                >
                  Équipe B
                </button>
                <button
                  onClick={handleToggleReady}
                  className={`font-semibold py-3 px-4 rounded-xl transition hover-lift text-sm ${
                    players.find(p => p.id === socket?.id)?.isReady
                      ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  }`}
                >
                  {players.find(p => p.id === socket?.id)?.isReady ? "Annuler" : "Prêt"}
                </button>
              </div>
            </div>

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
                  className="flex-1 group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover-lift disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10">Démarrer la partie</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="flex-1 glass border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl hover-lift"
              >
                Quitter
              </button>
            </div>

            {players.length < 4 && (
              <div className="text-center glass p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm font-medium">
                    En attente de {4 - players.length} joueur{4 - players.length > 1 ? 's' : ''}
                </p>
                </div>
              </div>
            )}
            
            {players.length === 4 && !players.every(p => p.isReady) && (
              <div className="text-center glass p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">
                    En attente que tous les joueurs soient prêts
                </p>
                </div>
              </div>
            )}

            {players.length === 4 && players.every(p => p.isReady) && 
             (players.filter(p => p.team === 0).length !== 2 || players.filter(p => p.team === 1).length !== 2) && (
              <div className="text-center glass p-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">
                    Il faut 2 joueurs par équipe
                </p>
                </div>
              </div>
            )}

            {!isHost && players.length === 4 && players.every(p => p.isReady) &&
             players.filter(p => p.team === 0).length === 2 && players.filter(p => p.team === 1).length === 2 && (
              <div className="text-center glass p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">
                    Prêt à démarrer ! En attente de l'hôte...
                </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

