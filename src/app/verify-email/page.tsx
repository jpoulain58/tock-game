"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/services/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token de vérification manquant");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        setStatus("success");
        setMessage(response.data.message || "Email vérifié avec succès !");
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Erreur lors de la vérification");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full glass rounded-3xl shadow-2xl p-10 text-center border border-gray-200 dark:border-gray-700">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-3">Vérification en cours</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Veuillez patienter...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">Email vérifié !</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Redirection automatique dans quelques secondes...</p>
            <Link
              href="/login"
              className="group relative inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover-lift overflow-hidden"
            >
              <span className="relative z-10">Se connecter maintenant</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Erreur de vérification</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="flex-1 group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover-lift overflow-hidden"
              >
                <span className="relative z-10">Nouvelle inscription</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/"
                className="flex-1 glass border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl hover-lift"
              >
                Accueil
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
        <div className="max-w-md w-full glass rounded-3xl shadow-2xl p-10 text-center border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-3">Vérification...</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Veuillez patienter</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

