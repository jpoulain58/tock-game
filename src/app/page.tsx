"use client";

import Link from "next/link";
import { useAuthStore } from "@/hooks/authStore";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = mounted && isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            🎮 Tock Game
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Jouez au Tock en ligne avec vos amis ! Jeu de plateau 2v2 avec animations temps réel et règles complètes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multijoueur</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Jouez à 4 en 2v2 avec vos amis en temps réel
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Animations</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Déplacements pas à pas avec compteur visuel
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Classement</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Historique des parties et tableau des scores
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          {authenticated ? (
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition text-lg"
              >
                📊 Mon Dashboard
              </Link>
              <Link
                href="/lobby/new"
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-green-700 transition text-lg"
              >
                🎮 Créer une partie
              </Link>
              <Link
                href="/lobby/join"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition text-lg"
              >
                🚪 Rejoindre une partie
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition text-lg"
              >
                🚀 Créer un compte
              </Link>
              <Link
                href="/login"
                className="bg-gray-200 text-gray-800 px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-gray-300 transition text-lg"
              >
                🔐 Se connecter
              </Link>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            {authenticated ? "Vous êtes connecté !" : "Inscrivez-vous pour sauvegarder vos parties et voir votre historique"}
          </p>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            🎴 Règles du jeu
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-semibold mb-2">Objectif</h4>
              <p className="text-sm">
                L'équipe qui finit tous ses 8 pions (4×2) dans leur maison gagne
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cartes spéciales</h4>
              <p className="text-sm">
                As/Roi pour sortir, 7 capture au passage, Valet échange 2 pions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Animations</h4>
              <p className="text-sm">
                Déplacements pas à pas (300ms/pas) avec compteur visible
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Temps réel</h4>
              <p className="text-sm">
                Communication Socket.IO pour une synchronisation parfaite
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Next.js 15 · React 19 · TypeScript · Socket.IO · Prisma · PostgreSQL</p>
          <p className="mt-2">
            Développé par <span className="font-semibold">Jérémy Poulain</span>
          </p>
        </div>
      </div>
    </div>
  );
}
