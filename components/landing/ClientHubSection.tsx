'use client';

// ─── Hub de Clientes Deep Dive ────────────────────────────────────────────────
// Main zig-zag block + 4-card feature grid

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const BULLETS = [
  'Gere roteiros otimizados para o seu cliente.',
  'Salve seus roteiros e envie para o videomaker em formato de shotlist.',
  'IA para transcrever todas suas reuniões e resumir todas as decisões tomadas.',
  'Histórico de feedback e termômetro do cliente.',
];

const FEATURE_CARDS: {
  title: string;
  copy: string;
  accent: string;
  badge: string;
  mediaType: 'video' | 'img';
  mediaSrc: string;
  mediaAlt?: string;
}[] = [
  {
    title: 'Link dedicado',
    copy: 'Seu cliente acompanha todo o processo de criação, aprova roteiros, materiais, pagamentos e vê de perto o trabalho que você presta para ele, com métricas reais.',
    accent: '#a78bfa',
    badge: 'Portal',
    mediaType: 'video',
    mediaSrc: '/link-do-cliente.mp4',
  },
  {
    title: 'Cérebro da marca',
    copy: 'Um hub exclusivo para descrever com detalhes o que seu cliente faz a fundo, proporcionando criações precisas.',
    accent: '#34d399',
    badge: 'Branding',
    mediaType: 'video',
    mediaSrc: '/cerebro-da-marca.mp4',
  },
  {
    title: 'Gerador de ideias infinitas',
    copy: 'Gere roteiros sem dor de cabeça, otimizados pelo cérebro da marca. O sistema entende o que realmente está em alta com base no nicho do seu cliente.',
    accent: '#60a5fa',
    badge: 'IA',
    mediaType: 'video',
    mediaSrc: '/ideias-inifinitas.mp4',
  },
  {
    title: 'Business Intelligence',
    copy: 'Acompanhe em tempo real todas as principais métricas da sua empresa e dos seus clientes.',
    accent: '#f59e0b',
    badge: 'Analytics',
    mediaType: 'img',
    mediaSrc: '/business-inteligence.png',
    mediaAlt: 'Business Intelligence',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientHubSection() {
  const [activeCard, setActiveCard] = useState(0);
  const prev = () => setActiveCard((i) => Math.max(0, i - 1));
  const next = () => setActiveCard((i) => Math.min(FEATURE_CARDS.length - 1, i + 1));

  return (
    <section className="relative bg-[#0B0C10] overflow-hidden">

      {/* Top divider */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background aurora */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-[0.07]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.8) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">

        {/* ── Main zig-zag block ───────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-28 lg:py-36">

          {/* Text side — 40% */}
          <div className="w-full lg:w-5/12 flex-shrink-0 max-w-lg lg:max-w-none">

            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/8 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Hub de Clientes
            </span>

            {/* H2 */}
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-5">
              Seus clientes organizados{' '}
              <span className="text-white/35">em um só lugar</span>
            </h2>

            {/* Subheading */}
            <p className="text-xl text-white/40 leading-relaxed mb-10">
              Chega de atrasar prazos e se perder com inúmeras ferramentas.
            </p>

            {/* Bullet list */}
            <ul className="space-y-4">
              {BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3.5">
                  <span
                    className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.25)',
                    }}
                  >
                    <Check className="w-2.5 h-2.5" strokeWidth={3} style={{ color: '#a78bfa' }} />
                  </span>
                  <span className="text-base text-white/55 leading-snug">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Media side — 60%, bleed to the right */}
          <div className="w-full lg:w-7/12 lg:-mr-12 relative">

            {/* Glow behind container */}
            <div
              className="pointer-events-none absolute -inset-8 opacity-60"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.15) 0%, transparent 65%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Premium video container */}
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08]"
              style={{
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(109,40,217,0.1)',
                background: 'linear-gradient(135deg, #12131a 0%, #0e0f15 100%)',
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
                  <span className="text-[9px] text-white/25 font-mono">creatorflow.app / hub-clientes</span>
                </div>
              </div>

              {/* Video — widescreen 16:9 */}
              <div className="relative aspect-video bg-[#0d0e14]">
                <video
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover"
                  src="/hub-do-cliente.mp4"
                />
              </div>
            </div>

            {/* Floating stat */}
            <div
              className="absolute -bottom-5 -right-4 lg:-right-8 flex items-center gap-3 rounded-xl border border-white/[0.08] px-4 py-3 shadow-2xl backdrop-blur-md"
              style={{ background: 'rgba(13,14,20,0.92)' }}
            >
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">Roteiro aprovado</p>
                <p className="text-[10px] text-white/35">Marca Horizonte · agora mesmo</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature carousel ─────────────────────────────────────────────── */}
        <div className="pb-28">

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-16" />

          {/* Header row: label + nav arrows */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
              Funcionalidades exclusivas
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                disabled={activeCard === 0}
                className="w-10 h-10 rounded-full border border-white/[0.10] bg-white/[0.04] flex items-center justify-center text-white/50 transition-all duration-200 hover:border-white/25 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                disabled={activeCard === FEATURE_CARDS.length - 1}
                className="w-10 h-10 rounded-full border border-white/[0.10] bg-white/[0.04] flex items-center justify-center text-white/50 transition-all duration-200 hover:border-white/25 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel track */}
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeCard * 100}%)` }}
            >
              {FEATURE_CARDS.map((card) => (
                <div key={card.title} className="w-full flex-shrink-0">
                  {/* Media — full width, widescreen */}
                  <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.07]"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5)' }}
                  >
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-sm"
                        style={{
                          background: `${card.accent}22`,
                          border: `1px solid ${card.accent}40`,
                          color: card.accent,
                        }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    {card.mediaType === 'video' ? (
                      <video
                        autoPlay loop muted playsInline
                        className="aspect-video w-full object-contain block bg-[#0a0b10]"
                        src={card.mediaSrc}
                      />
                    ) : (
                      <img
                        src={card.mediaSrc}
                        alt={card.mediaAlt ?? card.title}
                        className="aspect-video w-full object-contain block bg-[#0a0b10]"
                      />
                    )}
                  </div>

                  {/* Text below media — 2-col Frame.io style */}
                  <div className="pt-10 pb-2 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-16 px-1 items-start">
                    {/* Left: title + badge */}
                    <div>
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] mb-4"
                        style={{
                          background: `${card.accent}18`,
                          border: `1px solid ${card.accent}35`,
                          color: card.accent,
                        }}
                      >
                        {card.badge}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                        {card.title}
                      </h3>
                    </div>
                    {/* Right: description */}
                    <p className="text-base md:text-lg text-white/40 leading-relaxed md:pt-10">
                      {card.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {FEATURE_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCard(i)}
                className="transition-all duration-300"
              >
                <div
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeCard ? '28px' : '8px',
                    backgroundColor: i === activeCard
                      ? FEATURE_CARDS[activeCard].accent
                      : 'rgba(255,255,255,0.15)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
