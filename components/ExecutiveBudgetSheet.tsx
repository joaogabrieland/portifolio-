'use client';

import React, { useState, useCallback } from 'react';
import {
  ChevronDown, ChevronRight, Plus, Trash2,
  Wallet, BarChart2, DollarSign, TrendingUp, TrendingDown,
} from 'lucide-react';
import type { ExecutiveProject, BudgetCategory, BudgetItem, BudgetItemStatus } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function itemStatus(item: BudgetItem): BudgetItemStatus {
  return item.status ?? 'pendente';
}

function calcSubtotals(category: BudgetCategory) {
  return category.items.reduce(
    (acc, item) => ({
      budgeted:      acc.budgeted      + item.budgeted,
      approvedOnly:  acc.approvedOnly  + (itemStatus(item) === 'aprovado' ? item.budgeted : 0),
      spent:         acc.spent         + item.actualSpent,
    }),
    { budgeted: 0, approvedOnly: 0, spent: 0 }
  );
}

// ─── Status Toggle ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<BudgetItemStatus, { label: string; cls: string }> = {
  pendente: {
    label: 'Pendente',
    cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25',
  },
  aprovado: {
    label: 'Aprovado',
    cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25',
  },
  recusado: {
    label: 'Recusado',
    cls: 'bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/25',
  },
};

const STATUS_CYCLE: BudgetItemStatus[] = ['pendente', 'aprovado', 'recusado'];

function StatusToggle({
  value,
  onChange,
}: {
  value: BudgetItemStatus;
  onChange: (v: BudgetItemStatus) => void;
}) {
  const current = STATUS_CFG[value];
  const next    = STATUS_CYCLE[(STATUS_CYCLE.indexOf(value) + 1) % STATUS_CYCLE.length];
  return (
    <button
      type="button"
      title={`Clique para: ${STATUS_CFG[next].label}`}
      onClick={() => onChange(next)}
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${current.cls}`}
    >
      {current.label}
    </button>
  );
}

// ─── Mini KPI card (shared) ──────────────────────────────────────────────────

function KpiCard({
  icon: Icon, iconCls, label, value, sub, highlight,
}: {
  icon: React.FC<{ className?: string }>;
  iconCls: string;
  label: string;
  value: string;
  sub?: string;
  highlight?: 'green' | 'red';
}) {
  return (
    <div className={`rounded-2xl p-4 border ${
      highlight === 'red'   ? 'bg-red-500/5 border-red-500/20' :
      highlight === 'green' ? 'bg-gray-900 border-gray-800' :
      'bg-gray-900 border-gray-800'
    }`}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-xl font-black tabular-nums ${
        highlight === 'red' ? 'text-red-400' : highlight === 'green' ? 'text-emerald-400' : 'text-white'
      }`}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: ExecutiveProject;
  onUpdate: (updated: ExecutiveProject) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExecutiveBudgetSheet({ project, onUpdate }: Props) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(project.budgetCategories.map(c => c.id))
  );

  const toggleCategory = useCallback((id: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const updateCategories = useCallback(
    (categories: BudgetCategory[]) => onUpdate({ ...project, budgetCategories: categories }),
    [project, onUpdate]
  );

  // ── Item actions ────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (categoryId: string) => {
      const newItem: BudgetItem = {
        id:          `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name:        '',
        quantity:    1,
        days:        1,
        unitPrice:   0,
        budgeted:    0,
        actualSpent: 0,
        status:      'pendente',
      };
      updateCategories(
        project.budgetCategories.map(cat =>
          cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
        )
      );
      setOpenCategories(prev => new Set([...prev, categoryId]));
    },
    [project.budgetCategories, updateCategories]
  );

  const deleteItem = useCallback(
    (categoryId: string, itemId: string) => {
      updateCategories(
        project.budgetCategories.map(cat =>
          cat.id === categoryId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
        )
      );
    },
    [project.budgetCategories, updateCategories]
  );

  const updateItem = useCallback(
    (categoryId: string, itemId: string, field: keyof BudgetItem, value: string | number) => {
      updateCategories(
        project.budgetCategories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            items: cat.items.map(item => {
              if (item.id !== itemId) return item;
              const updated = { ...item, [field]: value };
              if (field === 'quantity' || field === 'days' || field === 'unitPrice') {
                updated.budgeted =
                  (field === 'quantity' ? (value as number) : updated.quantity) *
                  (field === 'days'     ? (value as number) : updated.days) *
                  (field === 'unitPrice' ? (value as number) : updated.unitPrice);
              }
              return updated;
            }),
          };
        })
      );
    },
    [project.budgetCategories, updateCategories]
  );

  // Auto-fill item from a team member (name + unit price in one shot)
  const fillFromMember = useCallback(
    (categoryId: string, itemId: string, memberId: string) => {
      const member = project.teamMembers.find(m => m.id === memberId);
      if (!member) return;
      const unitPrice = member.agreedRate;
      updateCategories(
        project.budgetCategories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            items: cat.items.map(item => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                name: member.name,
                unitPrice,
                budgeted: item.quantity * item.days * unitPrice,
              };
            }),
          };
        })
      );
    },
    [project.teamMembers, project.budgetCategories, updateCategories]
  );

  const updateItemStatus = useCallback(
    (categoryId: string, itemId: string, status: BudgetItemStatus) => {
      updateCategories(
        project.budgetCategories.map(cat =>
          cat.id !== categoryId ? cat : {
            ...cat,
            items: cat.items.map(item =>
              item.id !== itemId ? item : { ...item, status }
            ),
          }
        )
      );
    },
    [project.budgetCategories, updateCategories]
  );

  // ── Totals ──────────────────────────────────────────────────────────────────

  const { totalBudgeted, totalApproved, totalSpent } = project.budgetCategories.reduce(
    (acc, cat) => {
      const sub = calcSubtotals(cat);
      return {
        totalBudgeted: acc.totalBudgeted + sub.budgeted,
        totalApproved: acc.totalApproved + sub.approvedOnly,
        totalSpent:    acc.totalSpent    + sub.spent,
      };
    },
    { totalBudgeted: 0, totalApproved: 0, totalSpent: 0 }
  );

  // KPI cards data — custoExec is computed from transactions directly to guarantee
  // it always reflects the latest Financial Control entries, even if the cached
  // project.custoExecutado hasn't propagated yet in this render cycle.
  const orcamentoPre = project.orcamentoPreAprovado ?? 0;
  const custoExec    = (project.transactions ?? []).reduce((s, t) => s + t.amount, 0);
  const saldo        = orcamentoPre - custoExec;
  const isOverBudget = saldo < 0;
  const execPercent  = orcamentoPre > 0 ? Math.round((custoExec / orcamentoPre) * 100) : 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">

      {/* ── TOP: Global KPI cards ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-800/50">
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Visão Financeira Global</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard
            icon={Wallet}
            iconCls="bg-indigo-500/10"
            label="Orçamento Aprovado"
            value={orcamentoPre > 0 ? fmt(orcamentoPre) : '—'}
            sub={`Planilha aprovada: ${fmt(totalApproved)}`}
          />
          <KpiCard
            icon={BarChart2}
            iconCls="bg-amber-500/10"
            label="Custo Executado"
            value={fmt(custoExec)}
            sub={`${execPercent}% do orçamento aprovado`}
          />
          <KpiCard
            icon={isOverBudget ? TrendingDown : TrendingUp}
            iconCls={isOverBudget ? 'bg-red-500/10' : 'bg-emerald-500/10'}
            label={isOverBudget ? 'Déficit' : 'Saldo Restante'}
            value={fmt(Math.abs(saldo))}
            highlight={isOverBudget ? 'red' : 'green'}
            sub={isOverBudget ? 'Acima do orçamento' : 'Dentro do orçamento'}
          />
        </div>
      </div>

      {/* ── Scrollable categories ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {project.budgetCategories.map(category => {
          const { budgeted: catBudgeted, approvedOnly: catApproved, spent: catSpent } = calcSubtotals(category);
          const catOver = catSpent > catApproved && catApproved > 0;
          const isOpen  = openCategories.has(category.id);

          return (
            <div
              key={category.id}
              className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden"
            >
              {/* Accordion header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-800/30 transition-colors"
              >
                {isOpen
                  ? <ChevronDown  className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                <span className="flex-1 text-sm font-bold text-white text-left">{category.name}</span>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Aprovado</div>
                    <div className="text-sm font-bold text-emerald-400">{fmt(catApproved)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Total Orçado</div>
                    <div className="text-sm font-bold text-gray-400">{fmt(catBudgeted)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Executado</div>
                    <div className={`text-sm font-bold ${catOver ? 'text-red-400' : 'text-gray-300'}`}>
                      {fmt(catSpent)}
                    </div>
                  </div>
                </div>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="border-t border-gray-800/60">
                  {category.items.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800/50">
                            {['Item', 'Qtd', 'Diárias', 'Vlr. Unit (R$)', 'Orçado', 'Executado (R$)', 'Status', ''].map(col => (
                              <th key={col}
                                className="px-4 py-2.5 text-left text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {category.items.map((item, idx) => {
                            const st      = itemStatus(item);
                            const isOver  = item.actualSpent > item.budgeted && item.budgeted > 0;
                            const dimmed  = st === 'recusado';
                            return (
                              <tr key={item.id}
                                className={`border-b border-gray-800/20 last:border-0 ${
                                  idx % 2 !== 0 ? 'bg-gray-800/10' : ''
                                } ${dimmed ? 'opacity-50' : ''}`}
                              >
                                {/* Item name — smart select + fallback text */}
                                <td className="px-4 py-2 min-w-[200px]">
                                  {project.teamMembers.length > 0 ? (
                                    <div className="space-y-1">
                                      <select
                                        value={project.teamMembers.find(m => m.name === item.name)?.id ?? '__custom__'}
                                        onChange={e => {
                                          if (e.target.value === '__custom__') {
                                            updateItem(category.id, item.id, 'name', '');
                                          } else {
                                            fillFromMember(category.id, item.id, e.target.value);
                                          }
                                        }}
                                        className="w-full bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
                                      >
                                        <option value="__custom__">— Digitar manualmente —</option>
                                        {project.teamMembers.map(m => (
                                          <option key={m.id} value={m.id}>
                                            {m.name} ({m.role})
                                          </option>
                                        ))}
                                      </select>
                                      {/* Custom name input when no match */}
                                      {!project.teamMembers.find(m => m.name === item.name) && (
                                        <input type="text" value={item.name}
                                          onChange={e => updateItem(category.id, item.id, 'name', e.target.value)}
                                          placeholder="Nome do item"
                                          className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none focus:bg-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors" />
                                      )}
                                    </div>
                                  ) : (
                                    <input type="text" value={item.name}
                                      onChange={e => updateItem(category.id, item.id, 'name', e.target.value)}
                                      placeholder="Nome do item"
                                      className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none focus:bg-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors" />
                                  )}
                                </td>
                                {/* Qty */}
                                <td className="px-4 py-2">
                                  <input type="number" value={item.quantity}
                                    onChange={e => updateItem(category.id, item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="w-16 bg-transparent text-sm text-gray-300 text-right focus:outline-none focus:bg-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
                                    min="0" />
                                </td>
                                {/* Days */}
                                <td className="px-4 py-2">
                                  <input type="number" value={item.days}
                                    onChange={e => updateItem(category.id, item.id, 'days', parseFloat(e.target.value) || 0)}
                                    className="w-16 bg-transparent text-sm text-gray-300 text-right focus:outline-none focus:bg-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
                                    min="0" />
                                </td>
                                {/* Unit price */}
                                <td className="px-4 py-2">
                                  <input type="number" value={item.unitPrice}
                                    onChange={e => updateItem(category.id, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="w-28 bg-transparent text-sm text-gray-300 text-right focus:outline-none focus:bg-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
                                    min="0" step="0.01" />
                                </td>
                                {/* Budgeted (read-only) */}
                                <td className="px-4 py-2 text-right">
                                  <span className={`text-sm font-bold whitespace-nowrap ${
                                    st === 'aprovado' ? 'text-emerald-400' :
                                    st === 'recusado' ? 'text-red-400 line-through' :
                                    'text-gray-300'
                                  }`}>
                                    {fmt(item.budgeted)}
                                  </span>
                                </td>
                                {/* Actual spent */}
                                <td className="px-4 py-2">
                                  <input type="number" value={item.actualSpent}
                                    onChange={e => updateItem(category.id, item.id, 'actualSpent', parseFloat(e.target.value) || 0)}
                                    className={`w-28 bg-transparent text-sm text-right focus:outline-none focus:bg-gray-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors font-bold ${
                                      isOver ? 'text-red-400' : 'text-emerald-400'
                                    }`}
                                    min="0" step="0.01" />
                                </td>
                                {/* Status toggle */}
                                <td className="px-4 py-2">
                                  <StatusToggle
                                    value={st}
                                    onChange={v => updateItemStatus(category.id, item.id, v)}
                                  />
                                </td>
                                {/* Delete */}
                                <td className="px-4 py-2">
                                  <button onClick={() => deleteItem(category.id, item.id)}
                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Remover item">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {category.items.length === 0 && (
                    <p className="px-5 py-4 text-sm text-gray-600">Nenhum item cadastrado.</p>
                  )}

                  <div className="px-4 py-3 border-t border-gray-800/40">
                    <button onClick={() => addItem(category.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Global totals footer (sticky) ── */}
      <div className="flex-shrink-0 bg-gray-950 border-t border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Totais da Planilha
          </span>

          <div className="flex items-center gap-6 flex-wrap">
            {/* Total orçado (all) */}
            <div className="text-right">
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Total Lançado</div>
              <div className="text-lg font-black text-gray-400 tabular-nums">{fmt(totalBudgeted)}</div>
            </div>

            <div className="w-px h-8 bg-gray-800" />

            {/* Total approved only */}
            <div className="text-right">
              <div className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest mb-0.5">Total Aprovado</div>
              <div className="text-xl font-black text-emerald-400 tabular-nums">{fmt(totalApproved)}</div>
            </div>

            <div className="w-px h-8 bg-gray-800" />

            {/* Total spent */}
            <div className="text-right">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Total Executado</div>
              <div className={`text-xl font-black tabular-nums ${
                totalSpent > totalApproved && totalApproved > 0 ? 'text-red-400' : 'text-gray-300'
              }`}>
                {fmt(totalSpent)}
              </div>
            </div>

            {totalSpent > totalApproved && totalApproved > 0 && (
              <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl">
                <span className="text-xs font-black text-red-400 uppercase tracking-wider">Acima do aprovado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
