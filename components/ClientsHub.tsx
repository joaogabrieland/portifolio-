'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchClientData } from '@/lib/clients-api';
import {
  ArrowLeft, Plus, Users, Trash2, ChevronRight, AlertTriangle, Calendar,
  X, UserPlus, MoreVertical, Pencil, CheckCircle, Clock, Video, Globe,
  BarChart3, TrendingUp, AlertCircle, Activity, DollarSign, Layers, Zap, FileText,
  Copy, Check, Link,
} from 'lucide-react';
import { Client } from '@/types';
import ClientOnboardingModal from './ClientOnboardingModal';
import ClientDashboard from './ClientDashboard';
import ClientPortalView from './ClientPortalView';
import TutorialModal, { TutorialButton } from './TutorialModal';
import { useAgency } from './AgencyContext';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface ClientsHubProps {
  clients: Client[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onBack: () => void;
  onNavigateToArquivos?: () => void;
  onOpenBudgetSheet?: () => void;
  onLinkCopied?: () => void;
  /** RBAC: true = admin (full access), false = member (read-only+operational). Defaults to true. */
  isAdmin?: boolean;
}

// ─────────────────────────────────────────────
// Voice tone badge colors
// ─────────────────────────────────────────────
const VOICE_TONE_COLORS: Record<Client['voiceTone'], string> = {
  'Autoritário':  'bg-red-900/20 text-red-300 border-red-800/50',
  'Descontraído': 'bg-sky-900/20 text-sky-300 border-sky-800/50',
  'Educacional':  'bg-emerald-900/20 text-emerald-300 border-emerald-800/50',
  'Agressivo':    'bg-orange-900/20 text-orange-300 border-orange-800/50',
};

// ─────────────────────────────────────────────
// Workflow alert helpers (reads localStorage)
// ─────────────────────────────────────────────
interface ClientAlerts {
  hasOverdue: boolean;
  hasToday: boolean;
}

interface _WorkflowCard  { dueDate: string; }
interface _WorkflowColumn { id: string; cards: _WorkflowCard[]; }
interface _AgendaEvent {
  date: string;
  startTime: string;
  title: string;
  type: string;
}

interface _AgendaEventWithClient extends _AgendaEvent {
  clientId: string;
  clientName: string;
}

const _getTodayStr = (): string => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────
// Agenda aggregation — async, fetches from API
// ─────────────────────────────────────────────
const fetchUpcomingEvents = async (clients: Client[]): Promise<_AgendaEventWithClient[]> => {
  const todayStr = _getTodayStr();
  const all: _AgendaEventWithClient[] = [];

  for (const client of clients) {
    try {
      const events = await fetchClientData<_AgendaEvent[]>(client.id, 'agenda');
      if (Array.isArray(events)) {
        for (const e of events) {
          if (e.date >= todayStr) {
            all.push({ ...e, clientId: client.id, clientName: client.brandName });
          }
        }
      }
    } catch { /* ignore */ }
  }

  all.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  return all.slice(0, 5);
};

// ─────────────────────────────────────────────
// Format date for mini-card
// ─────────────────────────────────────────────
const formatEventDate = (dateStr: string): string => {
  const todayStr    = _getTodayStr();
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  if (dateStr === todayStr)    return 'Hoje';
  if (dateStr === tomorrowStr) return 'Amanhã';

  const [, m, d] = dateStr.split('-');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
};

// ─────────────────────────────────────────────
// Event type → icon helper
// ─────────────────────────────────────────────
const getEventIcon = (type: string) => {
  if (type === 'Gravação')        return <Video    className="w-3.5 h-3.5" />;
  if (type === 'Entrega de Vídeo') return <Video   className="w-3.5 h-3.5" />;
  return                                   <Calendar className="w-3.5 h-3.5" />;
};

// Client alerts are now loaded async via useEffect in the main component

// ─────────────────────────────────────────────
// Minha Equipe — types & constants
// ─────────────────────────────────────────────
type MemberRole = 'admin' | 'roteirista' | 'videomaker' | 'editor' | 'designer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  isOwner?: boolean;
}

const ROLE_CONFIG: Record<MemberRole, { label: string; emoji: string; badge: string }> = {
  'admin':      { label: 'Administrador',        emoji: '👑', badge: 'bg-violet-500/20 text-violet-400 border-violet-700/40' },
  'roteirista': { label: 'Roteirista / Copy',     emoji: '✍️', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-700/40' },
  'videomaker': { label: 'Videomaker / Produção', emoji: '🎥', badge: 'bg-sky-500/20 text-sky-400 border-sky-700/40' },
  'editor':     { label: 'Editor / Pós-produção', emoji: '✂️', badge: 'bg-amber-500/20 text-amber-400 border-amber-700/40' },
  'designer':   { label: 'Designer',              emoji: '🎨', badge: 'bg-pink-500/20 text-pink-400 border-pink-700/40' },
};

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin',      label: '👑 Administrador (Acesso total)' },
  { value: 'roteirista', label: '✍️ Roteirista / Copy'            },
  { value: 'videomaker', label: '🎥 Videomaker / Produção'        },
  { value: 'editor',     label: '✂️ Editor / Pós-produção'        },
  { value: 'designer',   label: '🎨 Designer'                     },
];

const INITIAL_TEAM: TeamMember[] = [
  { id: 'm1', name: 'Você', email: '', role: 'admin', isOwner: true },
];

const LABEL_CLS  = 'text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block';
const INPUT_CLS  = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-400';
const SELECT_CLS = `${INPUT_CLS} cursor-pointer`;

// ─────────────────────────────────────────────
// UpcomingScheduleSection
// ─────────────────────────────────────────────
interface UpcomingScheduleSectionProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

const UpcomingScheduleSection: React.FC<UpcomingScheduleSectionProps> = ({ clients, onSelectClient }) => {
  const [events, setEvents] = useState<_AgendaEventWithClient[]>([]);
  const fetchedIdsRef = useRef<string>('');

  useEffect(() => {
    const ids = clients.map(c => c.id).sort().join(',');
    if (ids === fetchedIdsRef.current) return;
    fetchedIdsRef.current = ids;
    fetchUpcomingEvents(clients).then(setEvents).catch(() => {});
  }, [clients]);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-violet-500" />
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
          Próximos Compromissos
        </h2>
      </div>

      {events.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40">
          <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <p className="text-sm text-zinc-400">
            Você não tem gravações agendadas para os próximos dias.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {events.map((evt, i) => {
            const client = clients.find(c => c.id === evt.clientId);
            const dateLabel = formatEventDate(evt.date);
            const isToday   = evt.date === _getTodayStr();

            return (
              <button
                key={`${evt.clientId}-${evt.date}-${i}`}
                onClick={() => client && onSelectClient(client)}
                className="group flex-shrink-0 w-52 flex flex-col gap-2.5 p-4 rounded-2xl border bg-zinc-900 border-zinc-800 hover:border-violet-700 hover:shadow-md transition-all text-left"
              >
                {/* Date + time row */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${isToday ? 'text-violet-400' : 'text-white'}`}>
                    {dateLabel}
                  </span>
                  {evt.startTime && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {evt.startTime}
                    </span>
                  )}
                </div>

                {/* Event title */}
                <div className="flex items-start gap-1.5">
                  <span className={`mt-0.5 flex-shrink-0 text-zinc-400 group-hover:text-violet-500 transition-colors`}>
                    {getEventIcon(evt.type)}
                  </span>
                  <p className="text-sm font-bold text-zinc-200 leading-tight line-clamp-2">
                    {evt.title}
                  </p>
                </div>

                {/* Client badge */}
                <span className="self-start text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-700/40 truncate max-w-full">
                  {evt.clientName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// TeamModal
// ─────────────────────────────────────────────
interface TeamModalProps { isOpen: boolean; onClose: () => void; }

interface ApiTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  cargo: string;
  isOwner: boolean;
  avatar?: string;
  joinedAt: number;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  const { updateMemberRole } = useAgency();

  const [members, setMembers]               = useState<ApiTeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteUrl, setInviteUrl]           = useState('');
  const [inviteLoading, setInviteLoading]   = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [inviteToast, setInviteToast]       = useState(false);
  const [openMenuId, setOpenMenuId]         = useState<string | null>(null);
  const [editingId, setEditingId]           = useState<string | null>(null);

  // Fetch members from API when modal opens
  const membersFetchedRef = useRef(false);
  useEffect(() => {
    if (!isOpen || membersFetchedRef.current) return;
    membersFetchedRef.current = true;
    setMembersLoading(true);
    const token = localStorage.getItem('cf_token');
    if (!token) { setMembersLoading(false); return; }
    fetch('/api/team/members', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.members) setMembers(data.members); })
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }, [isOpen]);

  // Reset fetch guard when modal closes so it re-fetches on next open
  useEffect(() => {
    if (!isOpen) membersFetchedRef.current = false;
  }, [isOpen]);

  const handleGenerateInvite = async () => {
    setInviteLoading(true);

    const storedToken = localStorage.getItem('cf_token');

    if (!storedToken) {
      setInviteLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/team/invite', {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (!res.ok) throw new Error('Falha ao gerar convite');
      const data = await res.json();
      setInviteUrl(data.inviteUrl);
      setShowInviteLink(true);
    } catch (err) {
      // Fallback: API unavailable in local dev — generate mock URL so the UI flow works
      const mockToken = `local-${Date.now()}`;
      setInviteUrl(`${window.location.origin}/invite/${mockToken}`);
      setShowInviteLink(true);
      console.warn('Invite API unavailable, using mock URL:', err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setInviteToast(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setInviteToast(false), 3000);
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remover este membro da equipe?')) { setOpenMenuId(null); return; }
    const token = localStorage.getItem('cf_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/team/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMembers(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
    setOpenMenuId(null);
  };

  const handleChangeRole = async (id: string, role: MemberRole) => {
    // Map MemberRole to cargo label
    const cargoMap: Record<MemberRole, string> = {
      admin: 'Administrador',
      roteirista: 'Roteirista',
      videomaker: 'Videomaker',
      editor: 'Editor',
      designer: 'Designer',
    };
    const cargo = cargoMap[role] || role;

    // Optimistic update
    setMembers(prev => prev.map(m => m.id === id ? { ...m, cargo } : m));
    updateMemberRole(id, role); // keep localStorage in sync
    setEditingId(null);

    const token = localStorage.getItem('cf_token');
    if (!token) return;
    try {
      await fetch(`/api/team/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cargo }),
      });
    } catch { /* ignore — optimistic update already applied */ }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => { setOpenMenuId(null); setEditingId(null); onClose(); }}
      />

      {/* Drawer panel */}
      <div className="relative w-full max-w-lg h-full bg-zinc-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-zinc-800">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-5 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Gestão de Equipe</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Gerencie os acessos da sua produtora</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Toast */}
          {inviteToast && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/50 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-bold text-emerald-300">Link copiado com sucesso!</p>
            </div>
          )}

          {/* Invite link */}
          {!showInviteLink ? (
            <button
              onClick={handleGenerateInvite}
              disabled={inviteLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-violet-700 text-violet-400 font-bold text-sm hover:bg-violet-900/20 transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {inviteLoading ? 'Gerando...' : '+ Convidar Membro'}
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black text-white">Link de Convite</h3>
                </div>
                <button
                  onClick={() => setShowInviteLink(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-400">Compartilhe este link para convidar um membro à sua equipe.</p>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 truncate">
                  {inviteUrl}
                </div>
                <button
                  onClick={handleCopyInvite}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold transition-colors bg-white text-black hover:bg-gray-100"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          {/* Member list — sourced from API */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
              Membros Ativos · {members.length}
            </p>

            {membersLoading && (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              </div>
            )}

            <div className="space-y-2">
              {members.map(member => {
                // Resolve cargo to MemberRole key for badge styling
                const cargoToRole: Record<string, MemberRole> = {
                  'Administrador': 'admin', 'Roteirista': 'roteirista',
                  'Videomaker': 'videomaker', 'Editor': 'editor', 'Designer': 'designer',
                };
                const badgeKey = cargoToRole[member.cargo] || (member.isOwner ? 'admin' : 'editor');
                const cfg = ROLE_CONFIG[badgeKey] ?? ROLE_CONFIG['editor'];
                return (
                  <div
                    key={member.id}
                    className="relative flex items-center gap-4 p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
                  >
                    {/* Avatar — photo if available, initials otherwise */}
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="flex-shrink-0 w-10 h-10 rounded-xl object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black select-none">
                        {getInitials(member.name)}
                      </div>
                    )}

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white truncate">{member.name}</p>
                        {member.isOwner && (
                          <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-wider">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{member.email}</p>
                    </div>

                    {/* Role badge */}
                    <span className={`flex-shrink-0 hidden sm:inline-flex text-[11px] font-black px-2.5 py-1 rounded-lg border ${cfg.badge}`}>
                      {cfg.emoji} {cfg.label}
                    </span>

                    {/* Three-dots menu (not for owner) */}
                    {!member.isOwner && (
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => { setOpenMenuId(openMenuId === member.id ? null : member.id); setEditingId(null); }}
                          className="p-1.5 hover:bg-zinc-700/50 rounded-lg text-zinc-400 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown menu */}
                        {openMenuId === member.id && editingId !== member.id && (
                          <div className="absolute right-0 top-9 z-20 w-44 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={() => { setEditingId(member.id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5 text-zinc-400" /> Editar Cargo
                            </button>
                            <div className="h-px bg-zinc-700" />
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remover Membro
                            </button>
                          </div>
                        )}

                        {/* Inline role editor */}
                        {editingId === member.id && (
                          <div className="absolute right-0 top-9 z-20 w-52 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 px-1">Alterar Cargo</p>
                            <div className="space-y-0.5">
                              {ROLE_OPTIONS.map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => handleChangeRole(member.id, opt.value)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                                    cargoToRole[member.cargo] === opt.value
                                      ? 'bg-violet-900/20 text-violet-400'
                                      : 'hover:bg-zinc-700/50 text-zinc-300'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setEditingId(null)}
                              className="mt-2 w-full text-[10px] font-bold text-zinc-400 hover:text-zinc-300 transition-colors py-1"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BI Dashboard — types, data, component
// ─────────────────────────────────────────────

interface _BIInvoice { id: string; dueDate: string; amount: number; status: 'pendente' | 'pago' | 'atrasado'; }
interface _BIKanbanCard { id: string; dueDate?: string; }
interface _BIKanbanColumn { id: string; cards: _BIKanbanCard[]; }
interface _BIRoteiroScript { portalStatus?: string; }
interface _BIRoteiroPackage { scripts: _BIRoteiroScript[]; }

interface BIFunnelStage { id: string; label: string; count: number; isBottleneck: boolean; }
interface BICriticalAlert { urgency: 'high' | 'medium'; message: string; detail: string; }
interface BITeamMember { name: string; role: string; workload: number; approvalRate: number; }

const BI_FUNNEL_COLS = [
  { id: 'preproducao', label: 'Pré-produção'  },
  { id: 'gravar',      label: 'Para Gravar'   },
  { id: 'edicao',      label: 'Em Edição'     },
  { id: 'aprovacao',   label: 'Ag. Aprovação' },
  { id: 'finalizado',  label: 'Finalizado'    },
];

const BI_TEAM_DATA: BITeamMember[] = [];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const EMPTY_BI_DATA = {
  totalReceived: 0, totalPending: 0, totalOverdue: 0, totalFinancial: 0,
  topProjects: [] as { clientName: string; amount: number }[],
  renewals: [] as { clientName: string; dueDate: string; daysLeft: number; amount: number }[],
  stages: BI_FUNNEL_COLS.map(col => ({ ...col, count: 0, isBottleneck: false })) as BIFunnelStage[],
  alerts: [] as BICriticalAlert[],
  team: BI_TEAM_DATA,
};

function useBIData(clients: Client[]) {
  const [data, setData] = useState(EMPTY_BI_DATA);
  const fetchedIdsRef = useRef<string>('');

  useEffect(() => {
    const ids = clients.map(c => c.id).sort().join(',');
    if (ids === fetchedIdsRef.current) return;
    fetchedIdsRef.current = ids;

    let cancelled = false;

    const compute = async () => {
      let totalReceived = 0, totalPending = 0, totalOverdue = 0;
      const projectTotals = new Map<string, number>();
      const renewals: typeof EMPTY_BI_DATA.renewals = [];
      const alerts: BICriticalAlert[] = [];
      const funnelCounts: Record<string, number> = Object.fromEntries(BI_FUNNEL_COLS.map(c => [c.id, 0]));

      const today    = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const in30     = new Date(today); in30.setDate(today.getDate() + 30);
      const in30Str  = in30.toISOString().split('T')[0];

      for (const client of clients) {
        // Invoices
        try {
          const invs = await fetchClientData<_BIInvoice[]>(client.id, 'invoices');
          if (Array.isArray(invs)) {
            let clientTotal = 0;
            for (const inv of invs) {
              clientTotal += inv.amount;
              if      (inv.status === 'pago')      totalReceived += inv.amount;
              else if (inv.status === 'pendente')  totalPending  += inv.amount;
              else if (inv.status === 'atrasado')  totalOverdue  += inv.amount;
              if (inv.status !== 'pago' && inv.dueDate >= todayStr && inv.dueDate <= in30Str) {
                const daysLeft = Math.round((new Date(inv.dueDate).getTime() - today.getTime()) / 86400000);
                renewals.push({ clientName: client.brandName, dueDate: inv.dueDate, daysLeft, amount: inv.amount });
              }
            }
            if (clientTotal > 0) projectTotals.set(client.brandName, (projectTotals.get(client.brandName) ?? 0) + clientTotal);
            const overdue = invs.filter(i => i.status === 'atrasado');
            if (overdue.length > 0) alerts.push({ urgency: 'high', message: `Fatura atrasada: ${client.brandName}`, detail: `${overdue.length} fatura(s) vencida(s)` });
          }
        } catch { /* ignore */ }

        // Kanban
        try {
          const cols = await fetchClientData<_BIKanbanColumn[]>(client.id, 'kanban');
          if (Array.isArray(cols)) {
            for (const col of cols) {
              if (col.id in funnelCounts) funnelCounts[col.id] += col.cards.length;
              if (col.id !== 'finalizado') {
                const overdueCards = col.cards.filter(c => c.dueDate && c.dueDate < todayStr);
                if (overdueCards.length > 0) alerts.push({ urgency: 'high', message: `Cards atrasados: ${client.brandName}`, detail: `${overdueCards.length} card(s) no Kanban fora do prazo` });
              }
            }
          }
        } catch { /* ignore */ }

        // Roteiros
        try {
          const pkgs = await fetchClientData<_BIRoteiroPackage[]>(client.id, 'roteiros');
          if (Array.isArray(pkgs)) {
            let waiting = 0;
            pkgs.forEach(p => p.scripts.forEach(sc => { if (sc.portalStatus === 'aguardando_cliente') waiting++; }));
            if (waiting > 0) alerts.push({ urgency: 'medium', message: `Aprovação travada: ${client.brandName}`, detail: `${waiting} roteiro(s) aguardando resposta do cliente` });
          }
        } catch { /* ignore */ }
      }

      const topProjects = Array.from(projectTotals.entries())
        .map(([clientName, amount]) => ({ clientName, amount }))
        .sort((a, b) => b.amount - a.amount).slice(0, 3);

      renewals.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

      const stages: BIFunnelStage[] = BI_FUNNEL_COLS.map(col => ({ ...col, count: funnelCounts[col.id], isBottleneck: false }));
      const active = stages.filter(s => s.id !== 'finalizado');
      const maxCount = Math.max(0, ...active.map(s => s.count));
      if (maxCount > 0) {
        const idx = stages.findIndex(s => s.id !== 'finalizado' && s.count === maxCount);
        if (idx !== -1) stages[idx].isBottleneck = true;
      }

      alerts.sort((a, b) => (a.urgency === 'high' ? 0 : 1) - (b.urgency === 'high' ? 0 : 1));

      if (!cancelled) {
        setData({
          totalReceived, totalPending, totalOverdue,
          totalFinancial: totalReceived + totalPending + totalOverdue,
          topProjects, renewals, stages, alerts,
          team: BI_TEAM_DATA,
        });
      }
    };

    if (clients.length > 0) compute();
    return () => { cancelled = true; };
  }, [clients]);

  return data;
}

const BIDashboard: React.FC<{ clients: Client[] }> = ({ clients }) => {
  const d = useBIData(clients);

  const recPct = d.totalFinancial > 0 ? (d.totalReceived / d.totalFinancial) * 100 : 0;
  const penPct = d.totalFinancial > 0 ? (d.totalPending  / d.totalFinancial) * 100 : 0;
  const ovdPct = d.totalFinancial > 0 ? (d.totalOverdue  / d.totalFinancial) * 100 : 0;
  const bottleneck = d.stages.find(s => s.isBottleneck);

  return (
    <div className="w-full bg-gray-950 text-white min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Business Intelligence</h2>
            <p className="text-xs text-gray-500 mt-0.5">Visão executiva · dados em tempo real</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <Activity className="w-3.5 h-3.5" />
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} ativo{clients.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Q1: Saúde Financeira ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-3.5 h-3.5 text-gray-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Saúde Financeira</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Faturamento vs Recebíveis */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Faturamento vs Recebíveis</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-400">Recebido</span>
                    <span className="text-xs font-black text-emerald-400">{formatBRL(d.totalReceived)}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${recPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-400">A Receber</span>
                    <span className="text-xs font-black text-amber-400">{formatBRL(d.totalPending)}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${penPct}%` }} />
                  </div>
                </div>
                {d.totalOverdue > 0 && (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-400">Atrasado</span>
                      <span className="text-xs font-black text-red-400">{formatBRL(d.totalOverdue)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${ovdPct}%` }} />
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Total Contratado</span>
                  <span className="text-sm font-black text-white">{formatBRL(d.totalFinancial)}</span>
                </div>
              </div>
            </div>

            {/* Top Projetos */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Top Projetos Lucrativos</p>
              {d.topProjects.length === 0 ? (
                <p className="text-xs text-gray-600 italic">Nenhuma fatura cadastrada ainda</p>
              ) : (
                <div className="space-y-3">
                  {d.topProjects.map((proj, i) => (
                    <div key={proj.clientName} className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black ${i === 0 ? 'bg-violet-500/20 text-violet-400' : i === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{proj.clientName}</p>
                      </div>
                      <span className="flex-shrink-0 text-sm font-black text-emerald-400">{formatBRL(proj.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vencimentos Próximos */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Vencimentos Próximos</p>
                {d.renewals.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-400">
                    <AlertTriangle className="w-3 h-3" /> {d.renewals.length}
                  </span>
                )}
              </div>
              {d.renewals.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> Nenhum vencimento nos próximos 30 dias
                </div>
              ) : (
                <div className="space-y-2">
                  {d.renewals.slice(0, 4).map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${r.daysLeft <= 7 ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                      <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${r.daysLeft <= 7 ? 'text-red-400' : 'text-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{r.clientName}</p>
                        <p className={`text-[10px] font-bold ${r.daysLeft <= 7 ? 'text-red-400' : 'text-amber-400'}`}>
                          {r.daysLeft === 0 ? 'Vence hoje' : `${r.daysLeft}d restantes`} · {formatBRL(r.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Q2: Funil de Produção ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-3.5 h-3.5 text-gray-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Funil de Produção</h3>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
              {d.stages.map((stage, i) => (
                <React.Fragment key={stage.id}>
                  <div className={`flex-1 min-w-[90px] flex flex-col items-center gap-2 p-4 rounded-xl ${stage.isBottleneck ? 'ring-2 ring-red-500/50 bg-red-500/5' : 'bg-gray-800/40'}`}>
                    <span className={`text-2xl font-black ${stage.isBottleneck ? 'text-red-400' : stage.count > 0 ? 'text-white' : 'text-gray-600'}`}>
                      {stage.count}
                    </span>
                    <p className={`text-[10px] font-black text-center uppercase tracking-wide leading-tight ${stage.isBottleneck ? 'text-red-400' : 'text-gray-500'}`}>
                      {stage.label}
                    </p>
                    {stage.isBottleneck && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <Zap className="w-2.5 h-2.5" /> Gargalo
                      </span>
                    )}
                  </div>
                  {i < d.stages.length - 1 && (
                    <div className="flex items-center text-gray-700 flex-shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {bottleneck && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-xs font-bold text-red-400">
                  Gargalo detectado: <strong>{bottleneck.count}</strong> {bottleneck.count === 1 ? 'vídeo acumulado' : 'vídeos acumulados'} em <strong>{bottleneck.label}</strong>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Q3 + Q4: Alertas + Performance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">

          {/* Q3: Alertas Críticos */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Alertas Críticos</h3>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              {d.alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> Nenhuma pendência crítica no momento
                </div>
              ) : (
                <div className="space-y-2">
                  {d.alerts.slice(0, 7).map((alert, i) => (
                    <div key={i} className={`flex items-start gap-3 px-3 py-3 rounded-xl border ${alert.urgency === 'high' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                      <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${alert.urgency === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">{alert.message}</p>
                        <p className={`text-[11px] mt-0.5 ${alert.urgency === 'high' ? 'text-red-400' : 'text-amber-400'}`}>{alert.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Q4: Performance da Equipe */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Performance da Equipe</h3>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-5">
              {d.team.map(member => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{member.name}</p>
                      <p className="text-[10px] text-gray-500">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                      <TrendingUp className="w-3 h-3" /> {member.approvalRate}% aprovação
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-500">Carga Horária</span>
                      <span className={`text-[10px] font-black ${member.workload >= 85 ? 'text-red-400' : member.workload >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {member.workload}% {member.workload >= 85 ? '· sobrecarregado' : member.workload >= 60 ? '· ocupado' : '· disponível'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${member.workload >= 85 ? 'bg-red-500' : member.workload >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${member.workload}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const ClientsHub: React.FC<ClientsHubProps> = ({
  clients,
  onSaveClient,
  onDeleteClient,
  onBack,
  onNavigateToArquivos,
  onOpenBudgetSheet,
  onLinkCopied,
  isAdmin = true, // default admin so the component is safe to use without explicit RBAC prop
}) => {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isTeamOpen, setIsTeamOpen]     = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [portalClient, setPortalClient]     = useState<Client | null>(null);
  const [hubView, setHubView]               = useState<'bi' | 'clientes'>(isAdmin ? 'bi' : 'clientes');
  const [alertsCache, setAlertsCache]       = useState<Record<string, ClientAlerts>>({});
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [portalToken, setPortalToken]       = useState('');
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  // Fetch portal invite token once
  const portalTokenFetchedRef = useRef(false);
  useEffect(() => {
    if (portalTokenFetchedRef.current) return;
    portalTokenFetchedRef.current = true;
    const token = localStorage.getItem('cf_token');
    if (!token) return;
    fetch('/api/team/invite', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.inviteUrl) {
          const t = data.inviteUrl.split('/invite/')[1];
          if (t) setPortalToken(t);
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  // Load alerts for all clients from API
  const alertsFetchedIdsRef = useRef<string>('');
  useEffect(() => {
    const ids = clients.map(c => c.id).sort().join(',');
    if (ids === alertsFetchedIdsRef.current) return;
    alertsFetchedIdsRef.current = ids;

    const loadAlerts = async () => {
      const todayStr = _getTodayStr();
      const cache: Record<string, ClientAlerts> = {};

      for (const client of clients) {
        let hasOverdue = false;
        let hasToday = false;

        try {
          const columns = await fetchClientData<_WorkflowColumn[]>(client.id, 'kanban');
          if (Array.isArray(columns)) {
            const active = columns.filter(c => c.id !== 'finalizado').flatMap(c => c.cards).filter(c => c.dueDate);
            if (active.some(c => c.dueDate < todayStr)) hasOverdue = true;
            if (active.some(c => c.dueDate === todayStr)) hasToday = true;
          }
        } catch { /* ignore */ }

        try {
          const agendaEvents = await fetchClientData<_AgendaEvent[]>(client.id, 'agenda');
          if (Array.isArray(agendaEvents)) {
            if (agendaEvents.some(e => e.date === todayStr)) hasToday = true;
          }
        } catch { /* ignore */ }

        cache[client.id] = { hasOverdue, hasToday };
      }

      setAlertsCache(cache);
    };

    if (clients.length > 0) loadAlerts();
  }, [clients]);

  if (portalClient) {
    return (
      <ClientPortalView
        client={portalClient}
        onBack={() => setPortalClient(null)}
      />
    );
  }

  if (selectedClient) {
    return (
      <ClientDashboard
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
        onNavigateToArquivos={onNavigateToArquivos}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 animate-in fade-in duration-300">

      {/* ══ Header ══ */}
      <header className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-1 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Hub de Clientes
                </h1>
                <p className="text-xs text-zinc-400 hidden sm:block">
                  {clients.length} {clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TutorialButton onClick={() => setIsTutorialOpen(true)} />
            {/* Admin-only: Gerar Proposta */}
            {isAdmin && onOpenBudgetSheet && (
              <button
                onClick={onOpenBudgetSheet}
                className="hidden sm:flex items-center gap-2 px-3 py-2.5 border border-indigo-800/50 bg-indigo-900/20 text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-900/30 transition-all"
              >
                <FileText className="w-4 h-4" />
                Gerar Proposta
              </button>
            )}
            {/* Admin-only: Gestão de equipe */}
            {isAdmin && (
              <button
                onClick={() => setIsTeamOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border border-zinc-700 bg-zinc-800/80 text-zinc-300 rounded-xl font-bold text-sm hover:border-violet-600 hover:text-violet-400 transition-all"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Minha Equipe</span>
              </button>
            )}
            {/* Admin-only: Adicionar novo cliente */}
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-100"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Cliente</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══ Main ══ */}
      <main className="flex-1 overflow-y-auto">

        {/* ── Hub view toggle ── */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
              {isAdmin && (
                <button
                  onClick={() => setHubView('bi')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    hubView === 'bi'
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" /> Business Intelligence
                </button>
              )}
              <button
                onClick={() => setHubView('clientes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  hubView === 'clientes'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Users className="w-4 h-4" /> Gestão de Clientes
              </button>
            </div>
          </div>
        </div>

        {/* ── BI Dashboard (owner only) ── */}
        {isAdmin && hubView === 'bi' && <BIDashboard clients={clients} />}

        {/* ── Clients view ── */}
        {hubView === 'clientes' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* ══ Upcoming schedule ══ */}
          {clients.length > 0 && (
            <UpcomingScheduleSection
              clients={clients}
              onSelectClient={setSelectedClient}
            />
          )}

          {/* Empty state */}
          {clients.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-emerald-900/40 bg-emerald-950/10 p-10 text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Nenhum cliente cadastrado
              </h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                Cadastre seus clientes para ter o briefing completo sempre à mão. Use a IA para extrair os dados de uma call!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
              >
                🤝 Cadastrar Primeiro Cliente
              </button>
            </div>
          )}

          {/* Grid de clientes */}
          {clients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(client => {
                const alerts = alertsCache[client.id] || { hasOverdue: false, hasToday: false };
                return (
                  <div
                    key={client.id}
                    className={`group relative flex flex-col gap-3 p-5 bg-zinc-900 border rounded-2xl transition-all hover:shadow-lg ${
                      alerts.hasOverdue
                        ? 'border-red-600/40 hover:border-red-600'
                        : 'border-zinc-800 hover:border-emerald-800'
                    }`}
                  >
                    {/* Delete btn — admin only */}
                    {isAdmin && (
                      <button
                        onClick={() => setClientToDelete(client)}
                        className="absolute top-3 right-3 p-1.5 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Excluir ${client.brandName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Brand name + niche */}
                    <div>
                      <h3 className="font-bold text-base text-white leading-tight pr-6">
                        {client.brandName}
                      </h3>
                      {(client.niche || client.subniche) && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {[client.niche, client.subniche].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Alert badges */}
                    {(alerts.hasOverdue || alerts.hasToday) && (
                      <div className="flex flex-wrap gap-1.5">
                        {alerts.hasOverdue && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-400/30">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span className="text-[10px] font-black text-red-500">Atrasado</span>
                          </div>
                        )}
                        {alerts.hasToday && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-500/15 border border-yellow-400/30">
                            <Calendar className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-black text-yellow-400">Ocorre Hoje</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Voice tone badge */}
                    <span
                      className={`self-start text-xs font-bold px-2.5 py-1 rounded-lg border ${VOICE_TONE_COLORS[client.voiceTone]}`}
                    >
                      🎙️ {client.voiceTone}
                    </span>

                    {/* CTA preview */}
                    {client.defaultCta && (
                      <p className="text-xs text-zinc-400 italic line-clamp-2">
                        &ldquo;{client.defaultCta}&rdquo;
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="mt-auto flex gap-2">
                      <button
                        className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:border-emerald-700 hover:text-emerald-400 transition-all"
                        onClick={() => setSelectedClient(client)}
                      >
                        Entrar no Painel <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-500 hover:border-violet-700 hover:text-violet-400 transition-all"
                        onClick={() => setPortalClient(client)}
                        title="Ver Portal do Cliente"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </button>
                      {portalToken && (
                        <button
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            copiedClientId === client.id
                              ? 'border-emerald-700 text-emerald-400 bg-emerald-900/20'
                              : 'border-zinc-800 text-zinc-500 hover:border-emerald-700 hover:text-emerald-400'
                          }`}
                          onClick={() => {
                            if (!portalToken) return;
                            navigator.clipboard.writeText(`${window.location.origin}/portal/${portalToken}/${client.id}`);
                            setCopiedClientId(client.id ?? null);
                            setTimeout(() => setCopiedClientId(null), 2000);
                            onLinkCopied?.();
                          }}
                          title="Copiar link do portal"
                        >
                          {copiedClientId === client.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add card — admin only */}
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-400 hover:border-emerald-400 hover:text-emerald-500 transition-all min-h-[180px]"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-bold">Novo Cliente</span>
                </button>
              )}
            </div>
          )}
        </div>
        )}
      </main>

      {/* ── FAB Mobile — admin only ── */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 sm:hidden z-40">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-sm shadow-2xl shadow-emerald-500/40 hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" /> Novo
          </button>
        </div>
      )}

      <ClientOnboardingModal
        isOpen={isModalOpen}
        onSave={onSaveClient}
        onClose={() => setIsModalOpen(false)}
      />

      <TeamModal
        isOpen={isTeamOpen}
        onClose={() => setIsTeamOpen(false)}
      />

      {/* ══ Modal: Confirmar exclusão de cliente ══ */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 p-6 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl bg-red-900/30">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">
                  Excluir Cliente Permanentemente?
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            {/* Body */}
            <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4 mb-6 text-sm text-zinc-300 leading-relaxed">
              Você está prestes a apagar o cliente{' '}
              <span className="font-black text-white">"{clientToDelete.brandName}"</span>.
              {' '}Todos os roteiros, tarefas, reuniões, backups e dados associados a este hub serão{' '}
              <span className="font-black text-red-400">destruídos para sempre</span>.
              Deseja continuar?
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setClientToDelete(null)}
                className="flex-1 px-4 py-3 rounded-2xl font-bold text-sm text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteClient(clientToDelete.id);
                  setClientToDelete(null);
                }}
                className="flex-1 px-4 py-3 rounded-2xl font-black text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Tutorial Modal ══ */}
      {/* TODO: Inserir link do tutorial gravado */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        title="Tutorial — Hub de Clientes"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
    </div>
  );
};

export default ClientsHub;
