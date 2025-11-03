"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du compte</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-semibold">Nom complet :</span> {user?.firstName} {user?.lastName}
              </div>
              <div>
                <span className="font-semibold">Nom d'utilisateur :</span> {user?.username}
              </div>
              <div>
                <span className="font-semibold">Email :</span> {user?.email}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-semibold">Parties jouées :</span> 0
              </div>
              <div>
                <span className="font-semibold">Victoires :</span> 0
              </div>
              <div>
                <span className="font-semibold">Taux de victoire :</span> 0%
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Les statistiques seront bientôt disponibles !
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/lobby/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
              🎮 Créer une partie
            </Link>
            <Link
              href="/lobby/join"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition"
            >
              🚪 Rejoindre une partie
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des parties</h2>
          <div className="text-center text-gray-500 py-8">
            <div className="text-5xl mb-4">🎲</div>
            <p>Aucune partie jouée pour le moment</p>
            <p className="text-sm mt-2">Créez une partie pour commencer !</p>
          </div>
        </div>
      </div>
    </div>
  );
}
