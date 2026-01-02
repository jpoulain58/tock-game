"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useThemeStore } from "@/hooks/themeStore";

export default function NewLobby() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [playerName, setPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert("Veuillez entrer votre nom");
      return;
    }

    setIsCreating(true);
    const gameId = uuidv4();

    localStorage.setItem("playerName", playerName);

    router.push(`/lobby/${gameId}`);
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-8">
      <div className="glass rounded-3xl shadow-2xl p-10 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Nouvelle partie
        </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Créez votre partie et invitez vos amis
          </p>
        </div>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Votre pseudo
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Entrez votre pseudo"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
              onKeyPress={(e) => e.key === "Enter" && handleCreateGame()}
            />
          </div>

          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full group relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10">{isCreating ? "Création en cours..." : "Créer la partie"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full glass border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl hover-lift"
          >
            Retour à l'accueil
          </button>
        </div>

        <div className="mt-8 p-5 glass rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Comment ça marche ?
          </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Une fois la partie créée, partagez l'ID avec 3 amis. Il faut 4 joueurs pour démarrer.
          </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

