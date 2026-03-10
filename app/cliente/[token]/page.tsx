'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Video, FolderOpen, Bell, AlertCircle, Loader2 } from 'lucide-react';

interface Section {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SECTIONS: Section[] = [
  {
    icon: <Video className="w-5 h-5 text-violet-400" />,
    title: 'Aprovação de Vídeos',
    description: 'Revise e aprove os vídeos da sua produção.',
  },
  {
    icon: <FolderOpen className="w-5 h-5 text-emerald-400" />,
    title: 'Arquivos Entregues',
    description: 'Acesse todos os arquivos finalizados.',
  },
  {
    icon: <Bell className="w-5 h-5 text-amber-400" />,
    title: 'Avisos / Mensagens',
    description: 'Comunicações da equipe de produção.',
  },
];

export default function ClientePortalPage() {
  const { token } = useParams<{ token: string }>();
  const [producerName, setProducerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducer() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        if (!res.ok) {
          setError('Acesso inválido.');
          return;
        }
        const data = await res.json();
        setProducerName(data.name);
      } catch {
        setError('Erro ao carregar portal.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducer();
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
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="group bg-white/[0.03] border border-white/8 hover:border-white/15 rounded-2xl p-6 flex items-start gap-4 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                {section.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-base">{section.title}</h3>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                    Em breve
                  </span>
                </div>
                <p className="text-sm text-zinc-500">{section.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-600 mt-12">
          Powered by CreatorFlow AI
        </p>
      </div>
    </div>
  );
}
