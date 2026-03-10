'use client';

import { Instagram, Youtube, Twitter, Send } from 'lucide-react';

const footerLinks = {
  Produto: [
    { label: 'Agentes', href: '#ferramenta' },
    { label: 'Fluxo de Trabalho', href: '#fluxo' },
    { label: 'Pre\u00e7os', href: '#precos' },
    { label: 'Changelog', href: '#' },
  ],
  Empresa: [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Blog', href: '#' },
    { label: 'Carreiras (em breve)', href: '#' },
  ],
  Legal: [
    { label: 'Privacidade', href: '#' },
    { label: 'Termos', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
};

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Twitter, href: '#', label: 'X / Twitter' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] pt-16 pb-8 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-[#8B5CF6] to-[#C026D3] bg-clip-text text-transparent">
                W
              </span>
              <span className="font-display text-sm font-bold tracking-[0.08em] text-white">
                FLOW
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0] leading-relaxed max-w-xs mb-6">
              O app de IA para creators. Crie conte&uacute;do profissional de v&iacute;deo com intelig&ecirc;ncia artificial.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all duration-200 hover:border-[#8B5CF6]/50 hover:text-[#A78BFA] hover:bg-[#8B5CF6]/10"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60 mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#A0A0A0] transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-white/[0.06] bg-[#111111]/50 p-6">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">Newsletter</h4>
            <p className="text-xs text-[#666666]">Receba novidades e dicas de cria&ccedil;&atilde;o</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              placeholder="Seu email"
              aria-label="Seu email para newsletter"
              className="flex-1 sm:w-56 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-[#666666] outline-none transition-colors focus:border-[#8B5CF6]/50 focus:bg-white/[0.06]"
            />
            <button type="button" aria-label="Inscrever na newsletter" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#7C3AED] to-[#C026D3] text-white transition-transform hover:scale-105 shadow-[0_0_16px_rgba(139,92,246,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]">
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.05] pt-8">
          <p className="text-[13px] text-[#666666]">
            &copy; 2026 CreatorFlow. Todos os direitos reservados.
          </p>
          <p className="text-[13px] text-[#666666]">
            Feito com{' '}
            <span className="text-[#8B5CF6]">&hearts;</span>{' '}
            por F&aacute;brica de Ideias
          </p>
        </div>
      </div>
    </footer>
  );
}
