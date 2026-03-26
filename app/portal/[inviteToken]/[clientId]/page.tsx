'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  LayoutDashboard, FileText, Video, Users, DollarSign, MessageSquare,
  Loader2, AlertCircle, CheckCircle, Clock, XCircle, ChevronRight,
  Play, ExternalLink, Menu, X, Zap, TrendingUp, Bell, Send,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Tab = 'dashboard' | 'roteiros' | 'videos' | 'reunioes' | 'financeiro' | 'mensagens';

interface PortalInfo {
  producerName: string;
  clientId: string;
  brandName: string;
  niche: string;
}

interface Deliverable {
  id: string;
  title: string;
  status: 'em_producao' | 'entregue' | 'aprovado' | 'revisao' | string;
  dueDate?: string;
  shareLink?: string;
  notes?: string;
}

interface ScriptScene {
  id: string;
  visual?: string;
  audio?: string;
  type?: string;
  freeContent?: string;
}

interface ScriptDoc {
  id: string;
  title: string;
  hook?: string;
  scenes?: ScriptScene[];
  cta?: string;
}

interface ScriptPackage {
  id: string;
  title: string;
  portalStatus?: 'aguardando_cliente' | 'aprovado' | 'revisao' | string;
  scripts?: ScriptDoc[];
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  executiveSummary: string;
  decisions?: string[];
  nextSteps?: { id: string; text: string; assignedTo: 'agencia' | 'cliente'; done: boolean }[];
}

interface Invoice {
  id: string;
  title: string;
  amount: number;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado' | string;
  dueDate?: string;
  boletoLink?: string;
}

interface PortalMessage {
  id: number;
  message: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// Portal data hook — fetches from public API
// ─────────────────────────────────────────────
function usePortalData<T>(
  inviteToken: string,
  clientId: string,
  dataType: string,
  fallback: T
): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/portal/${inviteToken}/${clientId}/data/${dataType}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (!cancelled && json?.data !== undefined) setData(json.data as T); })
      .catch(() => {/* silent */})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [inviteToken, clientId, dataType]);

  return { data, loading };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtCurrency(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─────────────────────────────────────────────
// Status configs
// ─────────────────────────────────────────────
const DELIVERY_STATUS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  em_producao: { label: 'Em Produção',  cls: 'text-amber-400  bg-amber-900/20  border-amber-800/40',   icon: <Clock className="w-3 h-3" /> },
  entregue:    { label: 'Entregue',     cls: 'text-sky-400    bg-sky-900/20    border-sky-800/40',     icon: <CheckCircle className="w-3 h-3" /> },
  aprovado:    { label: 'Aprovado',     cls: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40', icon: <CheckCircle className="w-3 h-3" /> },
  revisao:     { label: 'Em Revisão',   cls: 'text-rose-400   bg-rose-900/20   border-rose-800/40',    icon: <XCircle className="w-3 h-3" /> },
};

const SCRIPT_STATUS: Record<string, { label: string; cls: string }> = {
  aguardando_cliente: { label: 'Aguardando Aprovação', cls: 'text-amber-400 bg-amber-900/20 border-amber-800/40' },
  aprovado:           { label: 'Aprovado',              cls: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40' },
  revisao:            { label: 'Em Revisão',            cls: 'text-rose-400 bg-rose-900/20 border-rose-800/40' },
};

const INVOICE_STATUS: Record<string, { label: string; cls: string }> = {
  pendente:  { label: 'Pendente',   cls: 'text-amber-400 bg-amber-900/20 border-amber-800/40' },
  pago:      { label: 'Pago',       cls: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40' },
  vencido:   { label: 'Vencido',    cls: 'text-rose-400 bg-rose-900/20 border-rose-800/40' },
  cancelado: { label: 'Cancelado',  cls: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40' },
};

// ─────────────────────────────────────────────
// Sub-tabs
// ─────────────────────────────────────────────

function DashboardTab({ inviteToken, clientId, info }: { inviteToken: string; clientId: string; info: PortalInfo }) {
  const { data: deliverables, loading } = usePortalData<Deliverable[]>(inviteToken, clientId, 'entregas', []);
  const { data: invoices } = usePortalData<Invoice[]>(inviteToken, clientId, 'invoices', []);

  const pending  = invoices.filter(i => i.status === 'pendente' || i.status === 'vencido').length;
  const inProd   = deliverables.filter(d => d.status === 'em_producao').length;
  const delivered = deliverables.filter(d => d.status === 'entregue' || d.status === 'aprovado').length;
  const recent   = [...deliverables].sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '')).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest"><Play className="w-3.5 h-3.5" /> Em Produção</div>
          <span className="text-3xl font-black text-white">{inProd}</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest"><CheckCircle className="w-3.5 h-3.5" /> Entregues</div>
          <span className="text-3xl font-black text-white">{delivered}</span>
        </div>
        <div className={`col-span-2 md:col-span-1 bg-zinc-900 border rounded-2xl p-5 flex flex-col gap-2 ${pending > 0 ? 'border-amber-800/50' : 'border-zinc-800'}`}>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest"><Bell className="w-3.5 h-3.5" /> Faturas Pendentes</div>
          <span className={`text-3xl font-black ${pending > 0 ? 'text-amber-400' : 'text-white'}`}>{pending}</span>
        </div>
      </div>

      {/* Recent deliverables */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> Timeline de Produção
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-600 text-sm py-6"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
        ) : recent.length === 0 ? (
          <p className="text-zinc-600 text-sm py-6">Nenhuma entrega registada.</p>
        ) : (
          <div className="space-y-3">
            {recent.map(d => {
              const sc = DELIVERY_STATUS[d.status] ?? { label: d.status, cls: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40', icon: <Zap className="w-3 h-3" /> };
              return (
                <div key={d.id} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate text-sm">{d.title}</p>
                    {d.dueDate && <p className="text-xs text-zinc-500 mt-0.5">Prazo: {fmtDate(d.dueDate)}</p>}
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${sc.cls}`}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Welcome note */}
      <div className="rounded-2xl border border-indigo-900/40 bg-indigo-900/10 p-5">
        <p className="text-sm text-indigo-300 leading-relaxed">
          Olá! Este é o seu portal de acompanhamento de produção com <strong className="text-indigo-200">{info.producerName}</strong>.
          Aqui você acompanha roteiros, entregas, reuniões e faturas em tempo real.
        </p>
      </div>
    </div>
  );
}

function RoteirosTab({ inviteToken, clientId }: { inviteToken: string; clientId: string }) {
  const { data: packages, loading } = usePortalData<ScriptPackage[]>(inviteToken, clientId, 'roteiros', []);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mt-8" />;
  if (packages.length === 0) return <p className="text-zinc-600 text-sm mt-8">Nenhum roteiro disponível.</p>;

  return (
    <div className="space-y-4">
      {packages.map(pkg => {
        const sc = SCRIPT_STATUS[pkg.portalStatus ?? ''] ?? { label: 'Rascunho', cls: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40' };
        const isOpen = expanded === pkg.id;
        return (
          <div key={pkg.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/40 transition-colors"
              onClick={() => setExpanded(isOpen ? null : pkg.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="font-bold text-white truncate text-sm">{pkg.title}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {isOpen && pkg.scripts && pkg.scripts.length > 0 && (
              <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
                {pkg.scripts.map(script => (
                  <div key={script.id} className="space-y-2">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{script.title}</h4>
                    {script.hook && <p className="text-sm text-zinc-300 bg-zinc-800/60 rounded-xl px-4 py-3"><span className="text-xs font-bold text-violet-400 uppercase tracking-widest block mb-1">Hook</span>{script.hook}</p>}
                    {script.scenes && script.scenes.map((sc, idx) => (
                      <div key={sc.id} className="text-sm rounded-xl bg-zinc-800/40 px-4 py-3">
                        {sc.type === 'free_text' ? (
                          <p className="text-zinc-300 whitespace-pre-wrap">{sc.freeContent}</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            <div><span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Cena {idx + 1} — Visual</span><p className="text-zinc-300">{sc.visual}</p></div>
                            <div><span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Áudio</span><p className="text-zinc-300">{sc.audio}</p></div>
                          </div>
                        )}
                      </div>
                    ))}
                    {script.cta && <p className="text-sm text-emerald-300 bg-emerald-900/10 border border-emerald-900/30 rounded-xl px-4 py-3"><span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">CTA</span>{script.cta}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VideosTab({ inviteToken, clientId }: { inviteToken: string; clientId: string }) {
  const { data: deliverables, loading } = usePortalData<Deliverable[]>(inviteToken, clientId, 'entregas', []);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mt-8" />;
  if (deliverables.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <Video className="w-6 h-6 text-zinc-600" />
      </div>
      <p className="text-sm font-bold text-zinc-500 mb-1">Nenhum vídeo aguardando aprovação</p>
      <p className="text-xs text-zinc-600 max-w-xs">Os materiais enviados pela equipe aparecerão aqui para revisão.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {deliverables.map(d => {
        const sc = DELIVERY_STATUS[d.status] ?? { label: d.status, cls: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40', icon: <Zap className="w-3 h-3" /> };
        return (
          <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="font-bold text-white text-sm">{d.title}</p>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${sc.cls}`}>
                  {sc.icon} {sc.label}
                </span>
              </div>
              {d.dueDate && <p className="text-xs text-zinc-500 mt-1">Prazo: {fmtDate(d.dueDate)}</p>}
              {d.notes && <p className="text-xs text-zinc-400 mt-2">{d.notes}</p>}
              {d.shareLink && (
                <a href={d.shareLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir arquivo
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReuniõesTab({ inviteToken, clientId }: { inviteToken: string; clientId: string }) {
  const { data: meetings, loading } = usePortalData<Meeting[]>(inviteToken, clientId, 'meetings', []);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mt-8" />;
  if (meetings.length === 0) return <p className="text-zinc-600 text-sm mt-8">Nenhuma reunião registada.</p>;

  return (
    <div className="space-y-4">
      {meetings.filter(m => !('isArchived' in m && m.isArchived)).map(m => {
        const isOpen = expanded === m.id;
        return (
          <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/40 transition-colors"
              onClick={() => setExpanded(isOpen ? null : m.id)}
            >
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{m.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{fmtDate(m.date)}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-zinc-500 flex-shrink-0 ml-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
              <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
                {m.executiveSummary && (
                  <div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Resumo</p>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{m.executiveSummary}</p>
                  </div>
                )}
                {m.decisions && m.decisions.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Decisões</p>
                    <ul className="space-y-1">
                      {m.decisions.map((d, i) => <li key={i} className="text-sm text-zinc-300 flex gap-2"><span className="text-indigo-500 font-bold flex-shrink-0">•</span>{d}</li>)}
                    </ul>
                  </div>
                )}
                {m.nextSteps && m.nextSteps.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Próximos Passos</p>
                    <ul className="space-y-2">
                      {m.nextSteps.map(step => (
                        <li key={step.id} className={`flex items-start gap-3 text-sm p-3 rounded-xl ${step.done ? 'opacity-50' : ''} ${step.assignedTo === 'cliente' ? 'bg-violet-900/10 border border-violet-900/30' : 'bg-zinc-800/40'}`}>
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${step.done ? 'text-emerald-400' : 'text-zinc-600'}`} />
                          <div className="min-w-0">
                            <p className={`${step.done ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>{step.text}</p>
                            {step.assignedTo === 'cliente' && <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Sua responsabilidade</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FinanceiroTab({ inviteToken, clientId }: { inviteToken: string; clientId: string }) {
  const { data: invoices, loading } = usePortalData<Invoice[]>(inviteToken, clientId, 'invoices', []);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mt-8" />;
  if (invoices.length === 0) return <p className="text-zinc-600 text-sm mt-8">Nenhuma fatura registada.</p>;

  const total = invoices.filter(i => i.status === 'pendente' || i.status === 'vencido').reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      {total > 0 && (
        <div className="bg-amber-900/10 border border-amber-800/40 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-300">Total em aberto</span>
          <span className="text-lg font-black text-amber-400">{fmtCurrency(total)}</span>
        </div>
      )}
      {invoices.map(inv => {
        const sc = INVOICE_STATUS[inv.status] ?? { label: inv.status, cls: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40' };
        return (
          <div key={inv.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-white text-sm">{inv.title}</p>
                {inv.dueDate && <p className="text-xs text-zinc-500 mt-1">Vencimento: {fmtDate(inv.dueDate)}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-base font-black text-white">{fmtCurrency(inv.amount ?? 0)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
              </div>
            </div>
            {inv.boletoLink && (inv.status === 'pendente' || inv.status === 'vencido') && (
              <a href={inv.boletoLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Pagar Fatura
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MensagensTab({ inviteToken, clientId }: { inviteToken: string; clientId: string }) {
  // Producer → client messages (read-only)
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [loading, setLoading]   = useState(true);

  // Client → producer compose
  const [text, setText]     = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  useEffect(() => {
    fetch(`/api/cliente/${inviteToken}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.messages) setMessages(d.messages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [inviteToken]);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/portal/${inviteToken}/${clientId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      if (res.ok) {
        setText('');
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch {/* silent */} finally {
      setSending(false);
    }
  }

  function fmtMsg(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-8">

      {/* ── Compose: client → producer ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-black text-white">Enviar Mensagem para a Equipe</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Sua mensagem será recebida diretamente pela equipe de produção.</p>
        </div>

        {sent && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs font-bold text-emerald-300">Mensagem enviada!</p>
          </div>
        )}

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escreva sua mensagem aqui…"
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* ── Messages from producer ── */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Avisos da Equipe</h3>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
        ) : messages.length === 0 ? (
          <p className="text-zinc-600 text-sm">Nenhum aviso da equipe ainda.</p>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4">
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                <p className="text-[11px] text-zinc-600 mt-2">{fmtMsg(msg.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────
const TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'roteiros',   label: 'Roteiros',   Icon: FileText },
  { id: 'videos',     label: 'Vídeos',     Icon: Video },
  { id: 'reunioes',   label: 'Reuniões',   Icon: Users },
  { id: 'financeiro', label: 'Financeiro', Icon: DollarSign },
  { id: 'mensagens',  label: 'Mensagens',  Icon: MessageSquare },
];

// ─────────────────────────────────────────────
// Root page
// ─────────────────────────────────────────────
export default function PublicClientPortal() {
  const { inviteToken, clientId } = useParams<{ inviteToken: string; clientId: string }>();
  const [info, setInfo]             = useState<PortalInfo | null>(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/portal/${inviteToken}/${clientId}`)
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error ?? 'Erro')))
      .then((d: PortalInfo) => setInfo(d))
      .catch(e => setError(typeof e === 'string' ? e : 'Token inválido ou expirado.'))
      .finally(() => setLoading(false));
  }, [inviteToken, clientId]);

  const renderTab = useCallback(() => {
    if (!info) return null;
    switch (activeTab) {
      case 'dashboard':  return <DashboardTab inviteToken={inviteToken} clientId={clientId} info={info} />;
      case 'roteiros':   return <RoteirosTab  inviteToken={inviteToken} clientId={clientId} />;
      case 'videos':     return <VideosTab    inviteToken={inviteToken} clientId={clientId} />;
      case 'reunioes':   return <ReuniõesTab  inviteToken={inviteToken} clientId={clientId} />;
      case 'financeiro': return <FinanceiroTab inviteToken={inviteToken} clientId={clientId} />;
      case 'mensagens':  return <MensagensTab inviteToken={inviteToken} clientId={clientId} />;
    }
  }, [activeTab, info, inviteToken, clientId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  // ── Error ──
  if (error || !info) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-900/20 border border-red-800/40 flex items-center justify-center mb-5">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Acesso inválido</h1>
          <p className="text-sm text-zinc-400">{error || 'Link inválido ou expirado.'}</p>
        </div>
      </div>
    );
  }

  const initials = info.brandName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-white">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-64 flex flex-col bg-zinc-900 border-r border-zinc-800
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-sm font-black text-white select-none shadow-lg shadow-indigo-500/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white leading-none truncate">{info.brandName}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{info.niche || 'Área do Cliente'}</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 mt-4 leading-relaxed">
            Produção por <span className="text-zinc-400 font-bold">{info.producerName}</span>
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-600'}`} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-700 text-center">Powered by CreatorFlow AI</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-4 px-5 py-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-white leading-none truncate">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-[10px] text-zinc-600 mt-0.5">{info.brandName}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 py-8 max-w-4xl w-full mx-auto">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}
