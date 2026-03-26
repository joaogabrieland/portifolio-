'use client';

import React, { useEffect } from 'react';
import { X, PlayCircle } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Full embed URL (YouTube /embed/, Vimeo, Loom, etc.) */
  videoUrl: string;
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TutorialModal({
  isOpen,
  onClose,
  videoUrl,
  title = 'Tutorial',
}: TutorialModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Modal panel — stops click propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <PlayCircle className="w-4 h-4 text-violet-400" />
            {title}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            aria-label="Fechar tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 16:9 responsive iframe */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={videoUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tutorial button (shared style, importable) ───────────────────────────────

interface TutorialButtonProps {
  onClick: () => void;
  label?: string;
}

export function TutorialButton({ onClick, label = 'Assistir Tutorial' }: TutorialButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-400 transition-colors px-3 py-1.5 rounded-md border border-transparent hover:border-violet-500/30"
    >
      <PlayCircle className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
