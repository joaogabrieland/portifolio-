'use client';

// ─── Sprint 4: Extra Tools Grid + Scale / Target Audience ────────────────────

import type { LucideIcon } from 'lucide-react';
import { Calculator, FileText, FilePen, HardDrive, Users, Zap, TrendingUp, Building2 } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXTRA_TOOLS: {
  icon: LucideIcon;
  title: string;
  copy: string;
  accent: string;
  badge?: { label: string; style: 'novo' | 'breve' };
}[] = [
  {
    icon: Calculator,
    title: 'Precificação Inteligente',
    copy: 'Descubra exatamente quanto cobrar. Calcule sua margem de lucro e crie orçamentos à prova de prejuízo.',
    accent: '#a78bfa',
  },
  {
    icon: FileText,
    title: 'Propostas Magnéticas',
    copy: 'Converta mais clientes com propostas comerciais cinematográficas geradas com a sua marca em segundos.',
    accent: '#34d399',
  },
  {
    icon: HardDrive,
    title: 'Arquivos e Backups',
    copy: 'Seus assets seguros na nuvem. Organize brutos, referências e entregas finais sem depender de HDs externos.',
    accent: '#60a5fa',
  },
  {
    icon: Users,
    title: 'Controle de Equipe',
    copy: 'Controle de acessos inteligente. Freelancers só veem o que precisam, a sua margem de lucro fica totalmente protegida.',
    accent: '#f59e0b',
  },
  {
    icon: FilePen,
    title: 'Gerador de Contratos',
    copy: 'Crie contratos jurídicos blindados em formato de quiz em poucos cliques.',
    accent: '#c084fc',
    badge: { label: 'Novo ✨', style: 'novo' },
  },
];

const SCALE_TIERS = [
  {
    icon: Zap,
    label: 'Começo de jornada',
    title: 'Creator Solo',
    copy: 'Chega de se afogar em planilhas. Centralize seu atendimento e pareça uma agência gigante para os seus clientes.',
    accent: '#a78bfa',
    gradient: 'from-violet-500/[0.08] to-transparent',
    border: 'border-violet-500/20',
    features: ['1 usuário', 'Hub de Clientes', 'Roteiros com IA', 'Propostas e orçamentos'],
    step: '01',
  },
  {
    icon: TrendingUp,
    label: 'Em crescimento',
    title: 'Produtora em Crescimento',
    copy: 'Gerencie os seus primeiros freelancers com segurança, controle o caixa e aprove dezenas de vídeos ao mesmo tempo.',
    accent: '#60a5fa',
    gradient: 'from-blue-500/[0.1] to-transparent',
    border: 'border-blue-500/25',
    features: ['Até 10 membros', 'Controle de acesso (RBAC)', 'Assistente Executivo', 'Portal de aprovação'],
    step: '02',
    highlighted: true,
  },
  {
    icon: Building2,
    label: 'Operação consolidada',
    title: 'Grande Produtora',
    copy: 'Múltiplas equipes, grandes orçamentos e dezenas de clientes ativos. Controle financeiro estrito e visão global do negócio.',
    accent: '#34d399',
    gradient: 'from-emerald-500/[0.08] to-transparent',
    border: 'border-emerald-500/20',
    features: ['Membros ilimitados', 'SLA dedicado', 'Relatórios de BI', 'API e integrações'],
    step: '03',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExtraToolsSection() {
  return (
    <>
      {/* ── 1. Extra Tools Grid ──────────────────────────────────────────────── */}
      <section className="relative bg-[#0B0C10] overflow-hidden">

        {/* Top divider */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Subtle center aurora */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-[0.07]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.7) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-24 pb-16">

          <h2 className="text-3xl font-bold text-center text-white tracking-tight mb-3">
            O seu arsenal completo.
          </h2>
          <p className="text-center text-white/35 text-base mb-14">
            Todas as ferramentas que a sua produtora precisa, sem abrir outra aba.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {EXTRA_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.title}
                  className="group relative flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-7 transition-all duration-400 hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-0.5"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Hover inner glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${tool.accent}0D 0%, transparent 60%)` }}
                  />

                  {/* "Novo" badge — top-right */}
                  {tool.badge?.style === 'novo' && (
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full px-2.5 py-1 text-[9px] font-black tracking-wide"
                        style={{
                          background: 'rgba(192,86,211,0.12)',
                          border: '1px solid rgba(192,86,211,0.30)',
                          color: '#e879f9',
                        }}
                      >
                        {tool.badge.label}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                    style={{
                      backgroundColor: `${tool.accent}14`,
                      border: `1px solid ${tool.accent}22`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: tool.accent }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] font-extrabold text-white tracking-tight mb-2.5">
                    {tool.title}
                  </h3>

                  {/* Copy */}
                  <p className="text-sm text-white/38 leading-relaxed flex-1">
                    {tool.copy}
                  </p>

                  {/* Accent line */}
                  <div
                    className="mt-6 h-0.5 w-6 rounded-full opacity-30 group-hover:w-12 group-hover:opacity-60 transition-all duration-400"
                    style={{ backgroundColor: tool.accent }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. Scale / Target Audience ───────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-32 px-6 lg:px-12"
        style={{
          background: 'linear-gradient(170deg, #0B0C10 0%, #0d0e1a 35%, #0a0b14 70%, #0B0C10 100%)',
        }}
      >
        {/* Divider top */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

        {/* Left aurora */}
        <div
          className="pointer-events-none absolute top-1/2 -left-40 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.7) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Right aurora */}
        <div
          className="pointer-events-none absolute top-1/2 -right-40 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.6) 0%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-5">
              Feito para o seu momento.
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
              Não importa o tamanho da sua operação, o Creator Flow escala com você.
            </p>
          </div>

          {/* Scale tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {SCALE_TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.title}
                  className={`relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-500 ${
                    tier.highlighted
                      ? 'md:-mt-4 md:mb-4'
                      : ''
                  } ${tier.border}`}
                  style={{
                    background: tier.highlighted
                      ? `linear-gradient(160deg, ${tier.accent}0F 0%, #111218 40%)`
                      : '#111218',
                    boxShadow: tier.highlighted
                      ? `0 0 60px ${tier.accent}14, 0 0 0 1px ${tier.accent}18`
                      : 'none',
                  }}
                >
                  {/* Step number — top right */}
                  <div className="absolute top-6 right-6">
                    <span
                      className="text-[11px] font-black tabular-nums"
                      style={{ color: `${tier.accent}40` }}
                    >
                      {tier.step}
                    </span>
                  </div>

                  {/* Gradient bar top for highlighted */}
                  {tier.highlighted && (
                    <div
                      className="h-0.5 w-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)` }}
                    />
                  )}

                  <div className="p-8 flex flex-col flex-1">

                    {/* Label */}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] w-fit mb-6"
                      style={{
                        backgroundColor: `${tier.accent}12`,
                        border: `1px solid ${tier.accent}22`,
                        color: tier.accent,
                      }}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {tier.label}
                    </span>

                    {/* Title */}
                    <h3
                      className="text-xl font-extrabold tracking-tight mb-4 leading-tight"
                      style={{ color: tier.highlighted ? '#fff' : 'rgba(255,255,255,0.85)' }}
                    >
                      {tier.title}
                    </h3>

                    {/* Copy */}
                    <p className="text-sm text-white/40 leading-relaxed mb-8">
                      {tier.copy}
                    </p>

                    {/* Features */}
                    <ul className="mt-auto space-y-2.5">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5">
                          <span
                            className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: `${tier.accent}80` }}
                          />
                          <span className="text-sm text-white/45">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom accent bar */}
                  <div
                    className="h-0.5 w-full opacity-20"
                    style={{ background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Scale arrow below cards */}
          <div className="mt-12 flex items-center justify-center gap-3 opacity-20">
            <div className="h-px flex-1 max-w-[140px] bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Escala com você</span>
            <div className="h-px flex-1 max-w-[140px] bg-gradient-to-l from-transparent to-white/40" />
          </div>
        </div>

        {/* Divider bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </section>
    </>
  );
}
