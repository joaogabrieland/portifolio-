'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Check,
  Copy, Printer, CheckCircle, Users, Camera,
  Film, Mic, Sparkles, DollarSign, Calendar,
  RotateCcw, Lightbulb, Layers, Package, X,
  FileText, Clock, ChevronRight, Clapperboard,
  Building2, Target,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtraCost { id: string; item: string; value: string; }

interface WizardData {
  clientName:      string;
  objective:       string;
  objectiveCustom: string;
  videoType:       string;
  deliverables:    string;
  shootingDays:    string;
  crewSize:        string;
  crewSizeCustom:  string;
  equipmentLevel:  string;
  equipmentTags:   string[];
  narration:       boolean;
  motionGraphics:  boolean;
  colorGrading:    boolean;
  outros:          boolean;
  outrosDesc:      string;
  revisionLimit:   string;
  extraCosts:      ExtraCost[];
  serviceFee:      string;
  paymentTerms:    string;
  deadline:        string;
  agencyLogo:      string; // base64 DataURL
  clientLogo:      string; // base64 DataURL
}

interface SavedProposal {
  id:        string;
  createdAt: string; // ISO string
  data:      WizardData;
}

type View = 'history' | 'wizard' | 'document';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_DATA: WizardData = {
  clientName: '', objective: '', objectiveCustom: '',
  videoType: '', deliverables: '',
  shootingDays: '1', crewSize: 'pequena', crewSizeCustom: '',
  equipmentLevel: 'intermediario', equipmentTags: [],
  narration: false, motionGraphics: false, colorGrading: false,
  outros: false, outrosDesc: '',
  revisionLimit: '2', extraCosts: [],
  serviceFee: '', paymentTerms: '', deadline: '',
  agencyLogo: '', clientLogo: '',
};

const LS_LOGO_KEY = 'creatorflow_agency_logo';

const OBJECTIVES = [
  { value: 'vendas',        label: 'Vendas / Conversão' },
  { value: 'branding',      label: 'Branding / Awareness' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'lancamento',    label: 'Lançamento de Produto' },
  { value: 'treinamento',   label: 'Treinamento / Educação' },
  { value: 'evento',        label: 'Cobertura de Evento' },
  { value: 'redes_sociais', label: 'Redes Sociais / Reels' },
  { value: 'outro',         label: 'Outro' },
];

const CREW_SIZES = [
  { value: 'solo',    label: 'Solo (1 pessoa)' },
  { value: 'pequena', label: 'Pequena (2–3 pessoas)' },
  { value: 'media',   label: 'Média (4–6 pessoas)' },
  { value: 'grande',  label: 'Grande (7+ pessoas)' },
  { value: 'outro',   label: 'Outro' },
];

const EQUIPMENT_LEVELS = [
  { value: 'basico',        label: 'Básico',        desc: 'DSLR / Mirrorless, iluminação simples' },
  { value: 'intermediario', label: 'Intermediário',  desc: 'Cinema camera, kit de luzes, steadicam' },
  { value: 'avancado',      label: 'Avançado',       desc: 'Cinema completo, drone, multicâmera' },
];

const LS_KEY = 'cf_proposals';
const TOTAL_STEPS = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: string): string {
  const n = parseFloat(val.replace(',', '.'));
  if (isNaN(n)) return 'R$ 0,00';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function totalExtras(costs: ExtraCost[]): number {
  return costs.reduce((s, c) => s + (parseFloat(c.value.replace(',', '.')) || 0), 0);
}

function resolvedObjective(data: WizardData): string {
  if (data.objective === 'outro') return data.objectiveCustom.trim() || 'Outro';
  return OBJECTIVES.find(o => o.value === data.objective)?.label ?? data.objective;
}

function resolvedCrew(data: WizardData): string {
  if (data.crewSize === 'outro') return data.crewSizeCustom.trim() || 'Outro';
  return CREW_SIZES.find(c => c.value === data.crewSize)?.label ?? data.crewSize;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildWhatsAppText(data: WizardData): string {
  const extras = data.extraCosts.filter(c => c.item.trim());
  const extrasTotal = totalExtras(extras);
  const feeNum = parseFloat(data.serviceFee.replace(',', '.')) || 0;
  const total = extrasTotal + feeNum;
  return [
    `📽️ *Proposta Comercial — ${data.clientName}*`,
    '',
    `Projeto de *${data.videoType}* com objetivo de *${resolvedObjective(data)}*.`,
    '',
    `*📦 Entregáveis:* ${data.deliverables}`,
    `*🎬 Diárias:* ${data.shootingDays} dia(s)`,
    `*👥 Equipe:* ${resolvedCrew(data)}`,
    data.narration      ? '*🎙️ Locução:* Inclusa'                       : '',
    data.motionGraphics ? '*✨ Motion Graphics:* Incluso'                 : '',
    data.colorGrading   ? '*🎨 Color Grading:* Incluso'                  : '',
    data.outros && data.outrosDesc ? `*➕ Extra Pós:* ${data.outrosDesc}` : '',
    `*🔄 Alterações:* até ${data.revisionLimit} rodada(s)`,
    '',
    extras.length > 0
      ? `*💰 Custos Extras:*\n${extras.map(c => `  • ${c.item}: ${fmt(c.value)}`).join('\n')}`
      : '',
    `*🏷️ Serviço da Produtora:* ${fmt(data.serviceFee)}`,
    '',
    `*💎 Investimento Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*`,
    '',
    `*💳 Pagamento:* ${data.paymentTerms}`,
    `*📅 Prazo:* ${data.deadline}`,
    '',
    'Ficou com alguma dúvida? Estou à disposição! 🚀',
  ].filter(l => l !== '').join('\n');
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );
}

const inputCls =
  'w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors';

function ToggleBtn({ active, onClick, icon, label, desc }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; desc: string;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all ${
      active ? 'bg-emerald-500/10 border-emerald-500/40' : 'border-zinc-700 hover:border-zinc-600'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
      }`}>{icon}</div>
      <div className="flex-1 text-left">
        <div className={`text-sm font-bold ${active ? 'text-emerald-300' : 'text-zinc-300'}`}>{label}</div>
        <div className="text-xs text-zinc-600">{desc}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        active ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
      }`}>
        {active && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function StepShell({ step, total, title, tip, children }: {
  step: number; total: number; title: string; tip: string; children: React.ReactNode;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Passo {step} de {total}
          </span>
          <span className="text-[10px] font-bold text-zinc-600">{pct}%</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
        <h2 className="mt-4 text-lg font-black text-white">{title}</h2>
      </div>
      <div className="mx-6 mt-4 flex items-start gap-2.5 px-4 py-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex-shrink-0">
        <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-300/80 leading-relaxed">{tip}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
    </div>
  );
}

// ─── View: Document ───────────────────────────────────────────────────────────

function ProposalDocument({ proposal, onBack, onNew }: {
  proposal: SavedProposal;
  onBack: () => void;
  onNew: () => void;
}) {
  const { data, createdAt } = proposal;
  const [copied, setCopied] = useState(false);

  const extras = data.extraCosts.filter(c => c.item.trim());
  const extrasTotal = totalExtras(extras);
  const feeNum = parseFloat(data.serviceFee.replace(',', '.')) || 0;
  const grandTotal = extrasTotal + feeNum;
  const equipLabel = EQUIPMENT_LEVELS.find(e => e.value === data.equipmentLevel)?.label ?? data.equipmentLevel;

  const postItems = [
    data.narration      && { label: 'Locução / Narração',          icon: <Mic className="w-3.5 h-3.5" /> },
    data.motionGraphics && { label: 'Motion Graphics / Animação',   icon: <Sparkles className="w-3.5 h-3.5" /> },
    data.colorGrading   && { label: 'Color Grading / Correção de Cor', icon: <Layers className="w-3.5 h-3.5" /> },
    (data.outros && data.outrosDesc) && { label: data.outrosDesc,   icon: <Film className="w-3.5 h-3.5" /> },
  ].filter(Boolean) as { label: string; icon: React.ReactNode }[];

  async function handleCopy() {
    await navigator.clipboard.writeText(buildWhatsAppText(data));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { height: auto !important; overflow: visible !important; }
          body > * { visibility: hidden !important; }
          .printable-doc, .printable-doc * { visibility: visible !important; }
          .printable-doc {
            position: absolute !important;
            top: 0 !important; left: 0 !important; right: 0 !important;
            padding: 24px !important;
          }
          .no-print { display: none !important; }
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .page2-start {
            break-before: page !important;
            page-break-before: always !important;
          }
        }
      `}</style>

      <div className="flex flex-col h-full bg-zinc-950">
        {/* Header bar */}
        <header className="no-print flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white">Proposta Comercial</h1>
              <p className="text-xs text-zinc-500">{data.clientName} · {formatDate(createdAt)}</p>
            </div>
          </div>
          <button onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-lg transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Nova Proposta
          </button>
        </header>

        {/* Document scroll area */}
        <div className="flex-1 overflow-y-auto print:h-auto print:overflow-visible">
          <div className="printable-doc max-w-2xl mx-auto px-6 py-8">

            {/* ══════════════════════ PAGE 1 — O Projeto ══════════════════════ */}
            <div className="space-y-4">

              {/* ── Proposal header with logos ── */}
              <div className="avoid-break rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-600 to-violet-500" />

                {/* Logos row — only shown if at least one logo exists */}
                {(data.agencyLogo || data.clientLogo) && (
                  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {data.agencyLogo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.agencyLogo} alt="Logo Produtora" className="max-h-10 max-w-[130px] object-contain" />
                      )}
                    </div>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      Proposta para
                    </span>
                    <div className="flex-1 flex justify-end">
                      {data.clientLogo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.clientLogo} alt="Logo Cliente" className="max-h-10 max-w-[130px] object-contain" />
                      )}
                    </div>
                  </div>
                )}

                <div className="px-6 py-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                      Proposta Comercial
                    </p>
                    <h2 className="text-2xl font-black text-white">{data.clientName}</h2>
                    <p className="text-sm text-zinc-400 mt-1">{data.videoType}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Escopo ── */}
              <div className="avoid-break rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Escopo do Projeto</span>
                </div>
                <div className="px-6 py-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Objetivo</p>
                    <p className="text-sm font-bold text-white">{resolvedObjective(data)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tipo</p>
                    <p className="text-sm font-bold text-white">{data.videoType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Entregáveis</p>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{data.deliverables}</p>
                  </div>
                </div>
              </div>

              {/* ── Setup de Produção ── */}
              <div className="avoid-break rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
                  <Clapperboard className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Setup de Produção</span>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Diárias</p>
                    <p className="text-xl font-black text-white tabular-nums">{data.shootingDays}
                      <span className="text-sm font-bold text-zinc-500 ml-1">dia(s)</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Equipe</p>
                    <p className="text-sm font-bold text-white">{resolvedCrew(data)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Equipamento</p>
                    <p className="text-sm font-bold text-white">{equipLabel}</p>
                  </div>
                  {data.equipmentTags.length > 0 && (
                    <div className="col-span-3">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Kit Específico</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.equipmentTags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/25 rounded-lg text-xs font-bold text-violet-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Pós-Produção ── */}
              <div className="avoid-break rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pós-Produção</span>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {postItems.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {postItems.map(item => (
                        <div key={item.label}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
                          <span className="text-emerald-400">{item.icon}</span>
                          <span className="text-xs font-bold text-emerald-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600">Edição padrão sem serviços adicionais.</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Rodadas de Alteração:</span>
                    <span className="text-sm font-black text-white">{data.revisionLimit}</span>
                  </div>
                </div>
              </div>

            </div>{/* end PAGE 1 */}

            {/* ══════════════════════ PAGE 2 — O Negócio ══════════════════════ */}
            <div className="page2-start space-y-4 mt-4">

              {/* ── Custos Extras ── */}
              {extras.length > 0 && (
                <div className="avoid-break rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Custos Extras de Produção</span>
                  </div>
                  <div className="divide-y divide-zinc-800/60">
                    {extras.map(cost => (
                      <div key={cost.id} className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-zinc-300">{cost.item}</span>
                        <span className="text-sm font-bold text-zinc-200 tabular-nums">{fmt(cost.value)}</span>
                      </div>
                    ))}
                    <div className="px-6 py-3 flex justify-between items-center bg-zinc-800/30">
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Subtotal Extras</span>
                      <span className="text-base font-black text-white tabular-nums">
                        {extrasTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Investimento Total ── */}
              <div className="avoid-break rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/30">
                <div className="px-6 pt-5 pb-2">
                  <p className="text-[10px] font-black text-indigo-200/70 uppercase tracking-widest mb-1">Investimento Total</p>
                  <p className="text-4xl font-black text-white tabular-nums">
                    {grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-white/10 grid grid-cols-1 gap-2">
                  {extras.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-200/70">Custos de produção</span>
                      <span className="font-bold text-white/80 tabular-nums">
                        {extrasTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200/70">Serviço da produtora</span>
                    <span className="font-bold text-white/80 tabular-nums">{fmt(data.serviceFee)}</span>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest mb-1">Condições de Pagamento</p>
                    <p className="text-sm font-bold text-white">{data.paymentTerms || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest mb-1">Prazo de Entrega</p>
                    <p className="text-sm font-bold text-white">{data.deadline || '—'}</p>
                  </div>
                </div>
              </div>

              {/* ── Próximos Passos ── */}
              <div className="avoid-break rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Próximos Passos</span>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {[
                    'Aprovação desta proposta',
                    'Assinatura do contrato',
                    'Pagamento da entrada',
                    'Início das gravações',
                  ].map((item, i) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-black text-indigo-400">{i + 1}</span>
                      </div>
                      <span className="text-sm text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Action buttons ── */}
              <div className="no-print flex items-center gap-3 pt-2 pb-6">
                <button onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border ${
                    copied
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-600'
                  }`}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar Resumo para WhatsApp'}
                </button>
                <button onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
                  <Printer className="w-4 h-4" />
                  Salvar como PDF
                </button>
              </div>

            </div>{/* end PAGE 2 */}

          </div>
        </div>
      </div>
    </>
  );
}

// ─── View: History ────────────────────────────────────────────────────────────

function ProposalHistory({ proposals, onNew, onView, onBack }: {
  proposals: SavedProposal[];
  onNew: () => void;
  onView: (p: SavedProposal) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-white">Propostas Comerciais</h1>
            <p className="text-xs text-zinc-500">{proposals.length} proposta(s) salva(s)</p>
          </div>
        </div>
        <button onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Nova Proposta
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
              <FileText className="w-8 h-8 text-zinc-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-400 mb-1">Nenhuma proposta ainda</p>
              <p className="text-xs text-zinc-600">Crie sua primeira proposta e ela ficará salva aqui.</p>
            </div>
            <button onClick={onNew}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors mt-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Proposta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...proposals].reverse().map(p => {
              const extras = p.data.extraCosts.filter(c => c.item.trim());
              const total = totalExtras(extras) + (parseFloat(p.data.serviceFee.replace(',', '.')) || 0);
              return (
                <div key={p.id}
                  className="flex items-center gap-4 px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{p.data.clientName || 'Cliente sem nome'}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(p.createdAt)}
                      </span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className="text-xs text-zinc-500">{p.data.videoType || '—'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-white tabular-nums">
                      {total > 0 ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                    </p>
                    <p className="text-[10px] text-zinc-600">investimento</p>
                  </div>
                  <button onClick={() => onView(p)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 group-hover:bg-zinc-700 text-zinc-400 group-hover:text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0">
                    Ver
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { onBack: () => void; }

export default function ProposalWizard({ onBack }: Props) {
  const [view,      setView]      = useState<View>('history');
  const [proposals, setProposals] = useState<SavedProposal[]>([]);
  const [active,    setActive]    = useState<SavedProposal | null>(null);
  const [step,      setStep]      = useState(1);
  const [data,      setData]      = useState<WizardData>(INITIAL_DATA);
  const [equipInput,  setEquipInput]  = useState('');
  const [custoDesc,   setCustoDesc]   = useState('');
  const [custoValor,  setCustoValor]  = useState('');

  // ── localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setProposals(JSON.parse(raw));
      const savedLogo = localStorage.getItem(LS_LOGO_KEY);
      if (savedLogo) setData(prev => ({ ...prev, agencyLogo: savedLogo }));
    } catch { /* ignore */ }
  }, []);

  function saveProposal(d: WizardData): SavedProposal {
    const p: SavedProposal = {
      id:        `prop_${Date.now()}`,
      createdAt: new Date().toISOString(),
      data:      d,
    };
    const updated = [...proposals, p];
    setProposals(updated);
    try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    return p;
  }

  // ── Field setter ──
  const set = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  // ── Equipment tags ──
  const addEquipTag = (raw: string) => {
    const val = raw.trim();
    if (!val || data.equipmentTags.includes(val)) return;
    set('equipmentTags', [...data.equipmentTags, val]);
    setEquipInput('');
  };
  const removeEquipTag = (tag: string) =>
    set('equipmentTags', data.equipmentTags.filter(t => t !== tag));

  // ── Extra costs ──
  const commitCost = () => {
    const desc = custoDesc.trim();
    const val  = custoValor.trim();
    if (!desc) return;
    set('extraCosts', [
      ...data.extraCosts,
      { id: `ec_${Date.now()}`, item: desc, value: val },
    ]);
    setCustoDesc('');
    setCustoValor('');
  };
  const removeCost = (id: string) =>
    set('extraCosts', data.extraCosts.filter(c => c.id !== id));

  // ── Totals ──
  const extrasSum   = totalExtras(data.extraCosts);
  const serviceFeeN = parseFloat(data.serviceFee.replace(',', '.')) || 0;
  const grandTotal  = extrasSum + serviceFeeN;

  // ── Navigation ──
  const canNext = (): boolean => {
    if (step === 1) return !!(data.clientName.trim() && data.objective);
    if (step === 2) return !!(data.videoType.trim() && data.deliverables.trim());
    if (step === 6) return !!(data.serviceFee.trim() && data.paymentTerms.trim() && data.deadline.trim());
    return true;
  };

  function finishWizard() {
    const saved = saveProposal(data);
    setActive(saved);
    setView('document');
  }

  const next = () => { if (step < TOTAL_STEPS) setStep(s => s + 1); else finishWizard(); };
  const prev = () => { if (step > 1) setStep(s => s - 1); };

  // ── Logo upload handlers ──
  function handleAgencyLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      set('agencyLogo', b64);
      try { localStorage.setItem(LS_LOGO_KEY, b64); } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
  }

  function handleClientLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      set('clientLogo', b64);
    };
    reader.readAsDataURL(file);
  }

  function startNew() {
    const savedLogo = (() => { try { return localStorage.getItem(LS_LOGO_KEY) || ''; } catch { return ''; } })();
    setData({ ...INITIAL_DATA, agencyLogo: savedLogo });
    setEquipInput('');
    setCustoDesc('');
    setCustoValor('');
    setStep(1);
    setView('wizard');
  }

  // ── View: History ──
  if (view === 'history') {
    return (
      <ProposalHistory
        proposals={proposals}
        onNew={startNew}
        onView={p => { setActive(p); setView('document'); }}
        onBack={onBack}
      />
    );
  }

  // ── View: Document ──
  if (view === 'document' && active) {
    return (
      <ProposalDocument
        proposal={active}
        onBack={() => setView('history')}
        onNew={startNew}
      />
    );
  }

  // ── View: Wizard ──
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Back to history */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3 flex-shrink-0">
        <button onClick={() => setView('history')}
          className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-zinc-600">Gerador de Propostas</span>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <StepShell step={1} total={TOTAL_STEPS} title="O Cliente"
            tip="Identifique claramente o cliente e o objetivo do projeto. Isso define o posicionamento e o tom da proposta.">
            <div className="space-y-5">
              <div>
                <Label>Nome do Cliente / Marca</Label>
                <input type="text" value={data.clientName}
                  onChange={e => set('clientName', e.target.value)}
                  placeholder="Ex: Empresa XYZ, Marca ABC..."
                  className={inputCls} />
              </div>

              {/* ── Logos ── */}
              <div className="grid grid-cols-2 gap-3">
                {/* Agency logo */}
                <div>
                  <Label>Logo da sua Produtora</Label>
                  <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-800/50 cursor-pointer transition-colors overflow-hidden">
                    {data.agencyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.agencyLogo} alt="Logo Produtora" className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 text-zinc-600" />
                        <span className="text-[10px] text-zinc-600 text-center">Clique para enviar</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAgencyLogoUpload} />
                  </label>
                  {data.agencyLogo && (
                    <button onClick={() => { set('agencyLogo', ''); try { localStorage.removeItem(LS_LOGO_KEY); } catch { /* ignore */ } }}
                      className="mt-1.5 text-[10px] text-zinc-600 hover:text-red-400 transition-colors w-full text-center">
                      Remover logo
                    </button>
                  )}
                </div>

                {/* Client logo */}
                <div>
                  <Label>Logo do Cliente</Label>
                  <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border border-dashed border-zinc-700 hover:border-violet-500/50 bg-zinc-800/50 cursor-pointer transition-colors overflow-hidden">
                    {data.clientLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.clientLogo} alt="Logo Cliente" className="max-h-full max-w-full object-contain p-2" />
                    ) : (
                      <>
                        <Users className="w-5 h-5 text-zinc-600" />
                        <span className="text-[10px] text-zinc-600 text-center">Clique para enviar</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleClientLogoUpload} />
                  </label>
                  {data.clientLogo && (
                    <button onClick={() => set('clientLogo', '')}
                      className="mt-1.5 text-[10px] text-zinc-600 hover:text-red-400 transition-colors w-full text-center">
                      Remover logo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <Label>Objetivo do Vídeo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {OBJECTIVES.map(obj => (
                    <button key={obj.value} type="button" onClick={() => set('objective', obj.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                        data.objective === obj.value
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                          : 'text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-zinc-200'
                      }`}>
                      {obj.label}
                    </button>
                  ))}
                </div>
                {data.objective === 'outro' && (
                  <input type="text" value={data.objectiveCustom}
                    onChange={e => set('objectiveCustom', e.target.value)}
                    placeholder="Descreva o objetivo do vídeo..."
                    className={inputCls + ' mt-2'} autoFocus />
                )}
              </div>
            </div>
          </StepShell>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <StepShell step={2} total={TOTAL_STEPS} title="Entregáveis"
            tip="'Vídeo institucional de 2 min + 3 Reels' é muito mais convincente do que apenas 'vídeo'.">
            <div className="space-y-5">
              <div>
                <Label>Tipo de Vídeo</Label>
                <input type="text" value={data.videoType}
                  onChange={e => set('videoType', e.target.value)}
                  placeholder="Ex: Vídeo Institucional, Publicidade, Reels..."
                  className={inputCls} />
              </div>
              <div>
                <Label>Descrição das Entregas</Label>
                <textarea value={data.deliverables}
                  onChange={e => set('deliverables', e.target.value)}
                  placeholder="Ex: 1 vídeo master (2 min), 3 cortes para Reels (30s cada)..."
                  rows={4} className={inputCls + ' resize-none'} />
              </div>
            </div>
          </StepShell>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <StepShell step={3} total={TOTAL_STEPS} title="Equipe & Set"
            tip="O nível de equipamento e o tamanho da equipe justificam parte do valor. Apresente como diferencial de qualidade.">
            <div className="space-y-5">
              {/* Shooting days */}
              <div>
                <Label>Quantidade de Diárias</Label>
                <div className="flex items-center gap-3">
                  <button onClick={() => set('shootingDays', String(Math.max(1, parseInt(data.shootingDays) - 1)))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold hover:bg-zinc-700 transition-colors flex-shrink-0 flex items-center justify-center text-lg">−</button>
                  <span className="text-2xl font-black text-white w-12 text-center tabular-nums">{data.shootingDays}</span>
                  <button onClick={() => set('shootingDays', String(parseInt(data.shootingDays) + 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold hover:bg-zinc-700 transition-colors flex-shrink-0 flex items-center justify-center text-lg">+</button>
                  <span className="text-sm text-zinc-500">dia(s) de gravação</span>
                </div>
              </div>

              {/* Crew size */}
              <div>
                <Label>Tamanho da Equipe</Label>
                <div className="space-y-2">
                  {CREW_SIZES.map(cs => (
                    <button key={cs.value} onClick={() => set('crewSize', cs.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        data.crewSize === cs.value
                          ? 'bg-indigo-500/10 border-indigo-500/40'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}>
                      <Users className={`w-4 h-4 flex-shrink-0 ${data.crewSize === cs.value ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span className={`text-sm font-bold ${data.crewSize === cs.value ? 'text-indigo-300' : 'text-zinc-300'}`}>
                        {cs.label}
                      </span>
                    </button>
                  ))}
                </div>
                {data.crewSize === 'outro' && (
                  <input type="text" value={data.crewSizeCustom}
                    onChange={e => set('crewSizeCustom', e.target.value)}
                    placeholder="Descreva a formação da equipe..."
                    className={inputCls + ' mt-2'} autoFocus />
                )}
              </div>

              {/* Equipment level */}
              <div>
                <Label>Nível de Equipamento / Complexidade</Label>
                <div className="space-y-2">
                  {EQUIPMENT_LEVELS.map(eq => (
                    <button key={eq.value} onClick={() => set('equipmentLevel', eq.value)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        data.equipmentLevel === eq.value
                          ? 'bg-violet-500/10 border-violet-500/40'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}>
                      <Camera className={`w-4 h-4 flex-shrink-0 mt-0.5 ${data.equipmentLevel === eq.value ? 'text-violet-400' : 'text-zinc-500'}`} />
                      <div>
                        <div className={`text-sm font-bold ${data.equipmentLevel === eq.value ? 'text-violet-300' : 'text-zinc-300'}`}>
                          {eq.label}
                        </div>
                        <div className="text-xs text-zinc-600 mt-0.5">{eq.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment tags */}
              <div>
                <Label>Equipamentos Específicos (Opcional)</Label>
                <input type="text" value={equipInput}
                  onChange={e => setEquipInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEquipTag(equipInput); } }}
                  placeholder="Ex: Sony FX3 — pressione Enter para adicionar"
                  className={inputCls} />
                {data.equipmentTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.equipmentTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded-lg text-xs font-bold text-violet-300">
                        {tag}
                        <button onClick={() => removeEquipTag(tag)} className="text-violet-500 hover:text-violet-200 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </StepShell>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <StepShell step={4} total={TOTAL_STEPS} title="Pós-Produção"
            tip="Locução e Motion Graphics agregam muito valor percebido. Se incluídos, justificam um ticket maior.">
            <div className="space-y-4">
              <ToggleBtn active={data.narration} onClick={() => set('narration', !data.narration)}
                icon={<Mic className="w-5 h-5" />} label="Locução / Narração"
                desc="Voz em off profissional ou narração gravada" />
              <ToggleBtn active={data.motionGraphics} onClick={() => set('motionGraphics', !data.motionGraphics)}
                icon={<Sparkles className="w-5 h-5" />} label="Motion Graphics / Animação"
                desc="Elementos animados, vinhetas, lower thirds" />
              <ToggleBtn active={data.colorGrading} onClick={() => set('colorGrading', !data.colorGrading)}
                icon={<Layers className="w-5 h-5" />} label="Color Grading / Correção de Cor"
                desc="Tratamento cromático profissional da imagem" />
              <div className="space-y-2">
                <ToggleBtn active={data.outros} onClick={() => set('outros', !data.outros)}
                  icon={<Film className="w-5 h-5" />} label="Outros"
                  desc="Serviço extra não listado acima" />
                {data.outros && (
                  <input type="text" value={data.outrosDesc}
                    onChange={e => set('outrosDesc', e.target.value)}
                    placeholder="Descreva o serviço extra de pós-produção..."
                    className={inputCls} autoFocus />
                )}
              </div>
              <div>
                <Label>Limite de Rodadas de Alteração</Label>
                <div className="flex items-center gap-3">
                  <button onClick={() => set('revisionLimit', String(Math.max(1, parseInt(data.revisionLimit) - 1)))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold hover:bg-zinc-700 transition-colors flex-shrink-0 flex items-center justify-center text-lg">−</button>
                  <span className="text-2xl font-black text-white w-12 text-center tabular-nums">{data.revisionLimit}</span>
                  <button onClick={() => set('revisionLimit', String(parseInt(data.revisionLimit) + 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-bold hover:bg-zinc-700 transition-colors flex-shrink-0 flex items-center justify-center text-lg">+</button>
                  <span className="text-sm text-zinc-500">rodada(s) de revisão</span>
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <StepShell step={5} total={TOTAL_STEPS} title="Custos Extras de Produção"
            tip="Discriminar custos externos (locação, figurino, alimentação) aumenta a transparência e protege sua margem.">
            <div className="space-y-5">

              {/* ── Add form ── */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <Label>Adicionar Custo</Label>
                <input
                  type="text"
                  value={custoDesc}
                  onChange={e => setCustoDesc(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitCost(); } }}
                  placeholder="Descrição (ex: Locação de Estúdio, Figurino)"
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={custoValor}
                    onChange={e => setCustoValor(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitCost(); } }}
                    placeholder="Valor R$ (ex: 3500)"
                    className={inputCls}
                  />
                  <button
                    onClick={commitCost}
                    disabled={!custoDesc.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* ── List ── */}
              {data.extraCosts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                    Itens adicionados ({data.extraCosts.length})
                  </p>
                  {data.extraCosts.map(cost => (
                    <div key={cost.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <span className="text-sm text-zinc-200 flex-1 truncate">{cost.item}</span>
                      <span className="text-sm font-bold text-white tabular-nums flex-shrink-0">
                        {cost.value ? fmt(cost.value) : '—'}
                      </span>
                      <button onClick={() => removeCost(cost.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Subtotal Extras</span>
                    <span className="text-base font-black text-white tabular-nums">
                      {extrasSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              )}

              {data.extraCosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Package className="w-8 h-8 text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600">
                    Nenhum custo adicionado. Preencha o formulário acima e clique em "Adicionar".
                  </p>
                </div>
              )}
            </div>
          </StepShell>
        )}

        {/* ── STEP 6 ── */}
        {step === 6 && (
          <StepShell step={6} total={TOTAL_STEPS} title="Valores Finais & Prazos"
            tip="Separar custos de produção do seu cachê demonstra profissionalismo e facilita a negociação.">
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Resumo do Investimento</span>
                </div>
                {data.extraCosts.filter(c => c.item.trim()).length > 0 && (
                  <div className="px-5 py-3 border-b border-zinc-800/50 flex justify-between">
                    <span className="text-sm text-zinc-500">Custos extras</span>
                    <span className="text-sm font-bold text-zinc-400 tabular-nums">
                      {extrasSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
                <div className="px-5 py-3 border-b border-zinc-800/50 flex justify-between">
                  <span className="text-sm text-zinc-500">Serviço da produtora</span>
                  <span className="text-sm font-bold text-zinc-300 tabular-nums">
                    {serviceFeeN > 0 ? fmt(data.serviceFee) : '—'}
                  </span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center bg-indigo-500/5">
                  <span className="text-sm font-black text-white">Total</span>
                  <span className="text-xl font-black text-indigo-300 tabular-nums">
                    {grandTotal > 0 ? grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Valor do Cachê / Serviço (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input type="text" value={data.serviceFee}
                    onChange={e => set('serviceFee', e.target.value)}
                    placeholder="Ex: 5000" className={inputCls + ' pl-9'} />
                </div>
              </div>
              <div>
                <Label>Condições de Pagamento</Label>
                <input type="text" value={data.paymentTerms}
                  onChange={e => set('paymentTerms', e.target.value)}
                  placeholder="Ex: 50% na aprovação + 50% na entrega"
                  className={inputCls} />
              </div>
              <div>
                <Label>Prazo de Entrega</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input type="text" value={data.deadline}
                    onChange={e => set('deadline', e.target.value)}
                    placeholder="Ex: 15 dias úteis após aprovação"
                    className={inputCls + ' pl-9'} />
                </div>
              </div>
            </div>
          </StepShell>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
        <button onClick={prev} disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${
              i + 1 === step ? 'w-5 h-2 bg-indigo-500'
              : i + 1 < step ? 'w-2 h-2 bg-indigo-700'
              : 'w-2 h-2 bg-zinc-700'
            }`} />
          ))}
        </div>

        <button onClick={next} disabled={!canNext()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {step === TOTAL_STEPS ? (
            <><Sparkles className="w-4 h-4" />Gerar Proposta</>
          ) : (
            <>Próximo<ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
