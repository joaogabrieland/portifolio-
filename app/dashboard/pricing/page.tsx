'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Calculator,
  Plus,
  Minus,
  Check,
  RotateCcw,
  MapPin,
  Users,
  UtensilsCrossed,
  Car,
  Music,
  TrendingUp,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import HourlyRateCalculator from '@/components/HourlyRateCalculator';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectType = 'institucional' | 'evento' | 'reels' | 'documentario' | 'publicidade' | '';

interface ExtrasItem {
  enabled: boolean;
  value: number;
}

interface QuizState {
  projectName: string;
  projectType: ProjectType;
  captureDays: number;
  editingDays: number;
  extras: {
    locacao: ExtrasItem;
    atores: ExtrasItem;
    alimentacao: ExtrasItem;
    transporte: ExtrasItem;
    trilha: ExtrasItem;
  };
  hourlyRate: number;
  margin: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_TYPES: { id: ProjectType; label: string; desc: string }[] = [
  { id: 'institucional', label: 'Vídeo Institucional', desc: 'Apresentação de empresa ou marca' },
  { id: 'evento',        label: 'Evento',              desc: 'Cobertura ao vivo ou retrospectiva' },
  { id: 'reels',         label: 'Reels / TikTok',      desc: 'Conteúdo rápido para redes sociais' },
  { id: 'documentario',  label: 'Documentário',         desc: 'Produção de longa duração' },
  { id: 'publicidade',   label: 'Publicidade',          desc: 'Comerciais e campanhas publicitárias para marcas.' },
];

const MARGIN_OPTIONS = [
  { value: 10,  label: '10%',  desc: 'Conservador' },
  { value: 20,  label: '20%',  desc: 'Equilibrado' },
  { value: 50,  label: '50%',  desc: 'Competitivo' },
  { value: 100, label: '100%', desc: 'Premium' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingAssistantPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const [state, setState] = useState<QuizState>({
    projectName: '',
    projectType: '',
    captureDays: 1,
    editingDays: 1,
    extras: {
      locacao:     { enabled: false, value: 500 },
      atores:      { enabled: false, value: 1000 },
      alimentacao: { enabled: false, value: 200 },
      transporte:  { enabled: false, value: 150 },
      trilha:      { enabled: false, value: 300 },
    },
    hourlyRate: 100,
    margin: 20,
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const update = (partial: Partial<QuizState>) =>
    setState(prev => ({ ...prev, ...partial }));

  const updateExtra = (key: keyof QuizState['extras'], partial: Partial<ExtrasItem>) =>
    setState(prev => ({
      ...prev,
      extras: { ...prev.extras, [key]: { ...prev.extras[key], ...partial } },
    }));

  const counter = (
    value: number,
    min: number,
    onChange: (v: number) => void,
  ) => (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-10 text-center text-xl font-bold text-white">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );

  // ── Calculation ──────────────────────────────────────────────────────────

  const laborCost =
    state.captureDays * 10 * state.hourlyRate +
    state.editingDays * 8 * state.hourlyRate;

  const extrasCost = Object.values(state.extras)
    .filter(e => e.enabled)
    .reduce((sum, e) => sum + e.value, 0);

  const totalCost  = laborCost + extrasCost;
  const profit     = totalCost * (state.margin / 100);
  const finalPrice = totalCost + profit;

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ── Step validation ──────────────────────────────────────────────────────

  const canAdvance = () => {
    if (step === 1) return state.projectType !== '';
    return true;
  };

  // ── Render steps ─────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
          Nome do Projeto
        </label>
        <input
          type="text"
          value={state.projectName}
          onChange={e => update({ projectName: e.target.value })}
          placeholder="Ex: Institucional Empresa Alves 2025"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">
          Tipo de Projeto
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_TYPES.map(pt => (
            <button
              key={pt.id}
              onClick={() => update({ projectType: pt.id })}
              className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                state.projectType === pt.id
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              }`}
            >
              <span className="font-bold text-sm text-white mb-1">{pt.label}</span>
              <span className="text-xs text-gray-500">{pt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-5 rounded-2xl border border-white/8 bg-white/[0.03]">
        <div>
          <p className="font-bold text-white mb-1">Diárias de Captação</p>
          <p className="text-xs text-gray-500">Dias no set (10h/dia)</p>
        </div>
        {counter(state.captureDays, 1, v => update({ captureDays: v }))}
      </div>
      <div className="flex items-center justify-between p-5 rounded-2xl border border-white/8 bg-white/[0.03]">
        <div>
          <p className="font-bold text-white mb-1">Dias de Edição</p>
          <p className="text-xs text-gray-500">Pós-produção (8h/dia)</p>
        </div>
        {counter(state.editingDays, 1, v => update({ editingDays: v }))}
      </div>
      <div className="rounded-2xl border border-violet-900/40 bg-violet-900/10 p-4">
        <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-1">Total de horas</p>
        <p className="text-2xl font-bold text-white">
          {state.captureDays * 10 + state.editingDays * 8}h
        </p>
      </div>
    </div>
  );

  const EXTRAS_CONFIG: {
    key: keyof QuizState['extras'];
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: 'locacao',     label: 'Locação',           icon: <MapPin className="w-4 h-4" /> },
    { key: 'atores',      label: 'Atores / Modelos',  icon: <Users className="w-4 h-4" /> },
    { key: 'alimentacao', label: 'Alimentação',        icon: <UtensilsCrossed className="w-4 h-4" /> },
    { key: 'transporte',  label: 'Transporte',         icon: <Car className="w-4 h-4" /> },
    { key: 'trilha',      label: 'Trilha Sonora Paga', icon: <Music className="w-4 h-4" /> },
  ];

  const renderStep3 = () => (
    <div className="space-y-3">
      {EXTRAS_CONFIG.map(({ key, label, icon }) => {
        const item = state.extras[key];
        return (
          <div
            key={key}
            className={`rounded-2xl border p-4 transition-all ${
              item.enabled
                ? 'border-violet-500/40 bg-violet-500/8'
                : 'border-white/8 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateExtra(key, { enabled: !item.enabled })}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all border-2 ${
                  item.enabled
                    ? 'bg-violet-500 border-violet-500'
                    : 'border-white/20 bg-transparent'
                }`}
              >
                {item.enabled && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={`flex items-center gap-2 text-sm font-medium flex-1 ${item.enabled ? 'text-white' : 'text-gray-400'}`}>
                {icon} {label}
              </span>
              {item.enabled && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">R$</span>
                  <input
                    type="number"
                    value={item.value}
                    onChange={e => updateExtra(key, { value: Number(e.target.value) })}
                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Custo da sua hora de trabalho
          </label>
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            Não sabe? Calcule aqui
          </button>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
          <input
            type="number"
            value={state.hourlyRate}
            onChange={e => update({ hourlyRate: Math.max(1, Number(e.target.value)) })}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/hora</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">
          Margem de lucro desejada
        </label>
        <div className="grid grid-cols-4 gap-3">
          {MARGIN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => update({ margin: opt.value })}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                state.margin === opt.value
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <span className={`text-xl font-black mb-1 ${state.margin === opt.value ? 'text-violet-300' : 'text-white'}`}>
                {opt.label}
              </span>
              <span className="text-[10px] text-gray-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Mão de obra estimada</span>
          <span className="text-white font-medium">{fmt(laborCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Custos extras</span>
          <span className="text-white font-medium">{fmt(extrasCost)}</span>
        </div>
        <div className="h-px bg-white/5 my-1" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Custo total</span>
          <span className="text-white font-bold">{fmt(totalCost)}</span>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{state.projectName}</h2>
        <p className="text-gray-500 text-sm">
          {PROJECT_TYPES.find(p => p.id === state.projectType)?.label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Custo Total</p>
          <p className="text-2xl font-black text-white">{fmt(totalCost)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-900/10 p-5">
          <p className="text-xs text-emerald-400 uppercase tracking-widest mb-2">Margem ({state.margin}%)</p>
          <p className="text-2xl font-black text-emerald-400">+ {fmt(profit)}</p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-violet-500/40 bg-violet-500/8 p-6 text-center">
        <p className="text-xs text-violet-400 uppercase tracking-widest mb-2 font-bold">
          Valor Final Sugerido para o Cliente
        </p>
        <p className="text-4xl font-black text-white">{fmt(finalPrice)}</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Captação ({state.captureDays} dia{state.captureDays !== 1 ? 's' : ''})</span>
          <span className="text-white">{fmt(state.captureDays * 10 * state.hourlyRate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Edição ({state.editingDays} dia{state.editingDays !== 1 ? 's' : ''})</span>
          <span className="text-white">{fmt(state.editingDays * 8 * state.hourlyRate)}</span>
        </div>
        {Object.entries(state.extras)
          .filter(([, v]) => v.enabled)
          .map(([k, v]) => {
            const cfg = EXTRAS_CONFIG.find(e => e.key === k as keyof QuizState['extras']);
            return (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{cfg?.label}</span>
                <span className="text-white">{fmt(v.value)}</span>
              </div>
            );
          })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => { setStep(1); setState(s => ({ ...s, projectName: '', projectType: '' })); }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Novo Cálculo
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );

  // ── Step config ──────────────────────────────────────────────────────────

  const STEPS = [
    { title: 'Projeto',       subtitle: 'Identifique o escopo',       render: renderStep1 },
    { title: 'Horas',         subtitle: 'Quantos dias de trabalho?',   render: renderStep2 },
    { title: 'Custos Extras', subtitle: 'Adicione despesas do projeto', render: renderStep3 },
    { title: 'Margem',        subtitle: 'Configure sua precificação',  render: renderStep4 },
  ];

  const isResult = step === 5;
  const currentStep = STEPS[step - 1];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <AuthGuard>
      {isCalculatorOpen && (
        <HourlyRateCalculator
          onApply={rate => update({ hourlyRate: rate })}
          onClose={() => setIsCalculatorOpen(false)}
        />
      )}
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Glow */}
        <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 blur-[100px] rounded-full" />

        {/* Header */}
        <header className="relative z-10 flex items-center px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="flex items-center gap-2 mx-auto">
            <Calculator className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-white">Assistente de Precificação</span>
          </div>
          <div className="w-24" />
        </header>

        {/* Body */}
        <div className="relative z-10 flex justify-center px-4 py-12">
          <div className="w-full max-w-2xl">

            {!isResult && (
              <>
                {/* Progress bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Passo {step} de 4</span>
                    <span>{Math.round((step / 4) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-purple-400 rounded-full transition-all duration-500"
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3">
                    {STEPS.map((s, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                          i + 1 < step
                            ? 'bg-violet-500 border-violet-500 text-white'
                            : i + 1 === step
                            ? 'border-violet-500 text-violet-400 bg-violet-500/10'
                            : 'border-white/10 text-gray-600'
                        }`}>
                          {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className={`text-[10px] hidden sm:block ${i + 1 === step ? 'text-violet-400' : 'text-gray-600'}`}>
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-8">
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-1">{currentStep.title}</h1>
                    <p className="text-gray-400 text-sm">{currentStep.subtitle}</p>
                  </div>

                  {currentStep.render()}

                  {/* Navigation */}
                  <div className="flex gap-3 mt-10">
                    {step > 1 && (
                      <button
                        onClick={() => setStep(s => s - 1)}
                        className="flex-1 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all"
                      >
                        Voltar
                      </button>
                    )}
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canAdvance()}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                        canAdvance()
                          ? 'bg-violet-600 hover:bg-violet-700 text-white'
                          : 'bg-white/10 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {step === 4 ? 'Calcular Orçamento' : 'Próximo Passo'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {isResult && (
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-8">
                {renderResult()}
              </div>
            )}

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
