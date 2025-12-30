"use client";

import { useState } from "react";
import Link from "next/link";
import { authAPI } from "@/utils/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(
        response.data.message ||
          "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
      );
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Erreur lors de la demande de réinitialisation de mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔐 Mot de passe oublié</h1>
          <p className="text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}


