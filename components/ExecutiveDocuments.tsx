'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Plus, X, FileText, LayoutGrid, Monitor, File,
  ExternalLink, Trash2, Upload, Link as LinkIcon,
  CloudUpload,
} from 'lucide-react';
import type { ExecutiveProject, ProjectDocument, DocumentType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

type DocTypeConfig = {
  label: string;
  sectionLabel: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  headerColor: string;
};

const DOC_TYPE_CONFIG: Record<DocumentType, DocTypeConfig> = {
  documento:    {
    label: 'Documento',
    sectionLabel: 'Documentos e Contratos',
    icon: FileText,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    headerColor: 'text-indigo-400',
  },
  planilha:     {
    label: 'Planilha',
    sectionLabel: 'Planilhas',
    icon: LayoutGrid,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    headerColor: 'text-emerald-400',
  },
  apresentacao: {
    label: 'Apresentação',
    sectionLabel: 'Apresentações e Moodboards',
    icon: Monitor,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    headerColor: 'text-violet-400',
  },
  outro:        {
    label: 'Outro',
    sectionLabel: 'Outros',
    icon: File,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    headerColor: 'text-amber-400',
  },
};

const DOC_TYPES: DocumentType[] = ['documento', 'planilha', 'apresentacao', 'outro'];

// ─── Add Document Modal ───────────────────────────────────────────────────────

type AddMode = 'link' | 'upload';

interface AddDocModalProps {
  onClose: () => void;
  onSave: (doc: ProjectDocument) => void;
  onFileUpload: (file: File) => void;
}

function AddDocModal({ onClose, onSave, onFileUpload }: AddDocModalProps) {
  const [mode,            setMode]            = useState<AddMode>('link');
  const [title,           setTitle]           = useState('');
  const [url,             setUrl]             = useState('');
  const [type,            setType]            = useState<DocumentType>('documento');
  const [tipoCustomizado, setTipoCustomizado] = useState('');
  const [dragging,        setDragging]        = useState(false);
  const [pickedFile,      setPickedFile]      = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldCls = "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors";
  const labelCls = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";

  // ── Link submit ──────────────────────────────────────────────────────────────
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSave({
      id: `doc_${Date.now()}`,
      title: title.trim(),
      url: url.trim(),
      type,
      addedAt: Date.now(),
      ...(type === 'outro' && tipoCustomizado.trim() ? { customLabel: tipoCustomizado.trim() } : {}),
    });
  };

  // ── File submit ──────────────────────────────────────────────────────────────
  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedFile) return;
    const docTitle = title.trim() || pickedFile.name.replace(/\.[^.]+$/, '');
    // Create a temporary local object URL so the card is viewable until backend is connected
    const localUrl = URL.createObjectURL(pickedFile);
    onFileUpload(pickedFile);
    onSave({
      id: `doc_${Date.now()}`,
      title: docTitle,
      url: localUrl,
      type,
      addedAt: Date.now(),
      fileName: pickedFile.name,
      ...(type === 'outro' && tipoCustomizado.trim() ? { customLabel: tipoCustomizado.trim() } : {}),
    });
  };

  // ── Drag & drop ──────────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setPickedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-base font-bold text-white">Adicionar Documento</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex gap-1 p-1 bg-gray-800 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'link' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Link URL
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'upload' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload de Arquivo
            </button>
          </div>
        </div>

        {/* ── LINK mode ── */}
        {mode === 'link' && (
          <form onSubmit={handleLinkSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className={labelCls}>Título</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Contrato de Imagem, Roteiro Final..." required className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>URL / Link</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://docs.google.com/..." required className={fieldCls} />
            </div>
            <TypeSelector value={type} onChange={setType} />
            {type === 'outro' && (
              <div>
                <label className={labelCls}>Nome da Categoria (opcional)</label>
                <input
                  type="text"
                  value={tipoCustomizado}
                  onChange={e => setTipoCustomizado(e.target.value)}
                  placeholder="Ex: Referências, Moodboard, Contrato..."
                  className={fieldCls}
                />
              </div>
            )}
            <ModalFooter onClose={onClose} label="Adicionar Link" />
          </form>
        )}

        {/* ── UPLOAD mode ── */}
        {mode === 'upload' && (
          <form onSubmit={handleFileSubmit} className="px-6 py-5 space-y-4">

            {/* Drag & drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-2xl border-2 border-dashed transition-all ${
                dragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : pickedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPickedFile(file);
                    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
                  }
                }}
              />
              {pickedFile ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{pickedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(pickedFile.size / 1024).toFixed(0)} KB · Clique para trocar
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CloudUpload className="w-8 h-8 text-gray-600" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-400">Arraste um arquivo ou clique</p>
                    <p className="text-xs text-gray-600 mt-0.5">PDF, DOCX, XLSX, PPT, imagens...</p>
                  </div>
                </>
              )}
            </div>

            {/* Optional title override */}
            <div>
              <label className={labelCls}>Título (opcional)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Deixe em branco para usar o nome do arquivo"
                className={fieldCls} />
            </div>

            <TypeSelector value={type} onChange={setType} />
            {type === 'outro' && (
              <div>
                <label className={labelCls}>Nome da Categoria (opcional)</label>
                <input
                  type="text"
                  value={tipoCustomizado}
                  onChange={e => setTipoCustomizado(e.target.value)}
                  placeholder="Ex: Referências, Moodboard, Contrato..."
                  className={fieldCls}
                />
              </div>
            )}

            <ModalFooter
              onClose={onClose}
              label="Salvar Arquivo"
              disabled={!pickedFile}
            />
          </form>
        )}
      </div>
    </div>
  );
}

// ── Shared sub-components for the modal ──────────────────────────────────────

function TypeSelector({ value, onChange }: { value: DocumentType; onChange: (v: DocumentType) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo</label>
      <div className="grid grid-cols-2 gap-2">
        {DOC_TYPES.map(dt => {
          const cfg  = DOC_TYPE_CONFIG[dt];
          const Icon = cfg.icon;
          return (
            <button key={dt} type="button" onClick={() => onChange(dt)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                value === dt
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                  : 'text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModalFooter({
  onClose, label, disabled = false,
}: {
  onClose: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <button type="button" onClick={onClose}
        className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
        Cancelar
      </button>
      <button type="submit" disabled={disabled}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors">
        {label}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  project: ExecutiveProject;
  onUpdate: (updated: ExecutiveProject) => void;
  isAdmin?: boolean;
}

export default function ExecutiveDocuments({ project, onUpdate, isAdmin = true }: Props) {
  const [showModal, setShowModal] = useState(false);
  const documents = project.documents ?? [];

  // ── File upload stub ──────────────────────────────────────────────────────
  const handleFileUpload = useCallback((file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', project.id);
    // TODO: Backend Dev - Conectar aqui o upload para o bucket S3/Supabase e retornar a URL
    console.log('[handleFileUpload] FormData pronto para upload:', file.name, file.size);
  }, [project.id]);

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

  // ── Group by type ─────────────────────────────────────────────────────────
  const grouped = DOC_TYPES.map(dt => ({
    type: dt,
    docs: documents.filter(d => d.type === dt),
    cfg:  DOC_TYPE_CONFIG[dt],
  })).filter(g => g.docs.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Documentos</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {documents.length === 0
                ? 'Links, contratos e arquivos do projeto.'
                : `${documents.length} arquivo${documents.length !== 1 ? 's' : ''} em ${grouped.length} categori${grouped.length !== 1 ? 'as' : 'a'}`}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        {/* Empty state */}
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
          /* ── Kanban sections by type ── */
          <div className="space-y-8">
            {grouped.map(({ type: dt, docs, cfg }) => {
              const Icon = cfg.icon;
              return (
                <section key={dt}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-lg ${cfg.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${cfg.headerColor}`}>
                      {cfg.sectionLabel}
                    </span>
                    <span className="text-[10px] text-gray-700 font-bold ml-1">
                      ({docs.length})
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {docs.map(doc => (
                      <DocCard
                        key={doc.id}
                        doc={doc}
                        cfg={cfg}
                        isAdmin={isAdmin}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <AddDocModal
          onClose={() => setShowModal(false)}
          onSave={handleAdd}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
}

// ─── Document Card ─────────────────────────────────────────────────────────────

function DocCard({
  doc, cfg, isAdmin, onDelete,
}: {
  doc: ProjectDocument;
  cfg: DocTypeConfig;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const Icon = cfg.icon;
  const isLocalFile = !!doc.fileName;

  return (
    <div className="group flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all">

      {/* Top row: icon + delete */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} border ${isLocalFile ? 'border-amber-500/20' : 'border-transparent'} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(doc.id)}
            className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Remover documento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Title area */}
      <div className="flex-1 mb-4">
        <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${cfg.headerColor}`}>
          {isLocalFile ? 'Arquivo local' : (doc.customLabel || cfg.label)}
        </div>
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{doc.title}</h3>
        {doc.fileName && (
          <p className="text-[10px] text-gray-600 mt-0.5 truncate">{doc.fileName}</p>
        )}
      </div>

      {/* Footer action */}
      {doc.url ? (
        <a
          href={doc.url}
          target={isLocalFile ? undefined : '_blank'}
          rel={isLocalFile ? undefined : 'noopener noreferrer'}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {isLocalFile ? 'Pré-visualizar' : 'Abrir link'}
        </a>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-gray-600">
          <CloudUpload className="w-3.5 h-3.5" />
          Aguardando upload
        </span>
      )}
    </div>
  );
}
