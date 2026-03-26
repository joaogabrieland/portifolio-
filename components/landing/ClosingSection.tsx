'use client';

// ─── Closing: Pricing (4 plans) + FAQ + Bottom CTA ───────────────────────────

import Link from 'next/link';
import { useState } from 'react';
import { Check, ArrowRight, Plus, Minus, ShieldCheck, Zap, Sparkles, TrendingUp, Building2 } from 'lucide-react';

// ─── Pricing data ─────────────────────────────────────────────────────────────

interface Plan {
  key: string;
  name: string;
  tagline: string;
  price: string;
  priceSub: string;
  badge?: string;
  highlighted: boolean;
  icon: typeof Zap;
  accent: string;
  features: string[];
  cta: string;
  ctaHref: string;
}

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'Para quem está começando a profissionalizar.',
    price: 'R$ 47',
    priceSub: '/mês',
    highlighted: false,
    icon: Zap,
    accent: '#a78bfa',
    features: [
      '1 usuário',
      'Hub de Clientes (até 3)',
      'Geração de roteiros com IA',
      'Propostas básicas',
      'Suporte por e-mail',
    ],
    cta: 'Começar grátis',
    ctaHref: '/signup?plan=starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'Para creators e freelancers em crescimento.',
    price: 'R$ 97',
    priceSub: '/mês',
    highlighted: false,
    icon: TrendingUp,
    accent: '#60a5fa',
    features: [
      '1 usuário',
      'Hub de Clientes (até 10)',
      'IA nativa — roteiros e storyboards',
      'Propostas com sua marca',
      'Precificação inteligente',
    ],
    cta: 'Começar agora',
    ctaHref: '/signup?plan=pro',
  },
  {
    key: 'produtora',
    name: 'Produtora',
    tagline: 'Para agências e produtoras em crescimento.',
    price: 'R$ 197',
    priceSub: '/mês',
    badge: 'Mais Popular',
    highlighted: true,
    icon: Sparkles,
    accent: '#8b5cf6',
    features: [
      'Até 10 membros (RBAC)',
      'Hub de Clientes ilimitado',
      'Assistente Executivo completo',
      'Portal de aprovação white-label',
      'Controle financeiro avançado',
    ],
    cta: 'Começar agora',
    ctaHref: '/signup?plan=produtora',
  },
  {
    key: 'scale',
    name: 'Scale',
    tagline: 'Para grandes operações e redes de produção.',
    price: 'R$ 497',
    priceSub: '/mês',
    highlighted: false,
    icon: Building2,
    accent: '#34d399',
    features: [
      'Membros ilimitados',
      'SLA dedicado e onboarding',
      'Integrações via API',
      'Relatórios executivos e BI',
      'Contrato e NDA sob medida',
    ],
    cta: 'Falar com vendas',
    ctaHref: 'https://wa.me/5527999210071',
  },
];

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Posso convidar freelancers temporários para os projetos?',
    a: 'Sim. Com o controle de acesso inteligente, eles só veem o projeto atribuído e não têm acesso ao seu faturamento, margens ou outros clientes.',
  },
  {
    q: 'A plataforma é adequada se eu for um creator solo?',
    a: 'Absolutamente. O Creator Flow foi projetado para escalar do profissional independente à grande produtora. Ajuda a centralizar aprovações, orçamentos e roteiros num único lugar, fazendo você parecer uma operação muito maior do que é.',
  },
  {
    q: 'Meus arquivos e roteiros estão seguros?',
    a: 'Sim. Usamos criptografia de ponta a ponta e infraestrutura em nuvem de nível empresarial. Seus dados nunca são compartilhados com terceiros.',
  },
  {
    q: 'Existe limite de clientes no Hub de Clientes?',
    a: 'O limite varia conforme o seu plano (3 no Starter, 10 no Pro, ilimitado no Produtora e Scale), mas você pode fazer upgrade a qualquer momento sem perder nenhum dado.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, sem fidelidade e sem multas. Cancele quando precisar pelo painel de configurações. Você continua com acesso até o fim do período já pago.',
  },
];

// ─── FAQ Accordion item ───────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.07]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-6 text-left group"
      >
        <span className="text-base font-semibold text-white/75 group-hover:text-white transition-colors duration-200 leading-snug">
          {q}
        </span>
        <span className="flex-shrink-0 w-6 h-6 rounded-full border border-white/[0.1] flex items-center justify-center text-white/40 group-hover:border-white/20 group-hover:text-white/70 transition-all duration-200">
          {open ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      {open && (
        <p className="pb-6 text-sm text-white/40 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClosingSection() {
  return (
    <>
      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="precos" className="relative bg-[#0B0C10] overflow-hidden pt-32 pb-28 px-6 lg:px-12">

        {/* Top divider */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

        {/* Aurora */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-[0.12]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.7) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-4">
              Planos & Preços
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
              Escolha o seu plano.
            </h2>
            <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
              Sem surpresas. Sem fidelidade. Cancele quando quiser.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch pt-8">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col rounded-3xl transition-all duration-500 ${
                    plan.highlighted
                      ? 'border border-purple-500/45 shadow-2xl shadow-purple-900/20'
                      : 'border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                  style={{
                    background: plan.highlighted
                      ? 'linear-gradient(160deg, rgba(109,40,217,0.1) 0%, #12101f 40%)'
                      : '#111218',
                  }}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <span
                        className="inline-flex items-center rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white"
                        style={{
                          background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c026d3)',
                          boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                        }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}


                  <div className="flex flex-col flex-1 p-7">

                    {/* Icon + name */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0"
                        style={{
                          backgroundColor: `${plan.accent}14`,
                          borderColor: `${plan.accent}22`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: plan.accent }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white leading-tight">{plan.name}</h3>
                        <p className="text-[10px] text-white/30 leading-snug mt-0.5">{plan.tagline}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-7 pb-7 border-b border-white/[0.06]">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                          {plan.price}
                        </span>
                        <span className="text-sm text-white/30 font-medium">{plan.priceSub}</span>
                      </div>
                      <p className="text-[10px] text-white/20 mt-1.5">
                        Cobrança mensal · Cancele quando quiser
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="flex-1 space-y-3 mb-8">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <span
                            className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `${plan.accent}14`,
                              border: `1px solid ${plan.accent}25`,
                            }}
                          >
                            <Check className="w-2 h-2" strokeWidth={3} style={{ color: plan.accent }} />
                          </span>
                          <span className="text-[12px] text-white/50 leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {plan.highlighted ? (
                      <Link
                        href={plan.ctaHref}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-white py-3 text-[13px] font-bold text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] active:scale-[0.98]"
                      >
                        {plan.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={plan.ctaHref}
                        className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/12 py-3 text-[13px] font-medium text-white/60 transition-all duration-200 hover:border-white/25 hover:text-white hover:bg-white/[0.04]"
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/22">
            <ShieldCheck className="w-4 h-4 text-violet-500/45" />
            Garantia de 7 dias ou seu dinheiro de volta · Sem fidelidade · Cancele quando quiser
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0B0C10] overflow-hidden py-32 px-6">

        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-purple-400 tracking-widest uppercase mb-4">
              Suporte
            </p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Perguntas Frequentes
            </h2>
          </div>

          {/* Accordion */}
          <div>
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0B0C10] pb-4 px-6 lg:px-12 overflow-hidden">

        <div className="relative mx-auto max-w-7xl">
          <div
            className="relative rounded-3xl overflow-hidden px-8 py-24 text-center"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.22) 0%, rgba(13,14,20,0.97) 55%, #0d0e14 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Top glow line */}
            <div
              className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
            />
            {/* Bottom glow line */}
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }}
            />

            {/* Floating particles */}
            {[
              { top: '22%', left: '9%',  size: 'w-1 h-1',     color: '#8b5cf6' },
              { top: '68%', left: '7%',  size: 'w-1.5 h-1.5', color: '#a855f7' },
              { top: '26%', left: '89%', size: 'w-1 h-1',     color: '#c026d3' },
              { top: '64%', left: '91%', size: 'w-1.5 h-1.5', color: '#8b5cf6' },
            ].map((p, i) => (
              <div
                key={i}
                className={`pointer-events-none absolute ${p.size} rounded-full animate-pulse`}
                style={{
                  top: p.top, left: p.left,
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
              <h2 className="text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold text-white tracking-tight leading-[1.06] max-w-3xl mx-auto mb-6">
                Pronto para organizar a sua produtora?
              </h2>

              {/* Subtitle */}
              <p className="text-lg text-white/38 max-w-xl mx-auto leading-relaxed mb-12">
                Junte-se às produtoras que já transformaram o caos em fluxo criativo.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-bold text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_50px_rgba(255,255,255,0.18)] active:scale-[0.98]"
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/14 px-8 py-4 text-[15px] font-medium text-white/55 transition-all duration-200 hover:border-white/28 hover:text-white hover:bg-white/[0.04]"
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
