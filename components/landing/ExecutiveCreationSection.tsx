'use client';

// ─── Sprint 3: Assistente Executivo + Quote + Hub de Criação ──────────────────

import { Check } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXECUTIVE_BULLETS = [
  'Gerencia orçamentos da produção.',
  'Adiciona todos seus gastos envolvendo o orçamento aprovado.',
  'Cria e gerencia equipes dedicadas para a produção.',
  'Armazena arquivos.',
  'Gerencia datas e cronogramas.',
];

const CREATION_BULLETS = [
  'Gerador de roteiros',
  'Gerador de storyboard',
  'Assistente de iluminação',
  'Shotlists de gravação',
  'Assistente de workflow',
  'Assistente de imagens em bancos de imagens',
];

const CREATION_CARDS = [
  {
    title: 'Gerador de storyboard',
    copy: 'Crie storyboards cinematográficos das suas produções, para auxiliar nas captações e enviar aos seus clientes.',
    accent: '#a78bfa',
    badge: 'Visual',
    imageSrc: '/storyboard-novo.png',
    imageAlt: 'Gerador de Storyboard',
  },
  {
    title: 'Shotlist',
    copy: 'Chega de esquecer qual take você já gravou, organize cada take na palma da sua mão.',
    accent: '#34d399',
    badge: 'On Set',
    imageSrc: '/shotlist-foto.png',
    imageAlt: 'Gestão de Shotlist',
  },
  {
    title: 'Integração com Hub de Clientes',
    copy: 'Criou um roteiro e quer vincular a um cliente? Dentro do assistente de roteiros você pode.',
    accent: '#60a5fa',
    badge: 'Integração',
    imageSrc: '/vincular-cliente.png',
    imageAlt: 'Integração com Hub de Clientes',
  },
];

// ─── Fallback UIs ─────────────────────────────────────────────────────────────

function ExecutiveFallback() {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-6">
      {/* Project header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/25 flex items-center justify-center">
            <span className="text-[9px] font-black text-blue-300">CP</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/70">Campanha Prime</p>
            <p className="text-[8px] text-white/25">Produção · Fase 2/4</p>
          </div>
        </div>
        <span className="text-[7px] font-bold rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400 px-2 py-0.5">Em produção</span>
      </div>

      {/* Budget bar */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
        <div className="flex justify-between mb-2">
          <span className="text-[8px] text-white/30">Orçamento</span>
          <span className="text-[8px] font-bold text-white/60">R$18.400 / R$24.000</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: '76.7%' }} />
        </div>
        <p className="text-[7px] text-white/20 mt-1.5">76,7% utilizado · R$5.600 restante</p>
      </div>

      {/* Gantt-like timeline */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 flex-1">
        <p className="text-[7px] font-bold uppercase tracking-widest text-white/20 mb-3">Cronograma</p>
        <div className="flex flex-col gap-2.5">
          {[
            { task: 'Pré-produção',   done: true,  w: '100%', color: '#34d399' },
            { task: 'Captação',       done: true,  w: '100%', color: '#34d399' },
            { task: 'Edição',         done: false, w: '60%',  color: '#60a5fa' },
            { task: 'Revisão cliente',done: false, w: '0%',   color: '#a78bfa' },
          ].map((item) => (
            <div key={item.task} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.done ? 'bg-emerald-400' : 'bg-white/20'}`} />
              <span className="text-[8px] text-white/35 w-24 flex-shrink-0 truncate">{item.task}</span>
              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: item.w, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team row */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b'].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0d0e15] flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: c + '99' }}>
              {['RA','MF','AL','SB'][i]}
            </div>
          ))}
        </div>
        <span className="text-[8px] text-white/30">4 membros neste projeto</span>
        <div className="ml-auto h-4 w-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <span className="text-[7px] text-white/25">+ convidar</span>
        </div>
      </div>
    </div>
  );
}

function CreationHubFallback() {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-6">
      {/* Module tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: 'Roteiros', active: true,  color: 'border-violet-500/30 bg-violet-500/12 text-violet-300' },
          { label: 'Storyboard', active: false, color: '' },
          { label: 'Shotlist', active: false, color: '' },
          { label: 'Iluminação', active: false, color: '' },
        ].map((tab) => (
          <span
            key={tab.label}
            className={`rounded-full px-3 py-1 text-[8px] font-bold border ${
              tab.active ? tab.color : 'border-white/[0.06] text-white/25'
            }`}
          >
            {tab.label}
          </span>
        ))}
      </div>

      {/* Script card */}
      <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.05] flex flex-col overflow-hidden">
        {/* Script header */}
        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
          <span className="text-[9px] font-bold text-white/60">Campanha Verão 2026</span>
          <span className="text-[7px] rounded-full border border-violet-500/25 bg-violet-500/10 text-violet-400 px-2 py-0.5">IA ativada</span>
        </div>
        {/* Lines */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          {[
            { tag: 'INT.', line: 'PRAIA — GOLDEN HOUR', cls: 'text-violet-300/70 font-bold' },
            { tag: '',     line: 'Câmera abre em drone, revelando a orla.',  cls: 'text-white/30' },
            { tag: 'V.O.', line: '"O verão que você sempre quis começou."', cls: 'text-amber-300/60 italic' },
            { tag: 'CORTE', line: '— produto em câmera lenta.',             cls: 'text-blue-400/60 font-bold' },
          ].map((l, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="text-[7px] font-mono text-white/20 flex-shrink-0 w-7 mt-0.5">{l.tag}</span>
              <p className={`text-[8px] leading-snug ${l.cls}`}>{l.line}</p>
            </div>
          ))}
          {/* Cursor */}
          <div className="flex gap-2.5">
            <span className="w-7 flex-shrink-0" />
            <div className="h-3 w-0.5 bg-violet-400 animate-pulse mt-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom: AI suggestion */}
      <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 px-4 py-2.5 flex items-center gap-2.5">
        <div className="flex gap-0.5">
          {[0, 0.12, 0.24].map((d, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-violet-400/50 animate-bounce" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
        <span className="text-[8px] text-violet-300/55">Sugerindo próxima cena com base no nicho...</span>
      </div>
    </div>
  );
}


// ─── Shared sub-components ────────────────────────────────────────────────────

function BulletList({ bullets, accentColor }: { bullets: string[]; accentColor: string }) {
  return (
    <ul className="space-y-4">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex items-start gap-3.5">
          <span
            className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <Check className="w-2.5 h-2.5" strokeWidth={3} style={{ color: accentColor }} />
          </span>
          <span className="text-base text-white/55 leading-snug">{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function PremiumVideoContainer({
  urlLabel,
  fallback,
}: {
  urlLabel: string;
  fallback: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full max-w-xl lg:max-w-none relative">
      {/* Glow */}
      <div
        className="pointer-events-none absolute -inset-8 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.14) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08]"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(109,40,217,0.08)',
          background: 'linear-gradient(135deg, #12131a 0%, #0e0f15 100%)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
            <span className="text-[9px] text-white/25 font-mono">{urlLabel}</span>
          </div>
        </div>

        <div className="relative aspect-[4/3] bg-[#0d0e14]">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover" src="" />
          {fallback}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExecutiveCreationSection() {
  return (
    <section className="relative bg-[#0B0C10] overflow-hidden">

      {/* Top divider */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Aurora — top right */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[700px] h-[500px] opacity-[0.06]"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.8) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">

        {/* ─── 1. ASSISTENTE EXECUTIVO (reversed) ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16 py-28 lg:py-36">

          {/* Text side — 5/12 */}
          <div className="w-full lg:w-5/12 flex-shrink-0 max-w-lg lg:max-w-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/8 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Assistente Executivo
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-5">
              Gerencie suas{' '}
              <span className="text-white/35">produções</span>
            </h2>

            <p className="text-xl text-white/40 leading-relaxed mb-10">
              Nunca mais perca prazo, extrapole orçamentos ou esqueça de qualquer coisa em uma grande produção. Com o assistente executivo você:
            </p>

            <BulletList bullets={EXECUTIVE_BULLETS} accentColor="#60a5fa" />
          </div>

          {/* Media side — 7/12, sem corte */}
          <div className="w-full lg:w-7/12 relative">
            {/* Glow */}
            <div
              className="pointer-events-none absolute -inset-8 opacity-50"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 65%)',
                filter: 'blur(50px)',
              }}
            />
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08]"
              style={{
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.08)',
                background: 'linear-gradient(135deg, #12131a 0%, #0e0f15 100%)',
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
                  <span className="text-[9px] text-white/25 font-mono">creatorflow.app / assistente-executivo</span>
                </div>
              </div>
              {/* Video — aspect-video + object-contain para 100% visível */}
              <div className="relative aspect-video bg-[#0a0b10]">
                <video
                  autoPlay loop muted playsInline
                  className="w-full h-full object-contain"
                  src="/assistente-executivo.mp4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. AESTHETIC QUOTE ──────────────────────────────────────────── */}
        <div className="relative py-32 flex flex-col items-center border-y border-white/[0.04]">
          {/* Subtle radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(109,40,217,0.06) 0%, transparent 60%)',
            }}
          />

          {/* Tiny eyebrow */}
          <div className="relative flex items-center gap-3 mb-10">
            <div className="h-px w-12 bg-white/[0.1]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20">Filosofia</span>
            <div className="h-px w-12 bg-white/[0.1]" />
          </div>

          {/* Quote */}
          <blockquote className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-light text-center text-white/90 tracking-wide max-w-4xl mx-auto leading-[1.15]">
            <span className="text-violet-500/40 text-6xl lg:text-8xl font-serif leading-none mr-1 align-top">"</span>
            Organização é o pilar para o crescimento da sua empresa.
            <span className="text-violet-500/40 text-6xl lg:text-8xl font-serif leading-none ml-1 align-bottom">"</span>
          </blockquote>
        </div>

        {/* ─── 3. HUB DE CRIAÇÃO (normal) ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-28 lg:py-36">

          {/* Text side — 4/12 (40%) */}
          <div className="w-full lg:w-4/12 flex-shrink-0 max-w-lg lg:max-w-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/8 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Hub de Criação
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-5">
              Eleve o nível das suas{' '}
              <span className="text-white/35">produções</span>
            </h2>

            <p className="text-xl text-white/40 leading-relaxed mb-10">
              Chega de gastar horas tentando ter uma boa ideia. O hub de criação é uma central criativa que vai ser o braço direito das suas produções.
            </p>

            <BulletList bullets={CREATION_BULLETS} accentColor="#a78bfa" />
          </div>

          {/* Media side — 8/12 (60%), bleed direito */}
          <div className="w-full lg:w-8/12 lg:-mr-12 relative">
            {/* Glow */}
            <div
              className="pointer-events-none absolute -inset-8 opacity-50"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 65%)',
                filter: 'blur(50px)',
              }}
            />
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08]"
              style={{
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.08)',
                background: '#0a0b10',
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
                  <span className="text-[9px] text-white/25 font-mono">creatorflow.app / hub-criacao</span>
                </div>
              </div>
              {/* Image — aspect-video + object-contain para 100% visível */}
              <div className="relative aspect-video bg-[#0a0b10]">
                <img
                  src="/central-de-criacao.png"
                  alt="Hub de Criação"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── 4. HUB DE CRIAÇÃO — Feature cards grid ──────────────────────── */}
        <div className="pb-28">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-16" />

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-8 text-center">
            Ferramentas de criação
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CREATION_CARDS.map((card) => (
              <div
                key={card.title}
                className="group relative flex flex-col bg-[#111218] border border-white/[0.05] rounded-3xl overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:-translate-y-1"
              >
                {/* Inner glow on hover */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 40px ${card.accent}10` }}
                />

                {/* Media area */}
                <div className="relative aspect-[4/3] bg-[#0d0e15] border-b border-white/[0.05] overflow-hidden">
                  <img
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    className="w-full h-full object-cover"
                  />

                  {/* Badge overlay */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.15em]"
                      style={{
                        background: `${card.accent}18`,
                        border: `1px solid ${card.accent}30`,
                        color: card.accent,
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>

                {/* Text area */}
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-base font-extrabold text-white tracking-tight mb-2.5">
                    {card.title}
                  </h3>
                  <p className="text-sm text-white/38 leading-relaxed flex-1">
                    {card.copy}
                  </p>

                  {/* Accent underline */}
                  <div
                    className="mt-5 h-0.5 w-8 rounded-full opacity-40 group-hover:w-16 group-hover:opacity-70 transition-all duration-500"
                    style={{ backgroundColor: card.accent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
