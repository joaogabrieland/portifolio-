'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

const navLinks = [
  { label: 'Ferramenta', href: '#ferramenta' },
  { label: 'Fluxo de Trabalho', href: '#fluxo' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-[#7C3AED] to-[#C026D3]"
        style={{ scaleX }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0A0A0A]/85 backdrop-blur-2xl border-b border-white/[0.05]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-1.5" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-[#8B5CF6] to-[#C026D3] bg-clip-text text-transparent">
                W
              </span>
              <span className="font-display text-sm font-bold tracking-[0.08em] text-white">
                FLOW
              </span>
            </a>
            <button
              onClick={() => handleNavClick('#sobre')}
              className="hidden md:inline-flex items-center rounded-full border border-[#8B5CF6]/50 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-white/80 transition-colors hover:border-[#8B5CF6] hover:text-white"
            >
              Conheça-nos
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="rounded-full border border-white/15 px-5 py-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-white/80 transition-all duration-200 hover:border-white/30 hover:text-white"
              >
                {link.label}
              </button>
            ))}
            {/* Preços — outline roxo */}
            <button
              onClick={() => handleNavClick('#precos')}
              className="rounded-full border border-[#8B5CF6] px-5 py-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-white transition-all duration-200 hover:bg-[#8B5CF6]/10 hover:shadow-[0_0_16px_rgba(139,92,246,0.15)]"
            >
              Preços
            </button>

            {/* Separator */}
            <div className="h-5 w-px bg-white/10 mx-1" />

            {/* Entrar — text only */}
            <Link
              href="/login"
              className="px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-white/80 transition-all duration-200 hover:text-[#A78BFA]"
            >
              Entrar
            </Link>
            {/* Criar Conta — solid gradient */}
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C026D3] px-5 py-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_0_16px_rgba(139,92,246,0.2)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(139,92,246,0.4)] hover:scale-[1.03]"
            >
              Criar Conta
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[420px] border-b border-white/[0.05]' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-2 px-6 pb-6 bg-[#0A0A0A]/95 backdrop-blur-2xl">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('#precos')}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Preços
            </button>
            <button
              onClick={() => handleNavClick('#sobre')}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sobre
            </button>

            {/* Separator */}
            <div className="h-px w-full bg-white/[0.06] my-1" />

            {/* Auth buttons */}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C026D3] px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_20px_rgba(139,92,246,0.25)]"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
