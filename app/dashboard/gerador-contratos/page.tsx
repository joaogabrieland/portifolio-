'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FilePen, ChevronRight, ChevronLeft, Check, Loader2, Download, CheckCircle2, FileText, Clock } from 'lucide-react';

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'As Partes',       description: 'Quem está envolvido?' },
  { id: 2, label: 'O Projeto',       description: 'Do que se trata?' },
  { id: 3, label: 'As Entregas',     description: 'O que será entregue?' },
  { id: 4, label: 'Prazos',          description: 'Quando?' },
  { id: 5, label: 'Financeiro',      description: 'Valores e pagamentos' },
  { id: 6, label: 'Blindagem Legal', description: 'Cláusulas de proteção' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractData {
  clientName: string;
  clientCnpj: string;
  producerName: string;
  projectTitle: string;
  projectDescription: string;
  deliverables: string;
  deliveryFormat: string;
  startDate: string;
  endDate: string;
  revisionRounds: string;
  totalValue: string;
  paymentTerms: string;
  paymentMethod: string;
  fineClause: string;
  confidentiality: string;
  intellectualProperty: string;
}

interface HistoryEntry {
  id: string;
  date: string;
  data: ContractData;
}

const INITIAL_DATA: ContractData = {
  clientName: '', clientCnpj: '', producerName: '',
  projectTitle: '', projectDescription: '',
  deliverables: '', deliveryFormat: '', startDate: '', endDate: '', revisionRounds: '',
  totalValue: '', paymentTerms: '', paymentMethod: '',
  fineClause: '', confidentiality: '', intellectualProperty: '',
};

// ─── Label lookups ────────────────────────────────────────────────────────────

const PAYMENT_TERMS_LABELS: Record<string, string> = {
  '50-50':       '50% (cinquenta por cento) no ato da assinatura e 50% (cinquenta por cento) na entrega final',
  '30-70':       '30% (trinta por cento) no ato da assinatura e 70% (setenta por cento) na entrega final',
  '100-inicio':  '100% (cem por cento) no ato da assinatura deste instrumento',
  '100-entrega': '100% (cem por cento) na entrega final dos materiais',
  'parcelado-3': '3 (três) parcelas mensais e sucessivas de igual valor',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix:           'PIX',
  transferencia: 'Transferência Bancária (TED/DOC)',
  boleto:        'Boleto Bancário',
  cartao:        'Cartão de Crédito',
};

const CONFIDENTIALITY_LABELS: Record<string, string> = {
  total:      'total — ambas as partes se comprometem a não divulgar qualquer informação referente a este contrato ou ao projeto a terceiros',
  portfolio:  'parcial — a CONTRATADA reserva-se o direito de utilizar as obras produzidas em portfólio e material de divulgação próprio',
  nenhuma:    'não aplicável — as partes não estabelecem restrições de divulgação neste instrumento',
};

const IP_LABELS: Record<string, string> = {
  'cliente-apos-pagamento': 'transferida integralmente ao CONTRATANTE somente após a quitação total do valor contratado',
  'produtora':              'mantida pela CONTRATADA, que concede ao CONTRATANTE licença de uso não exclusiva e intransferível',
  'cliente-imediato':       'transferida integralmente ao CONTRATANTE no ato da assinatura deste instrumento',
};

const FINE_LABELS: Record<string, string> = {
  '20':  '20% (vinte por cento)',
  '30':  '30% (trinta por cento)',
  '50':  '50% (cinquenta por cento)',
  '100': '100% (cem por cento)',
};

const DELIVERY_FORMAT_LABELS: Record<string, string> = {
  link:       'link de download digital (WeTransfer, Google Drive ou similar)',
  hd:         'HD físico entregue em mãos',
  plataforma: 'plataforma de aprovação online do cliente',
  outro:      'formato a definir em acordo entre as partes',
};

// ─── Currency helper ──────────────────────────────────────────────────────────

function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatDateBR(isoDate: string): string {
  if (!isoDate) return '___/___/______';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Field Components ─────────────────────────────────────────────────────────

function InputField({ label, placeholder, value, onChange, hint }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all duration-200"
      />
      {hint && <p className="text-[11px] text-white/20 leading-relaxed">{hint}</p>}
    </div>
  );
}

function CurrencyInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(formatCurrency(e.target.value))}
        placeholder="R$ 0,00"
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all duration-200 font-mono tracking-wide"
      />
      <p className="text-[11px] text-white/20">Digite apenas os números — a formatação é automática.</p>
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange, rows = 4 }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all duration-200 resize-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all duration-200 appearance-none"
      >
        <option value="" disabled className="bg-[#111]">Selecione...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Step Content ──────────────────────────────────────────────────────────────

function StepContent({ step, data, update }: {
  step: number; data: ContractData;
  update: (key: keyof ContractData, value: string) => void;
}) {
  switch (step) {
    case 1:
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">As Partes</h3>
            <p className="text-sm text-white/35">Identifique quem está contratando e quem está sendo contratado.</p>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <InputField label="Nome do Cliente / Razão Social" placeholder="Ex: Marca Horizonte LTDA"
            value={data.clientName} onChange={(v) => update('clientName', v)}
            hint="Pessoa física ou jurídica que está contratando seus serviços." />
          <InputField label="CNPJ / CPF do Cliente (opcional)" placeholder="Ex: 00.000.000/0001-00"
            value={data.clientCnpj} onChange={(v) => update('clientCnpj', v)} />
          <InputField label="Nome da sua Produtora / Razão Social" placeholder="Ex: Studio Norte Produções LTDA"
            value={data.producerName} onChange={(v) => update('producerName', v)}
            hint="O nome que assinará o contrato como prestador de serviços." />
        </div>
      );
    case 2:
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">O Projeto</h3>
            <p className="text-sm text-white/35">Descreva com clareza o escopo do trabalho contratado.</p>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <InputField label="Título do Projeto" placeholder="Ex: Campanha de Verão 2026 — Vídeos Institucionais"
            value={data.projectTitle} onChange={(v) => update('projectTitle', v)} />
          <TextareaField label="Descrição rápida do projeto"
            placeholder="Descreva o objetivo, contexto e resultado esperado. Seja específico para evitar conflitos futuros."
            value={data.projectDescription} onChange={(v) => update('projectDescription', v)} rows={5} />
        </div>
      );
    case 3:
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">As Entregas</h3>
            <p className="text-sm text-white/35">Defina exatamente o que será produzido e em que formato.</p>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <TextareaField label="Lista de entregáveis"
            placeholder="Ex: 3 vídeos de 60s para Instagram Reels, 1 vídeo institucional de 2min..."
            value={data.deliverables} onChange={(v) => update('deliverables', v)} rows={4} />
          <SelectField label="Formato de entrega" value={data.deliveryFormat}
            onChange={(v) => update('deliveryFormat', v)}
            options={[
              { value: 'link', label: 'Link de download (WeTransfer, Drive, etc.)' },
              { value: 'hd', label: 'HD físico' },
              { value: 'plataforma', label: 'Plataforma de aprovação do cliente' },
              { value: 'outro', label: 'Outro (definir em contrato)' },
            ]} />
          <SelectField label="Rodadas de revisão inclusas" value={data.revisionRounds}
            onChange={(v) => update('revisionRounds', v)}
            options={[
              { value: '1', label: '1 rodada de revisão' },
              { value: '2', label: '2 rodadas de revisão' },
              { value: '3', label: '3 rodadas de revisão' },
              { value: '0', label: 'Sem revisões inclusas' },
            ]} />
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">Prazos</h3>
            <p className="text-sm text-white/35">Estabeleça as datas de início e entrega.</p>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Data de início</label>
              <input type="date" value={data.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-200 [color-scheme:dark]" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Data de entrega final</label>
              <input type="date" value={data.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all duration-200 [color-scheme:dark]" />
            </div>
          </div>
        </div>
      );
    case 5:
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">Financeiro</h3>
            <p className="text-sm text-white/35">Defina valores, parcelas e forma de pagamento.</p>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <CurrencyInput label="Valor total do contrato" value={data.totalValue}
            onChange={(v) => update('totalValue', v)} />
          <SelectField label="Condições de pagamento" value={data.paymentTerms}
            onChange={(v) => update('paymentTerms', v)}
            options={[
              { value: '50-50',       label: '50% na assinatura + 50% na entrega' },
              { value: '30-70',       label: '30% na assinatura + 70% na entrega' },
              { value: '100-inicio',  label: '100% na assinatura' },
              { value: '100-entrega', label: '100% na entrega' },
              { value: 'parcelado-3', label: '3× mensais iguais' },
            ]} />
          <SelectField label="Forma de pagamento" value={data.paymentMethod}
            onChange={(v) => update('paymentMethod', v)}
            options={[
              { value: 'pix',           label: 'PIX' },
              { value: 'transferencia', label: 'Transferência bancária (TED/DOC)' },
              { value: 'boleto',        label: 'Boleto bancário' },
              { value: 'cartao',        label: 'Cartão de crédito' },
            ]} />
        </div>
      );
    case 6:
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white mb-1">Blindagem Legal</h3>
            <p className="text-sm text-white/35">Cláusulas que protegem você em caso de conflito.</p>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <SelectField label="Multa por rescisão antecipada (pelo cliente)" value={data.fineClause}
            onChange={(v) => update('fineClause', v)}
            options={[
              { value: '20',  label: '20% do valor total restante' },
              { value: '30',  label: '30% do valor total restante' },
              { value: '50',  label: '50% do valor total restante' },
              { value: '100', label: '100% do valor total do contrato' },
            ]} />
          <SelectField label="Confidencialidade" value={data.confidentiality}
            onChange={(v) => update('confidentiality', v)}
            options={[
              { value: 'total',     label: 'Total — ambas as partes não divulgam nada' },
              { value: 'portfolio', label: 'Produtora pode usar o projeto em portfólio' },
              { value: 'nenhuma',   label: 'Sem cláusula de confidencialidade' },
            ]} />
          <SelectField label="Propriedade intelectual" value={data.intellectualProperty}
            onChange={(v) => update('intellectualProperty', v)}
            options={[
              { value: 'cliente-apos-pagamento', label: 'Transferida ao cliente após pagamento total' },
              { value: 'produtora',              label: 'Mantida pela produtora (licença de uso ao cliente)' },
              { value: 'cliente-imediato',       label: 'Transferida ao cliente na assinatura' },
            ]} />
        </div>
      );
    default:
      return null;
  }
}

// ─── Printable Contract Template ──────────────────────────────────────────────

function PrintableContract({ data }: { data: ContractData }) {
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const revLabel = data.revisionRounds === '0' ? 'sem direito a revisões' : `${data.revisionRounds} rodada(s) de revisão incluída(s)`;
  const deliveryFmt = DELIVERY_FORMAT_LABELS[data.deliveryFormat] ?? data.deliveryFormat;
  const paymentTerms = PAYMENT_TERMS_LABELS[data.paymentTerms] ?? data.paymentTerms;
  const paymentMethod = PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod;
  const fineLabel = FINE_LABELS[data.fineClause] ?? `${data.fineClause}%`;
  const confidentialityLabel = CONFIDENTIALITY_LABELS[data.confidentiality] ?? data.confidentiality;
  const ipLabel = IP_LABELS[data.intellectualProperty] ?? data.intellectualProperty;

  const p = 'text-base leading-8 text-justify mb-4';
  const clauseTitle = 'font-bold text-base mt-8 mb-2 uppercase tracking-wide';

  return (
    <div id="printable-contract" className="hidden print:block bg-white text-black font-serif p-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs tracking-widest uppercase mb-4 text-gray-500">Instrumento Particular</p>
        <h1 className="text-xl font-bold uppercase tracking-widest leading-tight">
          Contrato de Prestação de<br />Serviços Audiovisuais
        </h1>
        <div className="mt-4 h-0.5 w-16 bg-black mx-auto" />
      </div>

      {/* Preâmbulo */}
      <p className={p}>
        Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente
        Contrato de Prestação de Serviços Audiovisuais, que se regerá pelas cláusulas e condições
        a seguir estipuladas:
      </p>

      {/* Cláusula I — As Partes */}
      <p className={clauseTitle}>Cláusula I — Das Partes</p>
      <p className={p}>
        <strong>CONTRATANTE:</strong> {data.clientName || '[Nome do Cliente]'}
        {data.clientCnpj ? `, inscrito(a) sob o CNPJ/CPF n.º ${data.clientCnpj}` : ''}, doravante
        denominado(a) simplesmente <strong>CONTRATANTE</strong>.
      </p>
      <p className={p}>
        <strong>CONTRATADA:</strong> {data.producerName || '[Nome da Produtora]'}, prestadora de
        serviços audiovisuais, doravante denominada simplesmente <strong>CONTRATADA</strong>.
      </p>

      {/* Cláusula II — Objeto */}
      <p className={clauseTitle}>Cláusula II — Do Objeto</p>
      <p className={p}>
        O presente contrato tem por objeto a prestação de serviços de produção audiovisual
        referente ao projeto intitulado <strong>&ldquo;{data.projectTitle || '[Título do Projeto]'}&rdquo;</strong>,
        {data.projectDescription ? ` cuja descrição é a seguinte: ${data.projectDescription}` : ''}.
      </p>

      {/* Cláusula III — Entregas */}
      <p className={clauseTitle}>Cláusula III — Das Entregas e Escopo</p>
      <p className={p}>
        A CONTRATADA se compromete a entregar os seguintes materiais:{' '}
        <strong>{data.deliverables || '[lista de entregáveis]'}</strong>. A entrega será realizada
        por meio de {deliveryFmt}, com {revLabel}. Alterações fora do escopo acordado serão
        objeto de aditivo contratual com valores a negociar.
      </p>

      {/* Cláusula IV — Prazos */}
      <p className={clauseTitle}>Cláusula IV — Dos Prazos</p>
      <p className={p}>
        O início das atividades está previsto para{' '}
        <strong>{formatDateBR(data.startDate)}</strong> e o prazo de entrega final é
        estabelecido para <strong>{formatDateBR(data.endDate)}</strong>. Eventuais atrasos
        causados pelo CONTRATANTE, incluindo demora na aprovação ou fornecimento de materiais,
        não serão imputados à CONTRATADA e poderão implicar reprogramação dos prazos acordados.
      </p>

      {/* Cláusula V — Financeiro */}
      <p className={clauseTitle}>Cláusula V — Do Valor e Forma de Pagamento</p>
      <p className={p}>
        Fica acordado o valor total de{' '}
        <strong>{data.totalValue || 'R$ [VALOR]'}</strong> pelos serviços descritos neste
        instrumento. O pagamento será realizado da seguinte forma:{' '}
        {paymentTerms || '[condições de pagamento]'}, mediante{' '}
        {paymentMethod || '[forma de pagamento]'}. O não pagamento nas datas acordadas
        implicará incidência de multa de 2% (dois por cento) ao mês sobre o valor em atraso,
        acrescido de correção monetária pelo IGPM.
      </p>

      {/* Cláusula VI — Rescisão */}
      <p className={clauseTitle}>Cláusula VI — Da Rescisão e Multas</p>
      <p className={p}>
        Em caso de rescisão unilateral pelo CONTRATANTE após o início das atividades, fica
        estipulada multa rescisória equivalente a{' '}
        <strong>{fineLabel}</strong> do valor total do contrato, independentemente do estágio
        de execução dos serviços, a título de compensação pelo trabalho realizado e pela
        reserva de agenda. Em caso de rescisão por parte da CONTRATADA sem justificativa,
        serão devolvidos os valores recebidos proporcionalmente aos serviços não executados.
      </p>

      {/* Cláusula VII — Confidencialidade */}
      <p className={clauseTitle}>Cláusula VII — Da Confidencialidade</p>
      <p className={p}>
        A confidencialidade entre as partes é {confidentialityLabel}. Esta obrigação de
        sigilo persiste por período de 2 (dois) anos após o término ou rescisão do presente
        contrato, sob pena de indenização por perdas e danos.
      </p>

      {/* Cláusula VIII — Propriedade Intelectual */}
      <p className={clauseTitle}>Cláusula VIII — Da Propriedade Intelectual</p>
      <p className={p}>
        A propriedade intelectual e os direitos autorais sobre as obras produzidas serão{' '}
        {ipLabel}. Fica vedada a utilização dos materiais para fins distintos dos
        expressamente acordados sem prévia autorização escrita da detentora dos direitos.
      </p>

      {/* Cláusula IX — Disposições Gerais */}
      <p className={clauseTitle}>Cláusula IX — Das Disposições Gerais</p>
      <p className={p}>
        As partes elegem o foro da comarca do domicílio da CONTRATADA para dirimir quaisquer
        controvérsias oriundas do presente instrumento, com renúncia expressa a qualquer outro,
        por mais privilegiado que seja. Este contrato obriga as partes e seus sucessores, sendo
        nulo qualquer acordo verbal que contrarie suas disposições.
      </p>

      {/* Local e data */}
      <p className="text-base text-center mt-10 mb-12">
        {data.producerName ? data.producerName.split(' ').pop() : 'Local'}, {today}.
      </p>

      {/* Assinaturas */}
      <div className="grid grid-cols-2 gap-16 mt-8">
        <div className="flex flex-col gap-2">
          <div className="border-b border-black mb-1" style={{ borderStyle: 'dotted' }} />
          <p className="text-sm font-bold text-center">{data.clientName || 'CONTRATANTE'}</p>
          <p className="text-xs text-center text-gray-500">{data.clientCnpj || 'CPF/CNPJ'}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="border-b border-black mb-1" style={{ borderStyle: 'dotted' }} />
          <p className="text-sm font-bold text-center">{data.producerName || 'CONTRATADA'}</p>
          <p className="text-xs text-center text-gray-500">Prestador(a) de Serviços Audiovisuais</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-16">
        Documento gerado via Creator Flow · creatorflow.app · {today}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GeradorContratosPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [contractData, setContractData] = useState<ContractData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [printData, setPrintData] = useState<ContractData>(INITIAL_DATA);

  const update = (key: keyof ContractData, value: string) =>
    setContractData((prev) => ({ ...prev, [key]: value }));

  const goNext = () => setCurrentStep((s) => Math.min(STEPS.length, s + 1));
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1));
  const isLast = currentStep === STEPS.length;

  const handleGenerateContract = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        data: { ...contractData },
      };
      setPrintData({ ...contractData });
      setHistory((prev) => [entry, ...prev]);
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const handleNewContract = () => {
    setContractData(INITIAL_DATA);
    setCurrentStep(1);
    setIsGenerated(false);
  };

  return (
    <>
      {/* ── App UI (hidden on print) ──────────────────────────────────────── */}
      <div className="print:hidden min-h-screen bg-[#050505] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">

          {/* Back */}
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <FilePen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Gerador de Contratos</h1>
              <p className="text-gray-400 mt-0.5 text-sm">O seu assistente jurídico. Configure o seu contrato em poucos cliques.</p>
            </div>
          </div>

          {/* ── Success screen ─────────────────────────────────────────── */}
          {isGenerated && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl -z-10 scale-150" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Contrato Gerado com Sucesso!</h2>
              <p className="text-white/40 text-base max-w-md leading-relaxed mb-10">
                O PDF foi criado e está pronto para download. Guarde uma cópia assinada por ambas as partes.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-7 py-3 text-sm font-bold text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-purple-900/30"
                >
                  <Download className="w-4 h-4" />
                  Baixar / Imprimir PDF
                </button>
                <button
                  onClick={handleNewContract}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] px-7 py-3 text-sm font-semibold text-white/50 hover:text-white hover:border-white/25 transition-all duration-200"
                >
                  <FilePen className="w-4 h-4" />
                  Gerar novo contrato
                </button>
              </div>
            </div>
          )}

          {/* ── Wizard ─────────────────────────────────────────────────── */}
          {!isGenerated && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

              {/* Left: progress */}
              <div className="md:col-span-1">
                <div className="sticky top-8 flex flex-col gap-1">
                  {STEPS.map((step) => {
                    const done = step.id < currentStep;
                    const active = step.id === currentStep;
                    return (
                      <button key={step.id} onClick={() => setCurrentStep(step.id)}
                        className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${active ? 'bg-purple-500/10 border border-purple-500/20' : 'hover:bg-white/[0.03] border border-transparent'}`}>
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-all duration-200 ${done ? 'bg-purple-500' : active ? 'border-2 border-purple-400 bg-purple-400/20' : 'border border-white/[0.15]'}`}>
                          {done
                            ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            : <span className={`text-[9px] font-black ${active ? 'text-purple-300' : 'text-white/20'}`}>{step.id}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : done ? 'text-white/50' : 'text-white/25'}`}>{step.label}</p>
                          <p className={`text-[10px] mt-0.5 leading-tight ${active ? 'text-white/40' : 'text-white/15'}`}>{step.description}</p>
                        </div>
                      </button>
                    );
                  })}
                  <div className="mt-4 px-3">
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-white/20 mt-2">Passo {currentStep} de {STEPS.length}</p>
                  </div>
                </div>
              </div>

              {/* Right: active step */}
              <div className="md:col-span-3">
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8">
                  <StepContent step={currentStep} data={contractData} update={update} />
                  <div className={`flex items-center mt-10 pt-6 border-t border-white/[0.06] ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
                    {currentStep > 1 && (
                      <button onClick={goBack}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] px-5 py-2.5 text-sm font-semibold text-white/50 hover:text-white hover:border-white/25 transition-all duration-200">
                        <ChevronLeft className="w-4 h-4" /> Voltar
                      </button>
                    )}
                    <button
                      onClick={isLast ? handleGenerateContract : goNext}
                      disabled={isGenerating}
                      className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${isLast ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:opacity-90 shadow-lg shadow-purple-900/30' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
                      {isLast ? (
                        isGenerating
                          ? <><Loader2 className="w-4 h-4 animate-spin" />A gerar PDF...</>
                          : <>Gerar Contrato<FilePen className="w-4 h-4" /></>
                      ) : (
                        <>Próximo Passo<ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── History ────────────────────────────────────────────────── */}
          {history.length > 0 && (
            <div className="mt-16">
              <div className="h-px bg-white/[0.06] mb-8" />
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-white/25" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/25">Histórico de Contratos Gerados</h2>
              </div>
              <div className="flex flex-col gap-3">
                {history.map((entry) => (
                  <div key={entry.id}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {entry.data.projectTitle || 'Projeto sem título'}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {entry.data.clientName || 'Cliente não informado'} · {entry.data.totalValue || '—'}
                      </p>
                    </div>
                    <span className="text-[11px] text-white/20 flex-shrink-0">{entry.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Printable contract (hidden on screen, visible on print) ───── */}
      <PrintableContract data={printData} />
    </>
  );
}
