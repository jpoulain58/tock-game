import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard Tock</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          href="/lobby/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-center"
        >
          🎮 Créer une nouvelle partie
        </Link>
        <Link
          href="/lobby/join"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition text-center"
        >
          🚪 Rejoindre une partie
        </Link>
        <Link
          href="/"
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
