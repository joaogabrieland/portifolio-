'use client';

import React, { useState, useEffect } from 'react';
import { useClientData } from '@/lib/hooks/useClientData';
import { fetchClientData, saveClientData } from '@/lib/clients-api';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Flame,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Video,
  Users,
  DollarSign,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Calendar,
  Star,
  ThumbsUp,
  MessageSquare,
  X,
  Play,
  Check,
  Send,
  Copy,
  Menu,
  AlignLeft,
  Phone,
  ExternalLink,
  Loader2,
  Upload,
  Clock,
  Download,
  Folder,
} from 'lucide-react';
import { Client, Invoice } from '@/types';

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────
type PortalTab   = 'dashboard' | 'roteiros' | 'videos' | 'reunioes' | 'financeiro' | 'documentos' | 'mensagens';
type ReviewStatus = 'aguardando' | 'aprovado' | 'alteracao';

const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; badge: string }> = {
  aguardando: { label: 'Aguardando Aprovação', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  aprovado:   { label: 'Aprovado',             badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  alteracao:  { label: 'Alteração Solicitada', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
};

// ─────────────────────────────────────────────
// Portal script type (used by ScriptReviewModal)
// ─────────────────────────────────────────────
interface PortalScript {
  id: string;
  title: string;
  theme: string;
  sentAt: string;
  status: ReviewStatus;
  feedback?: string;
  rating?: number; // 1–5 stars from portal client
  body: { scene: number; visual: string; audio: string; type?: 'scene' | 'free_text'; freeContent?: string }[];
  caption: string;
  hashtags: string;
}

// ─────────────────────────────────────────────
// Portal script source types (from agency localStorage)
// ─────────────────────────────────────────────
type PortalScriptInternalStatus = 'aguardando_cliente' | 'aprovado_cliente' | 'refacao';

interface PortalScriptScene { id: string; visual: string; audio: string; type?: 'scene' | 'free_text'; freeContent?: string; }

interface PortalScriptDoc {
  id: string;
  title: string;
  gancho: string;
  scenes: PortalScriptScene[];
  portalStatus: PortalScriptInternalStatus;
  clientFeedback?: string;
  sentToPortalAt?: number;
  rating?: number; // 1–5 stars from portal client
  _pkgTitle?: string;
}

interface _PortalPkg {
  id: string;
  title: string;
  scripts: (Omit<PortalScriptDoc, '_pkgTitle'> & { portalStatus?: PortalScriptInternalStatus; [key: string]: unknown })[];
}

// ─────────────────────────────────────────────
// Portal deliverable type (mirrors Deliverable from agency)
// ─────────────────────────────────────────────
interface PortalDeliverable {
  id: string;
  title: string;
  status: 'aguardando' | 'aprovado' | 'alteracao';
  shareLink: string;
  expiresInDays: number;
  sentAt: number;   // unix timestamp
  rating?: number;
  feedback?: string;
}

// ─────────────────────────────────────────────
// Production stepper
// ─────────────────────────────────────────────
const PRODUCTION_STAGES = ['Briefing', 'Roteirização', 'Aprovação', 'Gravação', 'Edição', 'Pronto'] as const;
const CURRENT_STAGE_IDX = 4;

const ProductionStepper: React.FC = () => (
  <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-800">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status Atual</p>
      <h2 className="text-base font-black text-white mt-0.5">Produção do Pacote</h2>
    </div>
    <div className="px-6 py-6">
      <div className="flex items-start">
        {PRODUCTION_STAGES.map((stage, idx) => {
          const isCompleted = idx < CURRENT_STAGE_IDX;
          const isCurrent   = idx === CURRENT_STAGE_IDX;
          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center flex-shrink-0 w-10 sm:w-14">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
                  isCompleted ? 'bg-violet-600 border-violet-500 text-white'
                  : isCurrent ? 'bg-gray-950 border-violet-500 text-violet-400 shadow-lg shadow-violet-500/30 animate-pulse'
                  : 'bg-gray-950 border-gray-700 text-gray-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className={`mt-2 text-[8px] sm:text-[9px] font-black text-center leading-tight ${
                  isCurrent ? 'text-violet-400' : isCompleted ? 'text-gray-400' : 'text-gray-600'
                }`}>{stage}</span>
              </div>
              {idx < PRODUCTION_STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mt-3.5 sm:mt-4 transition-colors ${idx < CURRENT_STAGE_IDX ? 'bg-violet-600' : 'bg-gray-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
        <div>
          <p className="text-sm font-black text-violet-300">Etapa atual: {PRODUCTION_STAGES[CURRENT_STAGE_IDX]}</p>
          <p className="text-xs text-gray-500 mt-0.5">Seus vídeos estão sendo editados pela equipe. Previsão: 3 dias úteis.</p>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Follower history helpers (portal-local)
// ─────────────────────────────────────────────
const PORTAL_MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const PORTAL_MONTH_OPTIONS = [2025, 2026].flatMap(y => PORTAL_MONTHS_PT.map(m => `${m}/${y}`));

// ─────────────────────────────────────────────
// Achievements (dynamic)
// ─────────────────────────────────────────────
const AchievementsGrid: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [data, setData] = useState({ videosProduced: 0, instagramGrowth: '+0%', latestFollowers: '—' });

  useEffect(() => {
    const load = async () => {
      let videosProduced = 0;
      let instagramGrowth = '+0%';
      let latestFollowers = '—';

      try {
        const deliverables = await fetchClientData<PortalDeliverable[]>(clientId, 'entregas');
        if (Array.isArray(deliverables)) {
          videosProduced = deliverables.filter(d => d.status === 'aprovado').length;
        }
      } catch { /* ignore */ }

      try {
        const m = await fetchClientData<{ followerHistory?: { month: string; count: number }[]; initialFollowers?: number; currentFollowers?: number }>(clientId, 'metrics');
        if (m && typeof m === 'object') {
          if (m.followerHistory && m.followerHistory.length > 0) {
            const sorted = [...m.followerHistory].sort(
              (a, b) => PORTAL_MONTH_OPTIONS.indexOf(a.month) - PORTAL_MONTH_OPTIONS.indexOf(b.month),
            );
            const first = sorted[0].count;
            const last  = sorted[sorted.length - 1].count;
            latestFollowers = last.toLocaleString('pt-BR');
            if (sorted.length >= 2 && first > 0) {
              const pct = ((last - first) / first) * 100;
              instagramGrowth = `+${pct.toFixed(0)}%`;
            }
          } else if (m.initialFollowers && m.currentFollowers && m.initialFollowers > 0) {
            const pct = ((m.currentFollowers - m.initialFollowers) / m.initialFollowers) * 100;
            instagramGrowth = `+${pct.toFixed(0)}%`;
            latestFollowers = m.currentFollowers.toLocaleString('pt-BR');
          }
        }
      } catch { /* ignore */ }

      setData({ videosProduced, instagramGrowth, latestFollowers });
    };

    load();
  }, [clientId]);

  const achievements = [
    { icon: <Flame className="w-5 h-5" />,      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',       hover: 'hover:border-amber-700/50',   value: String(data.videosProduced), label: 'Vídeos Produzidos' },
    { icon: <TrendingUp className="w-5 h-5" />, iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', hover: 'hover:border-emerald-700/50', value: data.instagramGrowth,         label: 'Crescimento no Instagram' },
    { icon: <Trophy className="w-5 h-5" />,     iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400',    hover: 'hover:border-violet-700/50',  value: data.latestFollowers,         label: 'Seguidores Atualmente' },
  ];

  return (
    <section>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Marcos da Nossa Parceria</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {achievements.map(a => (
          <div key={a.label} className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 transition-colors ${a.hover}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${a.iconBg}`}>{a.icon}</div>
            <div>
              <p className="text-2xl font-black text-white">{a.value}</p>
              <p className="text-xs font-bold text-gray-400 mt-0.5">{a.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Follower history bar chart (portal)
// ─────────────────────────────────────────────
const FollowerHistoryPortal: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [history, setHistory] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchClientData<{ followerHistory?: { month: string; count: number }[] }>(clientId, 'metrics')
      .then(m => { if (!cancelled && m?.followerHistory) setHistory(m.followerHistory); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [clientId]);

  if (history.length === 0) return null;

  const sorted = [...history].sort(
    (a, b) => PORTAL_MONTH_OPTIONS.indexOf(a.month) - PORTAL_MONTH_OPTIONS.indexOf(b.month),
  );
  const maxCount = Math.max(...sorted.map(r => r.count));
  const first    = sorted[0].count;
  const last     = sorted[sorted.length - 1].count;
  const growthPct = sorted.length >= 2 && first > 0
    ? (((last - first) / first) * 100).toFixed(1)
    : null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Evolução de Seguidores</p>
        {growthPct !== null && (
          <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            +{growthPct}% crescimento
          </span>
        )}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        {sorted.map((record, i) => {
          const barPct = maxCount > 0 ? (record.count / maxCount) * 100 : 0;
          const isLast = i === sorted.length - 1;
          return (
            <div key={record.month} className="flex items-center gap-3">
              <span className="w-20 flex-shrink-0 text-xs font-black text-gray-500 tabular-nums text-right">{record.month}</span>
              <div className="flex-1 h-6 bg-gray-800 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ${isLast ? 'bg-emerald-500' : 'bg-violet-500/60'}`}
                  style={{ width: `${barPct}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2.5 text-[10px] font-black text-gray-200">
                  {record.count.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Pending actions
// ─────────────────────────────────────────────
const PendingActions: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [actions, setActions] = useState<{ bg: string; icon: string; text: string; title: string; sub: string }[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const result: typeof actions = [];

      // Scripts awaiting client approval
      try {
        const pkgs = await fetchClientData<{ scripts: { portalStatus?: string }[]; subFolders?: unknown[] }[]>(clientId, 'roteiros');
        if (Array.isArray(pkgs)) {
          const countScripts = (list: typeof pkgs): number =>
            list.reduce((acc, p) => {
              const waiting = p.scripts.filter(sc => sc.portalStatus === 'aguardando_cliente').length;
              const sub = (p.subFolders as typeof pkgs | undefined) ?? [];
              return acc + waiting + countScripts(sub);
            }, 0);
          const count = countScripts(pkgs);
          if (count > 0) {
            result.push({
              bg:    'bg-amber-500/10 border-amber-500/20',
              icon:  'text-amber-400',
              text:  'text-amber-300',
              title: `${count} Roteiro${count > 1 ? 's' : ''} aguardando sua aprovação`,
              sub:   'Clique na aba Roteiros para revisar',
            });
          }
        }
      } catch { /* ignore */ }

      // Deliverables awaiting client approval
      try {
        const items = await fetchClientData<{ status: string }[]>(clientId, 'entregas');
        if (Array.isArray(items)) {
          const count = items.filter(d => d.status === 'aguardando').length;
          if (count > 0) {
            result.push({
              bg:    'bg-violet-500/10 border-violet-500/20',
              icon:  'text-violet-400',
              text:  'text-violet-300',
              title: `${count} Vídeo${count > 1 ? 's' : ''} aguardando sua aprovação`,
              sub:   'Clique na aba Vídeos para revisar',
            });
          }
        }
      } catch { /* ignore */ }

      // Invoices pending or overdue
      try {
        const invoices = await fetchClientData<{ status: string; title: string; dueDate: string }[]>(clientId, 'invoices');
        if (Array.isArray(invoices)) {
          const pending = invoices.filter(inv => inv.status === 'pendente' || inv.status === 'atrasado');
          pending.forEach(inv => {
            const isOverdue = inv.status === 'atrasado';
            result.push({
              bg:    isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20',
              icon:  isOverdue ? 'text-red-400'                    : 'text-orange-400',
              text:  isOverdue ? 'text-red-300'                    : 'text-orange-300',
              title: `${isOverdue ? 'Fatura em atraso' : 'Fatura pendente'}: ${inv.title}`,
              sub:   inv.dueDate ? `Vencimento: ${inv.dueDate}` : 'Clique na aba Financeiro',
            });
          });
        }
      } catch { /* ignore */ }

      if (!cancelled) setActions(result);
    };

    load();
    return () => { cancelled = true; };
  }, [clientId]);

  return (
    <section>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Ações Pendentes</p>
      {actions.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-bold text-emerald-300">Você está em dia! Nada pendente por aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map(action => (
            <div key={action.title} className={`flex items-center gap-4 p-4 rounded-2xl border ${action.bg}`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${action.icon}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${action.text}`}>{action.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// Star Rating
// ─────────────────────────────────────────────
interface StarRatingProps { value: number; onChange: (v: number) => void; readonly?: boolean; }

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readonly }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          disabled={readonly}
          onClick={() => !readonly && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="transition-transform hover:scale-110 disabled:cursor-default"
        >
          <Star
            className="w-5 h-5"
            style={{
              fill:   n <= (hovered || value) ? '#f59e0b' : 'transparent',
              stroke: n <= (hovered || value) ? '#f59e0b' : '#4b5563',
            }}
          />
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Script Review Modal
// ─────────────────────────────────────────────
interface ScriptReviewModalProps {
  script: PortalScript;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestChange: (id: string, text: string) => void;
  onRate?: (id: string, rating: number) => void;
}

const ScriptReviewModal: React.FC<ScriptReviewModalProps> = ({ script, onClose, onApprove, onRequestChange, onRate }) => {
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [sent, setSent]                 = useState(false);
  const [justApproved, setJustApproved] = useState(false);

  const cfg = REVIEW_STATUS_CONFIG[script.status];

  const handleApprove = () => { onApprove(script.id); setJustApproved(true); };
  const handleRateAndClose = (rating: number) => {
    onRate?.(script.id, rating);
    if (justApproved) setTimeout(onClose, 700);
  };
  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    onRequestChange(script.id, feedbackText.trim());
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 animate-in slide-in-from-bottom-4 duration-300">

      {/* ── Modal header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-tight line-clamp-1">{script.title}</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">{script.theme} · Enviado em {script.sentAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border hidden sm:inline-flex ${cfg.badge}`}>
            {cfg.label}
          </span>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 max-w-3xl mx-auto w-full">

        {/* Approved feedback block + star rating */}
        {script.status === 'aprovado' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm font-bold text-emerald-300">
                {justApproved ? 'Roteiro aprovado! Como você avalia a escrita?' : 'Roteiro aprovado. Obrigado pelo feedback!'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {justApproved ? 'Avalie antes de fechar' : 'Avalie este roteiro'}
              </p>
              <div className="flex items-center gap-3">
                <StarRating
                  value={script.rating ?? 0}
                  onChange={handleRateAndClose}
                  readonly={!justApproved && !!script.rating && script.rating > 0}
                />
                {!!script.rating && script.rating > 0 && (
                  <span className="text-xs font-black text-amber-400">{script.rating}/5</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Script body */}
        <div className="space-y-6">
          {script.body.map(scene =>
            scene.type === 'free_text' ? (
              <div key={scene.scene} className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                  <AlignLeft className="w-3 h-3" /> Bloco de Texto Livre
                </p>
                <p className="text-sm text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {scene.freeContent || '—'}
                </p>
              </div>
            ) : (
              <div key={scene.scene} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 text-[10px] font-black flex items-center justify-center border border-violet-500/30">
                    {scene.scene}
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cena {scene.scene}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">🎥 Visual</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{scene.visual}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">🎙️ Áudio / Texto</p>
                    <p className="text-sm text-gray-200 italic leading-relaxed">&ldquo;{scene.audio}&rdquo;</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Caption + Hashtags */}
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">📝 Legenda</p>
            <p className="text-sm text-gray-200 leading-relaxed">{script.caption}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2"># Hashtags</p>
            <p className="text-sm text-violet-300 font-bold">{script.hashtags}</p>
          </div>
        </div>

        {/* Bottom spacer for sticky footer */}
        <div className="h-32" />
      </div>

      {/* ── Sticky footer ── */}
      {script.status === 'aguardando' && (
        <div className="flex-shrink-0 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm px-4 sm:px-8 py-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {!feedbackMode ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setFeedbackMode(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-orange-500/40 text-orange-300 text-sm font-black hover:bg-orange-500/10 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Solicitar Alteração
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-100"
                >
                  <ThumbsUp className="w-4 h-4" /> Aprovar Roteiro
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-200">
                <textarea
                  autoFocus
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Descreva o que deve ser alterado…"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none transition-all"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setFeedbackMode(false); setFeedbackText(''); }}
                    className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-xs font-black hover:bg-gray-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendFeedback}
                    disabled={!feedbackText.trim() || sent}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sent ? <><Check className="w-4 h-4" /> Enviado!</> : <><Send className="w-4 h-4" /> Enviar Feedback</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alteracao footer */}
      {script.status === 'alteracao' && script.feedback && (
        <div className="flex-shrink-0 border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm px-4 sm:px-8 py-4">
          <div className="max-w-3xl mx-auto flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <MessageSquare className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Seu feedback</p>
              <p className="text-sm text-gray-300">{script.feedback}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Roteiros tab
// ─────────────────────────────────────────────
const PortalRoteirosTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [scripts, setScripts]       = useState<PortalScriptDoc[]>([]);
  const [openScript, setOpenScript] = useState<PortalScriptDoc | null>(null);

  useEffect(() => {
    fetchClientData<_PortalPkg[]>(clientId, 'roteiros')
      .then(pkgs => {
        if (Array.isArray(pkgs)) {
          const loaded = pkgs.flatMap(pkg =>
            pkg.scripts
              .filter(sc => !!sc.portalStatus)
              .map(sc => ({ ...(sc as unknown as PortalScriptDoc), _pkgTitle: pkg.title })),
          );
          setScripts(loaded);
        }
      })
      .catch(() => {});
  }, [clientId]);

  const writeBack = async (id: string, updates: Partial<PortalScriptDoc>) => {
    setScripts(prev => prev.map(sc => sc.id === id ? { ...sc, ...updates } : sc));
    try {
      const pkgs = await fetchClientData<_PortalPkg[]>(clientId, 'roteiros');
      if (Array.isArray(pkgs)) {
        const updated = pkgs.map(pkg => ({
          ...pkg,
          scripts: pkg.scripts.map(sc => sc.id === id ? { ...sc, ...updates } : sc),
        }));
        await saveClientData(clientId, 'roteiros', updated);
      }
    } catch { /* ignore */ }
  };

  const handleApprove = (id: string) => writeBack(id, { portalStatus: 'aprovado_cliente' });

  const handleRequestChange = (id: string, text: string) =>
    writeBack(id, { portalStatus: 'refacao', clientFeedback: text });

  const handleRate = (id: string, rating: number) => writeBack(id, { rating });

  const toPortalScript = (doc: PortalScriptDoc): PortalScript => {
    const statusMap: Record<PortalScriptInternalStatus, ReviewStatus> = {
      aguardando_cliente: 'aguardando',
      aprovado_cliente:   'aprovado',
      refacao:            'alteracao',
    };
    const sentLabel = doc.sentToPortalAt
      ? new Date(doc.sentToPortalAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
      : '—';
    return {
      id:       doc.id,
      title:    doc.title,
      theme:    doc._pkgTitle ?? 'Roteiro',
      sentAt:   sentLabel,
      status:   statusMap[doc.portalStatus],
      feedback: doc.clientFeedback,
      rating:   doc.rating,
      body:     doc.scenes.map((sc, i) => ({ scene: i + 1, visual: sc.visual, audio: sc.audio, type: sc.type, freeContent: sc.freeContent })),
      caption:  doc.gancho || '',
      hashtags: '',
    };
  };

  const pendingCount = scripts.filter(s => s.portalStatus === 'aguardando_cliente').length;

  if (scripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-200">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-base font-black text-gray-400 mb-1">Nenhum roteiro enviado</h2>
        <p className="text-sm text-gray-600">Os roteiros enviados pela equipe para revisão aparecerão aqui.</p>
      </div>
    );
  }

  const statusMap: Record<PortalScriptInternalStatus, ReviewStatus> = {
    aguardando_cliente: 'aguardando',
    aprovado_cliente:   'aprovado',
    refacao:            'alteracao',
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white">Roteiros para Revisão</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {pendingCount > 0 ? `${pendingCount} aguardando sua aprovação` : 'Todos os roteiros foram revisados'}
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Script cards */}
      <div className="space-y-3">
        {scripts.map(doc => {
          const reviewStatus = statusMap[doc.portalStatus];
          const cfg = REVIEW_STATUS_CONFIG[reviewStatus];
          return (
            <button
              key={doc.id}
              onClick={() => setOpenScript(doc)}
              className="w-full text-left bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-violet-700/60 hover:bg-gray-900/80 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white leading-tight group-hover:text-violet-300 transition-colors line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc._pkgTitle ?? 'Roteiro'} · Enviado em{' '}
                    {doc.sentToPortalAt
                      ? new Date(doc.sentToPortalAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
                </div>
              </div>
              {doc.clientFeedback && (
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-400 bg-orange-500/5 border border-orange-500/15 rounded-xl px-3 py-2">
                  <MessageSquare className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-1">{doc.clientFeedback}</p>
                </div>
              )}
              {doc.portalStatus === 'aprovado_cliente' && !!doc.rating && doc.rating > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className="w-3.5 h-3.5" style={{ fill: n <= doc.rating! ? '#f59e0b' : 'transparent', stroke: n <= doc.rating! ? '#f59e0b' : '#4b5563' }} />
                  ))}
                  <span className="ml-1 text-[10px] font-bold text-amber-400">{doc.rating}/5</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {openScript && (
        <ScriptReviewModal
          script={toPortalScript(scripts.find(s => s.id === openScript.id) ?? openScript)}
          onClose={() => setOpenScript(null)}
          onApprove={handleApprove}
          onRequestChange={handleRequestChange}
          onRate={handleRate}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Videos / Materiais tab
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Video Upload Section (real API)
// ─────────────────────────────────────────────
interface UploadedVideo {
  id: number;
  filename: string;
  original_name: string;
  size: number;
  status: string;
  uploaded_at: string;
  expires_at: string;
}

const VideoUploadSection: React.FC = () => {
  const [inviteToken, setInviteToken] = useState('');
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const cfToken = localStorage.getItem('cf_token');
        const inviteRes = await fetch('/api/team/invite', {
          headers: { Authorization: `Bearer ${cfToken}` },
        });
        if (inviteRes.ok) {
          const data = await inviteRes.json();
          const urlToken = data.inviteUrl.split('/invite/')[1];
          setInviteToken(urlToken);
          const vidRes = await fetch(`/api/cliente/${urlToken}/videos`);
          if (vidRes.ok) {
            const vidData = await vidRes.json();
            setVideos(vidData.videos || []);
          }
        }
      } catch (err) {
        console.error('Video init error:', err);
      } finally {
        setLoadingVideos(false);
      }
    }
    init();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !inviteToken) return;
    setUploading(true);
    setUploadProgress(`Enviando ${file.name}...`);
    try {
      const cfToken = localStorage.getItem('cf_token');
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch(`/api/cliente/${inviteToken}/videos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfToken}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setVideos(prev => [data.video, ...prev]);
        setToast('Vídeo enviado para aprovação do cliente!');
        setTimeout(() => setToast(''), 3000);
      } else {
        const err = await res.json();
        setToast(err.error || 'Erro ao enviar vídeo');
        setTimeout(() => setToast(''), 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function daysRemaining(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  function formatSize(bytes: number) {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  const statusCfg: Record<string, { label: string; cls: string }> = {
    pendente:  { label: 'Pendente',  cls: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
    aprovado:  { label: 'Aprovado',  cls: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
    rejeitado: { label: 'Rejeitado', cls: 'text-red-300 bg-red-500/15 border-red-500/30' },
  };

  return (
    <div className="space-y-5 mb-8">
      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-bold text-emerald-300">{toast}</p>
        </div>
      )}

      {/* Upload */}
      <div className="rounded-2xl border border-gray-800/50 bg-gray-950/50 p-5 space-y-4">
        <h3 className="text-sm font-black text-gray-300">Enviar Vídeo para Aprovação</h3>
        <p className="text-xs text-gray-600">O vídeo ficará disponível por 7 dias no portal do cliente.</p>

        <label className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 font-bold text-sm hover:bg-gray-800/50 hover:border-gray-600 transition-all cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" />
          {uploading ? uploadProgress : 'Selecionar Vídeo'}
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading || !inviteToken}
          />
        </label>
      </div>

      {/* Video list */}
      {loadingVideos ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
        </div>
      ) : videos.length > 0 && (
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
            Vídeos Enviados · {videos.length}
          </h3>
          <div className="space-y-2">
            {videos.map(vid => {
              const sc = statusCfg[vid.status] || statusCfg.pendente;
              const days = daysRemaining(vid.expires_at);
              return (
                <div key={vid.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800/50">
                  <Video className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-300 truncate">{vid.original_name}</p>
                    <p className="text-[11px] text-gray-600">{formatSize(vid.size)} · {formatDate(vid.uploaded_at)}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${sc.cls}`}>
                    {sc.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                    <Clock className="w-3 h-3" /> {days}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const PortalVideosTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: deliverables, setData: setDeliverables } = useClientData<PortalDeliverable[]>(clientId, 'entregas', []);
  const [feedbackOpen, setFeedbackOpen]     = useState<string | null>(null);
  const [feedbackTexts, setFeedbackTexts]   = useState<Record<string, string>>({});
  const [feedbackSent, setFeedbackSent]     = useState<string | null>(null);
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);

  const updateDeliverable = (id: string, updates: Partial<PortalDeliverable>) => {
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleApprove = (id: string) => {
    updateDeliverable(id, { status: 'aprovado', rating: deliverables.find(d => d.id === id)?.rating ?? 0 });
    setJustApprovedId(id);
  };

  const handleRate = (id: string, rating: number) => {
    updateDeliverable(id, { rating });
    if (justApprovedId === id) setJustApprovedId(null);
  };

  const handleSendFeedback = (id: string) => {
    const text = feedbackTexts[id]?.trim();
    if (!text) return;
    updateDeliverable(id, { status: 'alteracao', feedback: text });
    setFeedbackSent(id);
    setTimeout(() => { setFeedbackSent(null); setFeedbackOpen(null); }, 1800);
  };

  const formatSentAt = (ts: number): string => {
    const d = new Date(ts);
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const pendingCount = deliverables.filter(d => d.status === 'aguardando').length;

  if (deliverables.length === 0) {
    return (
      <div className="animate-in fade-in duration-200">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-base font-black text-gray-400 mb-1">Nenhum material enviado</h2>
          <p className="text-sm text-gray-600">Os materiais enviados pela equipe aparecerão aqui para revisão.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white">Materiais para Revisão</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {pendingCount > 0 ? `${pendingCount} aguardando sua aprovação` : 'Todos os materiais foram revisados'}
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Deliverable cards */}
      <div className="space-y-4">
        {deliverables.map(item => {
          const cfg = REVIEW_STATUS_CONFIG[item.status];
          const isFeedbackOpen = feedbackOpen === item.id;

          return (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all">

              {/* ── Material preview area ── */}
              <div className="relative bg-gray-950 aspect-video flex items-center justify-center border-b border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-gray-950" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                    <Play className="w-6 h-6 text-white ml-1" style={{ fill: 'white' }} />
                  </div>
                  {item.shareLink && (
                    <a
                      href={item.shareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-violet-300 hover:text-violet-200 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-colors"
                    >
                      ▶ Assistir Vídeo
                    </a>
                  )}
                </div>
                <span className="absolute top-3 left-3 text-[10px] font-black px-2 py-0.5 rounded-md bg-violet-600/80 text-white backdrop-blur-sm">
                  Vídeo
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                  {item.expiresInDays}d de acesso
                </span>
              </div>

              {/* ── Card body ── */}
              <div className="p-5 space-y-4">
                {/* Title + status */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-black text-white leading-tight">{item.title}</h3>
                  <span className={`flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md border ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                <p className="text-xs text-gray-500">Enviado em {formatSentAt(item.sentAt)}</p>

                {/* Feedback block (alteracao) */}
                {item.status === 'alteracao' && item.feedback && (
                  <div className="flex items-start gap-2 text-xs text-gray-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-3">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p>{item.feedback}</p>
                  </div>
                )}

                {/* Approved: star rating */}
                {item.status === 'aprovado' && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <p className="text-xs font-bold text-emerald-300 flex-1">
                        {justApprovedId === item.id ? 'Vídeo aprovado! Como você avalia?' : 'Aprovado!'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 px-1">
                      <p className="text-xs text-gray-500 font-bold">Avaliação:</p>
                      <StarRating
                        value={item.rating ?? 0}
                        onChange={rating => handleRate(item.id, rating)}
                        readonly={justApprovedId !== item.id && !!item.rating && item.rating > 0}
                      />
                      {item.rating && item.rating > 0 && (
                        <span className="text-xs font-black text-amber-400">{item.rating}/5</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Pending: action buttons */}
                {item.status === 'aguardando' && !isFeedbackOpen && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFeedbackOpen(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-500/40 text-orange-300 text-xs font-black hover:bg-orange-500/10 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Solicitar Alteração
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Aprovar
                    </button>
                  </div>
                )}

                {/* Feedback textarea */}
                {isFeedbackOpen && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <textarea
                      autoFocus
                      value={feedbackTexts[item.id] ?? ''}
                      onChange={e => setFeedbackTexts(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Descreva o que deve ser alterado…"
                      rows={3}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none transition-all"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setFeedbackOpen(null); setFeedbackTexts(prev => ({ ...prev, [item.id]: '' })); }}
                        className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 text-xs font-black hover:bg-gray-800 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSendFeedback(item.id)}
                        disabled={!feedbackTexts[item.id]?.trim() || feedbackSent === item.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition-all disabled:opacity-50"
                      >
                        {feedbackSent === item.id
                          ? <><Check className="w-3.5 h-3.5" /> Enviado!</>
                          : <><Send className="w-3.5 h-3.5" /> Enviar Feedback</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Reuniões tab (read-only portal view)
// ─────────────────────────────────────────────
interface PortalMeetingNextStep {
  id: string;
  text: string;
  assignedTo: 'agencia' | 'cliente';
  done: boolean;
}

interface PortalMeeting {
  id: string;
  title: string;
  date: string;
  executiveSummary: string;
  decisions: string[];
  nextSteps: PortalMeetingNextStep[];
  createdAt: number;
}

const PortalReunioeTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: meetings } = useClientData<PortalMeeting[]>(clientId, 'meetings', []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-200">
        <div className="text-4xl mb-4">🤝</div>
        <h2 className="text-base font-black text-gray-400 mb-1">Nenhuma reunião registrada</h2>
        <p className="text-sm text-gray-600">Os resumos das suas reuniões aparecerão aqui assim que a equipe os registrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* Header */}
      <div>
        <h2 className="text-base font-black text-white">Resumos de Reuniões</h2>
        <p className="text-xs text-gray-500 mt-0.5">{meetings.length} reunião{meetings.length > 1 ? 'ões' : ''} registrada{meetings.length > 1 ? 's' : ''}</p>
      </div>

      {/* Meeting cards */}
      <div className="space-y-3">
        {meetings.map(meeting => {
          const isExpanded  = expandedId === meeting.id;
          const clientSteps = meeting.nextSteps.filter(s => s.assignedTo === 'cliente');
          const agencySteps = meeting.nextSteps.filter(s => s.assignedTo === 'agencia');

          return (
            <div key={meeting.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all">

              {/* Card header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-base select-none">
                    🤝
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{meeting.title}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(meeting.date)}
                      {clientSteps.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/25">
                          {clientSteps.length} tarefa{clientSteps.length > 1 ? 's' : ''} sua{clientSteps.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div className="border-t border-gray-800 px-5 py-5 space-y-6">

                  {/* 1. Resumo Executivo */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> 📝 Resumo Executivo
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">{meeting.executiveSummary}</p>
                  </div>

                  {/* 2. Decisões Tomadas */}
                  {meeting.decisions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> 🤝 Decisões Tomadas
                      </p>
                      <ul className="space-y-2">
                        {meeting.decisions.map((d, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                            <span className="w-4 h-4 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5 border border-violet-500/25">
                              {i + 1}
                            </span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 3. Próximos Passos */}
                  {meeting.nextSteps.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" /> ✅ Próximos Passos
                      </p>
                      <div className="space-y-4">

                        {/* Client tasks — highlighted */}
                        {clientSteps.length > 0 && (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-[10px] font-black text-emerald-400 mb-2.5">👤 Suas Tarefas</p>
                            <ul className="space-y-2">
                              {clientSteps.map(s => (
                                <li key={s.id} className="flex items-start gap-2 text-sm text-emerald-200">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  {s.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Agency tasks */}
                        {agencySteps.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black text-violet-400 mb-2.5">🏢 Equipe CreatorFlow</p>
                            <ul className="space-y-2">
                              {agencySteps.map(s => (
                                <li key={s.id} className="flex items-start gap-2 text-sm text-gray-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                                  {s.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Financeiro tab
// ─────────────────────────────────────────────
const INVOICE_STATUS_PORTAL: Record<Invoice['status'], { label: string; badge: string }> = {
  pendente: { label: 'Pendente',      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  pago:     { label: '✅ Pago',       badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  atrasado: { label: '⚠️ Atrasado',  badge: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

const PortalFinanceiroTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  const { data: invoices } = useClientData<Invoice[]>(clientId, 'invoices', []);
  const [payModalFor, setPayModalFor] = useState<Invoice | null>(null);
  const [copied, setCopied]           = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const formatCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDueDate  = (d: string): string => {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-200">
        <div className="text-4xl mb-4">💰</div>
        <h2 className="text-base font-black text-gray-400 mb-1">Sem faturas em aberto</h2>
        <p className="text-sm text-gray-600">Suas cobranças aparecerão aqui quando a equipe as enviar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-base font-black text-white">Financeiro</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {invoices.length} fatura{invoices.length > 1 ? 's' : ''} registrada{invoices.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {invoices.map(inv => {
          const cfg    = INVOICE_STATUS_PORTAL[inv.status];
          const canPay = inv.status !== 'pago';
          return (
            <div key={inv.id} className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">{inv.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Vencimento: {formatDueDate(inv.dueDate)}</p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md border ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-white">{formatCurrency(inv.amount)}</p>
                {canPay && (
                  <button
                    onClick={() => setPayModalFor(inv)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black transition-all shadow-lg shadow-violet-500/20"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Pagar Agora
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pay modal ── */}
      {payModalFor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-md space-y-5 p-6 animate-in slide-in-from-bottom-4 duration-300">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">{payModalFor.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(payModalFor.amount)}</p>
              </div>
              <button onClick={() => { setPayModalFor(null); setCopied(false); }} className="p-2 rounded-xl hover:bg-gray-800 text-gray-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PIX code */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pix Copia e Cola</p>
              <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
                <p className="flex-1 text-xs text-gray-300 font-mono break-all leading-relaxed">{payModalFor.pixCode}</p>
                <button
                  onClick={() => handleCopy(payModalFor.pixCode)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-black text-violet-400 hover:text-violet-300 transition-colors mt-0.5"
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </button>
              </div>
            </div>

            {/* Boleto link */}
            {payModalFor.boletoLink && (
              <a
                href={payModalFor.boletoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-black hover:bg-gray-800 transition-all"
              >
                📄 Abrir Boleto
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Placeholder for remaining tabs
// ─────────────────────────────────────────────
const _TabPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-200">
    <div className="text-4xl mb-4">🚧</div>
    <h2 className="text-base font-black text-gray-400 mb-1">Em breve</h2>
    <p className="text-sm text-gray-600">Esta seção está sendo preparada pela equipe.</p>
  </div>
);

// ─────────────────────────────────────────────
// Mensagens tab (WhatsApp + DB messages)
// ─────────────────────────────────────────────
interface PortalMessage {
  id: number;
  message: string;
  created_at: string;
}

interface InboxMessage {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const PortalMensagensTab: React.FC<{ clientId: string; inviteToken: string }> = ({ clientId, inviteToken }) => {
  // Producer → client messages (sent by producer, shown as reference)
  const [sentMessages, setSentMessages] = useState<PortalMessage[]>([]);
  const [loadingSent, setLoadingSent] = useState(true);

  // Client → producer inbox
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);

  // Compose (producer → client)
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Fetch producer-sent messages
  useEffect(() => {
    if (!inviteToken) return;
    fetch(`/api/cliente/${inviteToken}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.messages) setSentMessages(d.messages || []); })
      .catch(() => {})
      .finally(() => setLoadingSent(false));
  }, [inviteToken]);

  // Fetch client inbox messages (marks as read automatically)
  useEffect(() => {
    if (!inviteToken || !clientId) return;
    fetch(`/api/portal/${inviteToken}/${clientId}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.messages) setInboxMessages(d.messages || []); })
      .catch(() => {})
      .finally(() => setLoadingInbox(false));
  }, [inviteToken, clientId]);

  async function handleSend() {
    if (!newMessage.trim() || !inviteToken) return;
    setSending(true);
    try {
      const cfToken = localStorage.getItem('cf_token');
      const res = await fetch(`/api/cliente/${inviteToken}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfToken}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSentMessages(prev => [data.message, ...prev]);
        setToast('Aviso enviado ao portal do cliente!');
        setTimeout(() => setToast(''), 3000);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-bold text-emerald-300">{toast}</p>
        </div>
      )}

      {/* ── Inbox: messages from client ── */}
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
          Mensagens do Cliente
        </h3>
        {!inviteToken || loadingInbox ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
          </div>
        ) : inboxMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="w-7 h-7 text-gray-800 mb-3" />
            <p className="text-sm text-gray-600">Nenhuma mensagem do cliente ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inboxMessages.map(msg => (
              <div key={msg.id} className="px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                <p className="text-[11px] text-gray-600 mt-2">{formatDate(msg.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Compose: producer → client ── */}
      <div className="rounded-2xl border border-gray-800/50 bg-gray-950/50 p-5 space-y-4">
        <h3 className="text-sm font-black text-gray-300">Enviar Aviso ao Cliente</h3>

        <textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Escreva a mensagem para o cliente..."
          rows={3}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-gray-600 transition-colors resize-none"
        />

        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending || !inviteToken}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      {/* ── Sent messages log ── */}
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
          Avisos Enviados · {sentMessages.length}
        </h3>
        {loadingSent ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
          </div>
        ) : sentMessages.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhum aviso enviado ainda.</p>
        ) : (
          <div className="space-y-2">
            {sentMessages.map(msg => (
              <div key={msg.id} className="px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800/50">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                <p className="text-[11px] text-gray-600 mt-2">{formatDate(msg.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: Documentos (Client portal — read-only)
// ─────────────────────────────────────────────
const PORTAL_MOCK_DOCS = [
  { id: '1', name: 'Contrato_Prestacao_Servicos.pdf',  date: '26/03/2026', size: '150 KB' },
  { id: '2', name: 'Proposta_Comercial_Marco.pdf',      date: '20/03/2026', size: '89 KB'  },
  { id: '3', name: 'Autorizacao_Uso_Imagem.pdf',        date: '15/03/2026', size: '62 KB'  },
];

const PortalDocumentosTab: React.FC<{ clientId: string }> = ({ clientId: _clientId }) => {
  const docs = PORTAL_MOCK_DOCS;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-white tracking-tight">Os Seus Documentos</h2>
        <p className="text-sm text-gray-500 mt-1">Ficheiros partilhados pela sua produtora.</p>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mb-4">
            <Folder className="w-7 h-7 text-gray-600" />
          </div>
          <p className="text-gray-400 font-bold mb-1">Nenhum documento disponível</p>
          <p className="text-gray-600 text-sm">A sua produtora ainda não partilhou nenhum ficheiro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="group flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-800/70 bg-gray-900/60 hover:bg-gray-800/60 hover:border-gray-700/70 transition-all duration-150"
            >
              {/* PDF icon */}
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <FileText className="w-5 h-5 text-red-400" />
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{doc.date} · {doc.size}</p>
              </div>

              {/* Download only */}
              <button
                onClick={() => window.open('#', '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/60 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600 transition-all duration-150 opacity-0 group-hover:opacity-100"
                title="Descarregar"
              >
                <Download className="w-3.5 h-3.5" />
                Descarregar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Portal nav tabs config
// ─────────────────────────────────────────────
const PORTAL_TABS: { id: PortalTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'roteiros',   label: 'Roteiros',   icon: FileText },
  { id: 'videos',     label: 'Vídeos',     icon: Video },
  { id: 'reunioes',   label: 'Reuniões',   icon: Users },
  { id: 'financeiro',  label: 'Financeiro',  icon: DollarSign    },
  { id: 'documentos',  label: 'Documentos',  icon: Folder        },
  { id: 'mensagens',   label: 'Mensagens',   icon: MessageSquare },
];

// ─────────────────────────────────────────────
// ClientPortalView (root)
// ─────────────────────────────────────────────
interface ClientPortalViewProps {
  client: Client;
  onBack: () => void;
}

const ClientPortalView: React.FC<ClientPortalViewProps> = ({ client, onBack }) => {
  const [activeTab,   setActiveTab]   = useState<PortalTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch producer inviteToken once, then poll unread client messages count
  useEffect(() => {
    const cfToken = localStorage.getItem('cf_token');
    fetch('/api/team/invite', { headers: { Authorization: `Bearer ${cfToken}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.inviteUrl) return;
        const token = data.inviteUrl.split('/invite/')[1];
        setInviteToken(token);
        return fetch(`/api/portal/${token}/${client.id}/messages?peek=true`);
      })
      .then(r => r?.ok ? r.json() : null)
      .then(d => { if (d?.count) setUnreadCount(d.count); })
      .catch(() => {});
  }, [client.id]);

  const handleTabClick = (id: PortalTab) => {
    setActiveTab(id);
    if (id === 'mensagens') setUnreadCount(0);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950 text-white animate-in fade-in duration-300">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════
          SIDEBAR
          Desktop: fixed 256px, always visible
          Mobile: overlay, slides in from left
         ══════════════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-950 border-r border-gray-800/50
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* ── Sidebar header: back + brand ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-800/50">

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Sair do Portal
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm font-black text-white flex-shrink-0 select-none">
              {client.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white truncate leading-tight">
                {client.brandName}
              </h1>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">Portal do Cliente</p>
            </div>
          </div>
        </div>

        {/* ── Nav pills ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {PORTAL_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.07] text-white'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && <span className="absolute left-0 inset-y-0 my-2 w-[2px] rounded-full bg-indigo-500" />}
                <tab.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                <span className="truncate flex-1">{tab.label}</span>
                {tab.id === 'mensagens' && unreadCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Sidebar footer ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[9px] font-black text-white select-none">CF</div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">CreatorFlow</span>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN AREA
         ══════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Mobile top bar ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 bg-gray-950 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{client.brandName}</h1>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide truncate">
            {PORTAL_TABS.find(t => t.id === activeTab)?.label}
          </span>
        </div>

        {/* ── Desktop top bar ── */}
        <div className="hidden lg:flex flex-shrink-0 items-center gap-4 px-6 py-2.5 border-b border-gray-800/50 bg-gray-950/80">
          <div className="flex-1 min-w-0 flex items-center gap-2 text-[11px]">
            <span className="font-black text-gray-500">Portal</span>
            <span className="text-gray-700">/</span>
            <span className="font-black text-gray-400 truncate">{PORTAL_TABS.find(t => t.id === activeTab)?.label}</span>
          </div>
          <p className="text-xs font-bold text-gray-500 flex-shrink-0">
            Olá, <span className="text-violet-400 font-black">{client.brandName}</span> 👋
          </p>
        </div>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">

            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <ProductionStepper />
                <AchievementsGrid clientId={client.id} />
                <FollowerHistoryPortal clientId={client.id} />
                <PendingActions clientId={client.id} />
              </div>
            )}

            {activeTab === 'roteiros'   && <PortalRoteirosTab  clientId={client.id} />}
            {activeTab === 'videos'     && <PortalVideosTab    clientId={client.id} />}
            {activeTab === 'reunioes'   && <PortalReunioeTab   clientId={client.id} />}
            {activeTab === 'financeiro'  && <PortalFinanceiroTab  clientId={client.id} />}
            {activeTab === 'documentos'  && <PortalDocumentosTab  clientId={client.id} />}
            {activeTab === 'mensagens'   && <PortalMensagensTab   clientId={client.id} inviteToken={inviteToken} />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientPortalView;
