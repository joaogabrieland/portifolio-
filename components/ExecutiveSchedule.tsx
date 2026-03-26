'use client';

import React, { useState, useCallback } from 'react';
import { Plus, X, Calendar, Check, Flag, ExternalLink, AlignLeft } from 'lucide-react';
import type { ExecutiveProject, Milestone, MilestoneType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES: MilestoneType[] = ['pre_producao', 'captacao', 'pos'];

const PHASE_CONFIG: Record<
  MilestoneType,
  { label: string; color: string; bg: string; border: string }
> = {
  pre_producao: {
    label: 'Pré-Produção',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  captacao: {
    label: 'Captação',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  pos: {
    label: 'Pós-Produção',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [, m, d] = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${d} ${months[parseInt(m) - 1]}`;
}

// ─── New Milestone Modal ──────────────────────────────────────────────────────

interface NewMilestoneModalProps {
  onClose: () => void;
  onSave: (m: Milestone) => void;
}

function NewMilestoneModal({ onClose, onSave }: NewMilestoneModalProps) {
  const [title,     setTitle]     = useState('');
  const [date,      setDate]      = useState('');
  const [type,      setType]      = useState<MilestoneType>('pre_producao');
  const [descricao, setDescricao] = useState('');
  const [linkUtil,  setLinkUtil]  = useState('');

  const fieldCls = "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors";
  const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({
      id: `ms_${Date.now()}`,
      title: title.trim(),
      date,
      type,
      done: false,
      descricao: descricao.trim() || undefined,
      linkUtil:  linkUtil.trim()  || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-base font-bold text-white">Novo Marco</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className={labelCls}>Título do Marco</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Visita Técnica, Diária 1, Entrega de Corte..."
              required className={fieldCls} />
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              required className={fieldCls} />
          </div>

          {/* Phase */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fase</label>
            <div className="grid grid-cols-3 gap-2">
              {PHASES.map(ph => {
                const cfg = PHASE_CONFIG[ph];
                return (
                  <button key={ph} type="button" onClick={() => setType(ph)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === ph
                        ? `${cfg.color} ${cfg.bg} ${cfg.border}`
                        : 'text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                    }`}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descricao */}
          <div>
            <label className={labelCls}>Detalhes / Briefing da Tarefa</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o objetivo, entregas esperadas, responsáveis..."
              rows={3}
              className={fieldCls + ' resize-none leading-relaxed'}
            />
          </div>

          {/* Link util */}
          <div>
            <label className={labelCls}>Link Útil (Google Drive, Notion, Milanote...)</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input type="url" value={linkUtil} onChange={e => setLinkUtil(e.target.value)}
                placeholder="https://..." className={fieldCls + ' pl-9'} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={onClose}
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
              Adicionar Marco
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  project: ExecutiveProject;
  onUpdate: (updated: ExecutiveProject) => void;
  isAdmin?: boolean;
}

export default function ExecutiveSchedule({ project, onUpdate, isAdmin = true }: Props) {
  const [showModal, setShowModal] = useState(false);
  const milestones = project.milestones ?? [];

  const handleAddMilestone = useCallback(
    (m: Milestone) => {
      const sorted = [...milestones, m].sort((a, b) => a.date.localeCompare(b.date));
      onUpdate({ ...project, milestones: sorted });
      setShowModal(false);
    },
    [project, milestones, onUpdate]
  );

  const handleToggleDone = useCallback(
    (id: string) => {
      onUpdate({
        ...project,
        milestones: milestones.map(m => (m.id === id ? { ...m, done: !m.done } : m)),
      });
    },
    [project, milestones, onUpdate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onUpdate({ ...project, milestones: milestones.filter(m => m.id !== id) });
    },
    [project, milestones, onUpdate]
  );

  const totalDone = milestones.filter(m => m.done).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Cronograma</h2>
            {milestones.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {totalDone}/{milestones.length} marcos concluídos
              </p>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Marco
          </button>
        </div>

        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-400 mb-1">Cronograma vazio</h3>
            <p className="text-sm text-gray-600">
              Adicione marcos para visualizar a timeline do projeto.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {PHASES.map(phase => {
              const phaseMilestones = milestones.filter(m => m.type === phase);
              if (phaseMilestones.length === 0) return null;
              const cfg = PHASE_CONFIG[phase];

              return (
                <div key={phase}>
                  {/* Phase label */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border mb-4 ${cfg.color} ${cfg.bg} ${cfg.border}`}
                  >
                    <Flag className="w-3 h-3" />
                    {cfg.label}
                  </div>

                  {/* Vertical timeline */}
                  <div className="relative pl-6 space-y-3">
                    {/* Connector line */}
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-800" />

                    {phaseMilestones.map(m => (
                      <div key={m.id} className="relative flex items-start gap-3">
                        {/* Timeline dot (toggle button) */}
                        <button
                          onClick={() => handleToggleDone(m.id)}
                          title={m.done ? 'Marcar como pendente' : 'Marcar como concluído'}
                          className={`absolute -left-[14px] mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            m.done
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'bg-gray-950 border-gray-600 hover:border-indigo-400'
                          }`}
                        >
                          {m.done && <Check className="w-2.5 h-2.5 text-white" />}
                        </button>

                        {/* Card */}
                        <div
                          className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                            m.done
                              ? 'bg-gray-900/30 border-gray-800/30 opacity-55'
                              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          {/* Top row: title + delete */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-bold leading-snug ${
                                m.done ? 'line-through text-gray-500' : 'text-white'
                              }`}>
                                {m.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{formatDate(m.date)}</p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(m.id)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                                title="Remover marco"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Descricao */}
                          {m.descricao && (
                            <div className="flex items-start gap-1.5 mt-2.5 pt-2.5 border-t border-gray-800/60">
                              <AlignLeft className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-500 leading-relaxed">{m.descricao}</p>
                            </div>
                          )}

                          {/* Link util */}
                          {m.linkUtil && (
                            <div className="mt-2">
                              <a
                                href={m.linkUtil}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Abrir link
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <NewMilestoneModal onClose={() => setShowModal(false)} onSave={handleAddMilestone} />
      )}
    </div>
  );
}
