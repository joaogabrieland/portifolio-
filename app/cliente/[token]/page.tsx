'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Video, FolderOpen, Bell, AlertCircle, Loader2, MessageCircle } from 'lucide-react';

interface ClientMessage {
  id: number;
  message: string;
  created_at: string;
}

export default function ClientePortalPage() {
  const { token } = useParams<{ token: string }>();
  const [producerName, setProducerName] = useState('');
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [inviteRes, msgRes] = await Promise.all([
          fetch(`/api/invite/${token}`),
          fetch(`/api/cliente/${token}/messages`),
        ]);
        if (!inviteRes.ok) {
          setError('Acesso inválido.');
          return;
        }
        const inviteData = await inviteRes.json();
        setProducerName(inviteData.name);

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData.messages || []);
        }
      } catch {
        setError('Erro ao carregar portal.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
          <h1 className="text-xl font-bold text-white mb-2">Acesso inválido</h1>
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-600/8 blur-[140px] rounded-full" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Producer header */}
        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">
              {producerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Área do Cliente</p>
            <h1 className="text-xl font-bold text-white">{producerName}</h1>
          </div>
        </div>

        {/* Sections */}
        <div className="grid gap-4">
          {/* Aprovação de Vídeos — placeholder */}
          <div className="group bg-white/[0.03] border border-white/8 hover:border-white/15 rounded-2xl p-6 flex items-start gap-4 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-base">Aprovação de Vídeos</h3>
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">Em breve</span>
              </div>
              <p className="text-sm text-zinc-500">Revise e aprove os vídeos da sua produção.</p>
            </div>
          </div>

          {/* Arquivos Entregues — placeholder */}
          <div className="group bg-white/[0.03] border border-white/8 hover:border-white/15 rounded-2xl p-6 flex items-start gap-4 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-base">Arquivos Entregues</h3>
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">Em breve</span>
              </div>
              <p className="text-sm text-zinc-500">Acesse todos os arquivos finalizados.</p>
            </div>
          </div>

          {/* Avisos / Mensagens — LIVE */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base">Avisos / Mensagens</h3>
                <p className="text-sm text-zinc-500">Comunicações da equipe de produção.</p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white/[0.02] border border-white/5">
                <MessageCircle className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                <p className="text-sm text-zinc-600">Nenhuma mensagem ainda.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-[11px] text-zinc-600 mt-2">{formatDate(msg.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-600 mt-12">
          Powered by CreatorFlow AI
        </p>
      </div>
    </div>
  );
}
