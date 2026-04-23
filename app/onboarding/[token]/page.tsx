'use client';

import React, { useState, useEffect, useRef, use } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, unknown>;

interface Question {
  id: string;
  num: number;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  options?: string[];
  hasOther?: boolean;
  max?: number;
}

interface Block {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  questions: Question[];
}

// ─── Form Data ────────────────────────────────────────────────────────────────

const BLOCKS: Block[] = [
  {
    id: 'b1',
    eyebrow: 'Bloco 1 de 6',
    title: 'Identidade e Posicionamento',
    subtitle: 'Quem é você e o que você representa no mercado.',
    questions: [
      { id: 'q1', num: 1, label: 'Como você se apresenta profissionalmente hoje?', type: 'textarea', placeholder: 'Ex: Sou consultor de marketing digital especializado em e-commerce...', required: true },
      { id: 'q2', num: 2, label: 'Em uma frase, qual é o seu diferencial? O que só você entrega?', type: 'text', placeholder: 'Ex: Dobro o faturamento de e-commerces em 90 dias sem aumentar tráfego.', required: true },
      { id: 'q3', num: 3, label: 'Qual dessas opções melhor descreve seu perfil?', type: 'radio', required: true, options: ['Especialista técnico que quer ser reconhecido no mercado', 'Empreendedor/founder que quer atrair clientes e parceiros', 'Profissional liberal construindo autoridade na sua área', 'Criador de conteúdo querendo monetizar conhecimento'], hasOther: true },
      { id: 'q4', num: 4, label: 'Você já tem algum posicionamento definido hoje?', type: 'radio', required: true, options: ['Sim, está bem definido', 'Mais ou menos — tenho uma ideia mas nunca formalizei', 'Não, estou começando do zero'] },
    ],
  },
  {
    id: 'b2',
    eyebrow: 'Bloco 2 de 6',
    title: 'Público-alvo',
    subtitle: 'Com quem você quer falar e onde essa pessoa está.',
    questions: [
      { id: 'q5', num: 5, label: 'Quem é o seu cliente ideal? Descreva o perfil.', type: 'textarea', placeholder: 'Cargo, setor, faixa de faturamento, dores principais...', required: true },
      { id: 'q6', num: 6, label: 'Qual a faixa etária predominante do seu público?', type: 'radio', options: ['18–25 anos', '25–35 anos', '35–50 anos', '50+ anos', 'Misto'] },
      { id: 'q7', num: 7, label: 'Onde seu público passa mais tempo consumindo conteúdo?', type: 'checkbox', options: ['Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Twitter/X', 'Podcasts'] },
      { id: 'q8', num: 8, label: 'Qual a maior dor/problema que seu cliente ideal tem — e que você resolve?', type: 'textarea', placeholder: 'Seja específico — qual o principal problema que você soluciona?', required: true },
    ],
  },
  {
    id: 'b3',
    eyebrow: 'Bloco 3 de 6',
    title: 'Proposta de Valor e Serviços',
    subtitle: 'O que você vende e como seus clientes chegam até você.',
    questions: [
      { id: 'q9', num: 9, label: 'O que você vende? Liste seus principais serviços ou produtos.', type: 'textarea', placeholder: 'Ex: Mentoria individual, consultoria empresarial, curso online...', required: true },
      { id: 'q10', num: 10, label: 'Qual o ticket médio do seu produto/serviço principal?', type: 'radio', options: ['Até R$ 500', 'R$ 500 – R$ 2.000', 'R$ 2.000 – R$ 10.000', 'R$ 10.000 – R$ 50.000', 'Acima de R$ 50.000'] },
      { id: 'q11', num: 11, label: 'Como seus clientes chegam até você hoje?', type: 'checkbox', options: ['Indicação', 'Instagram', 'LinkedIn', 'Google / SEO', 'Eventos e palestras', 'Anúncios pagos', 'Ainda não tenho clientes recorrentes'] },
      { id: 'q12', num: 12, label: 'O que te impede de crescer mais rápido hoje?', type: 'checkbox', options: ['Falta de presença online / autoridade digital', 'Não sei me comunicar bem com o meu público', 'Falta de tempo para produzir conteúdo', 'Não sei o que postar / falta de estratégia', 'Minha marca visual não transmite o que eu quero'], hasOther: true },
    ],
  },
  {
    id: 'b4',
    eyebrow: 'Bloco 4 de 6',
    title: 'Conteúdo e Presença Digital',
    subtitle: 'O que já existe e o que precisa ser construído.',
    questions: [
      { id: 'q13', num: 13, label: 'Qual é sua situação atual nas redes sociais?', type: 'radio', options: ['Nunca produzi conteúdo de forma consistente', 'Já produzo mas sem estratégia definida', 'Tenho uma base construída e quero escalar', 'Já tive presença forte mas parei'] },
      { id: 'q14', num: 14, label: 'Você já tem algum tipo de conteúdo que performou bem? Se sim, qual?', type: 'textarea', placeholder: 'Pode deixar em branco se não souber ou não tiver histórico ainda.', optional: true },
      { id: 'q15', num: 15, label: 'Que tipo de conteúdo você se sente mais confortável produzindo?', type: 'checkbox', options: ['Vídeo falando para câmera', 'Vídeo nos bastidores / vlog', 'Texto (posts, artigos)', 'Carrossel / conteúdo visual', 'Áudio / podcast', 'Ainda não sei — estou aberto a testar'] },
      { id: 'q16', num: 16, label: 'Você tem algum criador de conteúdo ou marca que admira e serve de referência?', type: 'textarea', placeholder: 'Pode citar mais de um. Ex: Thiago Nigro, Ali Abdaal, Notion...', optional: true },
    ],
  },
  {
    id: 'b5',
    eyebrow: 'Bloco 5 de 6',
    title: 'Tom, Voz e Personalidade',
    subtitle: 'Como você comunica e como quer ser percebido.',
    questions: [
      { id: 'q17', num: 17, label: 'Como você descreveria seu jeito de se comunicar? (escolha até 3)', type: 'checkbox', max: 3, options: ['Direto e objetivo', 'Didático e explicativo', 'Provocativo e opinativo', 'Inspirador e motivador', 'Técnico e aprofundado', 'Leve e bem-humorado', 'Sério e formal'] },
      { id: 'q18', num: 18, label: 'Como você NÃO quer ser percebido?', type: 'textarea', placeholder: 'Ex: Não quero parecer arrogante ou inacessível...', optional: true },
      { id: 'q19', num: 19, label: 'Quais adjetivos você quer que as pessoas usem para te descrever após 30 dias te seguindo?', type: 'text', placeholder: 'Ex: Confiável, prático, referência, inspirador, direto...', optional: true },
    ],
  },
  {
    id: 'b6',
    eyebrow: 'Bloco 6 de 6',
    title: 'Objetivos e Visão',
    subtitle: 'Para onde você quer ir nos próximos meses.',
    questions: [
      { id: 'q20', num: 20, label: 'Qual é seu objetivo principal com a presença digital nos próximos 6 meses? (escolha até 2)', type: 'checkbox', max: 2, required: true, options: ['Atrair clientes de forma orgânica', 'Construir autoridade na minha área', 'Lançar um produto digital (curso, mentoria)', 'Conseguir convites para palestras e eventos', 'Crescer seguidores e alcance', 'Monetizar audiência existente'] },
      { id: 'q21', num: 21, label: 'Em 2 anos, onde você quer estar profissionalmente?', type: 'textarea', placeholder: 'Seja específico. Ex: Referência nacional em finanças para MEIs, com 100k seguidores e curso próprio...', optional: true },
      { id: 'q22', num: 22, label: 'Tem algo importante sobre você, sua história ou seu trabalho que ainda não perguntamos?', type: 'textarea', placeholder: 'Qualquer detalhe relevante para construirmos sua estratégia de conteúdo...', optional: true },
    ],
  },
];

const TOTAL_BLOCKS = BLOCKS.length;

// ─── Sub-components ───────────────────────────────────────────────────────────

function RadioChoice({ option, selected, onSelect }: { option: string; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-violet-500 bg-violet-500/10 text-white'
          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? 'border-violet-500' : 'border-zinc-600'}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-violet-500" />}
      </div>
      <span className="text-sm">{option}</span>
    </div>
  );
}

function CheckChoice({ option, selected, onToggle, disabled }: { option: string; selected: boolean; onToggle: () => void; disabled: boolean }) {
  return (
    <div
      onClick={!disabled || selected ? onToggle : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-violet-500 bg-violet-500/10 text-white'
          : disabled
          ? 'border-zinc-800 bg-zinc-900/30 text-zinc-600 cursor-not-allowed opacity-50'
          : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      }`}
    >
      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? 'border-violet-500 bg-violet-500' : 'border-zinc-600'}`}>
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm">{option}</span>
    </div>
  );
}

function QuestionField({ q, answers, onChange }: { q: Question; answers: Answers; onChange: (id: string, val: unknown) => void }) {
  const val = answers[q.id] || (q.type === 'checkbox' ? [] : '');
  const otherVal = (answers[`${q.id}_other`] as string) || '';
  const checkboxFull = !!(q.max && ((answers[q.id] as string[]) || []).length >= q.max);

  function toggleCheck(opt: string) {
    const cur = (answers[q.id] as string[]) || [];
    const next = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt];
    onChange(q.id, next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-bold text-violet-400 mt-0.5 flex-shrink-0 w-6">{q.num}.</span>
        <div className="flex-1">
          <span className="text-sm font-semibold text-zinc-100">{q.label}</span>
          {q.optional && <span className="ml-2 text-xs text-zinc-600 font-normal">Opcional</span>}
        </div>
      </div>

      <div className="pl-8">
        {q.type === 'text' && (
          <input
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            placeholder={q.placeholder}
            value={val as string}
            onChange={e => onChange(q.id, e.target.value)}
          />
        )}

        {q.type === 'textarea' && (
          <textarea
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none min-h-[100px]"
            placeholder={q.placeholder}
            value={val as string}
            onChange={e => onChange(q.id, e.target.value)}
          />
        )}

        {q.type === 'radio' && (
          <div className="flex flex-col gap-2">
            {q.options!.map(opt => (
              <RadioChoice key={opt} option={opt} selected={val === opt} onSelect={() => onChange(q.id, opt)} />
            ))}
            {q.hasOther && (
              <RadioChoice option="Outro" selected={val === 'outro'} onSelect={() => onChange(q.id, 'outro')} />
            )}
            {q.hasOther && val === 'outro' && (
              <input
                className="w-full bg-zinc-900 border border-violet-500/50 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors mt-1"
                placeholder="Descreva sua resposta..."
                value={otherVal}
                onChange={e => onChange(`${q.id}_other`, e.target.value)}
              />
            )}
          </div>
        )}

        {q.type === 'checkbox' && (
          <div className="flex flex-col gap-2">
            {q.options!.map(opt => (
              <CheckChoice
                key={opt}
                option={opt}
                selected={((val as string[]) || []).includes(opt)}
                onToggle={() => toggleCheck(opt)}
                disabled={checkboxFull && !((val as string[]) || []).includes(opt)}
              />
            ))}
            {q.hasOther && (
              <CheckChoice
                option="Outro"
                selected={((val as string[]) || []).includes('Outro')}
                onToggle={() => toggleCheck('Outro')}
                disabled={checkboxFull && !((val as string[]) || []).includes('Outro')}
              />
            )}
            {q.hasOther && ((val as string[]) || []).includes('Outro') && (
              <input
                className="w-full bg-zinc-900 border border-violet-500/50 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors mt-1"
                placeholder="Descreva sua resposta..."
                value={otherVal}
                onChange={e => onChange(`${q.id}_other`, e.target.value)}
              />
            )}
            {q.max && (
              <p className="text-xs text-zinc-600 mt-1">Selecione até {q.max} opções</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryView({ answers, brandName }: { answers: Answers; brandName: string }) {
  function display(q: Question): string | null {
    const v = answers[q.id];
    if (!v || (Array.isArray(v) && v.length === 0)) return null;
    if (Array.isArray(v)) return (v as string[]).join(', ');
    if (v === 'outro') return (answers[`${q.id}_other`] as string) || 'Outro';
    return String(v);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
        <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Nome da Marca</p>
        <p className="text-sm text-zinc-100">{brandName || '(não informado)'}</p>
      </div>
      {BLOCKS.map(block => (
        <div key={block.id} className="flex flex-col gap-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{block.title}</p>
          {block.questions.map(q => {
            const d = display(q);
            return (
              <div key={q.id} className="flex flex-col gap-1 p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                <p className="text-xs text-zinc-500"><span className="text-zinc-600 font-bold">P{q.num}.</span> {q.label}</p>
                {d
                  ? <p className="text-sm text-zinc-200">{d}</p>
                  : <p className="text-xs text-zinc-600 italic">Não respondido</p>
                }
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [status, setStatus] = useState<'loading' | 'ready' | 'expired' | 'completed' | 'not_found'>('loading');
  const [producerName, setProducerName] = useState('');
  const [prefillClientName, setPrefillClientName] = useState('');

  const [blockIdx, setBlockIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [brandName, setBrandName] = useState('');
  const [phase, setPhase] = useState<'name' | 'form' | 'summary' | 'done'>('name');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/onboarding/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('not_found'); return; }
        if (data.status === 'completed') { setStatus('completed'); return; }
        if (data.expired) { setStatus('expired'); return; }
        setProducerName(data.producerName || '');
        setPrefillClientName(data.clientName || '');
        if (data.clientName) setBrandName(data.clientName);
        setStatus('ready');
      })
      .catch(() => setStatus('not_found'));
  }, [token]);

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleChange(id: string, val: unknown) {
    setAnswers(prev => ({ ...prev, [id]: val }));
  }

  function canAdvance(): boolean {
    if (phase === 'name') return brandName.trim().length > 0;
    if (phase === 'summary') return true;
    const block = BLOCKS[blockIdx];
    return block.questions.every(q => {
      if (!q.required) return true;
      const v = answers[q.id];
      if (!v) return false;
      if (Array.isArray(v)) return v.length > 0;
      return String(v).trim().length > 0;
    });
  }

  function goNext() {
    if (phase === 'name') { setPhase('form'); scrollTop(); return; }
    if (blockIdx < TOTAL_BLOCKS - 1) { setBlockIdx(i => i + 1); scrollTop(); }
    else { setPhase('summary'); scrollTop(); }
  }

  function goBack() {
    if (phase === 'summary') { setPhase('form'); scrollTop(); return; }
    if (phase === 'form' && blockIdx === 0) { setPhase('name'); scrollTop(); return; }
    if (phase === 'form') { setBlockIdx(i => i - 1); scrollTop(); }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`/api/onboarding/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, brandName: brandName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || 'Erro ao enviar. Tente novamente.'); setSubmitting(false); return; }
      setPhase('done');
      scrollTop();
    } catch {
      setSubmitError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  }

  const progress = phase === 'name' ? 0
    : phase === 'summary' || phase === 'done' ? 100
    : Math.round(((blockIdx + 1) / TOTAL_BLOCKS) * 100);

  const stepLabel = phase === 'name' ? 'Início'
    : phase === 'summary' ? 'Revisão'
    : phase === 'done' ? 'Concluído'
    : `Bloco ${blockIdx + 1} de ${TOTAL_BLOCKS}`;

  // ── Loading / error states ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-white font-bold text-lg mb-2">Formulário não encontrado</p>
          <p className="text-zinc-500 text-sm">Este link não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">⏰</p>
          <p className="text-white font-bold text-lg mb-2">Link expirado</p>
          <p className="text-zinc-500 text-sm">Este formulário expirou. Peça ao produtor que gere um novo link.</p>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-white font-bold text-lg mb-2">Já preenchido!</p>
          <p className="text-zinc-500 text-sm">Este formulário já foi enviado. Se precisar alterar algo, fale com o produtor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10]" ref={topRef}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4 border-b border-zinc-900 bg-[#0b0c10]/95 backdrop-blur-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9 5H13L10 8L11 12L7 10L3 12L4 8L1 5H5L7 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">CreatorFlow</span>
          </div>
          <div className="text-xs text-zinc-600">
            {stepLabel}
            {phase === 'form' && <span className="ml-2 text-zinc-700">· {progress}%</span>}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-xl mx-auto px-4 py-8 pb-24">

        {/* NAME phase */}
        {phase === 'name' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Olá! 👋</p>
              <h1 className="text-2xl font-bold text-white mb-2">
                {prefillClientName ? `Bem-vindo, ${prefillClientName}!` : 'Vamos criar sua linha editorial'}
              </h1>
              <p className="text-zinc-500 text-sm">
                {producerName
                  ? `${producerName} preparou este briefing para entender melhor você e sua marca. Leva cerca de 10 minutos.`
                  : 'Este briefing nos ajuda a entender melhor você e sua marca. Leva cerca de 10 minutos.'
                }
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-200">Como você chama sua marca ou negócio?</label>
              <input
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ex: Studio Laila, Dr. Renato Alves, Agência Nexus..."
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && canAdvance()) goNext(); }}
                autoFocus
              />
            </div>

            <button
              onClick={goNext}
              disabled={!canAdvance()}
              className="self-end flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Começar →
            </button>
          </div>
        )}

        {/* FORM phase */}
        {phase === 'form' && (() => {
          const block = BLOCKS[blockIdx];
          return (
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">{block.eyebrow}</p>
                <h1 className="text-xl font-bold text-white mb-1">{block.title}</h1>
                <p className="text-zinc-500 text-sm">{block.subtitle}</p>
              </div>

              <div className="w-full h-px bg-zinc-800" />

              <div className="flex flex-col gap-8">
                {block.questions.map(q => (
                  <QuestionField key={q.id} q={q} answers={answers} onChange={handleChange} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={goBack}
                  className="px-4 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={goNext}
                  disabled={!canAdvance()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {blockIdx < TOTAL_BLOCKS - 1 ? 'Continuar →' : 'Revisar respostas →'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* SUMMARY phase */}
        {phase === 'summary' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Revisão</p>
              <h1 className="text-xl font-bold text-white mb-1">Confirme suas respostas</h1>
              <p className="text-zinc-500 text-sm">Revise tudo antes de enviar. Você pode voltar e editar qualquer bloco.</p>
            </div>

            <div className="w-full h-px bg-zinc-800" />

            <SummaryView answers={answers} brandName={brandName} />

            {submitError && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={goBack}
                className="px-4 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                ← Editar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : 'Enviar briefing →'}
              </button>
            </div>
          </div>
        )}

        {/* DONE phase */}
        {phase === 'done' && (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L12 22L26 8" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-2">Briefing enviado! 🎉</h1>
              <p className="text-zinc-500 text-sm">
                Recebemos todas as suas respostas. {producerName ? `${producerName} vai` : 'Nossa equipe vai'} analisar seu perfil e preparar a estratégia de conteúdo personalizada.
              </p>
            </div>
            <div className="w-full p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-left flex flex-col gap-2">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Próximos passos</p>
              {[
                'Seu briefing é analisado em até 48h',
                'Você recebe um documento de posicionamento completo',
                'Sessão de alinhamento para validar a linha editorial',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-emerald-400 font-bold flex-shrink-0">{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
