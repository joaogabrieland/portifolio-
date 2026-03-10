'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import GradientButton from './ui/GradientButton';
import MockupChat from './MockupChat';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-12 px-6">
      {/* Three.js 3D background — hidden on mobile for performance */}
      <div className="hidden md:block">
        <Scene3D />
      </div>

      {/* CSS glow — more intense */}
      <div className="pointer-events-none absolute inset-0">
        {/* Primary center glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,rgba(192,38,211,0.06)_40%,transparent_70%)]" />
        {/* Secondary glow offset */}
        <div className="absolute top-20 left-1/2 -translate-x-1/3 h-[500px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(192,38,211,0.1)_0%,transparent_65%)]" />

        {/* HUD grid — animated with CSS */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Secondary smaller grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.2) 1px, transparent 1px)',
            backgroundSize: '15px 15px',
          }}
        />

        {/* Animated floating particles */}
        {[
          { top: '15%', left: '20%', size: 'h-1.5 w-1.5', color: '#8B5CF6', opacity: 60, delay: '0s', dur: '4s' },
          { top: '25%', left: '75%', size: 'h-2 w-2', color: '#C026D3', opacity: 50, delay: '1s', dur: '5s' },
          { top: '60%', left: '12%', size: 'h-1 w-1', color: '#A78BFA', opacity: 40, delay: '2s', dur: '6s' },
          { top: '70%', left: '85%', size: 'h-1.5 w-1.5', color: '#8B5CF6', opacity: 50, delay: '0.5s', dur: '4.5s' },
          { top: '40%', left: '90%', size: 'h-1 w-1', color: '#C026D3', opacity: 35, delay: '1.5s', dur: '5.5s' },
          { top: '50%', left: '8%', size: 'h-1 w-1', color: '#A78BFA', opacity: 45, delay: '3s', dur: '4s' },
          { top: '80%', left: '30%', size: 'h-1 w-1', color: '#8B5CF6', opacity: 30, delay: '2.5s', dur: '5s' },
          { top: '35%', left: '45%', size: 'h-1 w-1', color: '#C026D3', opacity: 25, delay: '1s', dur: '6s' },
        ].map((p, i) => (
          <div
            key={i}
            className={`absolute ${p.size} rounded-full animate-pulse`}
            style={{
              top: p.top,
              left: p.left,
              backgroundColor: `${p.color}`,
              opacity: p.opacity / 100,
              boxShadow: `0 0 8px 3px ${p.color}60`,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}

        {/* Horizontal HUD lines */}
        <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/10 to-transparent" />
        <div className="absolute top-[70%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C026D3]/8 to-transparent" />
        {/* Vertical HUD lines */}
        <div className="absolute top-0 bottom-0 left-[25%] w-px bg-gradient-to-b from-transparent via-[#8B5CF6]/8 to-transparent" />
        <div className="absolute top-0 bottom-0 right-[25%] w-px bg-gradient-to-b from-transparent via-[#C026D3]/6 to-transparent" />
      </div>

      {/* Scan lines overlay — more visible */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Top label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6 text-center text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-[#A0A0A0]"
        >
          Fábrica de Ideias Academy apresenta
        </motion.p>

        {/* Giant title FLOW with light sweep + glitch hover */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="group font-display text-center font-extrabold leading-[0.9] tracking-[-0.04em] cursor-default"
        >
          <span className="relative block text-[72px] sm:text-[100px] md:text-[130px] lg:text-[160px]">
            {/* Glitch layers — visible on hover */}
            <span className="absolute inset-0 text-[#7C3AED]/0 group-hover:text-[#7C3AED]/30 transition-all duration-100 group-hover:translate-x-[2px] group-hover:translate-y-[-2px]" aria-hidden="true">
              FLOW
            </span>
            <span className="absolute inset-0 text-[#C026D3]/0 group-hover:text-[#C026D3]/20 transition-all duration-100 group-hover:translate-x-[-2px] group-hover:translate-y-[2px]" aria-hidden="true">
              FLOW
            </span>
            {/* Main text */}
            <span className="relative">
              <span className="text-white/90">FL</span>
              <span className="bg-gradient-to-br from-[#7C3AED] via-[#A855F7] to-[#C026D3] bg-clip-text text-transparent">
                O
              </span>
              <span className="text-white/90">W</span>
            </span>
            {/* Light sweep overlay */}
            <span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none"
              style={{
                animation: 'lightSweep 4s ease-in-out infinite',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%, black 60%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 40%, black 60%, transparent)',
              }}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-4 max-w-xl text-center text-base sm:text-lg text-[#A0A0A0] leading-relaxed"
        >
          Do primeiro briefing à aprovação final do cliente. Esqueça o caos do WhatsApp e Planilhas: gerencie equipe, orçamentos, roteiros e aprovações em um único <span className="text-white font-semibold">ecossistema premium.</span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.72 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <GradientButton href="/dashboard" variant="solid" size="lg">
            Começar Agora
          </GradientButton>
          <GradientButton href="#ferramenta" variant="outline" size="lg">
            Explorar Módulos
          </GradientButton>
        </motion.div>
      </div>

      {/* Laptop mockup with 3D perspective */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-16 w-full max-w-4xl"
        style={{ perspective: '1200px' }}
      >
        {/* Glow behind laptop — more intense */}
        <div className="absolute -inset-16 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22)_0%,rgba(192,38,211,0.08)_35%,transparent_65%)]" />

        {/* Lens flare */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-1 w-48 bg-gradient-to-r from-transparent via-[#A855F7]/50 to-transparent rounded-full blur-sm" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-0.5 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full blur-[1px]" />

        {/* Laptop frame with 3D tilt */}
        <div
          className="relative mx-auto w-full transition-transform duration-700 hover:rotate-x-0"
          style={{
            transform: 'rotateX(6deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Screen */}
          <div className="relative rounded-t-xl border border-white/[0.12] bg-[#0e0e0e] overflow-hidden aspect-[16/10] shadow-[0_0_80px_rgba(139,92,246,0.1),0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none z-10" />

            {/* CreatorFlow Chat UI — componente com typing animation */}
            <MockupChat />
          </div>
          {/* Laptop base */}
          <div className="mx-auto h-3 w-[102%] -ml-[1%] rounded-b-xl bg-gradient-to-b from-[#1a1a1a] to-[#141414] border-x border-b border-white/[0.06]" />
          <div className="mx-auto h-1 w-1/5 rounded-b-lg bg-[#161616]" />
        </div>

        {/* Reflection under laptop */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-40 w-4/5 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
      </motion.div>

      {/* Sparkle decorations */}
      <div className="pointer-events-none absolute bottom-24 left-[10%] text-[#8B5CF6]/30 text-lg select-none animate-pulse">&#10022;</div>
      <div className="pointer-events-none absolute bottom-40 right-[12%] text-[#C026D3]/25 text-sm select-none animate-pulse" style={{ animationDelay: '1s' }}>&#10022;</div>
      <div className="pointer-events-none absolute top-40 right-[8%] text-[#A78BFA]/20 text-base select-none animate-pulse" style={{ animationDelay: '2s' }}>&#10022;</div>

    </section>
  );
}
