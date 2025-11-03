"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/utils/api";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vérification en cours...</h1>
            <p className="text-gray-600">Veuillez patienter</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-4">Email vérifié !</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
            <Link
              href="/login"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Se connecter maintenant
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Erreur de vérification</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Retour à l'inscription
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vérification en cours...</h1>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

