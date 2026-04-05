'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [clients, setClients] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('cf_token');

    if (!token) {
      setError('Token não encontrado no localStorage');
      setLoading(false);
      return;
    }

    try {
      // Get user info
      const userRes = await fetch('/api/debug/user-info', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUserInfo(userData);

      // Get clients
      const clientRes = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientData = await clientRes.json();
      setClients(clientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🐛 Debug Page</h1>

        <button
          onClick={fetchData}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg font-bold"
        >
          {loading ? 'Carregando...' : 'Recarregar dados'}
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300">
            ❌ Erro: {error}
          </div>
        )}

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-3">👤 Informações do Usuário</h2>
            {userInfo ? (
              <pre className="bg-black p-3 rounded overflow-auto text-sm text-emerald-300">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            ) : (
              <p className="text-zinc-400">Carregando...</p>
            )}
          </div>

          {/* Clients */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-3">📋 Clientes</h2>
            {clients ? (
              <div>
                <p className="text-sm text-zinc-300 mb-3">
                  Total de clientes: <span className="font-bold text-emerald-300">{clients.clients?.length || 0}</span>
                </p>
                <pre className="bg-black p-3 rounded overflow-auto text-sm text-emerald-300">
                  {JSON.stringify(clients, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-zinc-400">Carregando...</p>
            )}
          </div>

          {/* Expected vs Actual */}
          {userInfo && clients && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-3">✅ Verificação</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  Owner tem <span className="font-bold text-emerald-300">{userInfo.ownerClientCount}</span> clientes
                </li>
                <li>
                  Você está vendo <span className="font-bold text-emerald-300">{clients.clients?.length || 0}</span> clientes
                </li>
                <li>
                  {userInfo.ownerClientCount > 0 && clients.clients?.length > 0 ? (
                    <span className="text-emerald-300">✅ Funcionando corretamente!</span>
                  ) : userInfo.ownerClientCount > 0 && clients.clients?.length === 0 ? (
                    <span className="text-red-300">❌ BUG: Owner tem clientes mas você não está vendo</span>
                  ) : (
                    <span className="text-yellow-300">⚠️ Owner não tem clientes cadastrados</span>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
