'use client';

import { use, useEffect, useState } from 'react';
import { Check, AlertCircle, MessageSquare, Film, Target, Sparkles } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropostaPaginaPublica({ params }: PageProps) {
  const resolvedParams = use(params);
  const proposalId = resolvedParams.id;
  const [approved, setApproved] = useState(false);
  const [showAlteracoes, setShowAlteracoes] = useState(false);
  const [alteracoes, setAlteracoes] = useState('');
  const [submitType, setSubmitType] = useState<'approval' | 'changes' | null>(null);

  useEffect(() => {
    // Evitar hydration mismatch - apenas aceder a localStorage no client
    const statusKey = `mock_proposal_status_${proposalId}`;
    const savedStatus = localStorage.getItem(statusKey);
    if (savedStatus) {
      setApproved(true);
      setSubmitType(savedStatus as 'approval' | 'changes');
    }
  }, [proposalId]);

  // Mock data — simula dados que viriam da BD
  const mockProposal = {
    id: proposalId,
    agencyName: 'Creator Flow Produções',
    clientName: 'Cliente Demo',
    projectTitle: 'Campanha de Verão 2026',
    objective: 'Branding / Awareness',
    deliverables: '3 vídeos de 60s para Instagram Reels, 1 vídeo institucional de 2 minutos',
    shootingDays: '3 dias',
    crewSize: 'Equipa média (4-6 pessoas)',
    equipment: 'Cinema camera, kit de luzes profissional, steadicam',
    postProduction: ['Edição avançada', 'Color grading', 'Motion graphics', 'Efeitos especiais'],
    revisions: '2 rodadas de revisão incluídas',
    extraCosts: [
      { item: 'Drone footage (1 dia)', value: 'R$ 1.500,00' },
      { item: 'Actor/Talent principal (3 dias)', value: 'R$ 2.000,00' },
    ],
    subtotal: 'R$ 12.000,00',
    serviceFee: 'R$ 2.400,00',
    total: 'R$ 14.400,00',
    paymentTerms: '50% na assinatura + 50% na entrega',
    timeline: '45 dias',
    startDate: '2026-04-15',
    endDate: '2026-05-30',
  };

  const handleApprove = () => {
    try {
      const dbStr = localStorage.getItem('mock_database_proposals') || '[]';
      const db = JSON.parse(dbStr);
      const proposal = db.find((p: any) => p.id === proposalId);
      if (proposal) {
        proposal.status = 'Aprovado';
        localStorage.setItem('mock_database_proposals', JSON.stringify(db));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('Erro ao atualizar status:', e);
    }
    setSubmitType('approval');
    setApproved(true);
  };

  const handleRequestChanges = () => {
    setShowAlteracoes(!showAlteracoes);
  };

  const handleSubmitChanges = () => {
    if (alteracoes.trim()) {
      console.log('Alterações solicitadas:', alteracoes);
      try {
        const dbStr = localStorage.getItem('mock_database_proposals') || '[]';
        const db = JSON.parse(dbStr);
        const proposal = db.find((p: any) => p.id === proposalId);
        if (proposal) {
          proposal.status = 'Alteração';
          localStorage.setItem('mock_database_proposals', JSON.stringify(db));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error('Erro ao atualizar status:', e);
      }
      setSubmitType('changes');
      setApproved(true);
      setShowAlteracoes(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <p className="text-xs tracking-widest uppercase text-white/40 mb-3">Proposta Comercial</p>
        <h1 className="text-5xl font-extrabold tracking-tight mb-3">{mockProposal.projectTitle}</h1>
        <p className="text-base text-white/60 mb-2">{mockProposal.agencyName}</p>
        <p className="text-sm text-white/40">ID: {proposalId}</p>
      </div>

      {/* Success notification */}
      {approved && (
        <div className="max-w-4xl mx-auto mb-8 p-6 rounded-2xl bg-emerald-900/20 border border-emerald-700/50 flex items-start gap-4">
          <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-300 mb-1">
              {submitType === 'changes' ? 'Solicitação de Alteração Enviada!' : 'Proposta Aprovada com Sucesso!'}
            </p>
            <p className="text-sm text-emerald-200/70">
              {submitType === 'changes'
                ? 'Sua solicitação foi recebida. Nossa equipa entrará em contacto em breve com as alterações propostas.'
                : 'A equipa foi notificada. Aguarde contacto para os próximos passos.'}
            </p>
          </div>
        </div>
      )}

      {/* Main proposal */}
      <div className="max-w-4xl mx-auto space-y-6 print:h-auto print:overflow-visible print:block">
        {/* ── Escopo do Projeto ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden print:block print:break-inside-avoid print:mb-8">
          <div className="border-b border-zinc-800 bg-zinc-800/50 px-6 py-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" /> Escopo do Projeto
            </p>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Objetivo</p>
              <p className="text-base text-white/90">{mockProposal.objective}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Entregáveis</p>
              <p className="text-base text-white/90">{mockProposal.deliverables}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Dias de Gravação</p>
                <p className="text-base text-white/90">{mockProposal.shootingDays}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Tamanho da Equipa</p>
                <p className="text-base text-white/90">{mockProposal.crewSize}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Setup de Produção ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden print:block print:break-inside-avoid print:mb-8">
          <div className="border-b border-zinc-800 bg-zinc-800/50 px-6 py-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Film className="w-4 h-4" /> Setup de Produção
            </p>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold mb-2">Equipamento</p>
              <p className="text-base text-white/90">{mockProposal.equipment}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold mb-2">Rodadas de Revisão</p>
              <p className="text-base text-white/90">{mockProposal.revisions}</p>
            </div>
          </div>
        </div>

        {/* ── Pós-Produção ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden print:block print:break-inside-avoid print:mb-8">
          <div className="border-b border-zinc-800 bg-zinc-800/50 px-6 py-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Pós-Produção
            </p>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-2">
              {mockProposal.postProduction.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Custos Extras ── */}
        {mockProposal.extraCosts.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden print:block print:break-inside-avoid print:mb-8">
            <div className="border-b border-zinc-800 bg-zinc-800/50 px-6 py-4">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Custos Extras</p>
            </div>
            <div className="px-6 py-6 space-y-3">
              {mockProposal.extraCosts.map((cost, idx) => (
                <div key={idx} className="flex items-center justify-between text-white/90">
                  <p className="text-base">{cost.item}</p>
                  <p className="font-semibold">{cost.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden print:block print:break-inside-avoid print:mb-8">
          <div className="border-b border-zinc-800 bg-zinc-800/50 px-6 py-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Timeline</p>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Início</p>
                <p className="text-base text-white/90">{new Date(mockProposal.startDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Conclusão</p>
                <p className="text-base text-white/90">{new Date(mockProposal.endDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Total</p>
                <p className="text-base text-white/90">{mockProposal.timeline}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold mb-1">Forma de Pagamento</p>
              <p className="text-base text-white/90">{mockProposal.paymentTerms}</p>
            </div>
          </div>
        </div>

        {/* ── Investimento Total (Grande card roxo) ── */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 shadow-lg shadow-indigo-900/30 print:block print:break-inside-avoid print:mb-8">
          <div className="px-8 py-12 text-center space-y-6">
            <div>
              <p className="text-white/80 text-sm uppercase font-semibold mb-2">Investimento</p>
              <p className="text-5xl font-extrabold text-white tracking-tight">{mockProposal.total}</p>
            </div>
            <div className="border-t border-white/20 pt-6 space-y-2 text-sm text-white/80">
              <div className="flex justify-between">
                <span>Subtotal (produção e pós)</span>
                <span>{mockProposal.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de serviço</span>
                <span>{mockProposal.serviceFee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        {!approved && (
          <div className="space-y-4">
            <button
              onClick={handleApprove}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-200 shadow-lg shadow-green-900/30 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Aceitar Proposta
            </button>

            <button
              onClick={handleRequestChanges}
              className="w-full py-4 px-6 rounded-xl border-2 border-white/[0.15] text-white font-bold text-lg hover:border-white/25 hover:bg-white/[0.05] transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Solicitar Alteração
            </button>
          </div>
        )}

        {/* ── Changes form ── */}
        {showAlteracoes && !approved && (
          <div className="p-6 bg-white/[0.03] border border-white/[0.07] rounded-2xl space-y-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Sugestões de Alteração</p>
                <p className="text-sm text-white/60">Descreva quais mudanças gostaria de sugerir na proposta.</p>
              </div>
            </div>

            <textarea
              value={alteracoes}
              onChange={(e) => setAlteracoes(e.target.value)}
              placeholder="Ex: Gostaria de aumentar o número de revisões para 3, ou ajustar a data de entrega..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] transition-all duration-200 resize-none"
              rows={5}
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmitChanges}
                disabled={!alteracoes.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Enviar Alterações
              </button>
              <button
                onClick={() => {
                  setShowAlteracoes(false);
                  setAlteracoes('');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-white/[0.15] text-white font-bold hover:bg-white/[0.05] transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 p-6 bg-white/[0.02] rounded-xl border border-white/[0.05] text-center text-sm text-white/50">
          <p>Dúvidas? Entre em contacto connosco ou aguarde o contacto direto da nossa equipa.</p>
        </div>
      </div>
    </div>
  );
}
