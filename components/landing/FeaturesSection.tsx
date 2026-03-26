'use client';

// ─── Bento Box Features Section ─────────────────────────────────────────────
// 3 pillar cards: Hub de Criação · Hub de Clientes · Assistente Executivo
// Layout: top row 2+1, bottom row full-width

import { useState } from 'react';

type CreationTab = 'roteiro' | 'storyboard' | 'shotlist';

const CREATION_TABS: { id: CreationTab; label: string }[] = [
  { id: 'roteiro',    label: 'Roteiro'    },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'shotlist',   label: 'Shotlist'   },
];

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<CreationTab>('roteiro');

  return (
    <section id="ferramenta" className="relative bg-[#0B0C10] pt-32 pb-24 px-6 lg:px-12 overflow-hidden">

      {/* Section aurora */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ── Section Header ─────────────────────────────────────────────────── */}
        <div className="mb-16">
          <p className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-4">
            Ecossistema Completo
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.08]">
            Organização e criação que{' '}
            <span className="text-white/35">acelera e otimiza sua produtora.</span>
          </h2>
          <p className="text-gray-400 text-lg mt-6 max-w-3xl leading-relaxed">
            Substitua dezenas de ferramentas fragmentadas por uma única plataforma desenhada especificamente para o fluxo audiovisual.
          </p>
        </div>

        {/* ── Bento Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Box 1: Hub de Criação (col-span-full) ────────────────────────── */}
          <div className="
            md:col-span-3
            group relative flex flex-col lg:flex-row items-stretch
            bg-[#111218] border border-white/[0.05] rounded-3xl overflow-hidden
            transition-all duration-500
            hover:border-violet-500/20 hover:shadow-[0_0_60px_rgba(109,40,217,0.1)]
          ">
            {/* Text block */}
            <div className="flex flex-col justify-between p-9 lg:w-[38%] flex-shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 mb-5 rounded-full border border-violet-500/20 bg-violet-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  Hub de Criação
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  Seu workflow criativo, acelerado.
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Uma central feita e otimizada para você criar roteiros, storyboards, shotlists, iluminações, e acelerar seu workflow de edição.
                </p>
              </div>

              {/* Micro stats */}
              <div className="mt-8 flex gap-4">
                <div>
                  <p className="text-xl font-extrabold text-violet-300">10×</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Mais rápido</p>
                </div>
                <div className="w-px bg-white/[0.06]" />
                <div>
                  <p className="text-xl font-extrabold text-emerald-400">IA</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Nativa</p>
                </div>
              </div>
            </div>

            {/* Interactive media block */}
            <div className="relative flex-1 min-h-[420px] lg:min-h-[540px] border-t lg:border-t-0 lg:border-l border-white/[0.05] bg-[#0d0e15] flex flex-col">

              {/* Tab bar */}
              <div className="flex items-center gap-1.5 px-4 pt-4 pb-3 border-b border-white/[0.06] flex-shrink-0">
                {CREATION_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/35 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'text-white/30 hover:text-white/50 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Media area */}
              <div className="relative flex-1 overflow-hidden">
                {activeTab === 'roteiro' && (
                  <video
                    key="roteiro"
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/sala-de-roteiros.mp4"
                  />
                )}
                {activeTab === 'storyboard' && (
                  <img
                    key="storyboard"
                    src="/storyboard-certo.png"
                    alt="Storyboard"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {activeTab === 'shotlist' && (
                  <video
                    key="shotlist"
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    src="/shotlist.mp4"
                  />
                )}
              </div>

              {/* Right-edge fade */}
              <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#111218] to-transparent pointer-events-none" />
            </div>
          </div>

          {/* ── Box 2: Assistente Executivo (col-span-3 full-width) ───────────── */}
          <div className="
            md:col-span-3
            group relative flex flex-col md:flex-row items-stretch
            bg-[#111218] border border-white/[0.05] rounded-3xl overflow-hidden
            transition-all duration-500
            hover:border-blue-500/15 hover:shadow-[0_0_80px_rgba(59,130,246,0.07)]
          ">
            {/* Text block */}
            <div className="flex flex-col justify-between p-9 md:w-[32%] flex-shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 mb-5 rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Assistente Executivo
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  Controle total do seu negócio.
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Gerencie e organize seus projetos, gerencie as equipes, orçamentos, documentos, entradas e saídas, tudo em um único lugar com acesso para equipe envolvida no projeto e freelancers.
                </p>
              </div>

              {/* Module pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  { label: 'Projetos',    cls: 'border-blue-500/25 bg-blue-500/8 text-blue-400' },
                  { label: 'Equipes',     cls: 'border-violet-500/25 bg-violet-500/8 text-violet-400' },
                  { label: 'Documentos', cls: 'border-white/[0.1] bg-white/[0.03] text-white/40' },
                  { label: 'Financeiro', cls: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400' },
                ].map(pill => (
                  <span key={pill.label} className={`rounded-full border px-3 py-1 text-[10px] font-bold ${pill.cls}`}>
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Media block */}
            <div className="relative flex-1 min-h-[280px] md:min-h-0 border-t md:border-t-0 md:border-l border-white/[0.05] bg-[#0d0e15]">
              <video
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src=""
              />
              {/* Fallback: executive dashboard */}
              <div className="absolute inset-0 grid grid-cols-3 gap-3 p-6">

                {/* Projects column */}
                <div className="flex flex-col gap-2">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/25 mb-1">Projetos Ativos</p>
                  {[
                    { name: 'Campanha Verão 26', progress: 72, color: '#7c3aed' },
                    { name: 'Reel Marca X', progress: 45, color: '#0ea5e9' },
                    { name: 'Doc Corporativo', progress: 90, color: '#10b981' },
                  ].map((proj, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
                      <p className="text-[9px] text-white/55 font-semibold truncate mb-2">{proj.name}</p>
                      <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, backgroundColor: proj.color }} />
                      </div>
                      <p className="text-[8px] text-white/25 mt-1">{proj.progress}% concluído</p>
                    </div>
                  ))}
                </div>

                {/* Finance column */}
                <div className="flex flex-col gap-2">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/25 mb-1">Financeiro</p>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3 flex flex-col gap-2">
                    {[
                      { label: 'Entradas', value: 'R$ 24.800', color: 'text-emerald-400' },
                      { label: 'Saídas',   value: 'R$ 9.200',  color: 'text-red-400/70' },
                      { label: 'Margem',   value: '+62,9%',     color: 'text-blue-300' },
                    ].map((item, i) => (
                      <div key={i} className={`flex justify-between items-center ${i < 2 ? 'pb-2 border-b border-white/[0.05]' : ''}`}>
                        <span className="text-[8px] text-white/30">{item.label}</span>
                        <span className={`text-[10px] font-extrabold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3">
                    <p className="text-[8px] text-emerald-400/60 uppercase tracking-widest mb-1">Orçamento em aberto</p>
                    <p className="text-sm font-extrabold text-emerald-300">R$ 38.000</p>
                    <p className="text-[8px] text-white/20 mt-0.5">3 propostas enviadas</p>
                  </div>
                </div>

                {/* Team column */}
                <div className="flex flex-col gap-2">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/25 mb-1">Equipe</p>
                  {[
                    { name: 'Ricardo A.', role: 'Diretor',    tagCls: 'bg-violet-500/15 text-violet-400', dot: '#a78bfa' },
                    { name: 'Mariana F.', role: 'Editora',    tagCls: 'bg-blue-500/15 text-blue-400',    dot: '#60a5fa' },
                    { name: 'André L.',   role: 'Videomaker', tagCls: 'bg-amber-500/15 text-amber-400',  dot: '#fbbf24' },
                    { name: 'Sofia B.',   role: 'Freelancer', tagCls: 'bg-white/[0.06] text-white/40',   dot: '#9ca3af' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-2">
                      <div className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center text-[7px] font-bold text-white"
                           style={{ backgroundColor: `${m.dot}25`, border: `1px solid ${m.dot}40` }}>
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-white/70 truncate">{m.name}</p>
                        <p className="text-[7px] text-white/25 truncate">{m.role}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.dot }} />
                    </div>
                  ))}
                </div>

              </div>

              {/* Left-edge fade */}
              <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#111218] to-transparent pointer-events-none" />
            </div>
          </div>

        </div>{/* /grid */}
      </div>
    </section>
  );
}
