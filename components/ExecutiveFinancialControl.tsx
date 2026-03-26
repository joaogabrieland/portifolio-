'use client';

import React, { useState, useCallback } from 'react';
import { Plus, X, CheckCircle, Circle, Trash2, ExternalLink, DollarSign, Clock, TrendingUp } from 'lucide-react';
import type { ExecutiveProject, Transaction, TransactionStatus } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── New Transaction Modal ─────────────────────────────────────────────────────

interface NewTransactionModalProps {
  categoryNames: string[];
  teamMemberNames: string[];
  onClose: () => void;
  onSave: (t: Transaction) => void;
}

function NewTransactionModal({ categoryNames, teamMemberNames, onClose, onSave }: NewTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount]           = useState('');
  const [date, setDate]               = useState('');
  const [category, setCategory]       = useState(categoryNames[0] ?? '');
  const [payee, setPayee]             = useState('');
  const [status, setStatus]           = useState<TransactionStatus>('pending');
  const [receiptUrl, setReceiptUrl]   = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !date) return;
    onSave({
      id: `tx_${Date.now()}`,
      date,
      description: description.trim(),
      category,
      payee: payee.trim(),
      amount: parseFloat(amount) || 0,
      status,
      receiptUrl: receiptUrl.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white">Nova Despesa / Lançamento</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Cachê Cinegrafista, Aluguel Drone..."
              required
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Category + Payee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {categoryNames.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Fornecedor / Profissional
              </label>
              {teamMemberNames.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={teamMemberNames.includes(payee) ? payee : '__custom__'}
                    onChange={e => setPayee(e.target.value === '__custom__' ? '' : e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="__custom__">— Digitar manualmente —</option>
                    {teamMemberNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  {!teamMemberNames.includes(payee) && (
                    <input
                      type="text"
                      value={payee}
                      onChange={e => setPayee(e.target.value)}
                      placeholder="Nome ou empresa"
                      className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={payee}
                  onChange={e => setPayee(e.target.value)}
                  placeholder="Nome ou empresa"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Status Inicial
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === 'pending'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                    : 'text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Pendente
              </button>
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                    : 'text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Pago
              </button>
            </div>
          </div>

          {/* Receipt URL */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Link do Comprovante (opcional)
            </label>
            <input
              type="url"
              value={receiptUrl}
              onChange={e => setReceiptUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Registrar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props {
  project: ExecutiveProject;
  onUpdate: (updated: ExecutiveProject) => void;
  isAdmin?: boolean;
}

export default function ExecutiveFinancialControl({ project, onUpdate, isAdmin = true }: Props) {
  const [showModal, setShowModal] = useState(false);
  const transactions     = project.transactions ?? [];
  const categoryNames    = project.budgetCategories.map(c => c.name);
  const teamMemberNames  = project.teamMembers.map(m => m.name);

  // ── Aggregates ────────────────────────────────────────────────────────────────
  const totalPaid    = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const totalAll     = totalPaid + totalPending;

  // Helper: persist new transaction list + recalculate custoExecutado
  const persistTransactions = useCallback(
    (nextTx: Transaction[]) => {
      const custoExecutado = nextTx.reduce((s, t) => s + t.amount, 0);
      onUpdate({ ...project, transactions: nextTx, custoExecutado });
    },
    [project, onUpdate]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    (t: Transaction) => {
      persistTransactions([t, ...transactions]);
      setShowModal(false);
    },
    [transactions, persistTransactions]
  );

  const handleMarkPaid = useCallback(
    (id: string) => {
      persistTransactions(
        transactions.map(t => t.id === id ? { ...t, status: 'paid' as const } : t)
      );
    },
    [transactions, persistTransactions]
  );

  const handleDelete = useCallback(
    (id: string) => {
      persistTransactions(transactions.filter(t => t.id !== id));
    },
    [transactions, persistTransactions]
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Controle Financeiro</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Livro-caixa de despesas e pagamentos do projeto.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Total Pago
              </span>
            </div>
            <div className="text-xl font-black text-emerald-400 tabular-nums">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {transactions.filter(t => t.status === 'paid').length} lançamento{transactions.filter(t => t.status === 'paid').length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Total Pendente
              </span>
            </div>
            <div className="text-xl font-black text-amber-400 tabular-nums">
              {formatCurrency(totalPending)}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {transactions.filter(t => t.status === 'pending').length} lançamento{transactions.filter(t => t.status === 'pending').length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Total Lançado
              </span>
            </div>
            <div className="text-xl font-black text-white tabular-nums">
              {formatCurrency(totalAll)}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {transactions.length} lançamento{transactions.length !== 1 ? 's' : ''} no total
            </div>
          </div>
        </div>

        {/* Empty state */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mb-4">
              <DollarSign className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-400 mb-1">Nenhum lançamento</h3>
            <p className="text-sm text-gray-600">
              Registre despesas, recibos e pagamentos do projeto.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_2fr_1.2fr_1.5fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-gray-800">
              {['Data', 'Descrição', 'Categoria', 'Fornecedor', 'Valor', 'Status', ''].map(h => (
                <span key={h} className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {transactions.map((t, idx) => (
              <div
                key={t.id}
                className={`flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1.2fr_1.5fr_1fr_auto_auto] gap-2 lg:gap-4 items-start lg:items-center px-5 py-4 ${
                  idx < transactions.length - 1 ? 'border-b border-gray-800/50' : ''
                }`}
              >
                {/* Date */}
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(t.date)}
                </span>

                {/* Description */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{t.description}</p>
                  {t.receiptUrl && (
                    <a
                      href={t.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Comprovante
                    </a>
                  )}
                </div>

                {/* Category */}
                <span className="text-xs font-bold text-gray-500 truncate">
                  {t.category || '—'}
                </span>

                {/* Payee */}
                <span className="text-sm text-gray-400 truncate">
                  {t.payee || '—'}
                </span>

                {/* Amount */}
                <span className="text-sm font-black text-white whitespace-nowrap tabular-nums">
                  {formatCurrency(t.amount)}
                </span>

                {/* Status badge + mark-paid button */}
                <div className="flex items-center gap-2">
                  {t.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      <CheckCircle className="w-3 h-3" />
                      Pago
                    </span>
                  ) : isAdmin ? (
                    <button
                      onClick={() => handleMarkPaid(t.id)}
                      title="Marcar como pago"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all whitespace-nowrap"
                    >
                      <Circle className="w-3 h-3" />
                      Pendente
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                      <Circle className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                </div>

                {/* Delete */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover lançamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewTransactionModal
          categoryNames={categoryNames}
          teamMemberNames={teamMemberNames}
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
        />
      )}
    </div>
  );
}
