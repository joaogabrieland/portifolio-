'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [producerName, setProducerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        if (!res.ok) {
          setError('Convite não encontrado ou expirado.');
          return;
        }
        const data = await res.json();
        setProducerName(data.name);
      } catch {
        setError('Erro ao carregar convite.');
      } finally {
        setLoading(false);
      }
    }
    fetchInvite();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-900/20 border border-red-800/40 flex items-center justify-center mb-5">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link inválido</h1>
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      {/* Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-violet-600/8 blur-[140px] rounded-full" />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-900/30 border border-violet-800/40 flex items-center justify-center mb-6">
          <Users className="w-7 h-7 text-violet-400" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-white mb-2">Você foi convidado!</h1>
        <p className="text-zinc-400 text-sm mb-1">
          <span className="text-white font-semibold">{producerName}</span> convidou você para acessar
        </p>
        <p className="text-zinc-400 text-sm mb-8">a área do cliente no CreatorFlow.</p>

        {/* CTA */}
        <button
          onClick={() => router.push(`/cliente/${token}`)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
        >
          Acessar Área do Cliente
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Footer note */}
        <p className="text-[11px] text-zinc-600 mt-8">
          Powered by CreatorFlow AI
        </p>
      </div>
    </div>
  );
}
