'use client';

import { Download, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface PDFDownloadButtonProps {
  proposalId: string;
  projectTitle?: string;
}

export function PDFDownloadButton({
  proposalId,
  projectTitle = 'Proposta',
}: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          projectTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao gerar PDF');
      }

      // Obter o blob do PDF
      const blob = await response.blob();

      // Criar URL e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao gerar o PDF. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-900/30"
      >
        <Download className="w-4 h-4" />
        {isLoading ? 'Gerando PDF...' : 'Baixar como PDF'}
      </button>

      {error && (
        <div className="mt-3 p-4 rounded-lg bg-red-900/20 border border-red-700/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Erro ao gerar PDF</p>
            <p className="text-xs text-red-200/70 mt-1">{error}</p>
          </div>
        </div>
      )}
    </>
  );
}
