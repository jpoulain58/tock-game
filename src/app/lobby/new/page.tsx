"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function NewLobby() {
  const router = useRouter();
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Créer une nouvelle partie
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Votre nom
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Entrez votre nom"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === "Enter" && handleCreateGame()}
            />
          </div>

          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Création..." : "Créer la partie"}
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Retour
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
            ℹ️ Instructions
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Créez une partie et partagez l'ID avec vos amis pour qu'ils puissent vous rejoindre. 
            Il faut 4 joueurs pour commencer une partie de Tock 2v2.
          </p>
        </div>
      </div>
    </div>
  );
}

