'use client';

import React from 'react';
import {
  TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle,
  Clock, ExternalLink, DollarSign, Wallet, BarChart2,
  CircleDot, Check,
} from 'lucide-react';
import type { ExecutiveProject, Milestone } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function daysRemaining(endDate: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const end = new Date(endDate + 'T00:00:00');
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calcProgress(startDate: string, endDate: string): number {
  const now   = Date.now();
  const start = new Date(startDate + 'T00:00:00').getTime();
  const end   = new Date(endDate   + 'T00:00:00').getTime();
  if (end <= start) return 100;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}

function daysFromToday(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const MILESTONE_TYPE_COLORS: Record<string, { dot: string; badge: string; badgeText: string }> = {
  pre_producao: { dot: 'bg-amber-400',   badge: 'bg-amber-500/10 border-amber-500/25',  badgeText: 'text-amber-400' },
  captacao:     { dot: 'bg-blue-400',    badge: 'bg-blue-500/10 border-blue-500/25',    badgeText: 'text-blue-400' },
  pos:          { dot: 'bg-violet-400',  badge: 'bg-violet-500/10 border-violet-500/25', badgeText: 'text-violet-400' },
};

const MILESTONE_TYPE_LABELS: Record<string, string> = {
  pre_producao: 'Pré',
  captacao:     'Captação',
  pos:          'Pós',
};

// ─── Sub-component: Visual Timeline ───────────────────────────────────────────

function ProjectTimeline({ milestones, startDate, endDate }: {
  milestones: Milestone[];
  startDate: string;
  endDate: string;
}) {
  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  const progress = calcProgress(startDate, endDate);
  const daysLeft = daysRemaining(endDate);

  if (sorted.length === 0) {
    return (
      <div className="py-8 text-center">
        <CircleDot className="w-7 h-7 text-gray-700 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Nenhum marco cadastrado.</p>
        <p className="text-xs text-gray-700 mt-1">Adicione marcos no módulo Cronograma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest w-14 shrink-0">
          {formatDate(startDate)}
        </span>
        <div className="relative flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
              daysLeft < 0 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-amber-400' : 'bg-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest w-14 text-right shrink-0">
          {formatDate(endDate)}
        </span>
      </div>

      {/* Milestone list */}
      <div className="relative ml-2">
        {/* Vertical line */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-800" />

        <div className="space-y-1">
          {sorted.map((m, idx) => {
            const delta     = daysFromToday(m.date);
            const isOverdue = !m.done && delta < 0;
            const isToday   = delta === 0;
            const color     = MILESTONE_TYPE_COLORS[m.type] ?? MILESTONE_TYPE_COLORS.pre_producao;

            return (
              <div key={m.id} className="relative flex items-start gap-4 pl-8 py-2">
                {/* Dot */}
                <div className={`
                  absolute left-0 top-3 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center
                  ${m.done
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : isOverdue
                    ? 'bg-red-500/20 border-red-500 animate-pulse'
                    : 'bg-gray-800 border-gray-600'}
                `}
                  style={{ width: '1.1rem', height: '1.1rem' }}
                >
                  {m.done && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                </div>

                {/* Content */}
                <div className={`flex-1 flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                  m.done
                    ? 'bg-gray-800/30 border-gray-700/30'
                    : isOverdue
                    ? 'bg-red-500/5 border-red-500/20'
                    : isToday
                    ? 'bg-indigo-500/8 border-indigo-500/25'
                    : idx === sorted.findIndex(x => !x.done)
                    ? 'bg-gray-800/60 border-gray-700'
                    : 'bg-gray-800/20 border-gray-800'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${m.done ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {m.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-red-400' : isToday ? 'text-indigo-400' : 'text-gray-600'}`}>
                        {formatDate(m.date)}
                      </span>
                      {isOverdue && <span className="text-[9px] font-black text-red-400 uppercase">· {Math.abs(delta)}d de atraso</span>}
                      {isToday   && <span className="text-[9px] font-black text-indigo-400 uppercase">· Hoje</span>}
                      {!m.done && delta > 0 && <span className="text-[9px] text-gray-700 uppercase">· em {delta}d</span>}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${color.badge} ${color.badgeText}`}>
                    {MILESTONE_TYPE_LABELS[m.type] ?? m.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Alertas Inteligentes ──────────────────────────────────────

function AlertasInteligentes({ project, isAdmin = true }: { project: ExecutiveProject; isAdmin?: boolean }) {
  const pendingTx = project.transactions.filter(t => t.status === 'pending');
  const paidTx    = project.transactions.filter(t => t.status === 'paid');
  const today     = new Date(); today.setHours(0, 0, 0, 0);

  type Alert = { kind: 'warning' | 'ok' | 'info'; text: string };
  const alerts: Alert[] = [];

  // Team
  if (project.teamMembers.length === 0) {
    alerts.push({ kind: 'warning', text: 'Equipe ainda não foi montada para este projeto.' });
  } else {
    alerts.push({ kind: 'ok', text: `Equipe: ${project.teamMembers.length} profissional${project.teamMembers.length !== 1 ? 'is' : ''} escalado${project.teamMembers.length !== 1 ? 's' : ''}.` });
  }

  // Over-budget categories (admin-only financial info)
  if (isAdmin) {
    const overspent = project.budgetCategories.filter(cat => {
      const b = cat.items.reduce((s, i) => s + i.budgeted, 0);
      const sp = cat.items.reduce((s, i) => s + i.actualSpent, 0);
      return sp > b && b > 0;
    });
    overspent.forEach(cat => {
      alerts.push({ kind: 'warning', text: `Orçamento de "${cat.name}" ultrapassado.` });
    });
  }

  // Deadline
  const daysLeft = daysRemaining(project.endDate);
  if (daysLeft < 0) {
    alerts.push({ kind: 'warning', text: `Prazo encerrado há ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) !== 1 ? 's' : ''}.` });
  } else if (daysLeft <= 7) {
    alerts.push({ kind: 'warning', text: `Projeto encerra em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}.` });
  }

  // Milestones
  const milestones = project.milestones ?? [];
  const doneMilestones = milestones.filter(m => m.done).length;
  const overdueMilestones = milestones.filter(m => !m.done && daysFromToday(m.date) < 0).length;
  if (overdueMilestones > 0) {
    alerts.push({ kind: 'warning', text: `${overdueMilestones} marco${overdueMilestones !== 1 ? 's' : ''} com atraso.` });
  }
  if (milestones.length > 0) {
    alerts.push({ kind: 'ok', text: `Cronograma: ${doneMilestones}/${milestones.length} marcos concluídos.` });
  }

  if (alerts.length === 0) {
    alerts.push({ kind: 'ok', text: 'Nenhum alerta no momento. Projeto no verde!' });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Alertas Inteligentes</span>
        {isAdmin && pendingTx.length > 0 && (
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[10px] font-black text-amber-400">
            {pendingTx.length} pagamento{pendingTx.length !== 1 ? 's' : ''} pendente{pendingTx.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* System alerts */}
      <div className="px-5 pt-4 space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${
            a.kind === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-gray-800/40'
          }`}>
            {a.kind === 'warning'
              ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              : <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />}
            <span className={`text-xs leading-snug ${a.kind === 'warning' ? 'text-amber-300' : 'text-gray-400'}`}>
              {a.text}
            </span>
          </div>
        ))}
      </div>

      {/* Pending transactions — Contas a Pagar (ADMIN ONLY) */}
      {isAdmin && pendingTx.length > 0 && (
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Contas a Pagar</p>
          <div className="space-y-1.5">
            {pendingTx.slice(0, 4).map(tx => {
              const txDate  = new Date(tx.date + 'T00:00:00');
              const overdue = txDate < today;
              return (
                <div key={tx.id} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border ${
                  overdue ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-800/40 border-gray-700/50'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{tx.description}</p>
                    <p className="text-[10px] text-gray-600">{tx.payee}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-white tabular-nums">{fmt(tx.amount)}</p>
                    <p className={`text-[9px] font-bold ${overdue ? 'text-red-400' : 'text-gray-600'}`}>
                      {overdue ? 'VENCIDO' : formatDate(tx.date)}
                    </p>
                  </div>
                </div>
              );
            })}
            {pendingTx.length > 4 && (
              <p className="text-[10px] text-gray-600 text-center py-1">+{pendingTx.length - 4} mais</p>
            )}
          </div>
        </div>
      )}

      {/* Paid transactions count (ADMIN ONLY) */}
      {isAdmin && paidTx.length > 0 && (
        <div className="px-5 pt-3 pb-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Contas Pagas</p>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-300">{paidTx.length} pagamento{paidTx.length !== 1 ? 's' : ''} quitado{paidTx.length !== 1 ? 's' : ''}. Total: {fmt(paidTx.reduce((s, t) => s + t.amount, 0))}</span>
          </div>
        </div>
      )}

      <div className="h-4" /> {/* bottom spacer */}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  project: ExecutiveProject;
  isAdmin?: boolean;
}

export default function ExecutiveMonitoringCenter({ project, isAdmin = true }: Props) {
  // ── Pre-approved budget (from setup) — admin-only ─────────────────────────
  const orcamentoPre  = project.orcamentoPreAprovado ?? 0;
  const custoExec     = project.custoExecutado       ?? 0;
  const saldo         = orcamentoPre - custoExec;
  const isOverBudget  = saldo < 0;
  const execPercent   = orcamentoPre > 0 ? Math.round((custoExec / orcamentoPre) * 100) : 0;

  const totalBudgeted  = project.budgetCategories.reduce((s, c) => s + c.items.reduce((a, i) => a + i.budgeted,    0), 0);
  const totalSpent     = project.budgetCategories.reduce((s, c) => s + c.items.reduce((a, i) => a + i.actualSpent, 0), 0);
  const totalTeamCost  = project.teamMembers.reduce((s, m) => s + m.totalCost, 0);

  const daysLeft   = daysRemaining(project.endDate);
  const progress   = calcProgress(project.startDate, project.endDate);
  const milestones = project.milestones ?? [];

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">

      {/* ── Project identity strip — visible to all ── */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-black text-white truncate">{project.name}</h2>
          <p className="text-xs text-gray-500 truncate">{project.client}</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {project.tipoProjeto && (
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-lg text-xs font-black text-indigo-400">
              {project.tipoProjeto}
            </span>
          )}
          {project.linkBriefing && (
            <a href={project.linkBriefing} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-400 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Briefing
            </a>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
          </div>
        </div>
      </div>

      {/* ── Financial KPI cards — ADMIN ONLY ── */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1: Orçamento Aprovado */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Orçamento Aprovado</span>
            </div>
            <div className="text-2xl font-black text-white tabular-nums">
              {orcamentoPre > 0 ? fmt(orcamentoPre) : <span className="text-gray-600">Não definido</span>}
            </div>
            {totalBudgeted > 0 && (
              <div className="text-xs text-gray-600 mt-1.5">
                Planilha: {fmt(totalBudgeted)} · Equipe: {fmt(totalTeamCost)}
              </div>
            )}
          </div>

          {/* Card 2: Custo Executado */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Custo Executado</span>
            </div>
            <div className="text-2xl font-black text-white tabular-nums">{fmt(custoExec)}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(execPercent, 100)}%` }} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 tabular-nums">{execPercent}%</span>
            </div>
            {totalSpent > 0 && <div className="text-xs text-gray-600 mt-1">Planilha: {fmt(totalSpent)}</div>}
          </div>

          {/* Card 3: Saldo */}
          <div className={`rounded-2xl p-5 border ${isOverBudget ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-900 border-gray-800'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isOverBudget ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                <DollarSign className={`w-3.5 h-3.5 ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`} />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {isOverBudget ? 'Déficit' : 'Saldo Restante'}
              </span>
            </div>
            <div className={`text-2xl font-black tabular-nums ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
              {fmt(Math.abs(saldo))}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {isOverBudget
                ? <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              <span className={`text-xs font-bold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                {isOverBudget ? 'Acima do orçamento' : 'Dentro do orçamento'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ── Visual Timeline — visible to all ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Linha do Tempo</span>
            <p className="text-xs text-gray-600 mt-0.5">
              {milestones.length} marco{milestones.length !== 1 ? 's' : ''} · {milestones.filter(m => m.done).length} concluído{milestones.filter(m => m.done).length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-xl font-black tabular-nums ${
              daysLeft < 0 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-white'
            }`}>{Math.round(progress)}%</div>
            <div className={`text-[10px] font-bold ${daysLeft < 0 ? 'text-red-500' : 'text-gray-600'}`}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrasado` : daysLeft === 0 ? 'Encerra hoje' : `${daysLeft}d restantes`}
            </div>
          </div>
        </div>
        <ProjectTimeline milestones={milestones} startDate={project.startDate} endDate={project.endDate} />
      </div>

      {/* ── Equipe — visible to all ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
          Equipe do Projeto
        </div>
        {project.teamMembers.length === 0 ? (
          <p className="text-sm text-gray-600">Nenhum profissional escalado.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.teamMembers.map(m => (
              <div key={m.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-xl border border-gray-700/50">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-white">{m.name}</span>
                <span className="text-xs text-gray-500">{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Alertas — visible to all (AlertasInteligentes hides financial data internally for members) ── */}
      <AlertasInteligentes project={project} isAdmin={isAdmin} />

    </div>
  );
}
