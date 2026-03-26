'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

// ─── Social proof logo placeholders ─────────────────────────────────────────
const LOGOS = [
  {
    name: 'Produtora Norte',
    svg: (
      <svg viewBox="0 0 100 24" fill="currentColor" className="h-5">
        <rect x="0" y="8" width="8" height="8" rx="1" />
        <rect x="10" y="4" width="8" height="16" rx="1" />
        <rect x="20" y="8" width="8" height="8" rx="1" />
        <text x="32" y="17" fontSize="11" fontWeight="700" letterSpacing="1">NORTE</text>
      </svg>
    ),
  },
  {
    name: 'Studio Alto',
    svg: (
      <svg viewBox="0 0 90 24" fill="currentColor" className="h-5">
        <circle cx="12" cy="12" r="10" />
        <text x="26" y="17" fontSize="11" fontWeight="700" letterSpacing="1">ALTO</text>
      </svg>
    ),
  },
  {
    name: 'Frames Co',
    svg: (
      <svg viewBox="0 0 100 24" fill="currentColor" className="h-5">
        <rect x="0" y="0" width="22" height="22" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="4" y="4" width="14" height="14" rx="1" />
        <text x="28" y="17" fontSize="11" fontWeight="700" letterSpacing="1">FRAMES</text>
      </svg>
    ),
  },
  {
    name: 'Motion Lab',
    svg: (
      <svg viewBox="0 0 110 24" fill="currentColor" className="h-5">
        <polygon points="0,22 11,2 22,22" />
        <text x="28" y="17" fontSize="11" fontWeight="700" letterSpacing="1">MOTION</text>
      </svg>
    ),
  },
  {
    name: 'Visão Digital',
    svg: (
      <svg viewBox="0 0 100 24" fill="currentColor" className="h-5">
        <path d="M0 12 Q11 0 22 12 Q11 24 0 12Z" />
        <text x="28" y="17" fontSize="11" fontWeight="700" letterSpacing="1">VISÃO</text>
      </svg>
    ),
  },
];

export default function HeroSection() {
  return (
    <>
      {/* ── Hero Section ───────────────────────────────────────────────────────── */}
      <section className="relative isolate min-h-screen flex items-center overflow-hidden bg-[#0B0C10] pt-24 pb-0 px-6 lg:px-12">

        {/* Aurora glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top-left aurora */}
          <div
            className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, rgba(109,40,217,0.15) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          {/* Right center aurora */}
          <div
            className="absolute top-1/3 -right-60 h-[600px] w-[700px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(16,185,129,0.1) 50%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          {/* Bottom center aurora */}
          <div
            className="absolute -bottom-20 left-1/3 h-[400px] w-[600px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
              filter: 'blur(90px)',
            }}
          />
        </div>

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* ── Split layout container ──────────────────────────────────────────── */}
        <div className="relative z-10 mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">

          {/* ── Left: Copy ────────────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center py-16 lg:py-24">

            {/* Tag badges */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {[
                { label: 'Criatividade',                   color: '#a78bfa' },
                { label: 'Gestão de equipes e clientes',   color: '#10b981' },
                { label: 'Orçamentos',                     color: '#0ea5e9' },
                { label: 'Planejamento',                   color: '#f59e0b' },
                { label: 'Controle financeiro',            color: '#c026d3' },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 transition-all duration-300 hover:border-white/[0.15] hover:text-white/70"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color, boxShadow: `0 0 6px ${tag.color}80` }} />
                  {tag.label}
                </span>
              ))}
            </div>

            {/* H1 */}
            <h1 className="text-[2.6rem] sm:text-[3.4rem] lg:text-[3.8rem] xl:text-[4.2rem] font-extrabold leading-[1.04] tracking-tight text-white mb-7">
              O cérebro da sua<br />
              produtora{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 50%, #c026d3 100%)' }}
              >
                em um só lugar.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-lg mb-10">
              Centralize sua produtora em um só lugar, gerencie seus clientes, crie roteiros, organize suas equipes, gere orçamentos e propostas, e tenha a visão real da saúde do seu negócio.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Primary — white solid (Frame.io-style high contrast) */}
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-bold text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-[0.98]"
              >
                Começar agora
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary — ghost */}
              <button
                onClick={() => {
                  document.querySelector('#ferramenta')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-[15px] font-medium text-white/70 transition-all duration-200 hover:border-white/30 hover:text-white hover:bg-white/[0.04]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Ver como funciona
              </button>
            </div>

            {/* Micro social proof */}
            <div className="mt-10 flex items-center gap-3">
              {/* Stacked avatars */}
              <div className="flex -space-x-2">
                {['#7c3aed','#0ea5e9','#10b981','#f59e0b'].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0B0C10] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {['RS','MF','AL','PV'][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/40 leading-snug">
                <span className="text-white/70 font-semibold">+240 produtoras</span> já usam o Creator Flow
              </p>
            </div>
          </div>

          {/* ── Right: Video / Product mockup ─────────────────────────────────── */}
          <div className="relative flex items-center justify-center py-12 lg:py-16">

            {/* Glow behind the container */}
            <div
              className="pointer-events-none absolute inset-0 -m-8"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.18) 0%, rgba(16,185,129,0.06) 45%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Premium video container */}
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08]"
              style={{
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(109,40,217,0.12), 0 0 120px rgba(16,185,129,0.06)',
                background: 'linear-gradient(135deg, #12131a 0%, #0e0f15 100%)',
              }}
            >
              {/* Window chrome bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-2.5">
                  <span className="text-[9px] text-white/25 font-mono truncate">creatorflow.app / dashboard</span>
                </div>
              </div>

              {/* Demo video */}
              <div className="relative aspect-[16/10] bg-[#0d0e14]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  src="/tela-inicial.mp4"
                />
              </div>
            </div>

            {/* Floating notification card — bottom-left */}
            <div
              className="absolute -bottom-4 -left-4 lg:-left-8 flex items-center gap-3 rounded-xl border border-white/[0.08] px-4 py-3 text-white shadow-2xl backdrop-blur-md"
              style={{ background: 'rgba(13,14,20,0.9)' }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">Cliente aprovou ✓</p>
                <p className="text-[10px] text-white/40">Roteiro • Marca Horizonte</p>
              </div>
            </div>

            {/* Floating badge — top-right */}
            <div
              className="absolute -top-3 -right-3 lg:-right-6 rounded-xl border border-violet-500/20 px-3.5 py-2 shadow-2xl backdrop-blur-md"
              style={{ background: 'rgba(109,40,217,0.12)' }}
            >
              <p className="text-[11px] font-bold text-violet-300">48h faster</p>
              <p className="text-[9px] text-violet-400/60">ciclo de aprovação</p>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0C10] to-transparent pointer-events-none" />
      </section>

      {/* ── Social Proof Strip ──────────────────────────────────────────────────── */}
      <section className="relative bg-[#0B0C10] border-y border-white/[0.04] py-10 px-6 overflow-hidden">
        {/* Subtle edge gradient */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0B0C10] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0B0C10] to-transparent z-10 pointer-events-none" />

        <div className="relative mx-auto max-w-6xl">
          {/* Label */}
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-8">
            A plataforma de confiança dos criadores mais rápidos do mercado
          </p>

          {/* Logos */}
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {LOGOS.map((logo) => (
              <div
                key={logo.name}
                className="text-white/20 hover:text-white/40 transition-colors duration-300 flex items-center"
                title={logo.name}
              >
                {logo.svg}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
