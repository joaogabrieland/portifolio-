'use client';

import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementId: string;
}

export function PrintPreviewModal({ isOpen, onClose, elementId }: PrintPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const element = document.getElementById(elementId);
      if (element) {
        setPreviewHtml(element.innerHTML);
      }
    }
  }, [isOpen, elementId]);

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoom < 150) {
      setZoom(zoom + 10);
    } else if (direction === 'out' && zoom > 50) {
      setZoom(zoom - 10);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pré-visualizar PDF</h2>
            <p className="text-sm text-gray-500 mt-1">
              Zoom: {zoom}% | Confira como ficará quando exportado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3 bg-gray-50">
          <button
            onClick={() => handleZoom('out')}
            disabled={zoom <= 50}
            className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            disabled={zoom >= 150}
            className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-6">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: '210mm', // Largura A4
              minHeight: '297mm', // Altura A4
              backgroundColor: 'white',
            }}
            className="shadow-lg rounded-sm"
          >
            {previewHtml ? (
              <div
                className="w-full h-full p-6 bg-white print:block"
                dangerouslySetInnerHTML={{
                  __html: previewHtml,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                Carregando pré-visualização...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
