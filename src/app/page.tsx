"use client";

import Link from "next/link";
import { useAuthStore } from "@/hooks/authStore";
import { useThemeStore } from "@/hooks/themeStore";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticated = mounted && isAuthenticated();

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-7xl font-extrabold mb-6 gradient-text leading-tight">
            Tock Game
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Affrontez vos amis dans des parties de Tock endiablées.
            Stratégie, animations temps réel et pure adrénaline.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="glass rounded-2xl p-8 hover-lift hover-glow group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Multijoueur</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Parties à 4 joueurs en équipes. Synchronisation parfaite via WebSocket.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 hover-lift hover-glow group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Animations Fluides</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Déplacements animés case par case pour une expérience immersive.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 hover-lift hover-glow group">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Statistiques</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Suivez vos performances et progressez dans le classement.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-6 mb-20">
          {authenticated ? (
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/dashboard"
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover-lift overflow-hidden"
              >
                <span className="relative z-10">Mon Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/lobby/new"
                className="px-8 py-4 glass text-gray-900 dark:text-white font-semibold rounded-xl hover-lift hover-glow border border-gray-200 dark:border-gray-700"
              >
                Créer une partie
              </Link>
              <Link
                href="/lobby/join"
                className="px-8 py-4 glass text-gray-900 dark:text-white font-semibold rounded-xl hover-lift hover-glow border border-gray-200 dark:border-gray-700"
              >
                Rejoindre
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover-lift overflow-hidden"
              >
                <span className="relative z-10">Créer un compte</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 glass text-gray-900 dark:text-white font-semibold rounded-xl hover-lift hover-glow border border-gray-200 dark:border-gray-700"
              >
                Se connecter
              </Link>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {authenticated ? "Prêt pour une nouvelle partie ?" : "Rejoignez la communauté dès maintenant"}
          </p>
        </div>

        {/* Rules Section */}
        <div className="glass rounded-2xl p-10 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold gradient-text mb-8 text-center">
            Comment jouer ?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Objectif du jeu</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Soyez la première équipe à placer tous vos pions dans votre maison. Travail d'équipe essentiel !
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Cartes spéciales</h4>
              <p className="text-gray-600 dark:text-gray-400">
                As et Roi pour sortir, 7 pour capturer, Valet pour échanger. Maîtrisez chaque carte.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Temps réel</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Chaque mouvement est synchronisé instantanément. Voyez vos adversaires jouer en direct.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Stratégie</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Bloquez vos adversaires, protégez votre partenaire. Chaque décision compte.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Propulsé par Next.js 15, React 19 & Socket.IO
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Développé avec passion par Jérémy Poulain
          </p>
        </div>
      </div>
    </div>
  );
}
