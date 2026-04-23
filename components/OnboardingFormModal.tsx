'use client';

import React, { useState } from 'react';
import { X, ClipboardList, Check, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Client } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

type Tab = 'new' | 'existing';

export default function OnboardingFormModal({ isOpen, onClose, clients }: Props) {
  const [tab, setTab] = useState<Tab>('new');
  const [clientName, setClientName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  function reset() {
    setClientName('');
    setSelectedClientId('');
    setGeneratedUrl('');
    setError('');
    setCopied(false);
    setLoading(false);
    setTab('new');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setGeneratedUrl('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('cf_token') : null;
    if (!token) { setError('Sessão expirada. Faça login novamente.'); setLoading(false); return; }

    const body = tab === 'new'
      ? { clientName: clientName.trim() }
      : { clientId: selectedClientId, clientName: clients.find(c => c.id === selectedClientId)?.brandName };

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao gerar link.'); setLoading(false); return; }
      setGeneratedUrl(`${window.location.origin}${data.url}`);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const canGenerate = tab === 'new' ? true : !!selectedClientId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <ClipboardList className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Formulário de Onboarding</h2>
              <p className="text-xs text-zinc-500">Gere um link para o cliente preencher</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Tabs */}
          {!generatedUrl && (
            <>
              <div className="flex p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                <button
                  onClick={() => setTab('new')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${tab === 'new' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Novo cliente
                </button>
                <button
                  onClick={() => setTab('existing')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${tab === 'existing' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Cliente existente
                </button>
              </div>

              {tab === 'new' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-300">Nome da marca <span className="text-zinc-600 font-normal">(opcional)</span></label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="Ex: Studio Laila, Renato Alves..."
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && canGenerate) handleGenerate(); }}
                  />
                  <p className="text-xs text-zinc-600">
                    O cliente pode informar o nome ao preencher. Um novo perfil será criado automaticamente no Hub.
                  </p>
                </div>
              )}

              {tab === 'existing' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-300">Selecionar cliente</label>
                  {clients.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">Nenhum cliente cadastrado ainda.</p>
                  ) : (
                    <select
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-violet-500 transition-colors"
                      value={selectedClientId}
                      onChange={e => setSelectedClientId(e.target.value)}
                    >
                      <option value="" className="text-zinc-600">Escolha um cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.brandName}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-zinc-600">
                    O formulário preenchido atualizará o perfil e o Cérebro da Marca deste cliente.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                {loading ? 'Gerando...' : 'Gerar Link'}
              </button>
            </>
          )}

          {/* Generated link */}
          {generatedUrl && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-zinc-400">Link gerado com sucesso!</p>
                <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <p className="flex-1 text-xs text-zinc-300 truncate font-mono">{generatedUrl}</p>
                  <button
                    onClick={copyLink}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl flex flex-col gap-1">
                <p className="text-xs font-bold text-violet-400">Como funciona</p>
                <p className="text-xs text-zinc-500">Envie este link para o cliente. Quando ele preencher o formulário, o perfil e o Cérebro da Marca serão criados automaticamente no Hub.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { reset(); }}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:border-zinc-600 transition-colors"
                >
                  Gerar outro link
                </button>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:border-violet-600 hover:text-violet-400 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visualizar
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
