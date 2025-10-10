import Link from "next/link";
import Board from "@/components/Board";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-4xl font-bold mb-2 text-center">Tock 2v2 Online</h1>
      <p className="text-lg text-center max-w-xl mb-4">
        Bienvenue sur la plateforme Tock ! Créez une partie, invitez vos amis et jouez en ligne avec les vraies règles du Tock 2v2.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
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
        <Link
          href="/dashboard"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
        >
          📊 Dashboard
        </Link>
      </div>
      <div className="mt-8 text-sm text-gray-500 text-center">
        Projet Next.js + Socket.IO + Prisma<br />
        <span className="italic">Développé par jeremypoulain</span>
      </div>
      {}
      <div className="w-full max-w-3xl">
        <Board src="/board.png" />
      </div>
    </div>
  );
}
