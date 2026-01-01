"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/authStore";
import { useThemeStore } from "@/hooks/themeStore";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Bonjour, {user?.firstName}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Prêt pour une nouvelle partie ?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover-lift">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Nom complet</span>
                <span className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pseudo</span>
                <span className="font-semibold text-gray-900 dark:text-white">{user?.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover-lift">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Statistiques</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Parties jouées</span>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Victoires</span>
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Taux de victoire</span>
                <span className="text-3xl font-bold gradient-text">0%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
              Commencez à jouer pour voir vos statistiques
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Lancer une partie</h2>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/lobby/new"
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover-lift overflow-hidden"
            >
              <span className="relative z-10">Créer une partie</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/lobby/join"
              className="px-8 py-4 glass text-gray-900 dark:text-white font-semibold rounded-xl hover-lift hover-glow border border-gray-300 dark:border-gray-600"
            >
              Rejoindre une partie
            </Link>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Historique des parties</h2>
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Aucune partie jouée</p>
            <p className="text-sm">Lancez votre première partie pour voir l'historique ici</p>
          </div>
        </div>
      </div>
    </div>
  );
}
