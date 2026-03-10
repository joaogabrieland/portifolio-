'use client';

import React, { useState, useCallback } from 'react';
import { Plus, X, FileText, LayoutGrid, Monitor, File, ExternalLink, Trash2, Scroll, Loader2, Copy, Check, Download } from 'lucide-react';
import type { ExecutiveProject, ProjectDocument, DocumentType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

type DocTypeConfig = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const DOC_TYPE_CONFIG: Record<DocumentType, DocTypeConfig> = {
  documento:    { label: 'Documento',    icon: FileText   },
  planilha:     { label: 'Planilha',     icon: LayoutGrid },
  apresentacao: { label: 'Apresentação', icon: Monitor    },
  outro:        { label: 'Outro',        icon: File       },
};

const DOC_TYPES: DocumentType[] = ['documento', 'planilha', 'apresentacao', 'outro'];

// ─── Add Document Modal ───────────────────────────────────────────────────────

interface AddDocModalProps {
  onClose: () => void;
  onSave: (doc: ProjectDocument) => void;
}

function AddDocModal({ onClose, onSave }: AddDocModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl]     = useState('');
  const [type, setType]   = useState<DocumentType>('documento');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSave({
      id: `doc_${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      type,
      addedAt: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white">Adicionar Link / Documento</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Contrato de Imagem, Roteiro Final..."
              required
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              URL / Link
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              required
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map(dt => {
                const cfg  = DOC_TYPE_CONFIG[dt];
                const Icon = cfg.icon;
                return (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setType(dt)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === dt
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                        : 'text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
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
              Adicionar
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
}

// ─── Contract Generation Modal ────────────────────────────────────────────────

function ContractModal({ onClose }: { onClose: () => void }) {
  const [clientName, setClientName] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [value, setValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('50% na assinatura, 50% na entrega');
  const [contract, setContract] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!clientName.trim() || !projectScope.trim()) { setError('Preencha o nome do cliente e o escopo.'); return; }
    setLoading(true); setError(''); setContract('');
    try {
      const token = localStorage.getItem('cf_token') || '';
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientName, projectScope, value, deadline, paymentTerms }),
      });
      if (!res.ok) throw new Error('Falha ao gerar contrato');
      const data = await res.json();
      setContract(data.contract);
    } catch { setError('Erro ao gerar contrato. Tente novamente.'); }
    setLoading(false);
  };

  const handleCopy = () => { navigator.clipboard.writeText(contract); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const blob = new Blob([contract], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `Contrato_${clientName.replace(/\s+/g, '_')}.txt`; a.click();
  };

  const INPUT = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-500';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scroll className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Gerar Contrato</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!contract ? (
            <>
              <div><label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Nome do Cliente *</label><input className={INPUT} placeholder="Ex: Studio Criativo Ltda" value={clientName} onChange={e => setClientName(e.target.value)} /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Escopo do Projeto *</label><textarea className={`${INPUT} min-h-[80px]`} placeholder="Descreva os serviços: produção de 4 vídeos, edição, etc." value={projectScope} onChange={e => setProjectScope(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Valor (R$)</label><input className={INPUT} placeholder="Ex: R$ 5.000,00" value={value} onChange={e => setValue(e.target.value)} /></div>
                <div><label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Prazo de Entrega</label><input className={INPUT} placeholder="Ex: 30 dias" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
              </div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Condições de Pagamento</label><input className={INPUT} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} /></div>
              {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
              <button onClick={generate} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando contrato...</> : <><Scroll className="w-4 h-4" /> Gerar Contrato com IA</>}
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-2">
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </button>
                <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                  <Download className="w-3.5 h-3.5" /> Baixar .txt
                </button>
                <button onClick={() => setContract('')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-zinc-700 text-zinc-400 hover:text-white transition-colors ml-auto">
                  Gerar Novo
                </button>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 max-h-[50vh] overflow-y-auto">
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">{contract}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExecutiveDocuments({ project, onUpdate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const documents = project.documents ?? [];

  const handleAdd = useCallback(
    (doc: ProjectDocument) => {
      onUpdate({ ...project, documents: [...documents, doc] });
      setShowModal(false);
    },
    [project, documents, onUpdate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onUpdate({ ...project, documents: documents.filter(d => d.id !== id) });
    },
    [project, documents, onUpdate]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Documentos</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Links, contratos e referências do projeto.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowContractModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Scroll className="w-4 h-4" />
              Gerar Contrato
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Link
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-400 mb-1">Nenhum documento</h3>
            <p className="text-sm text-gray-600">
              Adicione links de contratos, roteiros e apresentações.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => {
              const cfg  = DOC_TYPE_CONFIG[doc.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={doc.id}
                  className="group flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all"
                >
                  {/* Icon + delete */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="flex-1 mb-4">
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">
                      {cfg.label}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{doc.title}</h3>
                  </div>

                  {/* Open link */}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir link
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AddDocModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
      {showContractModal && (
        <ContractModal onClose={() => setShowContractModal(false)} />
      )}
    </div>
  );
}
