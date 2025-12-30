"use client";

export default function ApiTestPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'NOT SET';
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'NOT SET';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🔍 Configuration API</h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="font-semibold text-lg text-gray-700">NEXT_PUBLIC_API_URL</h2>
            <p className={`mt-2 font-mono text-sm p-3 rounded ${apiUrl === 'NOT SET' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {apiUrl}
            </p>
          </div>

          <div className="border-b pb-4">
            <h2 className="font-semibold text-lg text-gray-700">NEXT_PUBLIC_SOCKET_URL</h2>
            <p className={`mt-2 font-mono text-sm p-3 rounded ${socketUrl === 'NOT SET' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {socketUrl}
            </p>
          </div>

          <div className="pt-4">
            <h2 className="font-semibold text-lg text-gray-700 mb-2">Status</h2>
            {apiUrl === 'NOT SET' || socketUrl === 'NOT SET' ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                ❌ Variables d'environnement manquantes !
                <br />
                <small>Ajoutez-les sur Vercel → Settings → Environment Variables</small>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
                ✅ Configuration correcte !
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

