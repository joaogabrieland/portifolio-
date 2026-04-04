'use client';

// ─── Deep Dive Zig-Zag Section ───────────────────────────────────────────────
// Three large feature blocks alternating text / media layout.
// Video placeholders: swap src="" for real demo clips.

import { Check } from 'lucide-react';

interface DeepDiveBlock {
  id: string;
  tag: string;
  tagColor: string;           // Tailwind text color class
  tagBg: string;              // Tailwind bg + border classes
  accentColor: string;        // hex used for glow / check icon
  glowColor: string;          // rgba for box-shadow glow
  reverse: boolean;           // true → lg:flex-row-reverse
  title: string;
  description: string;
  bullets: string[];
  media: React.ReactNode;
}

// ─── Fallback UIs (shown while video src is empty) ───────────────────────────

function ClientHubFallback() {
  return (
    <div className="absolute inset-0 flex flex-col p-7 gap-4">
      {/* Portal header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm bg-violet-400/60" />
          </div>
          <div>
            <div className="h-2 w-24 rounded bg-white/15 mb-1.5" />
            <div className="h-1.5 w-16 rounded bg-white/[0.07]" />
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold text-emerald-400">
          Aprovado ✓
        </span>
      </div>

      {/* Video thumbnail */}
      <div className="flex-1 rounded-2xl bg-black/50 border border-white/[0.06] relative overflow-hidden flex items-center justify-center min-h-[100px]">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(16,185,129,0.05) 100%)' }}
        />
        <div className="relative w-12 h-12 rounded-full border border-white/20 bg-white/[0.06] flex items-center justify-center">
          <div className="w-0 h-0 border-t-[7px] border-b-[7px] border-l-[13px] border-transparent border-l-white/70 ml-1" />
        </div>
        {/* Scrubber */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
          <span className="text-[9px] text-white/30 font-mono">01:24</span>
          <div className="flex-1 h-1 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[38%] rounded-full bg-violet-500/80" />
          </div>
          <span className="text-[9px] text-white/30 font-mono">03:52</span>
        </div>
      </div>

      {/* Comment thread */}
      <div className="space-y-2">
        {[
          { name: 'Sofia Brand', text: 'Adorei o resultado! Pode ajustar a cor da legenda?', color: 'bg-violet-600/40' },
          { name: 'Ricardo A.', text: 'Atualizado! Versão final enviada ✓', color: 'bg-emerald-600/40' },
        ].map((c, i) => (
          <div key={i} className="flex gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] px-3.5 py-2.5">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 text-[8px] font-bold text-white flex items-center justify-center ${c.color}`}>
              {c.name[0]}
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/40 mb-0.5">{c.name}</p>
              <p className="text-[9px] text-white/30 leading-snug">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExecutiveFallback() {
  const rows = [
    { label: 'Dir. de Fotografia', daily: 'R$ 900', days: 3, total: 'R$ 2.700' },
    { label: 'Gaffer / Ilum.', daily: 'R$ 600', days: 3, total: 'R$ 1.800' },
    { label: 'Câmera RED Monstro', daily: 'R$ 1.200', days: 2, total: 'R$ 2.400' },
    { label: 'Locação Estúdio', daily: 'R$ 800', days: 1, total: 'R$ 800' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col p-7">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.07]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Orçamento — Projeto Horizonte</span>
        <span className="text-[10px] font-bold text-emerald-400">Margem: +23%</span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-1">
        {['Item', 'Diária', 'Dias', 'Total'].map(h => (
          <span key={h} className="text-[8px] font-bold uppercase tracking-widest text-white/20">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 rounded-xl bg-white/[0.03] border border-white/[0.04] px-3 py-2.5">
            <span className="text-[9px] text-white/50 truncate col-span-1">{row.label}</span>
            <span className="text-[9px] font-bold text-white/40">{row.daily}</span>
            <span className="text-[9px] font-bold text-white/40">{row.days}</span>
            <span className="text-[9px] font-bold text-emerald-400">{row.total}</span>
          </div>
        ))}
      </div>

      {/* Totals footer */}
      <div className="mt-4 pt-3 border-t border-white/[0.07] grid grid-cols-2 gap-4">
        <div>
          <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">Total Custos</p>
          <p className="text-lg font-extrabold text-white">R$ 7.700</p>
        </div>
        <div>
          <p className="text-[8px] text-white/20 uppercase tracking-widest mb-1">Faturado</p>
          <p className="text-lg font-extrabold text-emerald-400">R$ 9.500</p>
        </div>
      </div>
    </div>
  );
}

function AIFallback() {
  const lines = [
    { label: 'TEMA', value: 'Moda sustentável — 60s emocional' },
    { label: 'ABERTURA', value: 'FADE IN: mãos costurando sob luz quente' },
    { label: 'VOZ OFF', value: '"Cada peça tem uma história..."' },
    { label: 'CORTE', value: 'Close de tecido orgânico em câmera lenta' },
    { label: 'CLÍMAX', value: 'Coleção finalizada — música cresce' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col p-7 gap-4">
      {/* Prompt bar */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.07] p-4">
        <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest mb-1.5">Prompt IA</p>
        <p className="text-[11px] text-blue-300/80 leading-relaxed">
          "Roteiro emocional, 60 segundos, moda sustentável, câmera em movimento, narração em off."
        </p>
        <div className="mt-2.5 flex gap-1">
          {[0, 0.15, 0.3].map((d, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </div>
      </div>

      {/* Output lines */}
      <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 space-y-3 overflow-hidden">
        {lines.map((line, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex-shrink-0 rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest"
              style={{ background: 'rgba(59,130,246,0.12)', color: 'rgba(147,197,253,0.7)' }}
            >
              {line.label}
            </span>
            <p className="text-[9px] text-white/35 leading-snug">{line.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/20">5 cenas geradas</span>
        <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-3 py-1 text-[9px] font-bold text-blue-400">
          Exportar Roteiro →
        </span>
      </div>
    </div>
  );
}

// ─── Media wrapper shared by all blocks ──────────────────────────────────────

function MediaContainer({
  glowColor,
  fallback,
}: {
  glowColor: string;
  fallback: React.ReactNode;
}) {
  return (
    <div className="relative flex-1 w-full">
      {/* Outer glow */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}
      />
      {/* Container */}
      <div
        className="relative rounded-2xl border border-white/10 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #13141c 0%, #0e0f16 100%)',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.55), 0 0 40px ${glowColor}`,
        }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.015]">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-amber-500/60" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
        </div>

        {/* Video + fallback */}
        <div className="relative aspect-[4/3] bg-[#0d0e15]">
          {/* Video placeholder - add src when demo video is available */}
          {fallback}
        </div>
      </div>
    </div>
  );
}

// ─── Block data ───────────────────────────────────────────────────────────────

const BLOCKS: Omit<DeepDiveBlock, 'media'>[] = [
  {
    id: 'hub-clientes',
    tag: 'Client-Facing',
    tagColor: 'text-violet-400',
    tagBg: 'border border-violet-500/20 bg-violet-500/8',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(109,40,217,0.18)',
    reverse: false,
    title: 'A sua produtora com cara de agência global.',
    description:
      'Chega de enviar links do Drive soltos no WhatsApp ou perder o rasto das aprovações em threads de email infinitas.',
    bullets: [
      'Painéis de aprovação exclusivos com a sua marca.',
      'Histórico de feedbacks e comentários centralizados.',
      'Apresentação de propostas que convertem mais.',
    ],
  },
  {
    id: 'executivo',
    tag: 'Controlo Financeiro',
    tagColor: 'text-emerald-400',
    tagBg: 'border border-emerald-500/20 bg-emerald-500/8',
    accentColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.14)',
    reverse: true,
    title: 'O cérebro financeiro das suas produções.',
    description:
      'O orçamento deixou de ser uma dor de cabeça. O nosso motor financeiro liga a sua equipa aos seus custos em tempo real.',
    bullets: [
      'Planilhas que puxam os valores reais da equipa automaticamente.',
      'Controlo de caixa sincronizado com o orçamento.',
      'Margem de lucro calculada ao cêntimo, antes de fechar o projeto.',
    ],
  },
  {
    id: 'central-criacao',
    tag: 'Inteligência Artificial',
    tagColor: 'text-blue-400',
    tagBg: 'border border-blue-500/20 bg-blue-500/8',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.14)',
    reverse: false,
    title: 'Criação turbinada com IA nativa.',
    description:
      'Deixe a tela em branco no passado. Ferramentas de inteligência artificial integradas diretamente no seu fluxo de trabalho.',
    bullets: [
      'Geração de prompts precisos para imagens de referência (Moodboards).',
      'Decupagem e estruturação de roteiros em segundos.',
      'Organização inteligente de referências e documentos do set.',
    ],
  },
];

const FALLBACKS = [
  <ClientHubFallback key="hub" />,
  <ExecutiveFallback key="exec" />,
  <AIFallback key="ai" />,
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkflowSection() {
  return (
    <section id="fluxo" className="relative bg-[#0B0C10] overflow-hidden">

      {/* Divider line */}
      <div className="pointer-events-none mx-auto max-w-7xl px-6 lg:px-12">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">

        {BLOCKS.map((block, i) => (
          <div
            key={block.id}
            className={`
              flex flex-col gap-16 lg:gap-24 items-center py-28 lg:py-36
              ${block.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}
              ${i < BLOCKS.length - 1 ? 'border-b border-white/[0.05]' : ''}
            `}
          >
            {/* ── Text side ─────────────────────────────────────────────────── */}
            <div className="flex-1 max-w-xl">

              {/* Eyebrow tag */}
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] mb-8 ${block.tagColor} ${block.tagBg}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: block.accentColor }}
                />
                {block.tag}
              </span>

              {/* Title */}
              <h3 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.06] mb-6">
                {block.title}
              </h3>

              {/* Description */}
              <p className="text-lg text-white/45 leading-relaxed mb-10">
                {block.description}
              </p>

              {/* Bullets */}
              <ul className="space-y-4">
                {block.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-4">
                    {/* Check icon circle */}
                    <span
                      className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border"
                      style={{
                        borderColor: `${block.accentColor}30`,
                        backgroundColor: `${block.accentColor}12`,
                      }}
                    >
                      <Check
                        className="w-3 h-3"
                        style={{ color: block.accentColor }}
                        strokeWidth={3}
                      />
                    </span>
                    <span className="text-base text-white/60 leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Media side ────────────────────────────────────────────────── */}
            <MediaContainer
              glowColor={block.glowColor}
              fallback={FALLBACKS[i]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
