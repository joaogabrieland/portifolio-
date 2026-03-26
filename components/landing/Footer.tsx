'use client';

// ─── Footer ───────────────────────────────────────────────────────────────────
// Frame.io / Apple-inspired dark footer.

import { Instagram, Youtube, Twitter } from 'lucide-react';

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Produto: [
    { label: 'Features', href: '#ferramenta' },
    { label: 'Preços', href: '#precos' },
    { label: 'Changelog', href: '#' },
    { label: 'Roadmap', href: '#' },
  ],
  Empresa: [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Blog', href: '#' },
    { label: 'Contato', href: '#' },
    { label: 'Carreiras', href: '#' },
  ],
  Legal: [
    { label: 'Termos de Uso', href: '#' },
    { label: 'Privacidade', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

const SOCIALS = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'X / Twitter' },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.04] overflow-hidden">

      {/* Very subtle top glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-20 pb-8">

        {/* ── Main grid: brand + links ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand column — 2 cols */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
              >
                <span className="text-white font-black text-sm leading-none">CF</span>
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">Creator Flow</span>
            </div>

            {/* Copy */}
            <p className="text-sm text-white/30 leading-relaxed max-w-[260px] mb-8">
              O ecossistema definitivo para o audiovisual. Do briefing à aprovação final.
            </p>

            {/* Socials */}
            <div className="flex gap-2.5">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex w-9 h-9 items-center justify-center rounded-xl border border-white/[0.07] text-white/30 transition-all duration-200 hover:border-violet-500/30 hover:text-violet-400 hover:bg-violet-500/8"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns — 1 col each */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-5">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/35 transition-colors duration-150 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.04]">
          <p className="text-[12px] text-white/20 tracking-wide">
            © 2026 Creator Flow. Todos os direitos reservados.
          </p>
          <p className="text-[12px] text-white/15">
            Feito com{' '}
            <span className="text-violet-500/60">♥</span>
            {' '}por Fábrica de Ideias
          </p>
        </div>
      </div>
    </footer>
  );
}
