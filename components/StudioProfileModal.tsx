'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Clapperboard, Camera, Aperture, Mic, Lightbulb, Package } from 'lucide-react';
import { StudioProfile } from '@/types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface StudioProfileModalProps {
  isOpen: boolean;
  profile: StudioProfile;
  onSave: (profile: StudioProfile) => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Format options
// ─────────────────────────────────────────────
const FORMAT_OPTIONS: {
  value: StudioProfile['type'];
  label: string;
  desc: string;
  emoji: string;
}[] = [
  {
    value: 'mobile_creator',
    label: 'Mobile Creator',
    desc: 'Celular + acessórios compactos',
    emoji: '📱',
  },
  {
    value: 'solo_filmmaker',
    label: 'Solo Filmmaker',
    desc: 'Mirrorless / DSLR — produção independente',
    emoji: '🎥',
  },
  {
    value: 'produtora',
    label: 'Produtora Profissional',
    desc: 'Cinema / múltiplas câmeras / equipe',
    emoji: '🎬',
  },
];

// ─────────────────────────────────────────────
// Tag Input
// ─────────────────────────────────────────────
interface TagInputProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ icon, label, placeholder, tags, onChange }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const trimmed = raw.trim().replace(/,+$/, '').trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(value);
    } else if (e.key === 'Backspace' && !value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
        {icon}
        {label}
      </label>
      <div
        onClick={() => inputRef.current?.focus()}
        className="min-h-[52px] flex flex-wrap gap-1.5 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl cursor-text focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all"
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-violet-900/40 text-violet-300 rounded-lg border border-violet-800/50 select-none"
          >
            {tag}
            <button
              onClick={e => {
                e.stopPropagation();
                onChange(tags.filter((_, idx) => idx !== i));
              }}
              className="ml-0.5 text-violet-400 hover:text-violet-200 transition-colors"
              aria-label={`Remover ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => value.trim() && commit(value)}
          placeholder={tags.length === 0 ? placeholder : '+ Adicionar…'}
          className="flex-1 min-w-[130px] bg-transparent text-sm text-white placeholder:text-zinc-400 focus:outline-none py-0.5 px-1"
        />
      </div>
      <p className="text-[10px] text-zinc-400 mt-1.5">
        <kbd className="px-1 py-0.5 bg-zinc-800 rounded font-mono text-zinc-400">Enter</kbd>
        {' '}ou vírgula para adicionar · Backspace para remover a última tag
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const StudioProfileModal: React.FC<StudioProfileModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<StudioProfile>(profile);
  const [activeTab, setActiveTab] = useState<'identity' | 'inventory'>('identity');

  // Sync draft whenever profile changes from outside (e.g. load from localStorage)
  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  if (!isOpen) return null;

  const updateEquipment = (key: keyof StudioProfile['equipment'], tags: string[]) =>
    setDraft(p => ({ ...p, equipment: { ...p.equipment, [key]: tags } }));

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const inputCls =
    'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-900/20 text-violet-400 rounded-xl border border-violet-900/40">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Meu Estúdio
                </h2>
                <p className="text-xs text-zinc-400">Perfil & Inventário de Equipamentos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-zinc-800/80 rounded-xl">
            {(['identity', 'inventory'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-zinc-900 text-violet-400 shadow-sm'
                    : 'text-zinc-500 hover:hover:text-zinc-300'
                }`}
              >
                {tab === 'identity' ? '🎬 Identidade' : '🎛️ Inventário'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Tab A: Identidade ── */}
          {activeTab === 'identity' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <label htmlFor="studio-name-input" className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
                  Nome da Produtora / Creator
                </label>
                <input
                  id="studio-name-input"
                  aria-label="Nome da produtora ou creator"
                  autoFocus
                  type="text"
                  value={draft.name}
                  onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Studio Alves, Ricardo Films, @ricardocreator"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">
                  Formato Principal de Produção
                </label>
                <div className="space-y-2">
                  {FORMAT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDraft(p => ({ ...p, type: opt.value }))}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        draft.type === opt.value
                          ? 'border-violet-500 bg-violet-900/20'
                          : 'border-zinc-800 hover:border-violet-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          draft.type === opt.value
                            ? 'border-violet-600 bg-violet-600'
                            : 'border-zinc-600'
                        }`}
                      >
                        {draft.type === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                      <div>
                        <p className="font-bold text-sm text-white">{opt.label}</p>
                        <p className="text-xs text-zinc-400">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab B: Inventário ── */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cadastre seu kit de equipamentos. Você pode remover um item quando vendê-lo.
              </p>

              <TagInput
                icon={<Camera className="w-3.5 h-3.5" />}
                label="Câmeras"
                placeholder="Ex: Sony FX3, Canon R5, iPhone 15 Pro…"
                tags={draft.equipment.cameras}
                onChange={tags => updateEquipment('cameras', tags)}
              />

              <TagInput
                icon={<Aperture className="w-3.5 h-3.5" />}
                label="Lentes"
                placeholder="Ex: Sony 24-70mm f/2.8, Sigma 35mm f/1.4…"
                tags={draft.equipment.lenses}
                onChange={tags => updateEquipment('lenses', tags)}
              />

              <TagInput
                icon={<Mic className="w-3.5 h-3.5" />}
                label="Áudio"
                placeholder="Ex: Rode VideoMic Pro, Tascam DR-10L…"
                tags={draft.equipment.audio}
                onChange={tags => updateEquipment('audio', tags)}
              />

              <TagInput
                icon={<Lightbulb className="w-3.5 h-3.5" />}
                label="Iluminação"
                placeholder="Ex: Amaran 100X, Nanlite FS-300, Godox SL200…"
                tags={draft.equipment.lighting}
                onChange={tags => updateEquipment('lighting', tags)}
              />

              <TagInput
                icon={<Package className="w-3.5 h-3.5" />}
                label="Outros"
                placeholder="Ex: Drone DJI Mini 3, Gimbal DJI RS4, Teleprompter…"
                tags={draft.equipment.others ?? []}
                onChange={tags => updateEquipment('others', tags)}
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 flex gap-3 border-t border-zinc-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all"
          >
            Salvar Estúdio
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudioProfileModal;
