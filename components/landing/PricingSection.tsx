'use client';

// ─── Pricing + Bottom CTA ────────────────────────────────────────────────────
// Frame.io / Apple-inspired dark pricing table + full-width closing CTA.

import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck, Zap, Sparkles, Building2 } from 'lucide-react';

interface Plan {
  key: string;
  name: string;
  tagline: string;
  price: string;
  priceSub: string;
  highlighted: boolean;
  badge?: string;
  icon: typeof Zap;
  accentColor: string;
  features: string[];
  cta: string;
  ctaHref: string;
}

const PLANS: Plan[] = [
  {
    key: 'creator',
    name: 'Creator',
    tagline: 'Para freelancers e criadores independentes.',
    price: 'R$ 97',
    priceSub: '/mês',
    highlighted: false,
    icon: Zap,
    accentColor: '#a78bfa',
    features: [
      '1 membro da equipa',
      'Hub de Clientes (até 5 clientes)',
      'Geração de roteiros com IA',
      'Propostas e Orçamentos',
      'Suporte por email',
    ],
    cta: 'Começar agora',
    ctaHref: '/signup?plan=creator',
  },
  {
    key: 'studio',
    name: 'Produtora',
    tagline: 'Para agências e produtoras em crescimento.',
    price: 'R$ 297',
    priceSub: '/mês',
    highlighted: true,
    badge: 'Mais Popular',
    icon: Sparkles,
    accentColor: '#8b5cf6',
    features: [
      'Até 10 membros da equipa (RBAC)',
      'Hub de Clientes ilimitado',
      'IA nativa — roteiros, prompts e storyboards',
      'Assistente Executivo com controlo de caixa',
      'Portal de aprovação com marca própria',
    ],
    cta: 'Começar agora',
    ctaHref: '/signup?plan=studio',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para grandes operações e redes de produção.',
    price: 'Sob consulta',
    priceSub: '',
    highlighted: false,
    icon: Building2,
    accentColor: '#6ee7b7',
    features: [
      'Membros ilimitados',
      'SLA dedicado e onboarding assistido',
      'Integrações personalizadas via API',
      'Relatórios executivos e BI avançado',
      'Contrato e NDA sob medida',
    ],
    cta: 'Falar com vendas',
    ctaHref: 'mailto:contato@creatorflowia.com',
  },
];

export default function PricingSection() {
  return (
    <>
      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="precos" className="relative bg-[#0B0C10] pt-32 pb-28 px-6 lg:px-12 overflow-hidden">

        {/* Aurora */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-15"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.6) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Top divider */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-4">
              Planos & Preços
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
              Preços simples.{' '}
              <span className="text-white/35">Sem surpresas.</span>
            </h2>
            <p className="text-lg text-white/45 max-w-xl mx-auto leading-relaxed">
              Escolha o plano ideal para a escala da sua produção.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.key}
                  className={`
                    relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500
                    ${plan.highlighted
                      ? 'border border-purple-500/50 shadow-2xl shadow-purple-900/20 bg-[#13101f]'
                      : 'border border-white/[0.06] bg-[#111218] hover:border-white/[0.12]'
                    }
                  `}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <span
                        className="inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                        style={{
                          background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #c026d3 100%)',
                          boxShadow: '0 0 20px rgba(139,92,246,0.45)',
                        }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Top highlight bar for featured card */}
                  {plan.highlighted && (
                    <div
                      className="h-0.5 w-full"
                      style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c026d3)' }}
                    />
                  )}

                  {/* Inner glow for featured */}
                  {plan.highlighted && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-3xl"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%)',
                      }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col flex-1 p-9">

                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${plan.accentColor}15`,
                          borderColor: `${plan.accentColor}25`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: plan.accentColor }} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white leading-tight">{plan.name}</h3>
                        <p className="text-[11px] text-white/35 leading-snug mt-0.5">{plan.tagline}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-8 pb-8 border-b border-white/[0.06]">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`font-extrabold leading-none tracking-tight ${
                            plan.key === 'enterprise'
                              ? 'text-2xl text-white/70'
                              : 'text-[2.8rem] text-white'
                          }`}
                        >
                          {plan.price}
                        </span>
                        {plan.priceSub && (
                          <span className="text-sm font-medium text-white/30">{plan.priceSub}</span>
                        )}
                      </div>
                      {plan.key !== 'enterprise' && (
                        <p className="text-[11px] text-white/25 mt-1.5">
                          Cobrança mensal · Cancele quando quiser
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="flex-1 space-y-3.5 mb-10">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <span
                            className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${plan.accentColor}15`,
                              border: `1px solid ${plan.accentColor}25`,
                            }}
                          >
                            <Check
                              className="w-2.5 h-2.5"
                              strokeWidth={3}
                              style={{ color: plan.accentColor }}
                            />
                          </span>
                          <span className="text-sm text-white/55 leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {plan.highlighted ? (
                      <Link
                        href={plan.ctaHref}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-white py-3.5 text-[14px] font-bold text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] active:scale-[0.98]"
                      >
                        {plan.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={plan.ctaHref}
                        className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/15 py-3.5 text-[14px] font-medium text-white/70 transition-all duration-200 hover:border-white/30 hover:text-white hover:bg-white/[0.04]"
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust line */}
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/25">
            <ShieldCheck className="w-4 h-4 text-violet-500/50" />
            Garantia de 7 dias ou seu dinheiro de volta · Sem fidelidade
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0B0C10] pb-4 px-6 lg:px-12 overflow-hidden">
        <div className="relative mx-auto max-w-7xl">
          <div
            className="relative rounded-3xl overflow-hidden px-8 py-24 text-center"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.22) 0%, rgba(13,14,20,0.95) 55%, #0d0e14 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Inner glow lines */}
            <div
              className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
            />
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }}
            />

            {/* Floating particles */}
            {[
              { top: '20%', left: '10%', size: 'w-1 h-1', color: '#8b5cf6' },
              { top: '70%', left: '8%', size: 'w-1.5 h-1.5', color: '#a855f7' },
              { top: '25%', left: '88%', size: 'w-1 h-1', color: '#c026d3' },
              { top: '65%', left: '90%', size: 'w-1.5 h-1.5', color: '#8b5cf6' },
            ].map((p, i) => (
              <div
                key={i}
                className={`pointer-events-none absolute ${p.size} rounded-full animate-pulse`}
                style={{
                  top: p.top,
                  left: p.left,
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px 3px ${p.color}50`,
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            ))}

            <div className="relative z-10">
              {/* Eyebrow */}
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Comece hoje, sem compromisso
              </span>

              {/* Title */}
              <h2 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.06] max-w-3xl mx-auto mb-6">
                Pronto para elevar o nível das suas produções?
              </h2>

              {/* Subtitle */}
              <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed mb-12">
                Junte-se às produtoras que já transformaram o caos em fluxo criativo.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-bold text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_50px_rgba(255,255,255,0.18)] active:scale-[0.98]"
                >
                  Começar gratuitamente
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-4 text-[15px] font-medium text-white/60 transition-all duration-200 hover:border-white/30 hover:text-white hover:bg-white/[0.04]"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
