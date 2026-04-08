'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useClientData } from '@/lib/hooks/useClientData';
import { useUserData } from '@/lib/hooks/useUserData';
import { fetchClientData, saveClientData } from '@/lib/clients-api';
import {
  ArrowLeft,
  Sparkles,
  Rocket,
  Plus,
  X,
  Copy,
  Loader2,
  Target,
  ChevronRight,
  Calendar,
  HardDrive,
  CheckCircle2,
  Circle,
  Trash2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronUp,
  MapPin,
  Briefcase,
  Camera,
  Folder,
  BookOpen,
  ChevronDown,
  PenLine,
  Film,
  FileText,
  Check,
  UploadCloud,
  Link as LinkIcon,
  Star,
  CheckCircle,
  LayoutDashboard,
  Bookmark,
  BookmarkCheck,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Video,
  Scissors,
  Archive,
  RotateCcw,
  Mic,
  ListTodo,
  Gauge,
  BarChart3,
  Lightbulb,
  Clapperboard,
  Package,
  ExternalLink,
  FolderPlus,
  Image as ImageIcon,
  Menu,
  Pin,
  AlignLeft,
  Brain,
  Save,
  Square,
  ArrowRight,
  Pencil,
  User,
  AlertCircle,
  Download,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Client, BrandBrain, HDD, Recording, AgentId, Meeting, MeetingNextStep, Invoice } from '@/types';
import { sendMessageToAgent } from '@/lib/api';
import ClientMonthlyReport from './ClientMonthlyReport';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface ClientDashboardProps {
  client: Client;
  onBack: () => void;
  onNavigateToArquivos?: () => void;
}

// ─────────────────────────────────────────────
// Tab definition
// ─────────────────────────────────────────────
type TabId = 'visao_geral' | 'ideias' | 'roteiros' | 'kanban' | 'agenda' | 'acervo' | 'entregas' | 'reunioes' | 'financeiro' | 'documentos' | 'cerebro_da_marca';

interface Tab {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'visao_geral', label: 'Visão Geral',           icon: BarChart3       },
  { id: 'ideias',      label: 'Ideias Infinitas',       icon: Lightbulb       },
  { id: 'roteiros',    label: 'Sala de Roteiros',       icon: FileText        },
  { id: 'kanban',      label: 'Workflow',               icon: LayoutDashboard },
  { id: 'agenda',      label: 'Agenda',                 icon: Calendar        },
  { id: 'acervo',      label: 'Acervo e HDs',           icon: HardDrive       },
  { id: 'entregas',    label: 'Entregas',               icon: UploadCloud     },
  { id: 'reunioes',    label: 'Reuniões',               icon: Users           },
  { id: 'financeiro',       label: 'Financeiro & Métricas',  icon: TrendingUp  },
  { id: 'documentos',       label: 'Documentos',             icon: Folder      },
  { id: 'cerebro_da_marca', label: 'Cérebro da Marca',       icon: Brain       },
];

// ─────────────────────────────────────────────
// Motor de Ideias — constants
// ─────────────────────────────────────────────
interface SuggestedThemeGroup {
  label: string;
  emoji: string;
  themes: string[];
}

const SUGGESTED_THEME_GROUPS: SuggestedThemeGroup[] = [
  {
    label: 'Alta Demanda',
    emoji: '🔥',
    themes: ['Estratégias de vendas', 'Como reter clientes', 'Precificação correta', 'Como escalar o negócio'],
  },
  {
    label: 'Educacional',
    emoji: '📚',
    themes: ['Rotina matinal produtiva', 'Ferramentas essenciais do mercado', 'Dicas para iniciantes', 'Como evitar os erros mais comuns'],
  },
  {
    label: 'Autoridade',
    emoji: '🏆',
    themes: ['Bastidores do processo criativo', 'Resultados reais de clientes', 'Minha história de superação', 'O que aprendi nos primeiros anos'],
  },
];

const FORMATS = ['Reels', 'Carrossel', 'Stories', 'YouTube Shorts'];

const ANGLES = [
  'Mitos e Verdades',
  'Erros Comuns',
  'Passo a Passo',
  'FAQ',
  'Checklist',
  'Bastidores',
];

interface IdeaScript {
  slides: { visual: string; audio: string }[];
  caption: string;
  hashtags: string;
}

interface IdeaCard {
  id: string;
  title: string;
  tags: string[];
  gancho: string;
  estrutura: string[];
  cta: string;
  script: IdeaScript;
}

const buildMockIdeas = (client: Client): IdeaCard[] => [
  {
    id: '1',
    title: `5 Erros que Destroem Seu Resultado em ${client.niche || 'Seu Nicho'} (e como evitar)`,
    tags: ['Reels', 'Erros Comuns', 'Iniciante'],
    gancho: `${client.idealClient || 'Você'} já passou por aquela situação onde fez tudo "certo" e ainda assim o resultado foi uma decepção total? Eu vou te mostrar o que realmente está acontecendo.`,
    estrutura: [
      'Erro #1: Subestimar o planejamento inicial',
      'Erro #2: Ignorar os sinais do público',
      'Erro #3: Copiar fórmulas sem adaptar para o seu contexto',
      'Erro #4: Não medir os resultados',
      'Erro #5: Desistir cedo demais',
    ],
    cta: client.defaultCta || 'Salva esse conteúdo e me conta qual erro você já cometeu!',
    script: {
      slides: [
        { visual: `Close no rosto com expressão de surpresa — fundo simples`, audio: `Você sabia que 80% das pessoas em ${client.niche || 'seu nicho'} cometem esses 5 erros?` },
        { visual: `Texto animado na tela: "Erro #1" com ícone de alerta`, audio: `Erro #1: Subestimar o planejamento. Parece básico, mas é o mais fatal.` },
        { visual: `Câmera mostrando uma agenda ou quadro de planejamento vazio`, audio: `Sem um plano claro, você vai improvisar — e improvisar custa caro.` },
        { visual: `Texto: "Erro #2" + gráfico de queda simples`, audio: `Erro #2: Ignorar os sinais do público. Métricas existem para te guiar, não assustar.` },
        { visual: `Transição rápida mostrando os 5 pontos em lista com check`, audio: `Os outros três erros são igualmente comuns — e todos têm solução simples.` },
        { visual: `Volta ao rosto, sorriso confiante, apontando para a câmera`, audio: client.defaultCta || `Salva esse vídeo e comenta qual erro você já cometeu!` },
      ],
      caption: `Você está cometendo esses erros sem perceber? 👀\n\nDepois de trabalhar com dezenas de ${client.niche ? `clientes do setor de ${client.niche}` : 'clientes'}, percebi que existem 5 erros que aparecem sempre.\n\nSe você quer resultados diferentes, precisa identificar qual desses está freando o seu crescimento.\n\n✅ Salva esse conteúdo para consultar depois!\n💬 Me conta nos comentários qual desses você já cometeu.`,
      hashtags: `#${(client.niche || 'negocio').replace(/\s+/g, '')} #estrategia #crescimento #empreendedorismo #marketingdigital #dicasdenegocios #${(client.brandName || 'marca').replace(/\s+/g, '').toLowerCase()}`,
    },
  },
  {
    id: '2',
    title: `O Segredo que os Profissionais de ${client.niche || 'Sucesso'} Não Revelam`,
    tags: ['Carrossel', 'Bastidores', 'Autoridade'],
    gancho: `Depois de anos no mercado de ${client.niche || 'nosso nicho'}, resolvi finalmente revelar o que aprendi observando os melhores do setor.`,
    estrutura: [
      'Segredo 1: A preparação vale mais do que a execução',
      'Segredo 2: Consistência supera talento na longa jornada',
      'Segredo 3: Relacionamento com o cliente é o maior diferencial',
      'Segredo 4: Qualidade dos insumos define o resultado final',
      'Encerramento: O verdadeiro segredo é a disciplina diária',
    ],
    cta: client.defaultCta || 'Comente aqui se você quer que eu aprofunde algum desses pontos!',
    script: {
      slides: [
        { visual: `Capa do carrossel: título impactante com degradê escuro e tipografia grande`, audio: `(Texto) Os Segredos que Ninguém te Conta em ${client.niche || 'Seu Mercado'}` },
        { visual: `Slide 2: Bastidores do processo de trabalho — foto real ou ilustração`, audio: `(Texto) Segredo #1: A preparação vale mais do que a execução` },
        { visual: `Slide 3: Gráfico de crescimento consistente ao longo do tempo`, audio: `(Texto) Segredo #2: Consistência supera talento — sempre` },
        { visual: `Slide 4: Foto de interação com cliente (reunião, entrega, handshake)`, audio: `(Texto) Segredo #3: Relacionamento é o seu maior diferencial` },
        { visual: `Slide 5: Close em produto ou entrega final de alta qualidade`, audio: `(Texto) Segredo #4: Insumos de qualidade definem o resultado` },
        { visual: `Slide final CTA: fundo com cor da marca, texto grande e claro`, audio: `(Texto) ${client.defaultCta || 'Comente qual segredo foi mais valioso para você!'}` },
      ],
      caption: `Passei anos guardando esses segredos. Hoje resolvi compartilhar. 🔓\n\nOs profissionais de sucesso em ${client.niche || 'qualquer mercado'} não têm sorte — eles têm método.\n\nE o método está nesse carrossel.\n\n→ Arraste para ver todos os segredos\n💾 Salva para não perder\n💬 ${client.defaultCta || 'Comente qual segredo foi mais valioso para você!'}`,
      hashtags: `#${(client.niche || 'mercado').replace(/\s+/g, '')} #segredos #sucesso #metodologia #profissional #desenvolvimento #resultados #${(client.brandName || 'marca').replace(/\s+/g, '').toLowerCase()}`,
    },
  },
];

// ─────────────────────────────────────────────
// Workflow Tab — types & constants
// ─────────────────────────────────────────────
type TodoPriority = 'Baixa' | 'Média' | 'Urgente';

interface TodoItem {
  id: string;
  text: string;
  priority: TodoPriority;
  createdAt: number;
}

type KanbanPriority = 'Alta' | 'Normal' | 'Baixa' | 'Urgente';

interface KanbanCard {
  id: string;
  title: string;
  priority: KanbanPriority;
  startDate: string;
  dueDate: string;
  notes: string;
  assignedTo?: string;
}

interface KanbanColumn {
  id: string;
  emoji: string;
  title: string;
  cards: KanbanCard[];
  isArchived?: boolean;
}

const KANBAN_PRIORITIES: KanbanPriority[] = ['Urgente', 'Alta', 'Normal', 'Baixa'];

const KANBAN_PRIORITY_COLORS: Record<string, string> = {
  'Alta':    'bg-red-900/30 text-red-400 border border-red-800/50',
  'Normal':  'bg-sky-900/30 text-sky-400 border border-sky-800/50',
  'Baixa':   'bg-zinc-800 text-zinc-400 border border-zinc-700',
  'Urgente': 'bg-orange-900/30 text-orange-400 border border-orange-800/50',
};

const TODO_PRIORITY_STYLES: Record<TodoPriority, { btn: string; badge: string }> = {
  'Baixa':   {
    btn:   'border-zinc-600 text-zinc-400 bg-zinc-800/50',
    badge: 'bg-zinc-800 text-zinc-400',
  },
  'Média':   {
    btn:   'border-sky-600 text-sky-400 bg-sky-900/20',
    badge: 'bg-sky-900/30 text-sky-400',
  },
  'Urgente': {
    btn:   'border-red-600 text-red-400 bg-red-900/20',
    badge: 'bg-red-900/30 text-red-400',
  },
};

const INITIAL_TODOS: TodoItem[] = [
  { id: 't1', text: 'Solicitar senha do Instagram', priority: 'Urgente', createdAt: Date.now() - 3600000 },
  { id: 't2', text: 'Lembrar de emitir nota fiscal dia 15', priority: 'Baixa', createdAt: Date.now() - 1800000 },
];

const KANBAN_INITIAL_COLUMNS: KanbanColumn[] = [
  { id: 'preproducao', emoji: '', title: 'Pré-produção',  cards: [] },
  { id: 'gravar',      emoji: '', title: 'Para Gravar',   cards: [] },
  { id: 'edicao',      emoji: '', title: 'Em Edição',     cards: [] },
  { id: 'aprovacao',   emoji: '', title: 'Ag. Aprovação', cards: [] },
  { id: 'finalizado',  emoji: '', title: 'Finalizado',    cards: [] },
];

// Icon mapping for kanban columns (replaces emoji field)
const KANBAN_COL_ICON: Record<string, React.FC<{ className?: string }>> = {
  preproducao: PenLine,
  gravar:      Video,
  edicao:      Scissors,
  aprovacao:   Clock,
  finalizado:  CheckCircle,
};

// Status color mapping for kanban column icons
const KANBAN_COL_COLOR: Record<string, string> = {
  preproducao: 'text-blue-500',
  gravar:      'text-amber-500',
  edicao:      'text-purple-500',
  aprovacao:   'text-orange-500',
  finalizado:  'text-green-500',
};

// Column → production stage index mapping (for automatic timeline)
const COLUMN_STAGE_MAP: Record<string, number> = {
  preproducao: 1,
  aprovacao:   2,
  gravar:      3,
  edicao:      4,
  finalizado:  5,
};

const KANBAN_ASSIGNEES: { id: string; name: string; initials: string; color: string }[] = [
  { id: 'you',   name: 'Você (Admin)',            initials: 'VC', color: 'bg-violet-600' },
  { id: 'ana',   name: 'Ana Costa (Roteirista)',   initials: 'AC', color: 'bg-emerald-600' },
  { id: 'pedro', name: 'Pedro Lima (Videomaker)',  initials: 'PL', color: 'bg-sky-600' },
];

// ─────────────────────────────────────────────
// Agenda Tab — types & constants
// ─────────────────────────────────────────────
type _EventType    = 'Gravação' | 'Reunião' | 'Entrega de Vídeo' | 'Visita Técnica';
type EventLocation = 'Interna' | 'Externa' | 'Remoto';
type AgendaFilter  = 'todas' | 'gravacoes' | 'reunioes' | 'entregas';

interface AgendaEvent {
  id: string;
  title: string;
  type: string;       // EventType or custom user-defined string
  location: EventLocation;
  address: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  notes: string;
  createdAt: number;
}

const EVENT_TYPES: string[]            = ['Gravação', 'Reunião', 'Entrega de Vídeo', 'Visita Técnica'];
const EVENT_LOCATIONS: EventLocation[] = ['Interna', 'Externa', 'Remoto'];

const EVENT_TYPE_STYLES: { [key: string]: { bg: string; text: string; border: string; emoji: string } } = {
  'Gravação':         { bg: 'bg-violet-900/20', text: 'text-violet-400', border: 'border-violet-700/50', emoji: '🎬' },
  'Reunião':          { bg: 'bg-sky-900/20',       text: 'text-sky-400',       border: 'border-sky-700/50',       emoji: '🤝' },
  'Entrega de Vídeo': { bg: 'bg-emerald-900/20', text: 'text-emerald-400', border: 'border-emerald-700/50', emoji: '📦' },
  'Visita Técnica':   { bg: 'bg-amber-900/20',   text: 'text-amber-400',   border: 'border-amber-700/50',   emoji: '🔍' },
};

const EVENT_LOCATION_LABELS: Record<EventLocation, { label: string; emoji: string }> = {
  'Interna': { label: 'Estúdio', emoji: '🎙️' },
  'Externa': { label: 'Externa', emoji: '☀️'  },
  'Remoto':  { label: 'Remoto',  emoji: '💻'  },
};

const AGENDA_FILTERS: { id: AgendaFilter; label: string }[] = [
  { id: 'todas',     label: '📅 Todas'      },
  { id: 'gravacoes', label: '🎬 Gravações'  },
  { id: 'reunioes',  label: '🤝 Reuniões'   },
  { id: 'entregas',  label: '📦 Entregas'   },
];

const MONTHS_PT   = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DOW_PT      = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DOW_FULL_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DEFAULT_EVENT_STYLE = {
  bg: 'bg-zinc-800', text: 'text-zinc-400',
  border: 'border-zinc-700', emoji: '📌',
};

const getEventTypeStyle = (type: string) => EVENT_TYPE_STYLES[type] ?? DEFAULT_EVENT_STYLE;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

const getTodayStr = (): string => new Date().toISOString().split('T')[0];

const getTomorrowStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};


// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Shared modal style constants
// ─────────────────────────────────────────────
const MODAL_INPUT_CLS =
  'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-400';
const MODAL_LABEL_CLS = 'text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block';

// ─────────────────────────────────────────────
// AddCardModal
// ─────────────────────────────────────────────
interface AddCardModalProps {
  columnTitle: string;
  onSave: (card: Omit<KanbanCard, 'id'>) => void;
  onClose: () => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ columnTitle, onSave, onClose }) => {
  const [title, setTitle]           = useState('');
  const [priority, setPriority]     = useState<KanbanPriority>('Normal');
  const [startDate, setStartDate]   = useState('');
  const [dueDate, setDueDate]       = useState('');
  const [notes, setNotes]           = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), priority, startDate, dueDate, notes: notes.trim(), assignedTo: assignedTo || undefined });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Novo Card</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Coluna: {columnTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className={MODAL_LABEL_CLS}>Título *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              placeholder="Ex: Reels de bastidores da produção"
              className={MODAL_INPUT_CLS}
            />
          </div>

          <div>
            <label className={MODAL_LABEL_CLS}>Prioridade</label>
            <div className="grid grid-cols-4 gap-1.5">
              {KANBAN_PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 px-1 rounded-xl border-2 text-[10px] font-black transition-all text-center ${
                    priority === p
                      ? 'border-violet-500 bg-violet-900/20 text-violet-300'
                      : 'border-zinc-800 text-zinc-400 hover:border-violet-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={MODAL_LABEL_CLS}>Data de Início</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className={MODAL_INPUT_CLS}
              />
            </div>
            <div>
              <label className={MODAL_LABEL_CLS}>Data de Entrega</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={MODAL_INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className={MODAL_LABEL_CLS}>Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalhes adicionais sobre o conteúdo…"
              rows={3}
              className={`${MODAL_INPUT_CLS} resize-none`}
            />
          </div>

          <div>
            <label className={MODAL_LABEL_CLS}>
              <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> Responsavel (Opcional)</span>
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="Ex: Gabriel Correia, Editor..."
              className={MODAL_INPUT_CLS}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-zinc-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar Card
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CardDetailModal
// ─────────────────────────────────────────────
interface CardDetailModalProps {
  card: KanbanCard;
  columnTitle: string;
  onSave: (card: KanbanCard) => void;
  onDelete: () => void;
  onClose: () => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columnTitle,
  onSave,
  onDelete,
  onClose,
}) => {
  const [draft, setDraft] = useState<KanbanCard>(card);

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onSave({ ...draft, title: draft.title.trim(), notes: draft.notes.trim() });
  };

  const set = <K extends keyof KanbanCard>(key: K, value: KanbanCard[K]) =>
    setDraft(p => ({ ...p, [key]: value }));

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Editar Card</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Coluna: {columnTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className={MODAL_LABEL_CLS}>Título *</label>
            <input
              autoFocus
              type="text"
              value={draft.title}
              onChange={e => set('title', e.target.value)}
              className={MODAL_INPUT_CLS}
            />
          </div>

          <div>
            <label className={MODAL_LABEL_CLS}>Prioridade</label>
            <div className="grid grid-cols-4 gap-1.5">
              {KANBAN_PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => set('priority', p)}
                  className={`py-2 px-1 rounded-xl border-2 text-[10px] font-black transition-all text-center ${
                    draft.priority === p
                      ? 'border-violet-500 bg-violet-900/20 text-violet-300'
                      : 'border-zinc-800 text-zinc-400 hover:border-violet-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={MODAL_LABEL_CLS}>Data de Início</label>
              <input
                type="date"
                value={draft.startDate}
                onChange={e => set('startDate', e.target.value)}
                className={MODAL_INPUT_CLS}
              />
            </div>
            <div>
              <label className={MODAL_LABEL_CLS}>Data de Entrega</label>
              <input
                type="date"
                value={draft.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className={MODAL_INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className={MODAL_LABEL_CLS}>Notas</label>
            <textarea
              value={draft.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Detalhes adicionais sobre o conteúdo…"
              rows={3}
              className={`${MODAL_INPUT_CLS} resize-none`}
            />
          </div>

          <div>
            <label className={MODAL_LABEL_CLS}>
              <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> Responsavel (Opcional)</span>
            </label>
            <input
              type="text"
              value={draft.assignedTo ?? ''}
              onChange={e => set('assignedTo', e.target.value || undefined)}
              placeholder="Ex: Gabriel Correia, Editor..."
              className={MODAL_INPUT_CLS}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-zinc-800 flex-shrink-0">
          <button
            onClick={onDelete}
            className="p-3 rounded-xl border border-red-800/50 text-red-500 hover:bg-red-900/20 transition-all flex-shrink-0"
            title="Excluir card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!draft.title.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// NewEventModal
// ─────────────────────────────────────────────
interface NewEventModalProps {
  initialEvent?: Partial<AgendaEvent>;
  onSave: (event: Omit<AgendaEvent, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const NewEventModal: React.FC<NewEventModalProps> = ({ initialEvent, onSave, onDelete, onClose }) => {
  const isEdit       = !!initialEvent;
  const initIsCustom = !!initialEvent && !EVENT_TYPES.includes(initialEvent.type);

  const [title, setTitle]                   = useState(initialEvent?.title ?? '');
  const [type, setType]                     = useState<string>(initIsCustom ? 'Gravação' : (initialEvent?.type ?? 'Gravação'));
  const [useCustomType, setUseCustomType]   = useState(initIsCustom);
  const [customTypeText, setCustomTypeText] = useState(initIsCustom ? (initialEvent?.type ?? '') : '');
  const [location, setLocation]             = useState<EventLocation>(initialEvent?.location ?? 'Interna');
  const [address, setAddress]               = useState(initialEvent?.address ?? '');
  const [date, setDate]                     = useState(initialEvent?.date ?? getTodayStr());
  const [startTime, setStartTime]           = useState(initialEvent?.startTime ?? '09:00');
  const [endTime, setEndTime]               = useState(initialEvent?.endTime ?? '10:00');
  const [notes, setNotes]                   = useState(initialEvent?.notes ?? '');

  const effectiveType = useCustomType ? customTypeText.trim() : type;

  const handleSave = () => {
    if (!title.trim() || !date) return;
    if (useCustomType && !customTypeText.trim()) return;
    onSave({ title: title.trim(), type: effectiveType || 'Outro', location, address: address.trim(), date, startTime, endTime, notes: notes.trim() });
  };

  const addressPlaceholder =
    location === 'Remoto'  ? 'Ex: meet.google.com/abc-xyz' :
    location === 'Externa' ? 'Ex: Rua das Flores, 123 — São Paulo' :
                             'Ex: Estúdio A, 2º andar';

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{isEdit ? 'Editar Evento' : 'Novo Evento'}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Agenda de produção audiovisual</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <label className={MODAL_LABEL_CLS}>Título do Evento *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              placeholder="Ex: Gravação Comercial de Produto"
              className={MODAL_INPUT_CLS}
            />
          </div>

          {/* Event type */}
          <div>
            <label className={MODAL_LABEL_CLS}>Tipo de Evento</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map(t => {
                const s = getEventTypeStyle(t);
                return (
                  <button
                    key={t}
                    onClick={() => { setType(t); setUseCustomType(false); }}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold text-left transition-all flex items-center gap-2 ${
                      !useCustomType && type === t
                        ? 'border-violet-500 bg-violet-900/20 text-violet-300'
                        : 'border-zinc-800 text-zinc-400 hover:border-violet-700'
                    }`}
                  >
                    <span>{s.emoji}</span> {t}
                  </button>
                );
              })}
              <button
                onClick={() => setUseCustomType(true)}
                className={`col-span-2 py-2.5 px-3 rounded-xl border-2 text-xs font-bold text-left transition-all flex items-center gap-2 ${
                  useCustomType
                    ? 'border-violet-500 bg-violet-900/20 text-violet-300'
                    : 'border-zinc-800 text-zinc-400 hover:border-violet-700'
                }`}
              >
                <span>✏️</span> Outros...
              </button>
            </div>
            {useCustomType && (
              <input
                type="text"
                value={customTypeText}
                onChange={e => setCustomTypeText(e.target.value)}
                placeholder="Ex: Viagem, Scouting, Teste de Câmera…"
                className={`${MODAL_INPUT_CLS} mt-2`}
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label className={MODAL_LABEL_CLS}>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={MODAL_INPUT_CLS} />
          </div>

          {/* Start + End time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={MODAL_LABEL_CLS}>Início</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={MODAL_INPUT_CLS} />
            </div>
            <div>
              <label className={MODAL_LABEL_CLS}>Término</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={MODAL_INPUT_CLS} />
            </div>
          </div>

          {/* Location toggle */}
          <div>
            <label className={MODAL_LABEL_CLS}>Local / Formato</label>
            <div className="flex gap-2">
              {EVENT_LOCATIONS.map(loc => {
                const l = EVENT_LOCATION_LABELS[loc];
                return (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      location === loc
                        ? 'border-violet-500 bg-violet-900/20 text-violet-300'
                        : 'border-zinc-800 text-zinc-400 hover:border-violet-700'
                    }`}
                  >
                    <span className="text-base">{l.emoji}</span>
                    <span>{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address / Link */}
          <div>
            <label className={MODAL_LABEL_CLS}>{location === 'Remoto' ? 'Link da Reunião' : 'Endereço'}</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={addressPlaceholder}
              className={MODAL_INPUT_CLS}
            />
          </div>

          {/* Equipment & Notes */}
          <div>
            <label className={MODAL_LABEL_CLS}>Equipamentos e Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Levar drone, baterias extras, lente 35mm…"
              rows={3}
              className={`${MODAL_INPUT_CLS} resize-none`}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-zinc-800 flex-shrink-0">
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-red-800/50 text-red-500 hover:bg-red-900/20 transition-all flex-shrink-0 text-xs font-bold"
              title="Excluir evento"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:bg-zinc-800 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !date || (useCustomType && !customTypeText.trim())}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Salvar Alterações' : 'Salvar Evento'}
          </button>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ClientWorkflowTab sub-component
// ─────────────────────────────────────────────
const ClientWorkflowTab: React.FC<{ client: Client }> = ({ client }) => {
  // ── To-Do state ──────────────────────────────────────────
  const [todos, setTodos]               = useState<TodoItem[]>(INITIAL_TODOS);
  const [doneTodos, setDoneTodos]       = useState<TodoItem[]>([]);
  const [todoInput, setTodoInput]       = useState('');
  const [todoPriority, setTodoPriority] = useState<TodoPriority>('Média');
  const [showDone, setShowDone]         = useState(false);

  // ── Roteiros (for pending workflow scripts) ──────────────
  const { data: roteiroPkgs, setData: setRoteiroPkgs } = useClientData<ScriptPackage[]>(client.id, 'roteiros', []);

  // Scripts with workflow_status='pending' that haven't been sent to kanban yet
  const pendingWorkflowScripts = useMemo(() => {
    const scripts: { pkgId: string; script: ScriptDocument }[] = [];
    const collectPending = (pkgs: ScriptPackage[]) => {
      for (const pkg of pkgs) {
        for (const s of pkg.scripts) {
          if (s.workflow_status === 'pending' && !s.inWorkflow) {
            scripts.push({ pkgId: pkg.id, script: s });
          }
        }
        if (pkg.subFolders) collectPending(pkg.subFolders);
      }
    };
    if (Array.isArray(roteiroPkgs)) collectPending(roteiroPkgs);
    return scripts;
  }, [roteiroPkgs]);

  // ── Kanban state (persisted via API) ──────────────────────
  const { data: columns, setData: setColumns } = useClientData<KanbanColumn[]>(client.id, 'kanban', KANBAN_INITIAL_COLUMNS);

  // Restaura colunas padrão ausentes quando a API retorna dados incompletos ou array vazio
  const kanbanRestoredRef = useRef<string | null>(null);
  useEffect(() => {
    if (kanbanRestoredRef.current === client.id) return;
    const existingIds = new Set(columns.map(c => c.id));
    const missing = KANBAN_INITIAL_COLUMNS.filter(c => !existingIds.has(c.id));
    if (missing.length > 0) {
      kanbanRestoredRef.current = client.id;
      setColumns(prev => {
        const prevIds = new Set(prev.map(c => c.id));
        const stillMissing = KANBAN_INITIAL_COLUMNS.filter(c => !prevIds.has(c.id));
        return stillMissing.length > 0 ? [...prev, ...stillMissing] : prev;
      });
    }
  }, [columns, client.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [addingToCol, setAddingToCol]           = useState<string | null>(null);
  const [editingCard, setEditingCard]           = useState<{ card: KanbanCard; colId: string } | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [activeArchiveTab, setActiveArchiveTab] = useState<'tasks' | 'columns'>('tasks');
  const [renamingColId, setRenamingColId]       = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle]       = useState('');
  const [addingCol, setAddingCol]               = useState(false);
  const [newColTitle, setNewColTitle]           = useState('');
  const MAX_COLUMNS = 8;

  const { data: archivedCards, setData: setArchivedCards } = useClientData<KanbanCard[]>(client.id, 'archive', []);

  // ── Date helpers (computed each render) ──────────────────
  const todayStr    = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  // ── Alert counts (exclude "finalizado" column) ───────────
  const activeCards = columns
    .filter(c => c.id !== 'finalizado')
    .flatMap(c => c.cards)
    .filter(c => c.dueDate);

  const overdueCount  = activeCards.filter(c => c.dueDate < todayStr).length;
  const dueSoonCount  = activeCards.filter(c => c.dueDate >= todayStr && c.dueDate <= tomorrowStr).length;

  // Kanban + archive persistence handled by useClientData hook

  // ── To-Do handlers ────────────────────────────────────────
  const addTodo = () => {
    if (!todoInput.trim()) return;
    setTodos(prev => [
      { id: crypto.randomUUID(), text: todoInput.trim(), priority: todoPriority, createdAt: Date.now() },
      ...prev,
    ]);
    setTodoInput('');
  };

  const completeTodo = (id: string) => {
    const item = todos.find(t => t.id === id);
    if (!item) return;
    setTodos(prev => prev.filter(t => t.id !== id));
    setDoneTodos(prev => [item, ...prev]);
  };

  const undoTodo = (id: string) => {
    const item = doneTodos.find(t => t.id === id);
    if (!item) return;
    setDoneTodos(prev => prev.filter(t => t.id !== id));
    setTodos(prev => [item, ...prev]);
  };

  // ── Kanban handlers ───────────────────────────────────────
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    setColumns(prev => {
      const cols = prev.map(c => ({ ...c, cards: [...c.cards] }));
      const src = cols.find(c => c.id === source.droppableId)!;
      const dst = cols.find(c => c.id === destination.droppableId)!;
      const [moved] = src.cards.splice(source.index, 1);
      dst.cards.splice(destination.index, 0, moved);
      // When dropped into "Finalizado", also add to archive
      if (destination.droppableId === 'finalizado') {
        setArchivedCards(prev => [moved, ...prev.filter(c => c.id !== moved.id)]);
      }
      return cols;
    });
  };

  const addCard = (colId: string, draft: Omit<KanbanCard, 'id'>) => {
    setColumns(prev =>
      prev.map(c =>
        c.id === colId
          ? { ...c, cards: [{ id: crypto.randomUUID(), ...draft }, ...c.cards] }
          : c,
      ),
    );
    setAddingToCol(null);
  };

  const updateCard = (colId: string, updated: KanbanCard) => {
    setColumns(prev =>
      prev.map(c =>
        c.id === colId
          ? { ...c, cards: c.cards.map(card => (card.id === updated.id ? updated : card)) }
          : c,
      ),
    );
    setEditingCard(null);
  };

  const deleteCard = (colId: string, cardId: string) => {
    setColumns(prev =>
      prev.map(c =>
        c.id === colId
          ? { ...c, cards: c.cards.filter(card => card.id !== cardId) }
          : c,
      ),
    );
    setEditingCard(null);
  };

  const clearColumn = (colId: string) => {
    setColumns(prev => {
      // Move "Finalizado" cards to archive instead of deleting them
      if (colId === 'finalizado') {
        const col = prev.find(c => c.id === colId);
        if (col && col.cards.length > 0) {
          setArchivedCards(existing => {
            const existingIds = new Set(existing.map(c => c.id));
            const toArchive = col.cards.filter(c => !existingIds.has(c.id));
            return [...toArchive, ...existing];
          });
        }
      }
      return prev.map(c => c.id === colId ? { ...c, cards: [] } : c);
    });
  };

  const restoreCard = (card: KanbanCard) => {
    setArchivedCards(prev => prev.filter(c => c.id !== card.id));
    setColumns(prev => {
      const firstId = prev[0]?.id ?? 'preproducao';
      return prev.map(c => c.id === firstId ? { ...c, cards: [card, ...c.cards] } : c);
    });
  };

  const renameColumn = (colId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) { setRenamingColId(null); return; }
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, title: trimmed } : c));
    setRenamingColId(null);
  };

  const kanbanScrollRef = useRef<HTMLDivElement>(null);

  const addColumn = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setColumns(prev => [
      ...prev,
      { id: crypto.randomUUID(), emoji: '', title: trimmed, cards: [] },
    ]);
    setAddingCol(false);
    setNewColTitle('');
  };

  const handleAddColumnFromHeader = () => {
    if (columns.filter(c => !c.isArchived).length >= MAX_COLUMNS) return;
    const newId = crypto.randomUUID();
    setColumns(prev => [...prev, { id: newId, emoji: '', title: 'Nova Coluna', cards: [] }]);
    setRenamingColId(newId);
    setRenamingTitle('Nova Coluna');
    setTimeout(() => {
      kanbanScrollRef.current?.scrollTo({ left: kanbanScrollRef.current.scrollWidth, behavior: 'smooth' });
    }, 50);
  };

  const moveColumn = (colId: string, direction: 'left' | 'right') => {
    const visible = columns.filter(c => !c.isArchived);
    const visIdx = visible.findIndex(c => c.id === colId);
    if (visIdx === -1) return;
    const targetVisIdx = direction === 'left' ? visIdx - 1 : visIdx + 1;
    if (targetVisIdx < 0 || targetVisIdx >= visible.length) return;
    const realA = columns.findIndex(c => c.id === visible[visIdx].id);
    const realB = columns.findIndex(c => c.id === visible[targetVisIdx].id);
    const next = [...columns];
    [next[realA], next[realB]] = [next[realB], next[realA]];
    setColumns(next);
  };

  const deleteColumn = (colId: string) => {
    const col = columns.find(c => c.id === colId);
    if (!col) return;
    const msg = col.cards.length > 0
      ? `Arquivar a coluna "${col.title}"? Ela e suas ${col.cards.length} tarefa(s) serão movidas para o arquivo e poderão ser restauradas depois.`
      : `Arquivar a coluna "${col.title}"?`;
    if (!window.confirm(msg)) return;
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, isArchived: true } : c));
  };

  // Send a pending-workflow script to the first kanban column
  const sendPendingToKanban = (pkgId: string, script: ScriptDocument) => {
    const newCard: KanbanCard = {
      id: `script_${script.id}_${Date.now()}`,
      title: script.title || 'Roteiro sem título',
      priority: 'Normal',
      startDate: '',
      dueDate: '',
      notes: 'Criado automaticamente a partir do roteiro.',
      assignedTo: '',
    };
    setColumns(prev => prev.map((col, idx) =>
      idx === 0 ? { ...col, cards: [...col.cards, newCard] } : col
    ));
    // Mark script as inWorkflow + in_progress
    setRoteiroPkgs(prev => {
      const update = (pkgs: ScriptPackage[]): ScriptPackage[] =>
        pkgs.map(pkg => ({
          ...pkg,
          scripts: pkg.scripts.map(s =>
            s.id === script.id ? { ...s, inWorkflow: true, workflow_status: 'in_progress' as const } : s
          ),
          subFolders: pkg.subFolders ? update(pkg.subFolders) : undefined,
        }));
      return update(prev);
    });
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">

      {/* ── Pending Roteiros Banner ── */}
      {pendingWorkflowScripts.length > 0 && (
        <div className="bg-violet-950/30 border border-violet-800/40 rounded-2xl p-4 flex-shrink-0 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-violet-400">
              Roteiros Pendentes ({pendingWorkflowScripts.length})
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pendingWorkflowScripts.map(({ pkgId, script }) => (
              <button
                key={script.id}
                onClick={() => sendPendingToKanban(pkgId, script)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-violet-600 text-left transition-all group"
              >
                <span className="text-sm text-zinc-200 font-bold truncate max-w-[180px]">{script.title}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-700/40 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Enviar
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Unified Archive Modal ── */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Archive className="w-4 h-4 text-violet-500" />
                <h2 className="text-base font-bold text-white">Itens Arquivados</h2>
              </div>
              <button onClick={() => setShowArchiveModal(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 flex-shrink-0">
              {(['tasks', 'columns'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveArchiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    activeArchiveTab === tab
                      ? 'text-violet-400 border-b-2 border-violet-500'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  {tab === 'tasks' ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> Tarefas {archivedCards.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-black">{archivedCards.length}</span>}</>
                  ) : (
                    <><Folder className="w-3.5 h-3.5" /> Colunas {columns.filter(c => c.isArchived).length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-[10px] font-black">{columns.filter(c => c.isArchived).length}</span>}</>
                  )}
                </button>
              ))}
            </div>
            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {activeArchiveTab === 'tasks' ? (
                archivedCards.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <Archive className="w-8 h-8 text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500">Nenhuma tarefa arquivada ainda.</p>
                    <p className="text-xs text-zinc-400 mt-1">Cards movidos para "Finalizado" aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {archivedCards.map(card => (
                      <div key={card.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-800/40">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-300 leading-snug">{card.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${KANBAN_PRIORITY_COLORS[card.priority] ?? ''}`}>{card.priority}</span>
                            {card.dueDate && <span className="text-[10px] text-zinc-400">{formatDate(card.dueDate)}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => restoreCard(card)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-violet-800/50 text-violet-400 hover:bg-violet-900/20 transition-all"
                        >
                          <RotateCcw className="w-3 h-3" /> Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                columns.filter(c => c.isArchived).length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <Folder className="w-8 h-8 text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500">Nenhuma coluna arquivada.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {columns.filter(c => c.isArchived).map(col => (
                      <div key={col.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-800/40">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-300 truncate">{col.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{col.cards.length} tarefa{col.cards.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                          onClick={() => setColumns(prev => prev.map(c => c.id === col.id ? { ...c, isArchived: false } : c))}
                          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-violet-800/50 text-violet-400 hover:bg-violet-900/20 transition-all"
                        >
                          <RotateCcw className="w-3 h-3" /> Restaurar
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Alerts Banner ── */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div className="flex flex-col gap-2 flex-shrink-0">
          {overdueCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-900/20 border border-red-800/50 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <p className="text-xs font-bold text-red-400">
                Atenção: Há {overdueCount} tarefa{overdueCount !== 1 ? 's' : ''} atrasada{overdueCount !== 1 ? 's' : ''} para este cliente!
              </p>
            </div>
          )}
          {dueSoonCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-900/20 border border-amber-800/50 animate-in fade-in duration-200">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <p className="text-xs font-bold text-amber-400">
                Há {dueSoonCount} tarefa{dueSoonCount !== 1 ? 's' : ''} que precisa{dueSoonCount !== 1 ? 'm' : ''} ser entregue{dueSoonCount !== 1 ? 's' : ''} hoje ou amanhã.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Content Row: To-Do + Kanban ── */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">

        {/* ── To-Do List ── */}
        <aside className="lg:w-64 flex-shrink-0 flex flex-col min-h-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">

            {/* Header */}
            <div className="px-4 py-3.5 border-b border-zinc-800 flex-shrink-0">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5"><ListTodo className="w-3.5 h-3.5 text-violet-500" /> Tarefas & Lembretes</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {todos.length} pendente{todos.length !== 1 ? 's' : ''} · {client.brandName}
              </p>
            </div>

            {/* Input + priority selector */}
            <div className="px-3 py-3 border-b border-zinc-800 space-y-2 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={todoInput}
                  onChange={e => setTodoInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
                  placeholder="Nova tarefa..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-400"
                />
                <button
                  onClick={addTodo}
                  disabled={!todoInput.trim()}
                  className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Priority buttons */}
              <div className="flex gap-1.5">
                {(['Baixa', 'Média', 'Urgente'] as TodoPriority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setTodoPriority(p)}
                    className={`flex-1 text-[10px] font-black py-1 rounded-lg border-2 transition-all ${
                      todoPriority === p
                        ? TODO_PRIORITY_STYLES[p].btn
                        : 'border-zinc-700 text-zinc-400 hover:hover:border-zinc-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Active list — scrollable */}
            <ul className="px-3 py-3 space-y-2.5 flex-1 min-h-0 overflow-y-auto">
              {todos.length === 0 && (
                <li className="text-xs text-zinc-400 italic text-center py-4">
                  Nenhuma tarefa pendente 🎉
                </li>
              )}
              {todos.map(todo => (
                <li key={todo.id} className="flex items-start gap-2.5 group">
                  <button
                    onClick={() => completeTodo(todo.id)}
                    className="mt-0.5 flex-shrink-0"
                    title="Marcar como concluída"
                  >
                    <Circle className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs leading-relaxed block text-zinc-300">
                      {todo.text}
                    </span>
                    <span className={`mt-0.5 inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded ${TODO_PRIORITY_STYLES[todo.priority].badge}`}>
                      {todo.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer: done archive */}
            {doneTodos.length > 0 && (
              <div className="border-t border-zinc-800 flex-shrink-0">
                <button
                  onClick={() => setShowDone(v => !v)}
                  className="w-full px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-300 font-bold flex items-center justify-between transition-colors"
                >
                  <span>Ver {doneTodos.length} tarefa{doneTodos.length !== 1 ? 's' : ''} concluída{doneTodos.length !== 1 ? 's' : ''}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showDone ? 'rotate-90' : ''}`} />
                </button>
                {showDone && (
                  <ul className="px-3 pb-3 space-y-2 animate-in fade-in duration-200">
                    {doneTodos.map(todo => (
                      <li key={todo.id} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs leading-relaxed block line-through text-zinc-400">
                            {todo.text}
                          </span>
                          <button
                            onClick={() => undoTodo(todo.id)}
                            className="text-[10px] font-bold text-violet-500 hover:text-violet-300 transition-colors"
                          >
                            Desfazer
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Kanban Board ── */}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col gap-2">
          {/* Kanban top controls */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {columns.filter(c => !c.isArchived).length < MAX_COLUMNS && (
              <button
                onClick={handleAddColumnFromHeader}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm shadow-violet-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Coluna
              </button>
            )}
            {(() => {
              const totalArchived = archivedCards.length + columns.filter(c => c.isArchived).length;
              return (
                <button
                  onClick={() => { setActiveArchiveTab('tasks'); setShowArchiveModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 text-zinc-400 hover:text-violet-400 hover:border-violet-700 transition-all"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Ver Arquivados
                  {totalArchived > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-violet-900/30 text-violet-400 text-[10px] font-black">
                      {totalArchived}
                    </span>
                  )}
                </button>
              );
            })()}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div ref={kanbanScrollRef} className="flex overflow-x-auto overflow-y-hidden w-full h-full min-h-[70vh] pb-4 gap-4 items-stretch">
                {columns.filter(c => !c.isArchived).map((col, colIndex, visArr) => {
                  const isLastCol = col.id === 'finalizado';
                  return (
                    <div key={col.id} className="w-64 flex-shrink-0 flex flex-col h-full">

                      {/* Column header */}
                      <div className="flex items-center justify-between mb-2 px-1 flex-shrink-0 gap-1">
                        {/* Title / inline rename */}
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {renamingColId === col.id ? (
                            <>
                              <input
                                autoFocus
                                value={renamingTitle}
                                onChange={e => setRenamingTitle(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') renameColumn(col.id, renamingTitle);
                                  if (e.key === 'Escape') setRenamingColId(null);
                                }}
                                onBlur={() => renameColumn(col.id, renamingTitle || col.title)}
                                className="flex-1 min-w-0 text-xs font-bold bg-transparent border-b border-violet-500 text-white focus:outline-none pb-0.5"
                              />
                              <button
                                onMouseDown={e => { e.preventDefault(); renameColumn(col.id, renamingTitle); }}
                                className="flex-shrink-0 p-0.5 text-emerald-500 hover:text-emerald-400 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onMouseDown={e => { e.preventDefault(); setRenamingColId(null); }}
                                className="flex-shrink-0 p-0.5 text-red-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 min-w-0">
                                {(() => { const ColIcon = KANBAN_COL_ICON[col.id]; const colColor = KANBAN_COL_COLOR[col.id] || 'text-zinc-400'; return ColIcon ? <ColIcon className={`w-3.5 h-3.5 flex-shrink-0 ${colColor}`} /> : null; })()}
                                <span className="truncate">{col.title}</span>
                                <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                                  {col.cards.length}
                                </span>
                              </h4>
                              <button
                                onClick={() => { setRenamingColId(col.id); setRenamingTitle(col.title); }}
                                className="flex-shrink-0 p-0.5 text-zinc-600 hover:text-zinc-400 transition-colors"
                                title="Renomear coluna"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteColumn(col.id)}
                                className="flex-shrink-0 p-0.5 text-red-500 hover:text-red-400 transition-colors"
                                title="Excluir coluna"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveColumn(col.id, 'left')}
                                disabled={colIndex === 0}
                                className="flex-shrink-0 p-0.5 text-zinc-600 hover:text-violet-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Mover coluna para a esquerda"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveColumn(col.id, 'right')}
                                disabled={colIndex === visArr.length - 1}
                                className="flex-shrink-0 p-0.5 text-zinc-600 hover:text-violet-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Mover coluna para a direita"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Clear button — only on "Finalizado" when it has cards */}
                          {isLastCol && col.cards.length > 0 && (
                            <button
                              onClick={() => {
                                if (confirm('Limpar todos os cards de "Finalizado"?')) clearColumn(col.id);
                              }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-900/20 transition-colors"
                            >
                              Limpar
                            </button>
                          )}
                          <button
                            onClick={() => setAddingToCol(col.id)}
                            className="p-1 text-zinc-400 hover:text-violet-500 rounded transition-colors"
                            title="Adicionar card"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Column body — Droppable (scrollable) */}
                      <Droppable droppableId={col.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 min-h-0 overflow-y-auto rounded-2xl p-2 flex flex-col gap-2 transition-colors ${
                              snapshot.isDraggingOver
                                ? 'bg-violet-900/20'
                                : 'bg-zinc-800/30'
                            }`}
                          >
                            {col.cards.map((card, index) => {
                              const isOverdue  = !!card.dueDate && card.dueDate < todayStr;
                              const isDueSoon  = !isOverdue && !!card.dueDate && card.dueDate <= tomorrowStr;
                              const dateLabel  = card.startDate && card.dueDate
                                ? `${formatDate(card.startDate)} → ${formatDate(card.dueDate)}`
                                : card.dueDate
                                ? formatDate(card.dueDate)
                                : card.startDate
                                ? `Início: ${formatDate(card.startDate)}`
                                : null;

                              return (
                                <Draggable key={card.id} draggableId={card.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setEditingCard({ card, colId: col.id })}
                                      className={`bg-zinc-800 border rounded-xl p-3 cursor-pointer select-none transition-all ${
                                        snapshot.isDragging
                                          ? 'border-violet-600 shadow-lg shadow-violet-500/20 rotate-[1deg]'
                                          : isOverdue
                                          ? 'border-red-700/60 hover:border-red-600'
                                          : isDueSoon
                                          ? 'border-amber-700/60 hover:border-amber-600'
                                          : 'border-zinc-700 hover:border-violet-700 hover:shadow-md'
                                      }`}
                                    >
                                      <p className="text-xs font-bold text-zinc-200 leading-snug mb-2">
                                        {card.title}
                                      </p>

                                      <div className="flex items-center gap-1 mb-2">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${KANBAN_PRIORITY_COLORS[card.priority] ?? ''}`}>
                                          {card.priority}
                                        </span>
                                        {isOverdue && (
                                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">
                                            Atrasado
                                          </span>
                                        )}
                                        {isDueSoon && (
                                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400">
                                            Hoje/Amanhã
                                          </span>
                                        )}
                                      </div>

                                      {dateLabel && (
                                        <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-zinc-400'}`}>
                                          <Calendar className="w-3 h-3 flex-shrink-0" />
                                          {dateLabel}
                                        </div>
                                      )}

                                      {card.notes && (
                                        <p className="mt-1.5 text-[10px] text-zinc-400 line-clamp-2 leading-relaxed italic">
                                          {card.notes}
                                        </p>
                                      )}

                                      {card.assignedTo && (() => {
                                        // Support legacy ID-based assignees and new free-text names
                                        const legacy   = KANBAN_ASSIGNEES.find(a => a.id === card.assignedTo);
                                        const fullName = legacy?.name     ?? card.assignedTo!;
                                        const initials = legacy?.initials ?? getInitials(fullName);
                                        const color    = legacy?.color    ?? 'bg-violet-600';
                                        return (
                                          <div className="flex justify-end mt-2">
                                            <div
                                              className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-[9px] font-black ring-2 ring-zinc-900`}
                                              title={fullName}
                                            >
                                              {initials}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}

                            {provided.placeholder}

                            {/* Empty state */}
                            {col.cards.length === 0 && !snapshot.isDraggingOver && (
                              <div className="flex-1 flex items-center justify-center py-6">
                                <p className="text-[11px] text-zinc-400 italic text-center">Vazio</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>

                      {/* Add card button — pinned below the droppable */}
                      <button
                        onClick={() => setAddingToCol(col.id)}
                        className="mt-2 w-full flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-violet-400 hover:text-violet-500 transition-all text-[11px] font-bold flex-shrink-0"
                      >
                        <Plus className="w-3 h-3" /> Adicionar card
                      </button>
                    </div>
                  );
                })}

                {/* ── Add column ── */}
                {columns.filter(c => !c.isArchived).length < MAX_COLUMNS && (
                  addingCol ? (
                    <div className="w-64 flex-shrink-0 flex flex-col gap-2 self-start pt-0.5">
                      <input
                        autoFocus
                        value={newColTitle}
                        onChange={e => setNewColTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addColumn(newColTitle);
                          if (e.key === 'Escape') { setAddingCol(false); setNewColTitle(''); }
                        }}
                        placeholder="Nome da coluna..."
                        className="w-full text-xs font-bold bg-zinc-800 border border-violet-600 rounded-xl px-3 py-2 text-white focus:outline-none placeholder:text-zinc-400"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => addColumn(newColTitle)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Criar
                        </button>
                        <button
                          onClick={() => { setAddingCol(false); setNewColTitle(''); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 text-xs font-bold hover:bg-zinc-800 transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingCol(true)}
                      className="w-52 flex-shrink-0 h-16 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-violet-400 hover:text-violet-400 transition-all text-xs font-bold self-start"
                    >
                      <Plus className="w-4 h-4" /> Adicionar Coluna
                    </button>
                  )
                )}
            </div>
          </DragDropContext>
          </div>{/* end flex-1 min-h-0 */}
        </div>
      </div>

      {/* ── Modals ── */}
      {addingToCol && (
        <AddCardModal
          columnTitle={columns.find(c => c.id === addingToCol)?.title ?? ''}
          onSave={draft => addCard(addingToCol, draft)}
          onClose={() => setAddingToCol(null)}
        />
      )}

      {editingCard && (
        <CardDetailModal
          card={editingCard.card}
          columnTitle={columns.find(c => c.id === editingCard.colId)?.title ?? ''}
          onSave={updated => updateCard(editingCard.colId, updated)}
          onDelete={() => {
            if (confirm(`Excluir card "${editingCard.card.title}"?`)) {
              deleteCard(editingCard.colId, editingCard.card.id);
            }
          }}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// ClientAgendaTab sub-component
// ─────────────────────────────────────────────
interface ClientAgendaTabProps {
  client: Client;
  pendingEventTitle?: string | null;
  onPendingConsumed?: () => void;
}

const ClientAgendaTab: React.FC<ClientAgendaTabProps> = ({ client, pendingEventTitle, onPendingConsumed }) => {
  const { data: events, setData: setEvents } = useClientData<AgendaEvent[]>(client.id, 'agenda', []);
  const [activeFilter, setActiveFilter]         = useState<AgendaFilter>('todas');
  const [calYear, setCalYear]                   = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth]                 = useState(() => new Date().getMonth());
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [editingEvent, setEditingEvent]         = useState<AgendaEvent | null>(null);
  const [viewMode, setViewMode]                 = useState<'list' | 'grid'>('list');
  const [selectedDay, setSelectedDay]           = useState<string | null>(null);
  const [pendingInitialTitle, setPendingInitialTitle] = useState('');

  // Auto-open the "New Event" modal when a title is injected from the Ideias tab
  useEffect(() => {
    if (pendingEventTitle) {
      setPendingInitialTitle(pendingEventTitle);
      setEditingEvent(null);
      setIsModalOpen(true);
      onPendingConsumed?.();
    }
  }, [pendingEventTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayStr    = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  // Agenda persistence handled by useClientData hook

  // ── Mini-calendar ───────────────────────────
  const prevCalMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextCalMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const calCells: (number | null)[] = (() => {
    const firstDow    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  })();

  const eventDates = new Set(events.map(e => e.date));

  const toDayStr = (d: number) =>
    `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // ── Filtered + sorted events ─────────────────
  const filteredEvents = events
    .filter(e => {
      if (selectedDay && viewMode === 'list') return e.date === selectedDay;
      if (activeFilter === 'gravacoes') return e.type === 'Gravação';
      if (activeFilter === 'reunioes')  return e.type === 'Reunião';
      if (activeFilter === 'entregas')  return e.type === 'Entrega de Vídeo';
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // Grid: all events for the displayed month (ignores filters for full visibility)
  const monthStr    = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const monthEvents = events.filter(e => e.date.startsWith(monthStr));

  // ── Handlers ────────────────────────────────
  const saveEvent = (draft: Omit<AgendaEvent, 'id' | 'createdAt'>) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...draft } : e));
      setEditingEvent(null);
    } else {
      setEvents(prev => [...prev, { id: crypto.randomUUID(), ...draft, createdAt: Date.now() }]);
      setIsModalOpen(false);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setEditingEvent(null);
  };

  // ── Date display helper ───────────────────────
  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      day:   d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    };
  };

  // ─────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Left: Mini Calendar + Filters ── */}
      <aside className="lg:w-60 flex-shrink-0 space-y-3">

        {/* Mini Calendar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevCalMonth} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-300">
              {MONTHS_PT[calMonth]} {calYear}
            </span>
            <button onClick={nextCalMonth} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 mb-1">
            {DOW_PT.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-zinc-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells — clickable for day filter */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {calCells.map((day, i) => {
              if (!day) return <div key={i} />;
              const ds         = toDayStr(day);
              const isToday    = ds === todayStr;
              const hasEvent   = eventDates.has(ds);
              const isSelected = selectedDay === ds;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(prev => prev === ds ? null : ds)}
                  className="flex flex-col items-center py-0.5 cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                      isSelected
                        ? 'ring-2 ring-violet-500 ring-offset-1 bg-violet-900/40 text-violet-300'
                        : isToday
                        ? 'bg-violet-600 text-white'
                        : hasEvent
                        ? 'bg-violet-900/30 text-violet-300'
                        : 'text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {day}
                  </div>
                  {hasEvent && (
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-violet-300' : 'bg-violet-500'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Clear day filter */}
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="mt-3 w-full text-center text-xs font-bold text-violet-400 py-1.5 hover:bg-violet-900/20 rounded-xl transition-colors border border-violet-800/50"
            >
              Ver todos ✕
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 mb-2">Filtrar por</p>
          <div className="space-y-1">
            {AGENDA_FILTERS.map(btn => (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === btn.id
                    ? 'bg-violet-900/30 text-violet-400'
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

      </aside>

      {/* ── Right: View Toggle + Content ── */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* View toggle */}
        <div className="flex bg-zinc-800/60 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:hover:text-zinc-300'
            }`}
          >
            📄 Visão em Lista
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-400 hover:hover:text-zinc-300'
            }`}
          >
            📅 Visão Mensal
          </button>
        </div>

        {/* New event CTA */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Evento
        </button>

        {/* ══ LIST VIEW ══ */}
        {viewMode === 'list' && (
          <>
            {/* Selected day indicator */}
            {selectedDay && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-violet-900/20 border border-violet-800/50 rounded-xl">
                <span className="text-xs font-bold text-violet-400">
                  📅 {new Date(selectedDay + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </span>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-[10px] font-black text-violet-500 hover:text-violet-300 transition-colors"
                >
                  Limpar ✕
                </button>
              </div>
            )}

            {/* Empty state */}
            {filteredEvents.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-8 text-center">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-sm font-bold text-zinc-400">
                  {selectedDay ? 'Nenhum evento neste dia' : 'Nenhum evento encontrado'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {selectedDay
                    ? 'Selecione outro dia ou clique em "Ver todos".'
                    : 'Clique em "Novo Evento" para adicionar.'}
                </p>
              </div>
            )}

            {/* Event cards */}
            {filteredEvents.map(event => {
              const { day, month } = formatEventDate(event.date);
              const isToday    = event.date === todayStr;
              const isTomorrow = event.date === tomorrowStr;
              const style      = getEventTypeStyle(event.type);
              const locLabel   = EVENT_LOCATION_LABELS[event.location];

              return (
                <div
                  key={event.id}
                  onClick={() => setEditingEvent(event)}
                  className={`bg-zinc-900 border rounded-2xl p-4 flex gap-4 transition-all hover:shadow-md cursor-pointer ${
                    isToday
                      ? 'border-indigo-600/70 shadow-sm shadow-indigo-500/10'
                      : isTomorrow
                      ? 'border-amber-700/50'
                      : 'border-zinc-800'
                  }`}
                >
                  {/* Date block */}
                  <div className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl ${style.bg}`}>
                    <span className={`text-xl font-black leading-none ${style.text}`}>{day}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${style.text}`}>{month}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">

                    {/* Alert badge */}
                    {(isToday || isTomorrow) && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-indigo-900/30 text-indigo-400'
                          : 'bg-amber-900/30 text-amber-400'
                      }`}>
                        {isToday ? '🚨 Ocorre Hoje!' : '⏰ Amanhã'}
                      </span>
                    )}

                    {/* Title */}
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {event.title}
                    </h4>

                    {/* Time + type + location badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-400">
                        {event.startTime} — {event.endTime}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {style.emoji} {event.type}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-zinc-800 text-zinc-400 border-zinc-700">
                        {locLabel.emoji} {locLabel.label}
                      </span>
                    </div>

                    {/* Address */}
                    {event.address && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.address}</span>
                      </div>
                    )}

                    {/* Equipment notes */}
                    {event.notes && (
                      <div className="flex items-start gap-1 text-[11px] text-zinc-500 italic">
                        <Briefcase className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{event.notes}</span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ══ GRID VIEW ══ */}
        {viewMode === 'grid' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {/* Grid month header — synced with mini-calendar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <button onClick={prevCalMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-zinc-200">
                {MONTHS_PT[calMonth]} {calYear}
              </span>
              <button onClick={nextCalMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* DOW header */}
            <div className="grid grid-cols-7 border-b border-zinc-800">
              {DOW_FULL_PT.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calCells.map((day, i) => {
                const isLastCol = (i + 1) % 7 === 0;
                if (!day) return (
                  <div
                    key={i}
                    className={`min-h-24 border-b border-zinc-800/60 bg-zinc-950/40 ${!isLastCol ? 'border-r' : ''}`}
                  />
                );
                const ds      = toDayStr(day);
                const isToday = ds === todayStr;
                const dayEvs  = monthEvents.filter(e => e.date === ds);
                return (
                  <div
                    key={i}
                    className={`min-h-24 border-b border-zinc-800/60 p-1.5 ${!isLastCol ? 'border-r' : ''} ${isToday ? 'bg-violet-950/20' : ''}`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold mb-1 ${
                      isToday ? 'bg-violet-600 text-white' : 'text-zinc-400'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvs.slice(0, 3).map(ev => {
                        const s = getEventTypeStyle(ev.type);
                        return (
                          <button
                            key={ev.id}
                            onClick={() => setEditingEvent(ev)}
                            title={`${ev.startTime} — ${ev.title}`}
                            className={`w-full text-left px-1.5 py-0.5 rounded text-[9px] font-bold truncate transition-opacity hover:opacity-80 ${s.bg} ${s.text}`}
                          >
                            {ev.startTime} {ev.title}
                          </button>
                        );
                      })}
                      {dayEvs.length > 3 && (
                        <p className="text-[9px] font-bold text-zinc-400 px-1">+{dayEvs.length - 3} mais</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Modal — new event */}
      {isModalOpen && (
        <NewEventModal
          initialEvent={pendingInitialTitle ? { title: pendingInitialTitle, type: 'Gravação' } : undefined}
          onSave={saveEvent}
          onClose={() => { setIsModalOpen(false); setPendingInitialTitle(''); }}
        />
      )}

      {/* Modal — edit event */}
      {editingEvent && (
        <NewEventModal
          initialEvent={editingEvent}
          onSave={saveEvent}
          onDelete={() => deleteEvent(editingEvent.id)}
          onClose={() => setEditingEvent(null)}
        />
      )}

    </div>
  );
};

// ─────────────────────────────────────────────
// ClientAcervoTab sub-component
// ─────────────────────────────────────────────
const ACERVO_DEVICE_LABELS: Record<string, string> = {
  camera_a: 'Câm-A', camera_b: 'Câm-B', drone: 'Drone',
  audio_externo: 'Áudio Ext.', outros: 'Outros',
};


const ClientAcervoTab: React.FC<{ client: Client; onNavigateToArquivos?: () => void }> = ({ client, onNavigateToArquivos }) => {
  // ── Read global recordings and HDDs from API ──────────────
  const { data: allRecordings } = useUserData<Recording[]>('recordings', []);
  const { data: allHdds } = useUserData<HDD[]>('hdds', []);

  const displayItems = allRecordings.filter(r => r.clientId === client.id);

  const getHddName = (id: string): string =>
    allHdds.find(h => h.id === id)?.name ?? id;

  const fmtDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  // ─────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Acervo de Backups</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {displayItems.length === 0
              ? 'Nenhum backup vinculado a este cliente'
              : `${displayItems.length} backup${displayItems.length !== 1 ? 's' : ''} registrado${displayItems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {onNavigateToArquivos && (
          <button
            onClick={onNavigateToArquivos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 transition-colors shadow-sm shadow-violet-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Backup
          </button>
        )}
      </div>

      {/* ── Backup cards grid ── */}
      {displayItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems.map(rec => (
            <div
              key={rec.id}
              className="group relative flex flex-col gap-2.5 p-4 bg-zinc-800/60 border border-zinc-700/40 rounded-2xl hover:border-violet-500/50 transition-all min-h-[160px]"
            >
              {/* Icon + pending badge */}
              <div className="flex items-start justify-between gap-1">
                <div className="w-9 h-9 flex items-center justify-center bg-violet-500/15 rounded-xl flex-shrink-0">
                  <Folder className="w-4 h-4 text-violet-400" />
                </div>
                {rec.hasPendingTakes && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/50 flex-shrink-0">
                    ⚠️ Pendente
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white leading-tight line-clamp-2">
                  {rec.title}
                </p>
                {rec.summary && (
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-snug">
                    {rec.summary}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{fmtDate(rec.recordedAt)}</span>
              </div>

              {/* HDD badges */}
              <div className="flex flex-wrap gap-1 mt-auto pt-0.5">
                {rec.hddIds.slice(0, 2).map(id => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 bg-violet-900/30 text-violet-300 rounded-full border border-violet-800/50 truncate max-w-[90px]"
                  >
                    <HardDrive className="w-2.5 h-2.5 flex-shrink-0" />
                    {getHddName(id)}
                  </span>
                ))}
                {rec.hddIds.length === 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-700/50 text-zinc-500 rounded-full border border-zinc-700/50">
                    Sem HD
                  </span>
                )}
                {rec.hddIds.length > 2 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 rounded-full border border-zinc-700/50">
                    +{rec.hddIds.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {displayItems.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-10 text-center">
          <HardDrive className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-400">
            Nenhum backup registrado para este cliente ainda.
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto mb-5">
            Faça um ingest no Hub de Arquivos e vincule este cliente no campo &quot;Cliente Relacionado&quot;.
          </p>
          {onNavigateToArquivos && (
            <button
              onClick={onNavigateToArquivos}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 transition-colors shadow-sm shadow-violet-500/30"
            >
              <Plus className="w-4 h-4" />
              Fazer Novo Backup
            </button>
          )}
        </div>
      )}

    </div>
  );
};

// ─────────────────────────────────────────────
// Entregas Tab — types & constants
// ─────────────────────────────────────────────
type DeliverableStatus = 'aguardando' | 'aprovado' | 'alteracao';
type DeliverableExpiry = 7 | 15 | 30;

interface Deliverable {
  id: string;
  title: string;
  status: DeliverableStatus;
  shareLink: string;
  expiresInDays: DeliverableExpiry;
  sentAt: number;
  rating?: number;
  feedback?: string;
}

const DELIVERABLE_STATUS_CONFIG: Record<DeliverableStatus, { label: string; Icon: React.FC<{ className?: string }>; badge: string }> = {
  'aguardando': {
    label: 'Aguardando Aprovação',
    Icon: Clock,
    badge: 'bg-amber-900/20 text-amber-400 border-amber-800/50',
  },
  'aprovado': {
    label: 'Aprovado',
    Icon: CheckCircle,
    badge: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50',
  },
  'alteracao': {
    label: 'Pedido de Alteração',
    Icon: RotateCcw,
    badge: 'bg-orange-900/20 text-orange-400 border-orange-800/50',
  },
};

// ─────────────────────────────────────────────
// Sala de Roteiros — types & constants
// ─────────────────────────────────────────────
type ScriptStatus = 'Rascunho' | 'Aprovado' | 'Gravado';

interface ScriptScene {
  id: string;
  type?: 'scene' | 'free_text';
  visual: string;
  audio: string;
  isChecked: boolean;
  storyboardUrl?: string;
  storyboardText?: string;
  freeContent?: string;
  tags?: string[];
  location?: string;
  shotSize?: string;
  isRecorded?: boolean;
}

interface ScriptDocument {
  id: string;
  title: string;
  status: ScriptStatus;
  referenceLink: string;
  gancho: string;
  scenes: ScriptScene[];
  createdAt: number;
  writingMode?: 'structured' | 'free';
  freeText?: string;
  // Portal integration
  portalStatus?: 'aguardando_cliente' | 'aprovado_cliente' | 'refacao';
  clientFeedback?: string;
  sentToPortalAt?: number;
  rating?: number; // 1–5 stars from portal client
  inWorkflow?: boolean; // true when sent to the Kanban workflow
  workflow_status?: 'pending' | 'in_progress' | 'done'; // tracks script in workflow pipeline
  // Soft delete
  isArchived?: boolean;
  archivedAt?: string; // ISO timestamp
}

const ARCHIVE_RETENTION_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

interface ScriptPackage {
  id: string;
  title: string;
  scripts: ScriptDocument[];
  createdAt: number;
  subFolders?: ScriptPackage[];
  isPinnedToTimeline?: boolean;
}

const SCRIPT_STATUS_CYCLE: ScriptStatus[] = ['Rascunho', 'Aprovado', 'Gravado'];

const SCRIPT_STATUS_STYLES: Record<ScriptStatus, string> = {
  'Rascunho': 'bg-zinc-800 text-zinc-400 border-zinc-700',
  'Aprovado': 'bg-sky-900/30 text-sky-400 border-sky-800/50',
  'Gravado':  'bg-emerald-900/30 text-emerald-400 border-emerald-800/50',
};

type PortalScriptStatus = NonNullable<ScriptDocument['portalStatus']>;

const PORTAL_SCRIPT_STATUS_CONFIG: Record<PortalScriptStatus, { label: string; badge: string }> = {
  aguardando_cliente: { label: 'Aguardando Cliente', badge: 'bg-amber-900/20 text-amber-400 border-amber-800/50' },
  aprovado_cliente:   { label: 'Aprovado',           badge: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' },
  refacao:            { label: 'Refação',             badge: 'bg-orange-900/20 text-orange-400 border-orange-800/50' },
};

const buildDefaultScriptPackages = (): ScriptPackage[] => [
  {
    id: crypto.randomUUID(),
    title: 'Mês Atual',
    scripts: [],
    createdAt: Date.now(),
  },
];

// ─────────────────────────────────────────────
// ClientRoteirosTab sub-component
// ─────────────────────────────────────────────
const ClientRoteirosTab: React.FC<{ client: Client }> = ({ client }) => {
  const { data: packages, setData: setPackages, loading: pkgsLoading } = useClientData<ScriptPackage[]>(client.id, 'roteiros', buildDefaultScriptPackages());
  const [selectedPkgId, setSelectedPkgId]         = useState<string>(packages[0]?.id ?? '');
  const [viewMode, setViewMode]                   = useState<'edicao' | 'shotlist'>('edicao');
  const [expandedId, setExpandedId]               = useState<string | null>(null);
  const [shotlistFilters, setShotlistFilters]     = useState<Record<string, string[]>>({});
  const [sceneInputs, setSceneInputs]             = useState<Record<string, { location: string; shotSize: string }>>({});
  const [newPkgTitle, setNewPkgTitle]             = useState('');
  const [isAddingPkg, setIsAddingPkg]             = useState(false);
  const [addingSubFolderFor, setAddingSubFolderFor] = useState<string | null>(null);
  const [newSubFolderTitle, setNewSubFolderTitle] = useState('');
  const [expandedFolders, setExpandedFolders]     = useState<Set<string>>(new Set());
  const [generatingStoryboard, setGeneratingStoryboard] = useState<string | null>(null);
  const [pinnedToast, setPinnedToast]             = useState(false);
  const [workflowToast, setWorkflowToast]         = useState('');
  const { data: storyboardData, setData: setStoryboardData } = useClientData<{ count: number }>(client.id, 'storyboard_usage', { count: 0 });
  const storyboardUsed = storyboardData.count;
  const setStoryboardUsed = (v: number | ((prev: number) => number)) => {
    setStoryboardData(prev => ({
      count: typeof v === 'function' ? v(prev.count) : v,
    }));
  };
  const STORYBOARD_LIMIT = 15;
  const [showScriptArchiveModal, setShowScriptArchiveModal] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────
  const purgeExpiredArchived = (pkgs: ScriptPackage[]): ScriptPackage[] => {
    const now = Date.now();
    return pkgs.map(pkg => ({
      ...pkg,
      scripts: pkg.scripts.filter(s => {
        if (!s.isArchived || !s.archivedAt) return true;
        return now - new Date(s.archivedAt).getTime() <= ARCHIVE_RETENTION_MS;
      }),
      subFolders: pkg.subFolders ? purgeExpiredArchived(pkg.subFolders) : undefined,
    }));
  };

  const collectArchivedScripts = (pkgs: ScriptPackage[]): { script: ScriptDocument; pkgId: string; pkgTitle: string }[] => {
    const now = Date.now();
    const result: { script: ScriptDocument; pkgId: string; pkgTitle: string }[] = [];
    for (const pkg of pkgs) {
      for (const s of pkg.scripts) {
        if (s.isArchived && s.archivedAt) {
          if (now - new Date(s.archivedAt).getTime() <= ARCHIVE_RETENTION_MS) {
            result.push({ script: s, pkgId: pkg.id, pkgTitle: pkg.title });
          }
        }
      }
      if (pkg.subFolders?.length) result.push(...collectArchivedScripts(pkg.subFolders));
    }
    return result;
  };

  // Purge expired archives — runs once, AFTER API data has loaded, so that
  // hasSavedRef in useClientData is not set before the fetch completes.
  const purgedRef = useRef(false);
  useEffect(() => {
    if (!pkgsLoading && !purgedRef.current) {
      purgedRef.current = true;
      setPackages(prev => purgeExpiredArchived(prev));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkgsLoading]);

  // Sync selectedPkgId whenever packages changes from API load.
  // The initial useState uses the fallback UUID which differs from the UUID stored in the API.
  // Without this, selectedPkg resolves to null and the scripts panel stays blank.
  useEffect(() => {
    if (packages.length > 0 && !findPkgDeep(packages, selectedPkgId)) {
      setSelectedPkgId(packages[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packages]);

  const sendToWorkflow = async (pkgId: string, script: ScriptDocument) => {
    try {
      let cols: KanbanColumn[] = [];
      try {
        const fetched = await fetchClientData<KanbanColumn[]>(client.id, 'kanban');
        if (Array.isArray(fetched) && fetched.length > 0) cols = fetched;
      } catch { /* no kanban data yet — fall through to defaults */ }

      // Force-init: use defaults if empty; ensure every column has a valid cards array
      if (cols.length === 0) {
        cols = KANBAN_INITIAL_COLUMNS.map(c => ({ ...c, cards: [] as KanbanCard[] }));
      } else {
        cols = cols.map(c => ({ ...c, cards: Array.isArray(c.cards) ? c.cards : [] }));
      }

      const newCard: KanbanCard = {
        id: `script_${script.id}_${Date.now()}`,
        title: script.title || 'Roteiro sem título',
        priority: 'Normal',
        startDate: '',
        dueDate: '',
        notes: 'Criado automaticamente a partir do roteiro aprovado.',
        assignedTo: '',
      };

      const updatedCols = cols.map((col, idx) =>
        idx === 0 ? { ...col, cards: [...col.cards, newCard] } : col
      );
      await saveClientData(client.id, 'kanban', updatedCols);

      setPackages(prev => prev.map(pkg =>
        pkg.id === pkgId
          ? { ...pkg, scripts: pkg.scripts.map(s => s.id === script.id ? { ...s, inWorkflow: true, workflow_status: 'in_progress' as const } : s) }
          : pkg
      ));

      const firstColTitle = cols[0]?.title || 'Pré-produção';
      setWorkflowToast(`Roteiro enviado para a coluna "${firstColTitle}" do Workflow!`);
      setTimeout(() => setWorkflowToast(''), 4000);
    } catch (err) {
      console.error('[sendToWorkflow] erro ao enviar roteiro para o kanban:', err);
      setWorkflowToast('Erro ao enviar para o Workflow. Tente novamente.');
      setTimeout(() => setWorkflowToast(''), 4000);
    }
  };

  // Roteiros persistence handled by useClientData hook

  // ── Deep helpers ─────────────────────────────────────────────
  const findPkgDeep = (pkgs: ScriptPackage[], id: string): ScriptPackage | null => {
    for (const p of pkgs) {
      if (p.id === id) return p;
      if (p.subFolders?.length) {
        const found = findPkgDeep(p.subFolders, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updatePkgDeep = (pkgs: ScriptPackage[], id: string, updater: (p: ScriptPackage) => ScriptPackage): ScriptPackage[] =>
    pkgs.map(p =>
      p.id === id ? updater(p)
      : p.subFolders?.length ? { ...p, subFolders: updatePkgDeep(p.subFolders, id, updater) }
      : p,
    );

  const deletePkgDeep = (pkgs: ScriptPackage[], id: string): ScriptPackage[] =>
    pkgs
      .filter(p => p.id !== id)
      .map(p => p.subFolders?.length ? { ...p, subFolders: deletePkgDeep(p.subFolders, id) } : p);

  const selectedPkg = findPkgDeep(packages, selectedPkgId) ?? null;

  // ── Package / Folder CRUD ─────────────────────────────────────
  const addPackage = () => {
    if (!newPkgTitle.trim()) return;
    const pkg: ScriptPackage = {
      id: crypto.randomUUID(), title: newPkgTitle.trim(), scripts: [], createdAt: Date.now(),
    };
    setPackages(prev => [pkg, ...prev]);
    setSelectedPkgId(pkg.id);
    setNewPkgTitle('');
    setIsAddingPkg(false);
  };

  const addSubFolder = (parentId: string) => {
    if (!newSubFolderTitle.trim()) return;
    const sub: ScriptPackage = {
      id: crypto.randomUUID(), title: newSubFolderTitle.trim(), scripts: [], createdAt: Date.now(),
    };
    setPackages(prev => updatePkgDeep(prev, parentId, p => ({
      ...p, subFolders: [sub, ...(p.subFolders ?? [])],
    })));
    setSelectedPkgId(sub.id);
    setExpandedFolders(prev => new Set([...prev, parentId]));
    setNewSubFolderTitle('');
    setAddingSubFolderFor(null);
  };

  const deletePackage = (pkgId: string) => {
    setPackages(prev => {
      const remaining = deletePkgDeep(prev, pkgId);
      if (selectedPkgId === pkgId) setSelectedPkgId(remaining[0]?.id ?? '');
      return remaining;
    });
  };

  const pinToTimeline = (pkgId: string) => {
    const setPin = (pkgs: ScriptPackage[]): ScriptPackage[] =>
      pkgs.map(p => ({
        ...p,
        isPinnedToTimeline: p.id === pkgId,
        subFolders: p.subFolders ? setPin(p.subFolders) : undefined,
      }));
    setPackages(prev => setPin(prev));
    setPinnedToast(true);
    setTimeout(() => setPinnedToast(false), 2500);
  };

  const toggleFolderExpanded = (pkgId: string) => {
    setExpandedFolders(prev => {
      const s = new Set(prev);
      if (s.has(pkgId)) s.delete(pkgId); else s.add(pkgId);
      return s;
    });
  };

  // ── Script CRUD ───────────────────────────────────────────────
  const addScript = (pkgId: string) => {
    const s: ScriptDocument = {
      id: crypto.randomUUID(), title: 'Novo Roteiro', status: 'Rascunho',
      referenceLink: '', gancho: '', writingMode: 'structured', freeText: '',
      scenes: [{ id: crypto.randomUUID(), visual: '', audio: '', isChecked: false }],
      createdAt: Date.now(),
      workflow_status: 'pending',
    };
    setPackages(prev => updatePkgDeep(prev, pkgId, p => ({ ...p, scripts: [s, ...p.scripts] })));
    setExpandedId(s.id);
  };

  const updateScript = (pkgId: string, updated: ScriptDocument) =>
    setPackages(prev => updatePkgDeep(prev, pkgId, p => ({
      ...p, scripts: p.scripts.map(s => s.id === updated.id ? updated : s),
    })));

  const deleteScript = (pkgId: string, scriptId: string) => {
    setPackages(prev => updatePkgDeep(prev, pkgId, p => ({
      ...p, scripts: p.scripts.map(s =>
        s.id === scriptId ? { ...s, isArchived: true, archivedAt: new Date().toISOString() } : s
      ),
    })));
    if (expandedId === scriptId) setExpandedId(null);
  };

  const restoreScript = (pkgId: string, scriptId: string) => {
    setPackages(prev => updatePkgDeep(prev, pkgId, p => ({
      ...p, scripts: p.scripts.map(s =>
        s.id === scriptId ? { ...s, isArchived: false, archivedAt: undefined } : s
      ),
    })));
  };

  const cycleStatus = (pkgId: string, script: ScriptDocument) => {
    const next = SCRIPT_STATUS_CYCLE[(SCRIPT_STATUS_CYCLE.indexOf(script.status) + 1) % SCRIPT_STATUS_CYCLE.length];
    updateScript(pkgId, { ...script, status: next });
  };

  const sendToPortal = (pkgId: string, script: ScriptDocument) => {
    updateScript(pkgId, { ...script, portalStatus: 'aguardando_cliente', sentToPortalAt: Date.now() });
  };

  // ── Scene CRUD ────────────────────────────────────────────────
  const addScene = (pkgId: string, script: ScriptDocument) =>
    updateScript(pkgId, {
      ...script, scenes: [...script.scenes, { id: crypto.randomUUID(), visual: '', audio: '', isChecked: false, tags: [], location: '', shotSize: '', isRecorded: false }],
    });

  const addFreeTextBlock = (pkgId: string, script: ScriptDocument) =>
    updateScript(pkgId, {
      ...script,
      scenes: [...script.scenes, { id: crypto.randomUUID(), type: 'free_text' as const, visual: '', audio: '', isChecked: false, freeContent: '', tags: [], location: '', shotSize: '', isRecorded: false }],
    });

  const updateScene = (pkgId: string, script: ScriptDocument, sceneId: string, field: string, value: any) =>
    updateScript(pkgId, {
      ...script, scenes: script.scenes.map(sc => sc.id === sceneId ? { ...sc, [field]: value } : sc),
    });

  const deleteScene = (pkgId: string, script: ScriptDocument, sceneId: string) =>
    updateScript(pkgId, { ...script, scenes: script.scenes.filter(sc => sc.id !== sceneId) });

  const moveScene = (pkgId: string, script: ScriptDocument, sceneId: string, dir: 'up' | 'down') => {
    const idx = script.scenes.findIndex(sc => sc.id === sceneId);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === script.scenes.length - 1) return;
    const scenes = [...script.scenes];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [scenes[idx], scenes[swap]] = [scenes[swap], scenes[idx]];
    updateScript(pkgId, { ...script, scenes });
  };

  const toggleSceneCheck = (pkgId: string, script: ScriptDocument, sceneId: string) =>
    updateScript(pkgId, {
      ...script, scenes: script.scenes.map(sc => sc.id === sceneId ? { ...sc, isChecked: !sc.isChecked } : sc),
    });

  // ── Storyboard generation ─────────────────────────────────────
  const generateStoryboard = async (pkgId: string, script: ScriptDocument) => {
    if (storyboardUsed >= STORYBOARD_LIMIT || generatingStoryboard) return;

    setGeneratingStoryboard(script.id);
    try {
      // Try structured scenes first
      let scenesToSend = script.scenes
        .filter(sc => !sc.type || sc.type === 'scene' || sc.type === 'free_text')
        .filter(sc => (sc.visual || '').trim() || (sc.audio || '').trim() || (sc.freeContent || '').trim());

      // If no structured scenes with content, parse from freeText or scene content
      if (scenesToSend.length === 0) {
        const rawText =
          script.freeText?.trim() ||
          script.scenes.map(sc => sc.freeContent || sc.visual || '').join('\n').trim() ||
          '';
        if (!rawText) {
          setWorkflowToast('Adicione um roteiro primeiro');
          setTimeout(() => setWorkflowToast(''), 3000);
          return;
        }
        // Split by newlines, keep any line with 4+ chars
        const paragraphs = rawText
          .split(/\n/)
          .map(p => p.trim())
          .filter(p => p.length > 3);
        if (paragraphs.length === 0) {
          setWorkflowToast('Adicione um roteiro primeiro');
          setTimeout(() => setWorkflowToast(''), 3000);
          return;
        }
        scenesToSend = paragraphs.map((p, i) => ({
          id: `scene-${i + 1}`,
          visual: p,
          audio: '',
          isChecked: false,
        }));
      }

      const token = localStorage.getItem('cf_token') || '';
      if (!token) {
        setWorkflowToast('Sessão expirada. Faça login novamente.');
        setTimeout(() => setWorkflowToast(''), 4000);
        return;
      }
      const res = await fetch('/api/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          scriptTitle: script.title,
          scenes: scenesToSend.map(sc => ({ id: sc.id, visual: sc.visual || sc.freeContent || '', audio: sc.audio || '' })),
        }),
      });
      if (res.status === 401) {
        setWorkflowToast('Sessão expirada. Faça login novamente.');
        setTimeout(() => setWorkflowToast(''), 4000);
        return;
      }
      if (!res.ok) throw new Error('Storyboard API failed');
      const data = await res.json();
      const storyboards: { sceneId: string; description: string; image?: string | null }[] = data.storyboards || [];
      const descMap = new Map(storyboards.map(sb => [sb.sceneId, sb.description]));
      const imgMap = new Map(storyboards.map(sb => [sb.sceneId, sb.image || null]));

      // If we auto-generated scenes from plain text, create proper scene objects
      const hasAutoScenes = scenesToSend.some(sc => sc.id.startsWith('scene-'));
      let updatedScenes: ScriptScene[];
      if (hasAutoScenes) {
        updatedScenes = scenesToSend.map(sc => ({
          id: sc.id,
          visual: sc.visual,
          audio: sc.audio,
          isChecked: false,
          storyboardText: descMap.get(sc.id) || undefined,
          storyboardUrl: imgMap.get(sc.id) || undefined,
        }));
      } else {
        updatedScenes = script.scenes.map(sc => {
          const desc = descMap.get(sc.id);
          const img = imgMap.get(sc.id);
          return desc ? { ...sc, storyboardText: desc, storyboardUrl: img || undefined } : sc;
        });
      }

      setStoryboardUsed(prev => Math.min(prev + 1, STORYBOARD_LIMIT));
      updateScript(pkgId, { ...script, scenes: updatedScenes });
      setWorkflowToast('Storyboard gerado com sucesso!');
      setTimeout(() => setWorkflowToast(''), 3000);
    } catch (err) {
      console.error('Storyboard generation error:', err);
      setWorkflowToast('Erro ao gerar storyboard. Tente novamente.');
      setTimeout(() => setWorkflowToast(''), 4000);
    } finally {
      setGeneratingStoryboard(null);
    }
  };

  // ── Sidebar tree renderer ─────────────────────────────────────
  const renderFolderTree = (pkgs: ScriptPackage[], depth = 0): React.ReactNode =>
    pkgs.map(pkg => {
      const hasChildren = !!pkg.subFolders?.length;
      const isExpanded  = expandedFolders.has(pkg.id);
      const isSelected  = selectedPkgId === pkg.id;
      const isAddingSub = addingSubFolderFor === pkg.id;
      return (
        <div key={pkg.id} style={{ paddingLeft: depth * 12 }}>
          <div className="group flex items-center gap-0.5">
            {hasChildren ? (
              <button
                onClick={() => toggleFolderExpanded(pkg.id)}
                className="p-0.5 text-zinc-400 hover:text-zinc-300 transition-colors flex-shrink-0"
              >
                <ChevronRight className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <div className="w-4 flex-shrink-0" />
            )}
            <button
              onClick={() => setSelectedPkgId(pkg.id)}
              className={`flex-1 flex items-center gap-2 px-2 py-2.5 rounded-xl text-sm font-bold transition-all text-left min-w-0 ${
                isSelected
                  ? 'bg-violet-900/30 text-violet-300'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate flex-1">{pkg.title}</span>
              <span className="text-[10px] font-black text-zinc-400 flex-shrink-0">{pkg.scripts.filter(s => !s.isArchived).length}</span>
            </button>
            <button
              onClick={() => { setAddingSubFolderFor(pkg.id); setNewSubFolderTitle(''); }}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-violet-500 transition-all rounded-lg flex-shrink-0"
              title="Nova subpasta"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
            <button
              onClick={() => pinToTimeline(pkg.id)}
              className={`opacity-0 group-hover:opacity-100 p-1 transition-all rounded-lg flex-shrink-0 ${
                pkg.isPinnedToTimeline
                  ? 'text-amber-500 opacity-100'
                  : 'text-zinc-700 hover:text-amber-500'
              }`}
              title="Destacar na Timeline"
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={() => { if (confirm(`Excluir pasta "${pkg.title}"?`)) deletePackage(pkg.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-500 transition-all rounded-lg flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {isAddingSub && (
            <div className="flex gap-1.5 pb-2 mt-1" style={{ paddingLeft: (depth + 1) * 12 + 16 }}>
              <input
                autoFocus
                type="text"
                value={newSubFolderTitle}
                onChange={e => setNewSubFolderTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addSubFolder(pkg.id);
                  if (e.key === 'Escape') { setAddingSubFolderFor(null); setNewSubFolderTitle(''); }
                }}
                placeholder="Nome da subpasta…"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 placeholder:text-zinc-400"
              />
              <button onClick={() => addSubFolder(pkg.id)} className="p-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
                <Check className="w-3 h-3" />
              </button>
            </div>
          )}

          {hasChildren && isExpanded && (
            <div className="mt-0.5">
              {renderFolderTree(pkg.subFolders!, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-5">

      {/* ── Script Archive Modal ── */}
      {showScriptArchiveModal && (() => {
        const archived = collectArchivedScripts(packages);
        return (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
              <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-violet-500" />
                  <div>
                    <h2 className="text-base font-bold text-white">Roteiros Arquivados</h2>
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      Itens na lixeira são excluídos permanentemente após 15 dias.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowScriptArchiveModal(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {archived.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <Archive className="w-8 h-8 text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500">Nenhum roteiro arquivado.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {archived.map(({ script, pkgId, pkgTitle }) => {
                      const archivedDate = script.archivedAt ? new Date(script.archivedAt) : null;
                      const daysLeft = archivedDate
                        ? Math.ceil((ARCHIVE_RETENTION_MS - (Date.now() - archivedDate.getTime())) / (24 * 60 * 60 * 1000))
                        : null;
                      return (
                        <div key={script.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-800/40">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-300 truncate">{script.title || 'Sem título'}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{pkgTitle}</p>
                            {archivedDate && (
                              <p className={`text-[10px] mt-0.5 font-bold ${daysLeft !== null && daysLeft <= 3 ? 'text-red-400' : 'text-zinc-400'}`}>
                                Arquivado em {archivedDate.toLocaleDateString('pt-BR')} · {daysLeft}d restante{daysLeft !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => restoreScript(pkgId, script.id)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-violet-800/50 text-violet-400 hover:bg-violet-900/20 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" /> Restaurar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Pinned toast ── */}
      {pinnedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 border border-amber-500/30 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Pin className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm font-bold text-white">Projeto vinculado à Visão Geral</p>
        </div>
      )}

      {/* ── Workflow toast ── */}
      {workflowToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-900 border border-indigo-500/30 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <p className="text-sm font-bold text-white">{workflowToast}</p>
        </div>
      )}

      {/* ── Sidebar: Packages ── */}
      <aside className="w-full lg:w-56 xl:w-64 flex-shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 lg:sticky lg:top-4">
          <div className="flex items-center justify-between px-2 py-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pacotes</span>
            <button
              onClick={() => setIsAddingPkg(true)}
              className="p-1 rounded-lg hover:bg-violet-900/30 text-violet-500 transition-colors"
              title="Nova Pasta"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isAddingPkg && (
            <div className="flex gap-1.5 px-1 pb-2">
              <input
                autoFocus
                type="text"
                value={newPkgTitle}
                onChange={e => setNewPkgTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addPackage();
                  if (e.key === 'Escape') { setIsAddingPkg(false); setNewPkgTitle(''); }
                }}
                placeholder="Ex: Março 2026"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 placeholder:text-zinc-400"
              />
              <button onClick={addPackage} className="p-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
                <Check className="w-3 h-3" />
              </button>
            </div>
          )}

          {packages.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-4 px-2">Nenhum pacote.<br />Clique em + para criar.</p>
          )}

          <div className="space-y-0.5">
            {renderFolderTree(packages)}
          </div>
        </div>
      </aside>

      {/* ── Main: Script list ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {!selectedPkg ? (
          <div className="flex items-center justify-center h-40 text-zinc-400 text-sm">
            Selecione ou crie um pacote para começar.
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-lg text-white flex items-center gap-2">
                  <Folder className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  {selectedPkg.title}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 pl-7">
                  {selectedPkg.scripts.filter(s => !s.isArchived).length} roteiro{selectedPkg.scripts.filter(s => !s.isArchived).length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Archive + Dual-mode toggle */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
              {(() => { const count = collectArchivedScripts(packages).length; return (
                <button
                  onClick={() => setShowScriptArchiveModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-zinc-700 text-zinc-400 hover:text-violet-400 hover:border-violet-700 transition-all"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Ver Arquivados
                  {count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-violet-900/30 text-violet-400 text-[10px] font-black">{count}</span>}
                </button>
              ); })()}
              <div className="flex items-center bg-zinc-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('edicao')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    viewMode === 'edicao'
                      ? 'bg-zinc-700 text-violet-300 shadow-sm'
                      : 'text-zinc-400 hover:hover:text-zinc-200'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Modo Edição
                </button>
                <button
                  onClick={() => setViewMode('shotlist')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    viewMode === 'shotlist'
                      ? 'bg-zinc-700 text-indigo-300 shadow-sm'
                      : 'text-zinc-400 hover:hover:text-zinc-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  Modo Shotlist
                </button>
              </div>
              </div>
            </div>

            {/* New script button */}
            <button
              onClick={() => addScript(selectedPkg.id)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all hover:scale-[1.005] active:scale-100"
            >
              <Plus className="w-4 h-4" /> + Criar Roteiro do Zero
            </button>

            {/* Empty state */}
            {selectedPkg.scripts.filter(s => !s.isArchived).length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-10 text-center">
                <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-400">Nenhum roteiro neste pacote.</p>
                <p className="text-xs text-zinc-500 mt-1">Clique em "+ Criar Roteiro" para começar.</p>
              </div>
            )}

            {/* Script Accordions */}
            {selectedPkg.scripts.filter(s => !s.isArchived).map((script, idx) => {
              const isOpen       = expandedId === script.id;
              const checkedCount = script.scenes.filter(sc => sc.isChecked).length;
              const wMode        = script.writingMode ?? 'structured';
              return (
                <div
                  key={script.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all hover:border-violet-800/50"
                >
                  {/* ── Accordion Header ── */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setExpandedId(isOpen ? null : script.id)}
                  >
                    <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    <div className="w-6 h-6 rounded-full bg-violet-900/40 text-violet-300 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={script.title}
                      onChange={e => { e.stopPropagation(); updateScript(selectedPkg.id, { ...script, title: e.target.value }); }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-transparent font-bold text-sm text-white focus:outline-none placeholder:text-zinc-400 cursor-text"
                      placeholder="Título do roteiro…"
                    />
                    {viewMode === 'shotlist' && script.scenes.length > 0 && (
                      <span className="text-[10px] font-bold text-zinc-400 flex-shrink-0 tabular-nums">
                        {checkedCount}/{script.scenes.length}
                      </span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); cycleStatus(selectedPkg.id, script); }}
                      className={`flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all hover:opacity-80 ${SCRIPT_STATUS_STYLES[script.status]}`}
                    >
                      {script.status}
                    </button>
                    {script.portalStatus && (
                      <span className={`flex-shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg border ${PORTAL_SCRIPT_STATUS_CONFIG[script.portalStatus].badge}`}>
                        {PORTAL_SCRIPT_STATUS_CONFIG[script.portalStatus].label}
                      </span>
                    )}
                    {script.portalStatus === 'aprovado_cliente' && !!script.rating && script.rating > 0 && (
                      <div className="flex-shrink-0 flex items-center gap-px">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className="w-3 h-3" style={{ fill: n <= script.rating! ? '#f59e0b' : 'transparent', stroke: n <= script.rating! ? '#f59e0b' : '#71717a' }} />
                        ))}
                      </div>
                    )}
                    {!script.portalStatus && (
                      <button
                        onClick={e => { e.stopPropagation(); sendToPortal(selectedPkg.id, script); }}
                        className="flex-shrink-0 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border border-violet-800 text-violet-400 hover:bg-violet-900/20 transition-all"
                        title="Enviar para aprovação do cliente"
                      >
                        <UploadCloud className="w-3 h-3" /> Enviar
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); if (!script.inWorkflow) sendToWorkflow(selectedPkg.id, script); }}
                      disabled={!!script.inWorkflow}
                      className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${
                        script.inWorkflow
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-900/10 cursor-not-allowed opacity-70'
                          : 'border-indigo-800 text-indigo-400 hover:bg-indigo-900/20'
                      }`}
                      title={script.inWorkflow ? 'Já está no Workflow' : 'Enviar para o Workflow'}
                    >
                      {script.inWorkflow
                        ? <><CheckCircle className="w-3 h-3" /> No Workflow</>
                        : <><ArrowRight className="w-3 h-3" /> Workflow</>
                      }
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(`Excluir "${script.title}"?`)) deleteScript(selectedPkg.id, script.id); }}
                      className="flex-shrink-0 p-1 text-zinc-700 hover:text-red-500 transition-colors rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ── Accordion Body ── */}
                  {isOpen && (
                    <div className="border-t border-zinc-800 px-5 py-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">

                      {/* ── Global storyboard action ── */}
                      <div className="flex flex-wrap items-center gap-3">
                        <BrandBrainBadge clientId={client.id} />
                        <button
                          onClick={e => { e.stopPropagation(); generateStoryboard(selectedPkg.id, script); }}
                          disabled={storyboardUsed >= STORYBOARD_LIMIT || !!generatingStoryboard}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                            storyboardUsed >= STORYBOARD_LIMIT
                              ? 'border-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                              : generatingStoryboard === script.id
                                ? 'border-indigo-700 text-indigo-400 animate-pulse cursor-wait'
                                : 'border-indigo-800 text-indigo-400 hover:bg-indigo-900/20 hover:border-indigo-400'
                          }`}
                        >
                          {generatingStoryboard === script.id
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
                            : <><ImageIcon className="w-3.5 h-3.5" /> Gerar Storyboard do Roteiro</>
                          }
                        </button>
                        <span className="text-[10px] text-gray-400">
                          Storyboards:{' '}
                          <span className={`font-black tabular-nums ${storyboardUsed >= STORYBOARD_LIMIT ? 'text-red-400' : ''}`}>
                            {storyboardUsed}/{STORYBOARD_LIMIT}
                          </span>{' '}
                          usados neste mês
                        </span>
                      </div>

                      {viewMode === 'edicao' ? (
                        /* ─── EDIT MODE ─── */
                        <>
                          {/* Writing mode toggle */}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Formato</span>
                            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 gap-0.5">
                              <button
                                onClick={() => updateScript(selectedPkg.id, { ...script, writingMode: 'structured' })}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-black transition-all ${
                                  wMode === 'structured'
                                    ? 'bg-zinc-700 text-violet-300 shadow-sm'
                                    : 'text-zinc-400 hover:hover:text-zinc-200'
                                }`}
                              >
                                <LayoutDashboard className="w-3 h-3" /> Layout Estruturado
                              </button>
                              <button
                                onClick={() => updateScript(selectedPkg.id, { ...script, writingMode: 'free' })}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-black transition-all ${
                                  wMode === 'free'
                                    ? 'bg-zinc-700 text-indigo-300 shadow-sm'
                                    : 'text-zinc-400 hover:hover:text-zinc-200'
                                }`}
                              >
                                <PenLine className="w-3 h-3" /> Escrita Livre
                              </button>
                            </div>
                          </div>

                          {/* Reference link */}
                          <div>
                            <label className={MODAL_LABEL_CLS}>
                              <span className="flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> Link de Referência</span>
                            </label>
                            <input
                              type="text"
                              value={script.referenceLink}
                              onChange={e => updateScript(selectedPkg.id, { ...script, referenceLink: e.target.value })}
                              placeholder="https://notion.so/… ou docs.google.com/…"
                              className={MODAL_INPUT_CLS}
                            />
                          </div>

                          {wMode === 'structured' ? (
                            <>
                              {/* Hook */}
                              <div>
                                <label className={MODAL_LABEL_CLS}>
                                  <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Hook / Gancho</span>
                                </label>
                                <textarea
                                  value={script.gancho}
                                  onChange={e => updateScript(selectedPkg.id, { ...script, gancho: e.target.value })}
                                  placeholder="A frase de abertura que prende a atenção em 3 segundos…"
                                  rows={3}
                                  className={`${MODAL_INPUT_CLS} resize-none`}
                                />
                              </div>

                              {/* Scenes */}
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <label className={MODAL_LABEL_CLS}>
                                    <span className="flex items-center gap-1.5"><Film className="w-3 h-3" /> Cenas</span>
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => addScene(selectedPkg.id, script)}
                                      className="flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-300 transition-colors"
                                    >
                                      <Plus className="w-3 h-3" /> Cena
                                    </button>
                                    <button
                                      onClick={() => addFreeTextBlock(selectedPkg.id, script)}
                                      className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-300 transition-colors"
                                    >
                                      <AlignLeft className="w-3 h-3" /> Bloco Livre
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {script.scenes.map((scene, sIdx) => (
                                    scene.type === 'free_text' ? (
                                      <div
                                        key={scene.id}
                                        className="bg-zinc-950 border border-dashed border-zinc-700 rounded-xl p-4 space-y-2"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                            <AlignLeft className="w-3 h-3" /> Bloco de Texto Livre
                                          </span>
                                          <div className="flex items-center gap-0.5">
                                            <button
                                              onClick={() => moveScene(selectedPkg.id, script, scene.id, 'up')}
                                              disabled={sIdx === 0}
                                              className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded"
                                            >
                                              <ChevronUp className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => moveScene(selectedPkg.id, script, scene.id, 'down')}
                                              disabled={sIdx === script.scenes.length - 1}
                                              className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded"
                                            >
                                              <ChevronDown className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => deleteScene(selectedPkg.id, script, scene.id)}
                                              className="p-1 text-zinc-700 hover:text-red-500 transition-colors rounded"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <textarea
                                          value={scene.freeContent ?? ''}
                                          onChange={e => updateScene(selectedPkg.id, script, scene.id, 'freeContent', e.target.value)}
                                          placeholder="Escreva livremente aqui — teleprompter, narração, anotações…"
                                          rows={4}
                                          className={`${MODAL_INPUT_CLS} resize-y font-mono text-sm leading-relaxed`}
                                        />
                                      </div>
                                    ) : (
                                    <div
                                      key={scene.id}
                                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Cena {sIdx + 1}</span>
                                        <div className="flex items-center gap-0.5">
                                          <button
                                            onClick={() => moveScene(selectedPkg.id, script, scene.id, 'up')}
                                            disabled={sIdx === 0}
                                            className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded"
                                          >
                                            <ChevronUp className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => moveScene(selectedPkg.id, script, scene.id, 'down')}
                                            disabled={sIdx === script.scenes.length - 1}
                                            className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors rounded"
                                          >
                                            <ChevronDown className="w-3 h-3" />
                                          </button>
                                          {script.scenes.length > 1 && (
                                            <button
                                              onClick={() => deleteScene(selectedPkg.id, script, scene.id)}
                                              className="p-1 text-zinc-700 hover:text-red-500 transition-colors rounded"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Visual / Ação */}
                                      <div>
                                        <label className="block text-xs text-gray-400 uppercase font-semibold mb-2">Descrição Visual / Ação</label>
                                        <textarea
                                          value={scene.visual}
                                          onChange={e => updateScene(selectedPkg.id, script, scene.id, 'visual', e.target.value)}
                                          placeholder="Descreva o que a câmera vê nessa cena…"
                                          rows={2}
                                          className={`${MODAL_INPUT_CLS} resize-none text-xs`}
                                        />
                                      </div>

                                      {/* Áudio / Fala */}
                                      <div>
                                        <label className="block text-xs text-gray-400 uppercase font-semibold mb-2">Áudio / Fala / OFF</label>
                                        <textarea
                                          value={scene.audio}
                                          onChange={e => updateScene(selectedPkg.id, script, scene.id, 'audio', e.target.value)}
                                          placeholder="O que o apresentador fala nessa cena…"
                                          rows={2}
                                          className={`${MODAL_INPUT_CLS} resize-none text-xs`}
                                        />
                                      </div>

                                      {/* Locação e Tamanho do Plano (Text inputs com Enter-to-submit) */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">Locação</label>
                                          <input
                                            type="text"
                                            placeholder="Ex: Externa Rua"
                                            value={sceneInputs[scene.id]?.location ?? scene.location ?? ''}
                                            onChange={(e) => {
                                              setSceneInputs(prev => ({
                                                ...prev,
                                                [scene.id]: { ...prev[scene.id], location: e.target.value }
                                              }));
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                const value = (sceneInputs[scene.id]?.location ?? '').trim();
                                                if (value) {
                                                  updateScene(selectedPkg.id, script, scene.id, 'location', value);
                                                  setSceneInputs(prev => ({
                                                    ...prev,
                                                    [scene.id]: { ...prev[scene.id], location: '' }
                                                  }));
                                                }
                                              }
                                            }}
                                            className="w-full px-2 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-teal-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">Tamanho do Plano</label>
                                          <input
                                            type="text"
                                            placeholder="Ex: Close"
                                            value={sceneInputs[scene.id]?.shotSize ?? scene.shotSize ?? ''}
                                            onChange={(e) => {
                                              setSceneInputs(prev => ({
                                                ...prev,
                                                [scene.id]: { ...prev[scene.id], shotSize: e.target.value }
                                              }));
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                const value = (sceneInputs[scene.id]?.shotSize ?? '').trim();
                                                if (value) {
                                                  updateScene(selectedPkg.id, script, scene.id, 'shotSize', value);
                                                  setSceneInputs(prev => ({
                                                    ...prev,
                                                    [scene.id]: { ...prev[scene.id], shotSize: '' }
                                                  }));
                                                }
                                              }
                                            }}
                                            className="w-full px-2 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                                          />
                                        </div>
                                      </div>

                                      {/* Pills: Location, Shot Size, and Tags */}
                                      <div className="flex flex-wrap gap-2 pt-2">
                                        {scene.location && (
                                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-900/40 border border-teal-700/40 text-teal-200 text-xs font-bold">
                                            📍 {scene.location}
                                            <button
                                              onClick={() => updateScene(selectedPkg.id, script, scene.id, 'location', '')}
                                              className="text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                        {scene.shotSize && (
                                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-200 text-xs font-bold">
                                            🎬 {scene.shotSize}
                                            <button
                                              onClick={() => updateScene(selectedPkg.id, script, scene.id, 'shotSize', '')}
                                              className="text-orange-400 hover:text-orange-300 transition-colors"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                        {(scene.tags || []).length > 0 && (
                                          <>
                                            {(scene.tags || []).map((tag, tIdx) => (
                                              <div key={tIdx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-900/50 border border-purple-700/50 text-purple-200 text-xs font-bold">
                                                {tag}
                                                <button
                                                  onClick={() => {
                                                    const newTags = (scene.tags || []).filter((_, i) => i !== tIdx);
                                                    updateScene(selectedPkg.id, script, scene.id, 'tags', newTags);
                                                  }}
                                                  className="text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                            ))}
                                          </>
                                        )}
                                      </div>

                                      {/* Tags input */}
                                      <input
                                        type="text"
                                        placeholder="Adicionar tag (ex: Drone) e prima Enter"
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const value = (e.target as HTMLInputElement).value.trim();
                                            if (value) {
                                              const newTags = [...(scene.tags || []), value];
                                              updateScene(selectedPkg.id, script, scene.id, 'tags', newTags);
                                              (e.target as HTMLInputElement).value = '';
                                            }
                                          }
                                        }}
                                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                                      />
                                    </div>
                                    )
                                  ))}

                                  {/* Add scene button at bottom — Modo Edição only */}
                                  <button
                                    onClick={() => addScene(selectedPkg.id, script)}
                                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-white/20 bg-transparent hover:bg-white/5 transition-all text-center text-sm font-bold text-zinc-400 hover:text-zinc-300 flex items-center justify-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Nova Cena
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            /* ── FREE WRITING MODE ── */
                            <div>
                              <label className={MODAL_LABEL_CLS}>
                                <span className="flex items-center gap-1.5"><PenLine className="w-3 h-3" /> Texto Livre</span>
                              </label>
                              <textarea
                                value={script.freeText ?? ''}
                                onChange={e => updateScript(selectedPkg.id, { ...script, freeText: e.target.value })}
                                placeholder="Escreva livremente o roteiro aqui. Sem restrições de formato — ideal para teleprompter, narração ou roteiros literários…"
                                rows={18}
                                className={`${MODAL_INPUT_CLS} resize-y font-mono text-sm leading-relaxed`}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        /* ─── SHOTLIST MODE ─── */
                        <>
                          {script.gancho && (
                            <div className="flex gap-3 px-4 py-3 bg-indigo-900/20 border border-indigo-800/50 rounded-xl">
                              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-bold text-indigo-300 italic leading-relaxed">
                                &ldquo;{script.gancho}&rdquo;
                              </p>
                            </div>
                          )}

                          {/* Reference link — clickable if URL */}
                          {script.referenceLink && (
                            <div className="flex items-center gap-2 px-1">
                              <LinkIcon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                              {/^https?:\/\//i.test(script.referenceLink) ? (
                                <a
                                  href={script.referenceLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2 truncate"
                                >
                                  {script.referenceLink}
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="text-xs text-zinc-500 truncate">{script.referenceLink}</span>
                              )}
                            </div>
                          )}

                          {/* ── Filtros de Gravação no Set ── */}
                          {script.scenes.length > 0 && (() => {
                            // Extract all unique tags, locations, and shot sizes
                            const uniqueValues = new Set<string>();
                            script.scenes.forEach(scene => {
                              if (scene.tags && Array.isArray(scene.tags)) {
                                scene.tags.forEach(tag => { if (tag?.trim()) uniqueValues.add(tag); });
                              }
                              if (scene.location?.trim()) uniqueValues.add(scene.location);
                              if (scene.shotSize?.trim()) uniqueValues.add(scene.shotSize);
                            });
                            const allFilters = Array.from(uniqueValues).sort();
                            const activeFilters = shotlistFilters[script.id] ?? [];

                            // Filter scenes based on active filters
                            const filteredScenes = activeFilters.length === 0
                              ? script.scenes
                              : script.scenes.filter(scene => {
                                  const sceneValues = new Set<string>();
                                  if (scene.tags && Array.isArray(scene.tags)) {
                                    scene.tags.forEach(tag => { if (tag?.trim()) sceneValues.add(tag); });
                                  }
                                  if (scene.location?.trim()) sceneValues.add(scene.location);
                                  if (scene.shotSize?.trim()) sceneValues.add(scene.shotSize);
                                  return activeFilters.some(filter => sceneValues.has(filter));
                                });

                            const toggleFilter = (filterValue: string) => {
                              setShotlistFilters(prev => ({
                                ...prev,
                                [script.id]: activeFilters.includes(filterValue)
                                  ? activeFilters.filter(f => f !== filterValue)
                                  : [...activeFilters, filterValue],
                              }));
                            };

                            return (
                              <div className="space-y-3">
                                <div className="px-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2.5">
                                    Filtros de Gravação no Set
                                  </p>
                                  {allFilters.length === 0 ? (
                                    <p className="text-xs text-zinc-500">Nenhuma tag, locação ou tamanho de plano configurado.</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {allFilters.map(filter => (
                                        <button
                                          key={filter}
                                          onClick={() => toggleFilter(filter)}
                                          className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                                            activeFilters.includes(filter)
                                              ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                                              : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20'
                                          }`}
                                        >
                                          {filter}
                                        </button>
                                      ))}
                                      {activeFilters.length > 0 && (
                                        <button
                                          onClick={() => setShotlistFilters(prev => ({ ...prev, [script.id]: [] }))}
                                          className="ml-auto px-3 py-1.5 rounded-full text-sm font-bold border border-zinc-600 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-all"
                                        >
                                          Limpar Filtros
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* ── Filtered scenes ── */}
                                <div className="space-y-3">
                                  {filteredScenes.length === 0 ? (
                                    <div className="text-center py-12 px-4 text-zinc-500 text-sm">
                                      Nenhuma cena corresponde aos filtros selecionados.
                                    </div>
                                  ) : (
                                    <>
                                      {filteredScenes.map((scene, sIdx) => {
                                        const originalIdx = script.scenes.findIndex(s => s.id === scene.id);
                                        return (
                                          <div key={scene.id} className="space-y-3 p-4 rounded-xl border-2 border-zinc-800 bg-zinc-900 transition-all hover:border-indigo-700">
                                {/* Scene header with checkbox and recorded toggle */}
                                <div className="flex items-start gap-4">
                                  <div
                                    onClick={() => toggleSceneCheck(selectedPkg.id, script, scene.id)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all cursor-pointer ${
                                      scene.isChecked
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-zinc-600 hover:border-emerald-500'
                                    }`}
                                  >
                                    {scene.isChecked && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${scene.isChecked ? 'text-emerald-500' : 'text-indigo-400'}`}>
                                      CENA {sIdx + 1}
                                    </p>
                                  </div>
                                  {/* Recorded toggle button */}
                                  <button
                                    onClick={() => {
                                      const isRecorded = scene.isRecorded || false;
                                      updateScene(selectedPkg.id, script, scene.id, 'isRecorded', !isRecorded);
                                    }}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                      scene.isRecorded
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                                  >
                                    {scene.isRecorded ? '✓ Gravado' : 'Gravado'}
                                  </button>
                                </div>

                                {/* Visual and Audio — READ ONLY */}
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs text-gray-400 uppercase font-semibold mb-2">Descrição Visual / Ação</label>
                                    <p className="px-3 py-2 bg-zinc-800/30 border border-zinc-700 rounded-lg text-sm text-zinc-200 whitespace-pre-wrap break-words">
                                      {scene.visual || '(sem descrição visual)'}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 uppercase font-semibold mb-2">Áudio / Fala / OFF</label>
                                    <p className="px-3 py-2 bg-zinc-800/30 border border-zinc-700 rounded-lg text-sm text-zinc-200 whitespace-pre-wrap break-words">
                                      {scene.audio || '(sem áudio)'}
                                    </p>
                                  </div>
                                </div>

                                {/* Metadata Pills: Location, Shot Size, and Tags */}
                                <div className="flex flex-wrap gap-2">
                                  {scene.location && (
                                    <div className="px-2.5 py-1 rounded-full bg-teal-900/40 border border-teal-700/40 text-teal-200 text-xs font-bold">
                                      📍 {scene.location}
                                    </div>
                                  )}
                                  {scene.shotSize && (
                                    <div className="px-2.5 py-1 rounded-full bg-orange-900/40 border border-orange-700/40 text-orange-200 text-xs font-bold">
                                      🎬 {scene.shotSize}
                                    </div>
                                  )}
                                  {(scene.tags || []).length > 0 && (
                                    <>
                                      {(scene.tags || []).map((tag, tIdx) => (
                                        <div key={tIdx} className="px-2.5 py-1 rounded-full bg-purple-900/50 border border-purple-700/50 text-purple-200 text-xs font-bold">
                                          {tag}
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Progress bar */}
                          {script.scenes.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-zinc-400">Progresso no Set</span>
                                <span className="text-[10px] font-black text-zinc-500 tabular-nums">{checkedCount}/{script.scenes.length} cenas</span>
                              </div>
                              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(checkedCount / script.scenes.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* ── Storyboard grid (global) ── */}
                      {script.scenes.some(sc => sc.storyboardUrl || sc.storyboardText) && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5" /> Storyboard do Roteiro
                            </p>
                            <button
                              onClick={() => updateScript(selectedPkg.id, {
                                ...script,
                                scenes: script.scenes.map(sc => ({ ...sc, storyboardUrl: undefined, storyboardText: undefined })),
                              })}
                              className="text-[10px] font-bold text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              Limpar Board
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {script.scenes
                              .filter(sc => sc.storyboardUrl || sc.storyboardText)
                              .map((sc, i) => {
                                const structuredIdx = script.scenes.filter(s => !s.type || s.type === 'scene').findIndex(s => s.id === sc.id);
                                return (
                                  <div key={sc.id} className="rounded-xl overflow-hidden border border-indigo-800/50">
                                    {sc.storyboardUrl && (
                                      <img
                                        src={sc.storyboardUrl}
                                        alt={`Storyboard cena ${i + 1}`}
                                        className="w-full h-auto object-cover"
                                      />
                                    )}
                                    <div className="px-3 py-2.5 bg-indigo-900/20">
                                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">
                                        Cena {structuredIdx + 1}
                                      </p>
                                      {sc.storyboardText && (
                                        <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{sc.storyboardText}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* ── Client feedback from portal ── */}
                      {script.portalStatus === 'refacao' && script.clientFeedback && (
                        <div className="px-4 py-3 rounded-xl bg-orange-900/10 border border-orange-800/40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1.5 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" /> Feedback do Cliente (Portal)
                          </p>
                          <p className="text-xs text-zinc-300 italic leading-relaxed">
                            &ldquo;{script.clientFeedback}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* ── Portal rating ── */}
                      {script.portalStatus === 'aprovado_cliente' && !!script.rating && script.rating > 0 && (
                        <div className="px-4 py-3 rounded-xl bg-amber-900/10 border border-amber-800/40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-1.5">
                            <Star className="w-3 h-3" style={{ fill: '#f59e0b', stroke: '#f59e0b' }} /> Avaliação do Cliente (Portal)
                          </p>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} className="w-4 h-4" style={{ fill: n <= script.rating! ? '#f59e0b' : 'transparent', stroke: n <= script.rating! ? '#f59e0b' : '#71717a' }} />
                            ))}
                            <span className="ml-1.5 text-xs font-black text-amber-500">{script.rating}/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HowToUseModal
// ─────────────────────────────────────────────
const HOW_TO_USE_STEPS = [
  { title: 'Defina os Temas',     desc: 'Na Etapa 1, insira temas manuais ou peça sugestões à IA baseadas no nicho do cliente.' },
  { title: 'Escolha os Formatos', desc: 'Na Etapa 2, selecione os formatos (Reels, Carrossel…) e os ângulos editoriais que mais se encaixam na estratégia.' },
  { title: 'Gere as Ideias',      desc: 'Clique em "Gerar Ideias Infinitas". A IA cruzará o briefing do cliente com suas escolhas para criar conteúdo estratégico.' },
  { title: 'Crie o Roteiro',      desc: 'Em cada card de ideia, clique em "✨ Criar Roteiro" para gerar um script completo com visual, áudio, legenda e hashtags.' },
  { title: 'Integre ao Workflow', desc: 'No rodapé do roteiro, use "Enviar para Workflow" ou "Agendar Gravação" para conectar direto ao Kanban e à Agenda do cliente.' },
];

const HowToUseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Como Usar — Ideias Infinitas</h2>
            <p className="text-xs text-zinc-400">5 passos para gerar conteúdo de alto impacto</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-400 hover:hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {HOW_TO_USE_STEPS.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-violet-900/40 text-violet-400 flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-sm text-white">{step.title}</p>
              <p className="text-sm text-zinc-400 mt-0.5 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expert tip + close */}
      <div className="px-6 py-4 border-t border-zinc-800 space-y-3">
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-2xl px-4 py-3">
          <p className="text-xs font-black text-amber-400 mb-1">💡 Dica de Especialista</p>
          <p className="text-xs text-amber-400/80 leading-relaxed">
            Gere ideias em lotes temáticos — 4 a 6 ideias sobre o mesmo tema criam uma série com alta retenção de audiência.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors"
        >
          Entendido, vamos gerar!
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// ScriptModal
// ─────────────────────────────────────────────
interface ScriptModalProps {
  idea: IdeaCard;
  onClose: () => void;
  onSendToWorkflow: (title: string) => void;
  onScheduleRecording: (title: string) => void;
  onSaveToRoteiros: (idea: IdeaCard) => Promise<void>;
}

const ScriptModal: React.FC<ScriptModalProps> = ({ idea, onClose, onSendToWorkflow, onScheduleRecording, onSaveToRoteiros }) => {
  const [currentIdea, setCurrentIdea]               = useState<IdeaCard>(idea);
  const [copiedAll, setCopiedAll]                   = useState(false);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [workflowToast, setWorkflowToast]             = useState(false);
  const [roteirosSaveToast, setRoteirosSaveToast]     = useState(false);
  const [roteirosSaved, setRoteirosSaved]             = useState(false); // permanent lock after save
  const [roteirosSaving, setRoteirosSaving]           = useState(false);
  const [roteirosError, setRoteirosError]             = useState('');

  const copyAll = () => {
    const slidesText = currentIdea.script.slides
      .map((s, i) => `${i + 1}. [Visual: ${s.visual}]\n   Áudio: "${s.audio}"`)
      .join('\n\n');
    const full = `📌 ${currentIdea.title}\n\n🎣 Hook:\n"${currentIdea.gancho}"\n\n📋 Roteiro:\n${slidesText}\n\n📣 CTA:\n${currentIdea.cta}\n\n💬 Legenda:\n${currentIdea.script.caption}\n\n#️⃣ Hashtags:\n${currentIdea.script.hashtags}`;
    navigator.clipboard.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleSendToWorkflow = () => {
    onSendToWorkflow(currentIdea.title);
    setWorkflowToast(true);
    setTimeout(() => setWorkflowToast(false), 3000);
  };

  const handleSaveToRoteiros = async () => {
    if (roteirosSaved || roteirosSaving) return;
    setRoteirosSaving(true);
    setRoteirosError('');
    try {
      await onSaveToRoteiros(currentIdea);
      setRoteirosSaved(true);         // permanent — blocks re-save
      setRoteirosSaveToast(true);
      setTimeout(() => setRoteirosSaveToast(false), 4000);
    } catch {
      setRoteirosError('Erro ao salvar. Tente novamente.');
      setTimeout(() => setRoteirosError(''), 4000);
    } finally {
      setRoteirosSaving(false);
    }
  };

  const handleGenerateVariation = async () => {
    if (isGeneratingVariation) return;
    setIsGeneratingVariation(true);
    try {
      const slidesText = currentIdea.script.slides
        .map((s, i) => `${i + 1}. Visual: ${s.visual} | Áudio: "${s.audio}"`)
        .join('\n');
      const prompt = `Reescreva este roteiro de vídeo mantendo o tema "${currentIdea.title}", mas altere o Gancho (Hook) para ser mais agressivo e chamativo, e mude a estrutura das cenas para uma abordagem diferente. Retorne APENAS JSON válido, sem markdown, sem blocos de código, no formato exato: {"gancho":"...","cta":"...","slides":[{"visual":"...","audio":"..."}],"caption":"...","hashtags":"..."}\n\nRoteiro atual:\nGancho: "${currentIdea.gancho}"\nCenas:\n${slidesText}\nCTA: ${currentIdea.cta}`;
      const result = await sendMessageToAgent(
        AgentId.SCRIPT_GENERATOR,
        prompt,
        null,
        [],
        'Você é um roteirista especialista em conteúdo viral para redes sociais. Quando solicitado, retorne APENAS JSON válido, sem markdown, sem blocos de código, sem explicações.',
      );
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setCurrentIdea(prev => ({
          ...prev,
          gancho: parsed.gancho || prev.gancho,
          cta:    parsed.cta    || prev.cta,
          script: {
            slides:   Array.isArray(parsed.slides) && parsed.slides.length > 0 ? parsed.slides : prev.script.slides,
            caption:  parsed.caption  || prev.script.caption,
            hashtags: parsed.hashtags || prev.script.hashtags,
          },
        }));
      }
    } catch {
      /* silently ignore — user keeps current script */
    } finally {
      setIsGeneratingVariation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex-1 min-w-0 pr-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">Roteiro Completo</span>
            <h2 className="text-base font-black text-white leading-snug mt-1">{currentIdea.title}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentIdea.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-900/40 text-violet-300 border border-violet-800/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Loading overlay for variation */}
          {isGeneratingVariation && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-violet-900/20 border border-violet-800/50 animate-in fade-in duration-200">
              <Loader2 className="w-4 h-4 text-violet-500 animate-spin flex-shrink-0" />
              <p className="text-xs font-bold text-violet-300">Gerando variação com IA… aguarde um instante.</p>
            </div>
          )}

          {/* Workflow toast */}
          {workflowToast && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/50 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-bold text-emerald-300">✅ Card criado no Workflow de Produção!</p>
            </div>
          )}

          {/* Roteiros save toast */}
          {roteirosSaveToast && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-violet-900/20 border border-violet-800/50 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <p className="text-xs font-bold text-violet-300">✅ Roteiro salvo na Sala de Roteiros!</p>
            </div>
          )}
          {roteirosError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-900/20 border border-red-800/50 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-300">{roteirosError}</p>
            </div>
          )}

          {/* Hook */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">🎣 Hook (Gancho)</p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3">
              <p className="text-sm text-zinc-300 italic leading-relaxed">&ldquo;{currentIdea.gancho}&rdquo;</p>
            </div>
          </div>

          {/* Slides */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">🎬 Desenvolvimento — Cenas</p>
            <div className="space-y-3">
              {currentIdea.script.slides.map((slide, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <span className="text-[10px] font-black text-violet-500 mt-0.5 flex-shrink-0">📷 Visual:</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">{slide.visual}</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-[10px] font-black text-emerald-400 mt-0.5 flex-shrink-0">🎙 Áudio:</span>
                      <p className="text-xs font-medium text-zinc-200 leading-relaxed">&ldquo;{slide.audio}&rdquo;</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">📣 CTA</p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3">
              <p className="text-sm font-bold text-zinc-200">{currentIdea.cta}</p>
            </div>
          </div>

          {/* Caption + Hashtags */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">💬 Legenda & Hashtags</p>
            <div className="bg-violet-900/20 border border-violet-800/50 rounded-2xl px-4 py-4 space-y-3">
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{currentIdea.script.caption}</p>
              <div className="h-px bg-violet-800/50" />
              <p className="text-xs font-bold text-violet-400 leading-relaxed">{currentIdea.script.hashtags}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={handleGenerateVariation}
              disabled={isGeneratingVariation}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-zinc-700 rounded-xl text-xs font-bold text-zinc-400 hover:border-violet-600 hover:text-violet-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingVariation
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando…</>
                : <><Sparkles className="w-3.5 h-3.5" /> 🔄 Gerar Variação</>
              }
            </button>
            <button
              onClick={copyAll}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-zinc-700 rounded-xl text-xs font-bold text-zinc-400 hover:border-zinc-500 transition-all"
            >
              {copiedAll ? (
                <span className="text-emerald-400">✓ Copiado!</span>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> 📋 Copiar Tudo</>
              )}
            </button>
          </div>

          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-3 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">⚡ Ações do Creator Flow</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleSendToWorkflow}
                disabled={workflowToast}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 hover:opacity-90 transition-all disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5" /> Workflow
              </button>
              <button
                onClick={() => onScheduleRecording(currentIdea.title)}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-90 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" /> Agendar
              </button>
              <button
                onClick={handleSaveToRoteiros}
                disabled={roteirosSaved || roteirosSaving}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {roteirosSaving ? (
                  <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando…</>
                ) : roteirosSaved ? (
                  <><Check className="w-3.5 h-3.5" /> Salvo</>
                ) : (
                  <><FileText className="w-3.5 h-3.5" /> Sala de Roteiros</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ClientEntregasTab sub-component
// ─────────────────────────────────────────────
const ClientEntregasTab: React.FC<{ client: Client }> = ({ client }) => {
  const { data: deliverables, setData: setDeliverables } = useClientData<Deliverable[]>(client.id, 'entregas', []);

  const [formTitle, setFormTitle]       = useState('');
  const [formExpiry, setFormExpiry]     = useState<DeliverableExpiry>(7);
  const [formLink, setFormLink]         = useState('');
  const [isDragging, setIsDragging]     = useState(false);
  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);
  const [genLinkToast, setGenLinkToast] = useState(false);

  // Entregas persistence handled by useClientData hook

  const handleGenerateLink = () => {
    if (!formTitle.trim()) return;
    const resolvedLink = formLink.trim() || `https://app.creatorflow.com.br/review/${Math.random().toString(36).substring(2, 8)}`;
    const newDeliverable: Deliverable = {
      id: crypto.randomUUID(),
      title: formTitle.trim(),
      status: 'aguardando',
      shareLink: resolvedLink,
      expiresInDays: formExpiry,
      sentAt: Date.now(),
    };
    setDeliverables(prev => [newDeliverable, ...prev]);
    navigator.clipboard.writeText(resolvedLink).catch(() => {});
    setFormTitle('');
    setFormLink('');
    setGenLinkToast(true);
    setTimeout(() => setGenLinkToast(false), 3000);
  };

  const handleCopyLink = (d: Deliverable) => {
    navigator.clipboard.writeText(d.shareLink).catch(() => {});
    setLinkCopiedId(d.id);
    setTimeout(() => setLinkCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover esta entrega?')) setDeliverables(prev => prev.filter(d => d.id !== id));
  };

  const sentAgoLabel = (sentAt: number): string => {
    const mins = Math.floor((Date.now() - sentAt) / 60000);
    if (mins < 60)  return `há ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `há ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `há ${days} dia${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-8">

      {/* ══ NOVA ENTREGA ══ */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Nova Entrega de Vídeo</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

          {/* Drag-and-drop area */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); }}
            className={`flex flex-col items-center justify-center gap-3 px-6 py-10 border-b border-dashed transition-all ${
              isDragging
                ? 'border-violet-600 bg-violet-900/10'
                : 'border-zinc-700 bg-zinc-800/30'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isDragging
                ? 'bg-violet-900/40 text-violet-500'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-300">Arraste o vídeo finalizado</p>
              <p className="text-xs text-zinc-400 mt-0.5">ou cole o link (Drive / Vimeo) abaixo</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div>
              <label className={MODAL_LABEL_CLS}>Título da Entrega *</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleGenerateLink(); }}
                placeholder="Ex: Reels 01 — Bastidores da Confeitaria"
                className={MODAL_INPUT_CLS}
              />
            </div>

            <div>
              <label className={MODAL_LABEL_CLS}>Link do Material (Drive / Vimeo)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  value={formLink}
                  onChange={e => setFormLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={`${MODAL_INPUT_CLS} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className={MODAL_LABEL_CLS}>Prazo do Link</label>
              <div className="flex gap-1.5">
                {([7, 15, 30] as DeliverableExpiry[]).map(days => (
                  <button
                    key={days}
                    onClick={() => setFormExpiry(days)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${
                      formExpiry === days
                        ? 'bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-500/25'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {genLinkToast && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/50 animate-in fade-in duration-200">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-300">Link de aprovação gerado e copiado!</p>
              </div>
            )}

            <button
              onClick={handleGenerateLink}
              disabled={!formTitle.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-black text-sm shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LinkIcon className="w-4 h-4" />
              Gerar Link Seguro
            </button>
          </div>
        </div>
      </section>

      {/* ══ LISTA DE ENTREGAS ══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Vídeos Enviados</h2>
          {deliverables.length > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400">
              {deliverables.length}
            </span>
          )}
        </div>

        {deliverables.length === 0 && (
          <div className="py-16 text-center rounded-2xl border-2 border-dashed border-zinc-800">
            <Film className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm font-bold text-zinc-400">Nenhum vídeo enviado ainda</p>
            <p className="text-xs text-zinc-400 mt-1">Gere o primeiro link seguro acima.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {deliverables.map(d => {
            const cfg = DELIVERABLE_STATUS_CONFIG[d.status];
            return (
              <div
                key={d.id}
                className={`group relative flex flex-col gap-4 p-5 bg-zinc-900 border rounded-2xl transition-all hover:shadow-md ${
                  d.status === 'alteracao'
                    ? 'border-orange-600/30'
                    : d.status === 'aprovado'
                    ? 'border-emerald-600/30'
                    : 'border-zinc-800'
                }`}
              >
                {/* Delete btn */}
                <button
                  onClick={() => handleDelete(d.id)}
                  className="absolute top-3 right-3 p-1.5 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Remover entrega"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-violet-900/30 text-violet-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-white leading-tight pr-6 line-clamp-2">
                      {d.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Enviado {sentAgoLabel(d.sentAt)}
                      </span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className="text-[10px] text-zinc-400">Expira em {d.expiresInDays} dias</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`self-start inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg border ${cfg.badge}`}>
                  <cfg.Icon className="w-3 h-3" /> {cfg.label}
                </span>

                {/* Star rating — aprovado only */}
                {d.status === 'aprovado' && d.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < d.rating!
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-zinc-800 text-zinc-600'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-black text-zinc-400 ml-1.5">{d.rating}/5</span>
                  </div>
                )}

                {/* Client feedback — alteracao only */}
                {d.status === 'alteracao' && d.feedback && (
                  <div className="px-4 py-3 rounded-xl bg-orange-900/10 border border-orange-800/40">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1.5">Feedback do Cliente</p>
                    <p className="text-xs text-zinc-300 italic leading-relaxed">
                      &ldquo;{d.feedback}&rdquo;
                    </p>
                  </div>
                )}

                {/* Copy link */}
                <button
                  onClick={() => handleCopyLink(d)}
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    linkCopiedId === d.id
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-900/10'
                      : 'border-zinc-700 text-zinc-400 hover:border-violet-600 hover:text-violet-400'
                  }`}
                >
                  {linkCopiedId === d.id
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Link Copiado!</>
                    : <><LinkIcon className="w-3.5 h-3.5" /> Copiar Link</>
                  }
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────
// HealthThermometer
// ─────────────────────────────────────────────
const HealthThermometer: React.FC<{ score: number }> = ({ score }) => {
  const isRed    = score < 34;
  const isYellow = score >= 34 && score < 67;
  const color    = isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : 'text-emerald-400';
  const label    = isRed ? 'Atenção — Há itens críticos' : isYellow ? 'Moderado — Atenção necessária' : 'Saudável — Tudo fluindo';
  const iconBg   = isRed ? 'bg-red-500/15 border-red-500/20' : isYellow ? 'bg-amber-500/15 border-amber-500/20' : 'bg-emerald-500/15 border-emerald-500/20';
  const glow     = isRed ? 'from-red-600/10' : isYellow ? 'from-amber-600/10' : 'from-emerald-600/10';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className={`absolute inset-0 bg-gradient-to-r ${glow} to-transparent pointer-events-none`} />
      <div className="relative z-10 flex items-center gap-5">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Gauge className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Termômetro de Saúde do Projeto</p>
          <p className={`text-sm font-black ${color}`}>{label}</p>
        </div>
        <div className="flex-shrink-0 w-36">
          <div className="relative h-3 rounded-full overflow-hidden bg-gray-800">
            {/* gradient track */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
            {/* mask that hides the right portion */}
            <div
              className="absolute inset-y-0 right-0 bg-gray-900 transition-all duration-700"
              style={{ width: `${100 - score}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-red-600 font-bold">Crítico</span>
            <span className={`text-[9px] font-black tabular-nums ${color}`}>{score}%</span>
            <span className="text-[9px] text-emerald-600 font-bold">Ótimo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ClientVisaoGeralTab — Central de Comando
// ─────────────────────────────────────────────
const PRODUCTION_STAGES = ['Briefing', 'Roteiro', 'Aprovação', 'Gravação', 'Edição', 'Pronto'] as const;

interface VisaoGeralData {
  awaitingClient:    number;
  teamBottleneck:    number;
  readyToRecord:     number;
  riskScript:        { title: string; recordingDate: string } | null;
  opportunityScript: { title: string } | null;
  nextRecordings:    AgendaEvent[];
  radarFeedbacks:    { title: string; rating: number; feedback?: string; type: 'script' | 'deliverable' }[];
  stageIdx:          number | null;  // null = no pinned package
  pinnedTitle:       string | null;
  healthScore:       number;
}

const ClientVisaoGeralTab: React.FC<{ client: Client }> = ({ client }) => {
  const todayStr = getTodayStr();

  // Use shared hooks instead of direct fetchClientData — eliminates duplicate requests
  // and prevents data loss on tab switch (hooks persist state across mounts)
  const { data: pkgs } = useClientData<ScriptPackage[]>(client.id, 'roteiros', []);
  const { data: cols } = useClientData<KanbanColumn[]>(client.id, 'kanban', KANBAN_INITIAL_COLUMNS);
  const { data: inv } = useClientData<Invoice[]>(client.id, 'invoices', []);
  const { data: events } = useClientData<AgendaEvent[]>(client.id, 'agenda', []);
  const { data: deliverables } = useClientData<Deliverable[]>(client.id, 'entregas', []);

  const data = useMemo<VisaoGeralData>(() => {
    let awaitingClient    = 0;
    let teamBottleneck    = 0;
    let readyToRecord     = 0;
    let riskScript:        VisaoGeralData['riskScript']        = null;
    let opportunityScript: VisaoGeralData['opportunityScript'] = null;
    let nextRecordings:    AgendaEvent[]   = [];
    let radarFeedbacks:    VisaoGeralData['radarFeedbacks']    = [];
    let allScripts:        ScriptDocument[] = [];
    let stageIdx:          number | null    = null;
    let pinnedTitle:       string | null    = null;
    let healthScore        = 100;

    // ── Roteiros ────────────────────────────────
    if (Array.isArray(pkgs) && pkgs.length > 0) {
      allScripts     = pkgs.flatMap(p => p.scripts);
      awaitingClient = allScripts.filter(sc => sc.portalStatus === 'aguardando_cliente').length;
      const topRated = allScripts.find(sc => sc.rating === 5);
      if (topRated) opportunityScript = { title: topRated.title };
      const scriptFbs = allScripts
        .filter(sc => (sc.rating ?? 0) > 0)
        .sort((a, b) => (b.sentToPortalAt ?? 0) - (a.sentToPortalAt ?? 0))
        .slice(0, 3)
        .map(sc => ({ title: sc.title, rating: sc.rating!, type: 'script' as const }));
      radarFeedbacks.push(...scriptFbs);

      // ── Pinned package → Timeline stage ─────
      const findPinned = (list: ScriptPackage[]): ScriptPackage | null => {
        for (const p of list) {
          if (p.isPinnedToTimeline) return p;
          if (p.subFolders) { const found = findPinned(p.subFolders); if (found) return found; }
        }
        return null;
      };
      const pinned = findPinned(pkgs);
      if (pinned) {
        pinnedTitle = pinned.title;
        const sc = pinned.scripts;
        if (sc.length === 0) {
          stageIdx = 0; // Briefing
        } else {
          const allGravado    = sc.every(r => r.status === 'Gravado');
          const hasGravado    = sc.some(r => r.status === 'Gravado');
          const hasAprovado   = sc.some(r => r.portalStatus === 'aprovado_cliente' || r.status === 'Aprovado');
          const hasAguardando = sc.some(r => r.portalStatus === 'aguardando_cliente');
          if      (allGravado)    stageIdx = 5;
          else if (hasGravado)    stageIdx = 4;
          else if (hasAprovado)   stageIdx = 3;
          else if (hasAguardando) stageIdx = 2;
          else                    stageIdx = 1;
        }
      }
    }

    // ── Kanban + auto-stage + health ─────────────
    if (Array.isArray(cols) && cols.length > 0) {
      const today = new Date();
      const bottleneckCards = cols
        .filter(c => c.id === 'preproducao' || c.id === 'gravar')
        .flatMap(c => c.cards);
      const overdueCards = cols
        .filter(c => c.id !== 'finalizado')
        .flatMap(c => c.cards)
        .filter(card => card.dueDate && new Date(card.dueDate) < today);
      const combined = new Set([...bottleneckCards.map(c => c.id), ...overdueCards.map(c => c.id)]);
      teamBottleneck = combined.size;

      for (const col of cols) {
        if (col.cards.length > 0) {
          const colStage = COLUMN_STAGE_MAP[col.id] ?? 0;
          if (colStage > (stageIdx ?? -1)) stageIdx = colStage;
        }
      }

      healthScore -= Math.min(overdueCards.length * 20, 60);
    }

    // ── Health: overdue invoices ─────────────────
    if (Array.isArray(inv) && inv.length > 0) {
      const overdueInv = inv.filter(i => i.status === 'atrasado').length;
      healthScore -= Math.min(overdueInv * 25, 50);
    }

    // Health: scripts awaiting approval
    healthScore -= Math.min(awaitingClient * 10, 30);
    healthScore = Math.max(0, Math.min(100, healthScore));

    // ── Agenda ──────────────────────────────────
    if (Array.isArray(events) && events.length > 0) {
      const futureRecs = events
        .filter(e => e.type === 'Gravação' && e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date));
      nextRecordings = futureRecs.slice(0, 3);

      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      const threeDaysStr = threeDaysLater.toISOString().split('T')[0];
      const urgentRec = futureRecs.find(e => e.date <= threeDaysStr);
      if (urgentRec) {
        const hasApproved = allScripts.some(sc => sc.portalStatus === 'aprovado_cliente');
        if (!hasApproved) riskScript = { title: urgentRec.title, recordingDate: urgentRec.date };
      }
    }

    const approvedCount = allScripts.filter(sc => sc.portalStatus === 'aprovado_cliente').length;
    readyToRecord = nextRecordings.length > 0 ? 0 : approvedCount;

    // ── Entregas (radar) ─────────────────────────
    if (Array.isArray(deliverables) && deliverables.length > 0) {
      const withRating = deliverables
        .filter(d => (d.rating ?? 0) > 0)
        .sort((a, b) => b.sentAt - a.sentAt)
        .slice(0, 2)
        .map(d => ({ title: d.title, rating: d.rating!, feedback: d.feedback, type: 'deliverable' as const }));
      radarFeedbacks.push(...withRating);
    }

    radarFeedbacks = radarFeedbacks.slice(0, 3);

    return { awaitingClient, teamBottleneck, readyToRecord, riskScript, opportunityScript, nextRecordings, radarFeedbacks, stageIdx, pinnedTitle, healthScore };
  }, [pkgs, cols, inv, events, deliverables, todayStr]);

  const stageIdx    = data.stageIdx;         // null when no package is pinned
  const progressPct = stageIdx !== null
    ? Math.round((stageIdx / (PRODUCTION_STAGES.length - 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* ══ 0. Termômetro de Saúde ══ */}
      <HealthThermometer score={data.healthScore} />

      {/* ══ 1. Cards de Status Crítico ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* 🔴 Aguardando Cliente */}
        <div className="flex flex-col gap-3 p-5 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 uppercase tracking-wider">Urgente</span>
          </div>
          <div>
            <p className="text-4xl font-black text-red-400 tabular-nums">{data.awaitingClient}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">Roteiros aguardando aprovação do cliente</p>
          </div>
        </div>

        {/* 🟡 Gargalo da Equipe */}
        <div className="flex flex-col gap-3 p-5 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase tracking-wider">Atenção</span>
          </div>
          <div>
            <p className="text-4xl font-black text-amber-400 tabular-nums">{data.teamBottleneck}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">Tarefas em gargalo ou atrasadas no Workflow</p>
          </div>
        </div>

        {/* 🟢 Pronta para Gravar */}
        <div className="flex flex-col gap-3 p-5 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Liberado</span>
          </div>
          <div>
            <p className="text-4xl font-black text-emerald-400 tabular-nums">{data.readyToRecord}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">Roteiros aprovados sem gravação agendada</p>
          </div>
        </div>
      </div>

      {/* ══ 2. Iara Insights ══ */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-indigo-950/20 p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5 pointer-events-none" />
        <div className="relative z-10 space-y-4">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Iara Insights</p>
              <p className="text-[10px] text-indigo-400/60 mt-0.5">Inteligência proativa do seu projeto</p>
            </div>
          </div>

          {data.riskScript ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-red-300">Risco de Atraso</p>
                <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                  A gravação de <span className="font-bold text-red-300">{formatDate(data.riskScript.recordingDate)}</span> está próxima, mas nenhum roteiro foi aprovado ainda.
                </p>
              </div>
              <button className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-black border border-red-500/30 transition-all whitespace-nowrap">
                Cobrar Cliente
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs font-bold text-emerald-300">Nenhum risco de atraso identificado. Projeto no caminho certo!</p>
            </div>
          )}

          {data.opportunityScript && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-violet-300">Oportunidade de Growth</p>
                <p className="text-xs text-violet-400/80 mt-1 leading-relaxed">
                  O cliente avaliou com 5 estrelas o conteúdo <span className="font-bold text-violet-300">"{data.opportunityScript.title}"</span>. Que tal gerarmos uma nova série parecida?
                </p>
              </div>
              <button className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-[11px] font-black border border-violet-500/30 transition-all whitespace-nowrap">
                Gerar Ideias
              </button>
            </div>
          )}

          {!data.riskScript && !data.opportunityScript && (
            <p className="text-xs text-gray-600 italic">Continue criando conteúdo para que a Iara identifique oportunidades aqui.</p>
          )}
        </div>
      </div>

      {/* ══ 3. Timeline + Próximas Gravações ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Timeline de Produção ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5" /> Timeline de Produção
            </p>
            {stageIdx !== null && data.pinnedTitle && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 max-w-[140px] truncate">
                <Pin className="w-2.5 h-2.5 flex-shrink-0" /> {data.pinnedTitle}
              </span>
            )}
          </div>

          {stageIdx === null ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                <Pin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Nenhuma pasta vinculada</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Selecione uma pasta na Sala de Roteiros<br />e clique em <span className="text-amber-500 font-bold">Destacar na Timeline</span>.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start">
                {PRODUCTION_STAGES.map((stage, i) => {
                  const isCompleted = i < stageIdx;
                  const isCurrent   = i === stageIdx;
                  return (
                    <React.Fragment key={stage}>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted ? 'bg-violet-600 border-violet-500'
                          : isCurrent  ? 'bg-violet-600/20 border-violet-500 ring-2 ring-violet-500/25'
                          :              'bg-gray-800 border-gray-700'
                        }`}>
                          {isCompleted
                            ? <Check className="w-3 h-3 text-white" />
                            : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-violet-400' : 'bg-gray-600'}`} />
                          }
                        </div>
                        <p className={`text-[9px] font-black text-center leading-tight ${
                          isCurrent ? 'text-violet-300' : isCompleted ? 'text-gray-500' : 'text-gray-700'
                        }`}>{stage}</p>
                      </div>
                      {i < PRODUCTION_STAGES.length - 1 && (
                        <div className={`flex-shrink-0 h-px w-3 mt-3.5 ${i < stageIdx ? 'bg-violet-600' : 'bg-gray-700'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Progresso</span>
                  <span className="text-[11px] font-black text-violet-400">{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {stageIdx === PRODUCTION_STAGES.length - 1 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs font-black text-emerald-300">Projeto Finalizado!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Próximas Gravações ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Próximas Gravações</p>
          {data.nextRecordings.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-center">
              <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nenhuma gravação agendada</p>
              <p className="text-xs text-gray-700 mt-1">Adicione eventos do tipo "Gravação" na aba Agenda</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.nextRecordings.map((event, i) => {
                const d = new Date(event.date + 'T12:00:00');
                const day   = d.toLocaleDateString('pt-BR', { day: '2-digit' });
                const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/20">
                      <p className="text-sm font-black text-violet-300 leading-none">{day}</p>
                      <p className="text-[10px] text-violet-500 uppercase leading-none mt-0.5">{month}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{event.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {event.startTime ? `${event.startTime} · ` : ''}{event.location}
                      </p>
                    </div>
                    <Video className="w-4 h-4 flex-shrink-0 text-violet-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ 4. Radar do Cliente ══ */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Radar do Cliente — Últimos Feedbacks</p>
        </div>
        {data.radarFeedbacks.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center">
            <Star className="w-7 h-7 text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Nenhuma avaliação recebida ainda</p>
            <p className="text-xs text-gray-700 mt-1">As notas do Portal aparecerão aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.radarFeedbacks.map((fb, i) => (
              <div key={i} className="flex flex-col gap-2 p-3.5 rounded-xl border border-gray-700/50 bg-gray-800/50">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className="w-3.5 h-3.5" style={{ fill: n <= fb.rating ? '#f59e0b' : 'transparent', stroke: n <= fb.rating ? '#f59e0b' : '#52525b' }} />
                  ))}
                  <span className="ml-1.5 text-[10px] font-black text-amber-400">{fb.rating}/5</span>
                </div>
                <p className="text-xs font-bold text-gray-300 truncate">{fb.title || '(sem título)'}</p>
                {fb.feedback && (
                  <p className="text-[11px] text-gray-500 italic leading-relaxed line-clamp-2">"{fb.feedback}"</p>
                )}
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                  {fb.type === 'script'
                    ? <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Roteiro</span>
                    : <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Entrega</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Financeiro & Métricas tab
// ─────────────────────────────────────────────
interface FollowerRecord {
  month: string;   // e.g., "Fev/2026"
  count: number;
}

interface ClientMetrics {
  followerHistory: FollowerRecord[];
}

const DEFAULT_METRICS: ClientMetrics = { followerHistory: [] };

const FOLLOWER_MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const FOLLOWER_MONTH_OPTIONS = [2025, 2026].flatMap(y => FOLLOWER_MONTHS_PT.map(m => `${m}/${y}`));

const INVOICE_STATUS_STYLES: Record<Invoice['status'], { label: string; badge: string }> = {
  pendente: { label: 'Pendente',  badge: 'bg-amber-900/20 text-amber-400 border-amber-800/50' },
  pago:     { label: 'Pago',      badge: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' },
  atrasado: { label: 'Atrasado',  badge: 'bg-red-900/20 text-red-400 border-red-800/50' },
};

// ─────────────────────────────────────────────
// BrandBrainBadge — indicador visual reutilizável
// ─────────────────────────────────────────────
const BrandBrainBadge: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(`creator_flow_brand_brain_${clientId}`);
      if (!raw) return;
      const data = JSON.parse(raw);
      setActive(typeof data === 'object' && !!data.coreTransformation?.trim());
    } catch { /* ignore */ }
  }, [clientId]);

  if (!active) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium w-fit"
      title="IA contextualizada com o DNA deste cliente."
    >
      <Brain className="w-3.5 h-3.5 flex-shrink-0" />
      Cérebro da Marca Ativado
    </div>
  );
};

// ─────────────────────────────────────────────
// ClientBrandBrainTab — Cérebro da Marca (Wizard)
// ─────────────────────────────────────────────

const BRAND_BRAIN_FIELDS: { key: keyof BrandBrain; label: string; placeholder: string }[] = [
  { key: 'coreTransformation',   label: 'A Grande Transformação',        placeholder: 'Qual transformação profunda o cliente entrega? Ex: de confuso a autoridade reconhecida...' },
  { key: 'audiencePainsDesires', label: 'Dores e Desejos Profundos',     placeholder: 'O que mantém seu público acordado à noite? O que eles sonham em alcançar...' },
  { key: 'uniqueMechanism',      label: 'Mecanismo Único',               placeholder: 'Qual é o método, processo ou abordagem exclusiva que só esta marca usa...' },
  { key: 'commonObjections',     label: 'Principais Objeções de Compra', placeholder: 'Por que as pessoas hesitam em comprar? Preço, tempo, dúvida sobre resultado...' },
  { key: 'brandVoice',           label: 'Tom de Voz',                    placeholder: 'Como a marca fala? Direto, empático, provocador, inspiracional...' },
  { key: 'keywordsRules',        label: 'Regras de Vocabulário',         placeholder: 'Palavras que DEVE usar. Palavras que NUNCA deve usar. Expressões da marca...' },
  { key: 'visualStyle',          label: 'Estilo Visual',                 placeholder: 'Paleta de cores, tipografia, sensação estética, referências visuais...' },
  { key: 'inspirationBrands',    label: 'Marcas de Inspiração',          placeholder: 'Quais marcas (nacionais ou internacionais) inspiram a comunicação deste cliente...' },
];

interface BrainWizardStep {
  label: string;
  subtitle: string;
  fields: (keyof BrandBrain)[];
}

const BB_WIZARD_STEPS: BrainWizardStep[] = [
  { label: 'Essência',      subtitle: 'A proposta central e o mecanismo único da marca',     fields: ['coreTransformation', 'uniqueMechanism'] },
  { label: 'Público',       subtitle: 'Quem você impacta, suas dores e objeções de compra',  fields: ['audiencePainsDesires', 'commonObjections'] },
  { label: 'Comunicação',   subtitle: 'Voz, vocabulário, estilo visual e referências',       fields: ['brandVoice', 'keywordsRules', 'visualStyle', 'inspirationBrands'] },
  { label: 'Quadro Branco', subtitle: 'Contexto livre — escreva ou dicte tudo que faltou',   fields: [] },
];

const BB_TOTAL_STEPS = BB_WIZARD_STEPS.length;

const EMPTY_BRAIN: BrandBrain = {
  coreTransformation: '', audiencePainsDesires: '', uniqueMechanism: '',
  commonObjections: '', brandVoice: '', keywordsRules: '', visualStyle: '',
  inspirationBrands: '', freeDump: '',
};

const ClientBrandBrainTab: React.FC<{ client: Client }> = ({ client }) => {
  const STORAGE_KEY = `creator_flow_brand_brain_${client.id}`;

  const [brain, setBrain] = useState<BrandBrain>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) return { ...EMPTY_BRAIN, ...JSON.parse(s) };
    } catch { /* ignore */ }
    return { ...EMPTY_BRAIN };
  });

  const [step, setStep]   = useState(1);
  const [saved, setSaved] = useState(false);

  // Speech recognition state (steps 1–3 per-field voice)
  const [activeField, setActiveField] = useState<keyof BrandBrain | null>(null);

  // MediaRecorder state (step 4 — quadro branco)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isTranscribing,   setIsTranscribing]   = useState(false);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (key: keyof BrandBrain, value: string) => {
    setBrain(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(brain)); } catch { /* ignore */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Speech recognition (per-field, steps 1–3) ──────────────
  const stopSpeech = () => {
    try { (window as any).__brainRecognition?.stop(); } catch { /* ignore */ }
    setActiveField(null);
  };

  const startSpeech = (key: keyof BrandBrain) => {
    const SR = typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null;
    if (!SR) { alert('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.'); return; }
    setActiveField(key);
    const recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[]).map((r: any) => r[0].transcript).join(' ');
      setBrain(prev => ({ ...prev, [key]: (prev[key] ? prev[key] + ' ' : '') + transcript }));
    };
    recognition.onerror = () => setActiveField(null);
    recognition.onend   = () => setActiveField(null);
    recognition.start();
    (window as any).__brainRecognition = recognition;
  };

  const handleMicClick = (key: keyof BrandBrain) => {
    if (activeField === key) { stopSpeech(); } else { if (activeField) stopSpeech(); startSpeech(key); }
  };

  // ── MediaRecorder + transcription (step 4) ─────────────────
  const transcribeBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader  = new FileReader();
      const base64  = await new Promise<string>((resolve, reject) => {
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const res  = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64 }),
      });
      const data = await res.json();
      if (data.transcript) {
        setBrain(prev => ({
          ...prev,
          freeDump: (prev.freeDump ? prev.freeDump + '\n\n' : '') + data.transcript,
        }));
      }
    } catch { /* silently fail — textarea unchanged */ }
    finally  { setIsTranscribing(false); }
  };

  const startAudioRecording = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        transcribeBlob(blob, mimeType);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingAudio(true);
    } catch {
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const stopAudioRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingAudio(false);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await transcribeBlob(file, file.type || 'audio/mpeg');
  };

  // ── Field renderer (steps 1–3) ──────────────────────────────
  const renderField = (key: keyof BrandBrain) => {
    const meta        = BRAND_BRAIN_FIELDS.find(f => f.key === key)!;
    const isListening = activeField === key;
    return (
      <div key={key} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-gray-400 uppercase tracking-wide">{meta.label}</label>
          <button
            onClick={() => handleMicClick(key)}
            title={isListening ? 'Parar gravação' : 'Ditar por voz'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300 hover:bg-gray-700'
            }`}
          >
            {isListening ? <><Square className="w-3 h-3" /> Parar</> : <><Mic className="w-3 h-3" /> Voz</>}
          </button>
        </div>
        <textarea
          value={(brain[key] as string) || ''}
          onChange={e => updateField(key, e.target.value)}
          placeholder={meta.placeholder}
          rows={4}
          className={`w-full text-sm px-3 py-2.5 rounded-xl bg-gray-800 border text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 transition-all resize-none ${
            isListening
              ? 'border-red-500/50 focus:ring-red-500/30 bg-red-950/10'
              : 'border-gray-700 focus:ring-indigo-500/30 focus:border-indigo-500/50'
          }`}
        />
      </div>
    );
  };

  const currentStepCfg = BB_WIZARD_STEPS[step - 1];

  return (
    <div className="animate-in fade-in duration-200 space-y-6">

      {/* ── Wizard progress header ── */}
      <div className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Passo {step} de {BB_TOTAL_STEPS}</span>
            <span>{Math.round((step / BB_TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / BB_TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-start justify-between gap-1">
          {BB_WIZARD_STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all flex-shrink-0 ${
                i + 1 < step
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : i + 1 === step
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-white/10 text-gray-600'
              }`}>
                {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight ${i + 1 === step ? 'text-indigo-400' : 'text-gray-600'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step card header */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            {currentStepCfg.label}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{currentStepCfg.subtitle}</p>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="space-y-5 animate-in fade-in duration-200" key={step}>

        {/* Steps 1–3: field inputs */}
        {step <= 3 && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Mic className="w-3.5 h-3.5 flex-shrink-0" />
              Clique no microfone ao lado de cada campo para ditar por voz. Clique novamente para parar.
            </div>
            <div className={`grid grid-cols-1 ${currentStepCfg.fields.length > 2 ? 'lg:grid-cols-2' : ''} gap-5`}>
              {currentStepCfg.fields.map(k => renderField(k))}
            </div>
          </>
        )}

        {/* Step 4: Quadro Branco Livre */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              Use este espaço como um quadro branco estratégico. Escreva qualquer contexto adicional ou grave um áudio — a IA transcreve e adiciona automaticamente ao campo.
            </p>
            <textarea
              value={brain.freeDump || ''}
              onChange={e => updateField('freeDump', e.target.value)}
              placeholder="Descreva livremente o histórico da marca, insights de reunião, posicionamento especial, referências importantes… Tudo que não coube nos campos anteriores."
              rows={11}
              className="w-full text-sm px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all resize-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              {/* Record / Stop */}
              {!isRecordingAudio ? (
                <button
                  onClick={startAudioRecording}
                  disabled={isTranscribing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Mic className="w-4 h-4" /> Gravar Áudio
                </button>
              ) : (
                <button
                  onClick={stopAudioRecording}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse text-sm font-bold"
                >
                  <Square className="w-4 h-4" /> Parar Gravação
                </button>
              )}

              {/* Upload */}
              <button
                onClick={() => audioFileInputRef.current?.click()}
                disabled={isRecordingAudio || isTranscribing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UploadCloud className="w-4 h-4" /> Upload de Áudio
              </button>
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioUpload}
              />

              {/* Transcribing indicator */}
              {isTranscribing && (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold">Transcrevendo áudio…</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation footer ── */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Passo Anterior
          </button>
        )}
        {step < BB_TOTAL_STEPS ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all"
          >
            Próximo Passo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90'
            }`}
          >
            {saved
              ? <><Check className="w-4 h-4" /> Inteligência Salva!</>
              : <><Save className="w-4 h-4" /> Salvar Cérebro da Marca</>
            }
          </button>
        )}
      </div>
    </div>
  );
};

const INPUT_CLS = 'w-full text-sm px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all';

const ClientFinanceiroTab: React.FC<{ client: Client }> = ({ client }) => {
  // ── Metrics (persisted via API) ──
  const { data: metrics, setData: setMetrics } = useClientData<ClientMetrics>(client.id, 'metrics', DEFAULT_METRICS);
  const [newMonth, setNewMonth] = useState<string>('Fev/2026');
  const [newCount, setNewCount] = useState<string>('');
  const [recordSaved, setRecordSaved] = useState(false);

  const addFollowerRecord = () => {
    const count = parseInt(newCount);
    if (!newCount || isNaN(count) || count < 0) return;
    setMetrics(prev => ({
      followerHistory: [
        ...(prev.followerHistory || []).filter(r => r.month !== newMonth),
        { month: newMonth, count },
      ],
    }));
    setNewCount('');
    setRecordSaved(true);
    setTimeout(() => setRecordSaved(false), 2000);
  };

  const removeFollowerRecord = (month: string) => {
    setMetrics(prev => ({
      followerHistory: (prev.followerHistory || []).filter(r => r.month !== month),
    }));
  };

  const sortedHistory = [...(metrics?.followerHistory || [])].sort(
    (a, b) => FOLLOWER_MONTH_OPTIONS.indexOf(a.month) - FOLLOWER_MONTH_OPTIONS.indexOf(b.month),
  );
  const maxCount  = sortedHistory.length ? Math.max(...sortedHistory.map(r => r.count)) : 0;
  const growthPct = sortedHistory.length >= 2
    ? (((sortedHistory[sortedHistory.length - 1].count - sortedHistory[0].count) / sortedHistory[0].count) * 100).toFixed(1)
    : null;

  // ── Invoices (persisted via API) ──
  const { data: invoices, setData: setInvoices } = useClientData<Invoice[]>(client.id, 'invoices', []);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: '', dueDate: '', amount: '', status: 'pendente' as Invoice['status'], pixCode: '', boletoLink: '' });

  const persistInvoices = (next: Invoice[]) => {
    setInvoices(next);
  };

  const addInvoice = () => {
    if (!form.title.trim() || !form.dueDate || !form.amount || !form.pixCode.trim()) return;
    const newInv: Invoice = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      title: form.title.trim(),
      dueDate: form.dueDate,
      amount: parseFloat(form.amount),
      status: form.status,
      pixCode: form.pixCode.trim(),
      boletoLink: form.boletoLink.trim() || undefined,
    };
    persistInvoices([newInv, ...invoices]);
    setForm({ title: '', dueDate: '', amount: '', status: 'pendente', pixCode: '', boletoLink: '' });
    setFormOpen(false);
  };

  const deleteInvoice = (id: string) => persistInvoices(invoices.filter(inv => inv.id !== id));
  const updateStatus  = (id: string, status: Invoice['status']) =>
    persistInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));

  const formatCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDueDate  = (d: string): string => {
    const [y, m, day] = d.split('-');
    return `${parseInt(day)} ${FOLLOWER_MONTHS_PT[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="space-y-8">

      {/* ══ EVOLUÇÃO DE SEGUIDORES ══ */}
      <section className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-100">Evolução de Seguidores</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Histórico mensal exibido no portal do cliente</p>
            </div>
          </div>
          {growthPct !== null && (
            <span className="flex-shrink-0 text-xs font-black px-3 py-1 rounded-full bg-emerald-900/20 text-emerald-400 border border-emerald-800/50">
              +{growthPct}% total
            </span>
          )}
        </div>

        {/* Add record form */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Registrar mês</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-zinc-400">Mês</label>
              <select
                value={newMonth}
                onChange={e => setNewMonth(e.target.value)}
                className={INPUT_CLS}
              >
                {FOLLOWER_MONTH_OPTIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-zinc-400">Seguidores</label>
              <input
                type="number" min={0}
                value={newCount}
                onChange={e => setNewCount(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addFollowerRecord(); }}
                placeholder="Ex: 12500"
                className={INPUT_CLS}
              />
            </div>
            <button
              onClick={addFollowerRecord}
              disabled={!newCount.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black transition-all shadow-sm whitespace-nowrap"
            >
              {recordSaved ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : <><Plus className="w-3.5 h-3.5" /> Registrar</>}
            </button>
          </div>
        </div>

        {/* History list */}
        <div className="px-6 py-4">
          {sortedHistory.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold">Nenhum registro ainda</p>
              <p className="text-xs mt-1 opacity-70">Adicione o primeiro mês acima.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map((record, i) => {
                const barPct = maxCount > 0 ? (record.count / maxCount) * 100 : 0;
                const isLast = i === sortedHistory.length - 1;
                return (
                  <div key={record.month} className="group flex items-center gap-3">
                    <span className="w-20 flex-shrink-0 text-xs font-black text-zinc-500 tabular-nums text-right">{record.month}</span>
                    <div className="flex-1 h-6 bg-zinc-800 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${isLast ? 'bg-emerald-500' : 'bg-violet-600'}`}
                        style={{ width: `${barPct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2.5 text-[10px] font-black text-zinc-200">
                        {record.count.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFollowerRecord(record.month)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-500 transition-all rounded flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ COBRANÇAS ══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-zinc-100">Cobranças</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Faturas visíveis no portal do cliente</p>
          </div>
          <button
            onClick={() => setFormOpen(p => !p)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-800 text-violet-400 text-xs font-black hover:bg-violet-900/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Cobrança
          </button>
        </div>

        {/* New invoice form */}
        {formOpen && (
          <div className="mb-4 bg-zinc-900 rounded-2xl border border-violet-800/60 p-5 space-y-4 animate-in fade-in duration-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Nova Cobrança</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Título</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Fatura Março/26" className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Vencimento</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Valor (R$)</label>
                <input type="number" min={0} step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Ex: 1500.00" className={INPUT_CLS} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Invoice['status'] }))} className={INPUT_CLS}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Código PIX (Copia e Cola)</label>
                <textarea value={form.pixCode} onChange={e => setForm(p => ({ ...p, pixCode: e.target.value }))} rows={2} placeholder="Cole o código PIX aqui…" className={`${INPUT_CLS} resize-none`} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Link do Boleto (opcional)</label>
                <input type="url" value={form.boletoLink} onChange={e => setForm(p => ({ ...p, boletoLink: e.target.value }))} placeholder="https://…" className={INPUT_CLS} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-500 text-xs font-black hover:bg-zinc-800 transition-all">
                Cancelar
              </button>
              <button
                onClick={addInvoice}
                disabled={!form.title.trim() || !form.dueDate || !form.amount || !form.pixCode.trim()}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Adicionar Cobrança
              </button>
            </div>
          </div>
        )}

        {/* Invoice list */}
        {invoices.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold">Nenhuma cobrança cadastrada</p>
            <p className="text-xs mt-1 opacity-70">Clique em "Nova Cobrança" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => {
              const cfg = INVOICE_STATUS_STYLES[inv.status];
              return (
                <div key={inv.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-zinc-100 truncate">{inv.title}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Venc. {formatDueDate(inv.dueDate)} · {formatCurrency(inv.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={inv.status}
                      onChange={e => updateStatus(inv.id, e.target.value as Invoice['status'])}
                      className="text-xs px-2 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 focus:outline-none transition-all"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                      <option value="atrasado">Atrasado</option>
                    </select>
                    <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────
// Reuniões tab
// ─────────────────────────────────────────────
interface MeetingExtract {
  executiveSummary: string;
  decisions: string[];
  nextSteps: { text: string; assignedTo: 'agencia' | 'cliente' }[];
}

const MEETING_ARCHIVE_RETENTION_MS = 15 * 24 * 60 * 60 * 1000;

const ClientReuniaoTab: React.FC<{ client: Client }> = ({ client }) => {
  const { data: meetings, setData: setMeetings, loading: meetingsLoading } = useClientData<Meeting[]>(client.id, 'meetings', []);

  const [formOpen, setFormOpen]                   = useState(false);
  const [expandedId, setExpandedId]               = useState<string | null>(null);
  const [showMeetingArchiveModal, setShowMeetingArchiveModal] = useState(false);

  // Purge expired archived meetings — runs once, AFTER API data has loaded, so
  // hasSavedRef in useClientData is not set before the fetch completes.
  const meetingPurgedRef = useRef(false);
  useEffect(() => {
    if (!meetingsLoading && !meetingPurgedRef.current) {
      meetingPurgedRef.current = true;
      const now = Date.now();
      setMeetings(prev => prev.filter(m =>
        !m.isArchived || !m.archivedAt ||
        now - new Date(m.archivedAt).getTime() <= MEETING_ARCHIVE_RETENTION_MS
      ));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingsLoading]);

  // ── Form fields ──────────────────────────────
  const [formTitle, setFormTitle]           = useState('');
  const [formDate, setFormDate]             = useState(() => new Date().toISOString().split('T')[0]);
  const [formTranscript, setFormTranscript] = useState('');

  // ── AI extraction state ──────────────────────
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted]       = useState<MeetingExtract | null>(null);

  // ── Editable extracted fields ────────────────
  const [editSummary, setEditSummary]     = useState('');
  const [editDecisions, setEditDecisions] = useState<string[]>([]);
  const [editNextSteps, setEditNextSteps] = useState<{ text: string; assignedTo: 'agencia' | 'cliente' }[]>([]);

  const resetForm = () => {
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTranscript('');
    setExtracted(null);
    setEditSummary('');
    setEditDecisions([]);
    setEditNextSteps([]);
  };

  const handleExtract = async () => {
    if (isExtracting) return;
    setIsExtracting(true);
    try {
      let result: MeetingExtract;
      const hasTranscript = formTranscript.trim().length > 80;

      if (hasTranscript) {
        const prompt = `Você é um assistente especializado em produção de vídeo. Analise a transcrição da reunião abaixo e extraia as informações. Retorne APENAS JSON válido (sem markdown, sem código, sem explicações) no formato exato:\n{"executiveSummary":"...","decisions":["decisão 1","decisão 2"],"nextSteps":[{"text":"tarefa","assignedTo":"agencia"},{"text":"tarefa","assignedTo":"cliente"}]}\n\nTranscrição:\n${formTranscript.slice(0, 3000)}`;
        const response = await sendMessageToAgent(
          AgentId.SCRIPT_GENERATOR,
          prompt,
          null,
          [],
          'Você é um assistente de produtora de vídeo. Retorne APENAS JSON válido, sem markdown e sem explicações.',
        );
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('JSON não encontrado');
        result = JSON.parse(jsonMatch[0]) as MeetingExtract;
      } else {
        // Simulated extraction (no real transcript provided)
        await new Promise(r => setTimeout(r, 1600));
        result = {
          executiveSummary: `Reunião de alinhamento estratégico com ${client.brandName}. Foram discutidos os objetivos do próximo ciclo de produção e definidas as prioridades de conteúdo para o período.`,
          decisions: [
            'Calendário editorial do próximo mês foi aprovado',
            `Foco em conteúdo educacional alinhado ao nicho ${client.niche || 'definido'}`,
            'Reels com duração máxima de 60 segundos como formato prioritário',
          ],
          nextSteps: [
            { text: 'Desenvolver roteiros dos próximos 3 vídeos aprovados', assignedTo: 'agencia' },
            { text: 'Enviar referências visuais e de concorrentes até sexta-feira', assignedTo: 'cliente' },
            { text: 'Agendar sessão de gravação para a próxima semana', assignedTo: 'agencia' },
            { text: 'Aprovar artes da identidade visual revisada', assignedTo: 'cliente' },
          ],
        };
      }

      setExtracted(result);
      setEditSummary(result.executiveSummary);
      setEditDecisions([...result.decisions]);
      setEditNextSteps(result.nextSteps.map(s => ({ ...s })));
    } catch {
      // Fallback mock on API/parse error
      const fallback: MeetingExtract = {
        executiveSummary: `Reunião de alinhamento com ${client.brandName}. Estratégia de conteúdo revisada e próximos passos definidos em equipe.`,
        decisions: [
          'Estratégia de conteúdo aprovada para o próximo período',
          'Revisão do tom de comunicação acordada',
        ],
        nextSteps: [
          { text: 'Criar roteiros conforme briefing aprovado', assignedTo: 'agencia' },
          { text: 'Confirmar disponibilidade para as gravações', assignedTo: 'cliente' },
        ],
      };
      setExtracted(fallback);
      setEditSummary(fallback.executiveSummary);
      setEditDecisions([...fallback.decisions]);
      setEditNextSteps(fallback.nextSteps.map(s => ({ ...s })));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!formTitle.trim() || !editSummary.trim()) return;
    const meeting: Meeting = {
      id:               `mtg_${Date.now()}`,
      title:            formTitle.trim(),
      date:             formDate,
      rawTranscript:    formTranscript.trim() || undefined,
      executiveSummary: editSummary.trim(),
      decisions:        editDecisions.filter(d => d.trim()),
      nextSteps:        editNextSteps
                          .filter(s => s.text.trim())
                          .map((s, i): MeetingNextStep => ({ id: `ns_${i}_${Date.now()}`, ...s, done: false })),
      createdAt:        Date.now(),
    };
    const updated = [meeting, ...meetings];
    setMeetings(updated);
    setFormOpen(false);
    resetForm();
    setExpandedId(meeting.id);
  };

  const activeMeetings  = meetings.filter(m => !m.isArchived);
  const archivedMeetings = meetings.filter(m =>
    m.isArchived && m.archivedAt &&
    Date.now() - new Date(m.archivedAt).getTime() <= MEETING_ARCHIVE_RETENTION_MS
  );

  const formatMeetingDate = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">🤝 Reuniões</h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            {activeMeetings.length > 0
              ? `${activeMeetings.length} reunião${activeMeetings.length > 1 ? 'ões' : ''} registrada${activeMeetings.length > 1 ? 's' : ''}`
              : 'Registre reuniões e extraia resumos com IA'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {archivedMeetings.length > 0 && (
            <button
              onClick={() => setShowMeetingArchiveModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs font-bold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Ver Arquivados ({archivedMeetings.length})
            </button>
          )}
          {!formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-black transition-all hover:scale-[1.02] active:scale-100 shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" /> Nova Reunião
            </button>
          )}
        </div>
      </div>

      {/* ── Create form ── */}
      {formOpen && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">

          {/* Form header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Nova Reunião</h3>
            <button onClick={() => { setFormOpen(false); resetForm(); }} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title + Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block">Título da Reunião *</label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Ex: Alinhamento de Conteúdo – Fevereiro"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-zinc-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block">Data *</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Transcript */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block">
              Transcrição Bruta <span className="normal-case font-normal text-zinc-400">(opcional — cole aqui a transcrição do Meet/Zoom)</span>
            </label>
            <textarea
              value={formTranscript}
              onChange={e => setFormTranscript(e.target.value)}
              placeholder="Cole aqui a transcrição da reunião para que a IA extraia automaticamente o resumo e as tarefas…"
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-zinc-400 resize-none transition-all"
            />
          </div>

          {/* AI Extraction button */}
          {!extracted && (
            <button
              onClick={handleExtract}
              disabled={isExtracting || !formTitle.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isExtracting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Extraindo com IA…</>
                : <><Sparkles className="w-4 h-4" /> ✨ Extrair Resumo e Tarefas com IA</>}
            </button>
          )}

          {/* ── Extracted blocks ── */}
          {extracted && (
            <div className="space-y-5 animate-in fade-in duration-300">

              {/* Success banner */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-900/20 border border-emerald-800/40">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-400">Resumo extraído com sucesso! Revise e edite antes de salvar.</p>
              </div>

              {/* 1. Resumo Executivo */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <FileText className="w-3.5 h-3.5" /> 📝 Resumo Executivo
                </label>
                <textarea
                  value={editSummary}
                  onChange={e => setEditSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none transition-all"
                />
              </div>

              {/* 2. Decisões Tomadas */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <Users className="w-3.5 h-3.5" /> 🤝 Decisões Tomadas
                </label>
                <div className="space-y-2">
                  {editDecisions.map((decision, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={decision}
                        onChange={e => {
                          const updated = [...editDecisions];
                          updated[i] = e.target.value;
                          setEditDecisions(updated);
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                      <button
                        onClick={() => setEditDecisions(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-2.5 hover:bg-red-900/20 rounded-xl text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditDecisions(prev => [...prev, ''])}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar decisão
                  </button>
                </div>
              </div>

              {/* 3. Próximos Passos */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <CheckCircle className="w-3.5 h-3.5" /> ✅ Próximos Passos
                </label>
                <div className="space-y-2">
                  {editNextSteps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={step.text}
                        onChange={e => {
                          const updated = [...editNextSteps];
                          updated[i] = { ...updated[i], text: e.target.value };
                          setEditNextSteps(updated);
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                      <button
                        onClick={() => {
                          const updated = [...editNextSteps];
                          updated[i] = { ...updated[i], assignedTo: step.assignedTo === 'agencia' ? 'cliente' : 'agencia' };
                          setEditNextSteps(updated);
                        }}
                        className={`flex-shrink-0 px-3 py-2.5 rounded-xl border text-[11px] font-black transition-all ${
                          step.assignedTo === 'agencia'
                            ? 'border-violet-800 bg-violet-900/20 text-violet-400'
                            : 'border-emerald-800 bg-emerald-900/20 text-emerald-400'
                        }`}
                      >
                        {step.assignedTo === 'agencia' ? '🏢 Agência' : '👤 Cliente'}
                      </button>
                      <button
                        onClick={() => setEditNextSteps(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-2.5 hover:bg-red-900/20 rounded-xl text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditNextSteps(prev => [...prev, { text: '', assignedTo: 'agencia' }])}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar próximo passo
                  </button>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-violet-800 text-violet-400 text-xs font-black hover:bg-violet-900/20 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Regerar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formTitle.trim() || !editSummary.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" /> Salvar Reunião
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {activeMeetings.length === 0 && !formOpen && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-12 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-sm font-black text-zinc-300 mb-1">Nenhuma reunião registrada</h3>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto">
            Registre suas reuniões e deixe a IA extrair o resumo, decisões e próximos passos automaticamente.
          </p>
        </div>
      )}

      {/* ── Meeting list ── */}
      {/* ── Archive modal ── */}
      {showMeetingArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-black text-white">Lixeira de Reuniões</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Os itens são eliminados permanentemente após 15 dias.</p>
              </div>
              <button onClick={() => setShowMeetingArchiveModal(false)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {archivedMeetings.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">Nenhuma reunião arquivada.</p>
              ) : (
                archivedMeetings.map(m => {
                  const msLeft = MEETING_ARCHIVE_RETENTION_MS - (Date.now() - new Date(m.archivedAt!).getTime());
                  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
                  return (
                    <div key={m.id} className="flex items-center justify-between gap-3 bg-zinc-800/50 rounded-xl px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-200 truncate">{m.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{formatMeetingDate(m.date)} · Arquivada em {new Date(m.archivedAt!).toLocaleDateString('pt-BR')}</p>
                        <p className={`text-xs font-bold mt-0.5 ${daysLeft <= 3 ? 'text-red-500' : 'text-zinc-400'}`}>
                          {daysLeft <= 3 ? `⚠️ Expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}` : `Expira em ${daysLeft} dias`}
                        </p>
                      </div>
                      <button
                        onClick={() => setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, isArchived: false, archivedAt: undefined } : x))}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-900/30 text-violet-400 hover:bg-violet-900/50 transition-all flex-shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" /> Restaurar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeMeetings.length > 0 && (
        <div className="space-y-3">
          {activeMeetings.map(meeting => {
            const isExpanded   = expandedId === meeting.id;
            const agencySteps  = meeting.nextSteps.filter(s => s.assignedTo === 'agencia');
            const clientSteps  = meeting.nextSteps.filter(s => s.assignedTo === 'cliente');
            return (
              <div key={meeting.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all">

                {/* Card header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-violet-900/20 border border-violet-800/40 flex items-center justify-center text-base select-none">
                      🤝
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate">{meeting.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{formatMeetingDate(meeting.date)} · {meeting.nextSteps.length} próximo{meeting.nextSteps.length !== 1 ? 's passos' : ' passo'}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-5 py-5 space-y-5">

                    {/* Resumo */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> 📝 Resumo Executivo
                      </p>
                      <p className="text-sm text-zinc-300 leading-relaxed">{meeting.executiveSummary}</p>
                    </div>

                    {/* Decisões */}
                    {meeting.decisions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> 🤝 Decisões Tomadas
                        </p>
                        <ul className="space-y-1.5">
                          {meeting.decisions.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                              <span className="w-4 h-4 rounded-full bg-violet-900/30 text-violet-400 flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Próximos Passos */}
                    {meeting.nextSteps.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" /> ✅ Próximos Passos
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {agencySteps.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black text-violet-400 mb-2">🏢 Agência</p>
                              <ul className="space-y-1.5">
                                {agencySteps.map(s => (
                                  <li key={s.id} className="flex items-start gap-2 text-xs text-zinc-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                                    {s.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {clientSteps.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black text-emerald-400 mb-2">👤 Cliente</p>
                              <ul className="space-y-1.5">
                                {clientSteps.map(s => (
                                  <li key={s.id} className="flex items-start gap-2 text-xs text-zinc-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    {s.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delete (soft) */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setMeetings(prev => prev.map(m =>
                            m.id === meeting.id
                              ? { ...m, isArchived: true, archivedAt: new Date().toISOString() }
                              : m
                          ));
                          setExpandedId(null);
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-red-500 hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sidebar health score helper
// ─────────────────────────────────────────────
function useSidebarHealth(clientId: string): number {
  const [score, setScore] = useState(100);

  useEffect(() => {
    let cancelled = false;

    const compute = async () => {
      let s = 100;
      try {
        const cols = await fetchClientData<{ id: string; cards: { dueDate?: string }[] }[]>(clientId, 'kanban');
        if (Array.isArray(cols)) {
          const today = new Date().toISOString().split('T')[0];
          let overdue = 0;
          cols.forEach(col => col.cards.forEach(card => {
            if (card.dueDate && card.dueDate < today && col.id !== 'finalizado') overdue++;
          }));
          s -= Math.min(overdue * 20, 60);
        }
      } catch { /* ignore */ }
      try {
        const inv = await fetchClientData<{ status: string }[]>(clientId, 'invoices');
        if (Array.isArray(inv)) {
          s -= Math.min(inv.filter(i => i.status === 'atrasado').length * 25, 50);
        }
      } catch { /* ignore */ }
      try {
        const pkgs = await fetchClientData<{ scripts: { portalStatus?: string }[] }[]>(clientId, 'roteiros');
        if (Array.isArray(pkgs)) {
          let waiting = 0;
          pkgs.forEach(p => p.scripts.forEach(sc => { if (sc.portalStatus === 'aguardando_cliente') waiting++; }));
          s -= Math.min(waiting * 10, 30);
        }
      } catch { /* ignore */ }
      if (!cancelled) setScore(Math.max(0, Math.min(100, s)));
    };

    compute();
    return () => { cancelled = true; };
  }, [clientId]);

  return score;
}

// ─────────────────────────────────────────────
// TAB: Documentos (Agency side)
// ─────────────────────────────────────────────
interface DocItem {
  id: string;
  name: string;
  date: string;
  size: string;
}

const ClientDocumentosTab: React.FC<{ client: Client }> = ({ client: _client }) => {
  const [docs, setDocs] = useState<DocItem[]>([]);

  const handleDelete = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Documentos e Contratos</h2>
          <p className="text-sm text-gray-500 mt-1">Gira os ficheiros legais e partilhe com o cliente.</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 bg-gray-800/60 text-sm font-bold text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-150 cursor-pointer">
            <UploadCloud className="w-4 h-4" />
            Fazer Upload
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const newDoc: DocItem = {
                  id: Date.now().toString(),
                  name: file.name,
                  date: new Date().toLocaleDateString('pt-BR'),
                  size: file.size > 1024 * 1024
                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.ceil(file.size / 1024)} KB`,
                };
                setDocs(prev => [newDoc, ...prev]);
                e.target.value = '';
              }}
            />
          </label>
          <a
            href="/dashboard/gerador-contratos"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition-all duration-150 shadow-lg shadow-indigo-900/30"
          >
            <FileText className="w-4 h-4" />
            Gerar Contrato
          </a>
        </div>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-800/60 bg-gray-900/30 py-24 text-center">
          <p className="text-sm text-gray-600">
            Nenhum documento ou contrato vinculado a este cliente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div
              key={doc.id}
              className="group flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-800/70 bg-gray-900/60 hover:bg-gray-800/60 hover:border-gray-700/70 transition-all duration-150"
            >
              {/* PDF icon */}
              <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <FileText className="w-5 h-5 text-red-400" />
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{doc.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{doc.date} · {doc.size}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => window.open('#', '_blank')}
                  className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  title="Descarregar"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const ClientDashboard: React.FC<ClientDashboardProps> = ({ client, onBack, onNavigateToArquivos }) => {
  const [activeTab,    setActiveTab]    = useState<TabId>('visao_geral');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const sidebarHealth                   = useSidebarHealth(client.id);
  const [showReport,   setShowReport]   = useState(false);

  // ── Persistência de navegação (sessionStorage) ──
  useEffect(() => {
    const savedTab = sessionStorage.getItem(`hub_active_tab_${client.id}`);
    if (savedTab && TABS.some(t => t.id === savedTab)) {
      setActiveTab(savedTab as TabId);
    }
  }, [client.id]);

  useEffect(() => {
    sessionStorage.setItem(`hub_active_tab_${client.id}`, activeTab);
  }, [activeTab, client.id]);

  // ── Motor de Ideias state ─────────────────
  const [themeInput, setThemeInput]                 = useState('');
  const [themes, setThemes]                         = useState<string[]>([]);
  const [isSuggestingThemes, setIsSuggestingThemes] = useState(false);
  const [suggestedThemes, setSuggestedThemes]       = useState<string[]>([]);
  const [suggestedThemeGroups, setSuggestedThemeGroups] = useState<SuggestedThemeGroup[]>([]);
  const [selectedFormats, setSelectedFormats]       = useState<string[]>([]);
  const [selectedAngles, setSelectedAngles]         = useState<string[]>([]);
  const { data: ideas, setData: setIdeas }           = useClientData<IdeaCard[]>(client.id, 'generated_ideas', []);
  const [isGenerating, setIsGenerating]             = useState(false);
  const [generateError, setGenerateError]           = useState<string | null>(null);
  const [copiedId, setCopiedId]                     = useState<string | null>(null);
  const [quantidadeIdeias, setQuantidadeIdeias]     = useState(3);
  const [ideasView, setIdeasView]                   = useState<'generator' | 'banco'>('generator');
  const { data: savedIdeas, setData: setSavedIdeas } = useClientData<IdeaCard[]>(client.id, 'saved_ideas', []);
  const [savedIdeaToast, setSavedIdeaToast]         = useState(false);
  const [selectedMeetingId, setSelectedMeetingId]   = useState('');
  const { data: availableMeetings }                  = useClientData<Meeting[]>(client.id, 'meetings', []);

  const addTheme = (value: string) => {
    const t = value.trim();
    if (t && !themes.includes(t)) setThemes(prev => [...prev, t]);
  };

  const handleThemeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTheme(themeInput);
      setThemeInput('');
    }
  };

  const removeTheme = (theme: string) =>
    setThemes(prev => prev.filter(t => t !== theme));

  const handleSuggestThemes = async () => {
    if (isSuggestingThemes) return;
    setIsSuggestingThemes(true);
    try {
      const selectedMeeting = availableMeetings.find(m => m.id === selectedMeetingId);
      const meetingContent = selectedMeeting
        ? [
            selectedMeeting.title  ? `Reunião: ${selectedMeeting.title}`  : '',
            selectedMeeting.date   ? `Data: ${selectedMeeting.date}`      : '',
            selectedMeeting.executiveSummary ? `Resumo: ${selectedMeeting.executiveSummary}` : '',
            (selectedMeeting.decisions?.length ?? 0) > 0
              ? `Decisões: ${selectedMeeting.decisions!.join('; ')}`
              : '',
            (selectedMeeting.nextSteps?.length ?? 0) > 0
              ? `Próximos passos: ${selectedMeeting.nextSteps!.map(s => s.text).join('; ')}`
              : '',
          ].filter(Boolean).join('\n')
        : '';
      const campaignLine = meetingContent
        ? `\nALERTA DE CAMPANHA ATIVA: Além do DNA da marca, ESTA geração de temas deve focar EXCLUSIVAMENTE neste briefing/direcionamento específico: ${meetingContent}`
        : '';
      const prompt = `Atue como estrategista de conteúdo digital. O cliente é do nicho "${client.niche || 'geral'}", subnicho "${client.subniche || 'geral'}", público-alvo: "${client.idealClient || 'geral'}".${campaignLine} Sugira 12 temas de vídeos MUITO ESPECÍFICOS e práticos para este nicho. Divida em 3 categorias. Retorne APENAS JSON válido, sem markdown, sem explicações, no formato exato: {"groups":[{"label":"Alta Demanda","emoji":"🔥","themes":["tema1","tema2","tema3","tema4"]},{"label":"Educacional","emoji":"📚","themes":["tema5","tema6","tema7","tema8"]},{"label":"Autoridade","emoji":"🏆","themes":["tema9","tema10","tema11","tema12"]}]}`;
      const result = await sendMessageToAgent(
        AgentId.SCRIPT_GENERATOR,
        prompt,
        null,
        [],
        'Você é um estrategista de conteúdo digital. Quando solicitado, retorne APENAS JSON válido, sem markdown, sem blocos de código, sem explicações.',
      );
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.groups && Array.isArray(parsed.groups)) {
          setSuggestedThemeGroups(parsed.groups as SuggestedThemeGroup[]);
          setSuggestedThemes((parsed.groups as SuggestedThemeGroup[]).flatMap(g => g.themes));
          return;
        }
      }
      throw new Error('Resposta da IA não era JSON válido');
    } catch {
      // Fallback to static themes on error
      setSuggestedThemeGroups(SUGGESTED_THEME_GROUPS);
      setSuggestedThemes(SUGGESTED_THEME_GROUPS.flatMap(g => g.themes));
    } finally {
      setIsSuggestingThemes(false);
    }
  };

  const toggleSuggestedTheme = (theme: string) => {
    if (themes.includes(theme)) removeTheme(theme);
    else addTheme(theme);
  };

  const toggleFormat = (f: string) =>
    setSelectedFormats(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f],
    );

  const toggleAngle = (a: string) =>
    setSelectedAngles(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a],
    );

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const themesText  = themes.length > 0 ? themes.join(', ') : 'temas gerais do nicho';
      const formatsText = selectedFormats.length > 0 ? selectedFormats.join(', ') : 'qualquer formato';
      const anglesText  = selectedAngles.length > 0 ? selectedAngles.join(', ') : 'qualquer ângulo';

      const selectedMeeting = availableMeetings.find(m => m.id === selectedMeetingId);
      const meetingContent = selectedMeeting
        ? [
            selectedMeeting.title  ? `Reunião: ${selectedMeeting.title}`  : '',
            selectedMeeting.date   ? `Data: ${selectedMeeting.date}`      : '',
            selectedMeeting.executiveSummary ? `Resumo: ${selectedMeeting.executiveSummary}` : '',
            (selectedMeeting.decisions?.length ?? 0) > 0
              ? `Decisões: ${selectedMeeting.decisions!.join('; ')}`
              : '',
            (selectedMeeting.nextSteps?.length ?? 0) > 0
              ? `Próximos passos: ${selectedMeeting.nextSteps!.map(s => s.text).join('; ')}`
              : '',
          ].filter(Boolean).join('\n')
        : '';
      const campaignLine = meetingContent
        ? `\nALERTA DE CAMPANHA ATIVA: Além do DNA da marca, ESTA geração de ideias deve focar EXCLUSIVAMENTE neste briefing/direcionamento específico: ${meetingContent}\n`
        : '';

      const prompt = `Gere EXATAMENTE ${quantidadeIdeias} ideias de vídeo para o seguinte cliente:
- Marca: ${client.brandName}
- Nicho: ${client.niche || 'geral'} / Subnicho: ${client.subniche || 'geral'}
- Público-alvo: ${client.idealClient || 'geral'}
- Tom de voz: ${client.voiceTone}
- Dores do público: ${client.mainPains || 'não especificado'}
- Desejos do público: ${client.mainDesires || 'não especificado'}
- CTA padrão: ${client.defaultCta || 'sem CTA definido'}
- Temas: ${themesText}
- Formatos: ${formatsText}
- Ângulos editoriais: ${anglesText}
${campaignLine}
REGRA OBRIGATÓRIA: Gere EXATAMENTE ${quantidadeIdeias} ideias. O array "ideas" deve conter exatamente ${quantidadeIdeias} objetos. Não gere a menos, nem a mais.

Retorne APENAS JSON válido, sem markdown, no formato exato:
{"ideas":[{"title":"...","tags":["formato","ângulo"],"gancho":"...","estrutura":["ponto1","ponto2","ponto3","ponto4","ponto5"],"cta":"...","script":{"slides":[{"visual":"...","audio":"..."},{"visual":"...","audio":"..."},{"visual":"...","audio":"..."},{"visual":"...","audio":"..."},{"visual":"...","audio":"..."},{"visual":"...","audio":"..."}],"caption":"...","hashtags":"..."}}]}`;

      const result = await sendMessageToAgent(
        AgentId.SCRIPT_GENERATOR,
        prompt,
        null,
        [],
        `Você é um estrategista de conteúdo digital e roteirista especializado em vídeos virais para redes sociais. Quando solicitado, retorne APENAS JSON válido, sem markdown, sem blocos de código, sem explicações. REGRA ABSOLUTA: o array "ideas" deve ter EXATAMENTE o número de itens solicitado pelo usuário — nem mais, nem menos.`,
      );

      if (result.limitReached) {
        setGenerateError(`Limite de ideias atingido. ${result.limitReached.message}`);
        return;
      }

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.ideas && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
          const processedIdeas: IdeaCard[] = parsed.ideas.map((idea: Partial<IdeaCard>, i: number) => ({
            id: crypto.randomUUID(),
            title:     idea.title     || `Ideia ${i + 1}`,
            tags:      Array.isArray(idea.tags) ? idea.tags : [],
            gancho:    idea.gancho    || '',
            estrutura: Array.isArray(idea.estrutura) ? idea.estrutura : [],
            cta:       idea.cta       || client.defaultCta || '',
            script: {
              slides:   Array.isArray(idea.script?.slides) && idea.script.slides.length > 0
                          ? idea.script.slides
                          : [{ visual: '', audio: '' }],
              caption:  idea.script?.caption  || '',
              hashtags: idea.script?.hashtags || '',
            },
          }));
          setIdeas(processedIdeas);
          return;
        }
      }
      setGenerateError('A IA não retornou ideias válidas. Tente novamente.');
    } catch {
      setGenerateError('Erro ao conectar com a IA. Verifique sua conexão e tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyStructure = (idea: IdeaCard) => {
    const text = `📌 ${idea.title}\n\n🎣 Gancho:\n${idea.gancho}\n\n📋 Estrutura:\n${idea.estrutura.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n📣 CTA:\n${idea.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSaveIdea = (idea: IdeaCard) => {
    const isAlreadySaved = savedIdeas.some(s => s.id === idea.id);
    setSavedIdeas(prev => isAlreadySaved ? prev.filter(s => s.id !== idea.id) : [idea, ...prev]);
    if (!isAlreadySaved) {
      setSavedIdeaToast(true);
      setTimeout(() => setSavedIdeaToast(false), 3000);
    }
  };

  const removeFromBank = (ideaId: string) => {
    setSavedIdeas(prev => prev.filter(s => s.id !== ideaId));
  };

  const canGenerate = selectedFormats.length > 0 || selectedAngles.length > 0 || themes.length > 0;

  const [isHowToUseOpen, setIsHowToUseOpen]     = useState(false);
  const [scriptIdea, setScriptIdea]             = useState<IdeaCard | null>(null);
  const [pendingAgendaTitle, setPendingAgendaTitle] = useState<string | null>(null);

  // ── Workflow: add card to kanban via API ──────────
  const [ideiaWorkflowToast, setIdeiaWorkflowToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const addCardToWorkflow = async (title: string) => {
    try {
      let cols: KanbanColumn[] = [];
      try {
        const fetched = await fetchClientData<KanbanColumn[]>(client.id, 'kanban');
        if (Array.isArray(fetched) && fetched.length > 0) cols = fetched;
      } catch { /* no kanban data yet */ }

      if (cols.length === 0) {
        cols = KANBAN_INITIAL_COLUMNS.map(c => ({ ...c, cards: [] as KanbanCard[] }));
      } else {
        cols = cols.map(c => ({ ...c, cards: Array.isArray(c.cards) ? c.cards : [] }));
      }

      const newCard: KanbanCard = {
        id: crypto.randomUUID(),
        title,
        priority: 'Normal',
        startDate: '',
        dueDate: '',
        notes: 'Criado automaticamente a partir de uma Ideia Infinita.',
        assignedTo: '',
      };

      // Always target first column by index — never use a hardcoded ID
      const updated = cols.map((col, idx) => idx === 0 ? { ...col, cards: [newCard, ...col.cards] } : col);
      await saveClientData(client.id, 'kanban', updated);

      const firstColTitle = cols[0]?.title || 'Workflow';
      setIdeiaWorkflowToast({ ok: true, msg: `Ideia enviada para "${firstColTitle}" no Workflow!` });
      setTimeout(() => setIdeiaWorkflowToast(null), 4000);
    } catch {
      setIdeiaWorkflowToast({ ok: false, msg: 'Erro ao enviar para o Workflow. Tente novamente.' });
      setTimeout(() => setIdeiaWorkflowToast(null), 4000);
    }
  };

  // ── Roteiros: convert IdeaCard → ScriptDocument and persist via API ──
  const saveToRoteiros = async (idea: IdeaCard): Promise<void> => {
    const current = await fetchClientData<ScriptPackage[]>(client.id, 'roteiros');
    let pkgs = Array.isArray(current) && current.length > 0 ? current : [];

    if (pkgs.length === 0) {
      // Use same structure as buildDefaultScriptPackages so the tab renders correctly
      pkgs = [{ id: crypto.randomUUID(), title: 'Mês Atual', scripts: [], createdAt: Date.now() }];
    }
    // Ensure all packages have valid scripts arrays (defensive)
    pkgs = pkgs.map(p => ({ ...p, scripts: Array.isArray(p.scripts) ? p.scripts : [] }));

    const scenes: ScriptScene[] = idea.script.slides.map(slide => ({
      id: crypto.randomUUID(),
      visual: slide.visual || '',
      audio:  slide.audio  || '',
      isChecked: false,
    }));

    const newScript: ScriptDocument = {
      id: crypto.randomUUID(),
      title: idea.title,
      status: 'Rascunho',
      referenceLink: '',
      gancho: idea.gancho,
      scenes,
      createdAt: Date.now(),
      workflow_status: 'pending',
    };

    pkgs[0] = { ...pkgs[0], scripts: [newScript, ...pkgs[0].scripts] };
    await saveClientData(client.id, 'roteiros', pkgs);
    // throws on failure — caller handles feedback
  };

  const handleScheduleRecording = (title: string) => {
    setScriptIdea(null);
    setPendingAgendaTitle(`Gravação: ${title}`);
    setActiveTab('agenda');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950 animate-in fade-in duration-300">

      {/* ── Monthly report modal ── */}
      {showReport && (
        <ClientMonthlyReport
          client={client}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════
          SIDEBAR
          Desktop: 256px fixed, always visible
          Mobile: overlay, slides in from left
         ══════════════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-950 border-r border-gray-800/50
        overflow-hidden
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* ── Sidebar header ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gray-800">

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-400 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar à lista
          </button>

          {/* Avatar + brand name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm font-black text-white flex-shrink-0 select-none">
              {client.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-white truncate leading-tight">
                {client.brandName}
              </h1>
              {(client.niche || client.subniche) && (
                <p className="text-[10px] text-gray-500 truncate mt-0.5">
                  {[client.niche, client.subniche].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>

          {/* Voice tone badge */}
          {client.voiceTone && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-violet-900/20 text-violet-300 border-violet-800/50">
              <Mic className="w-3 h-3" /> {client.voiceTone}
            </span>
          )}

          {/* Mini health bar */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 truncate">Saúde</span>
              <span className={`text-[10px] font-black flex-shrink-0 ${sidebarHealth < 34 ? 'text-red-400' : sidebarHealth < 67 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {sidebarHealth}%
              </span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-800">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
              <div
                className="absolute inset-y-0 right-0 bg-gray-950 transition-all duration-700"
                style={{ width: `${100 - sidebarHealth}%` }}
              />
            </div>
          </div>

          {/* ── Relatório Mensal button ── */}
          <button
            onClick={() => setShowReport(true)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 transition-all text-xs font-bold"
          >
            <FileText className="w-3.5 h-3.5" /> Relatório Mensal
          </button>
        </div>

        {/* ── Nav pills ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Abas do workspace">
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id;
            /* separator before secondary tabs */
            const showSep = i === 5 || i === 10; // before 'acervo' and before 'cerebro_da_marca'
            return (
              <React.Fragment key={tab.id}>
                {showSep && (
                  <div className="mx-3 my-2 h-px bg-gray-800/70" />
                )}
                <button
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.07] text-white'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 inset-y-0 my-2 w-[2px] rounded-full bg-indigo-500" />
                  )}
                  <tab.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                  <span className="truncate">{tab.label}</span>
                  {tab.id === 'entregas' && (
                    <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Em breve</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {/* ══════════════════════════════════
          MAIN AREA
         ══════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Mobile top bar (hamburger) ── */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{client.brandName}</h1>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide truncate">
            {TABS.find(t => t.id === activeTab)?.label}
          </span>
        </div>

        {/* ── Desktop topbar ── */}
        <div className="hidden lg:flex flex-shrink-0 items-center gap-4 px-6 py-2.5 border-b border-gray-800/50 bg-gray-950/80">
          <div className="flex-1 min-w-0 flex items-center gap-2 text-[11px]">
            <span className="font-black text-gray-500 truncate">{client.brandName}</span>
            <span className="text-gray-700">/</span>
            <span className="font-black text-gray-400 truncate">
              {TABS.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Saúde</span>
            <div className="relative w-20 h-1 rounded-full overflow-hidden bg-gray-800">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
              <div
                className="absolute inset-y-0 right-0 bg-gray-950 transition-all duration-700"
                style={{ width: `${100 - sidebarHealth}%` }}
              />
            </div>
            <span className={`text-[10px] font-black tabular-nums ${sidebarHealth < 34 ? 'text-red-400' : sidebarHealth < 67 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {sidebarHealth}%
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <main className={`flex-1 bg-gray-900 ${activeTab === 'kanban' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          <div className={
            activeTab === 'kanban'
              ? 'flex flex-col flex-1 min-h-0 p-4'
              : activeTab === 'agenda' || activeTab === 'roteiros'
              ? 'w-full p-4'
              : 'w-full max-w-5xl mx-auto px-4 sm:px-6 py-8'
          }>


          {/* ══ TAB: Visão Geral ══ */}
          {activeTab === 'visao_geral' && (
            <div className="animate-in fade-in duration-200">
              <ClientVisaoGeralTab client={client} />
            </div>
          )}

          {/* ══ TAB: Ideias Infinitas ══ */}
          {activeTab === 'ideias' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              {/* Workflow toast */}
              {ideiaWorkflowToast && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg ${ideiaWorkflowToast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}>
                  {ideiaWorkflowToast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {ideiaWorkflowToast.msg}
                </div>
              )}

              {/* Sub-nav + Como Usar */}
              <div className="flex items-center justify-between flex-wrap gap-2 -mb-2">
                <div className="flex items-center gap-1 p-1 bg-zinc-800 rounded-xl">
                  <button
                    onClick={() => setIdeasView('generator')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      ideasView === 'generator'
                        ? 'bg-zinc-900 shadow text-violet-400'
                        : 'text-zinc-400 hover:hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Gerador com IA
                  </button>
                  <button
                    onClick={() => setIdeasView('banco')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      ideasView === 'banco'
                        ? 'bg-zinc-900 shadow text-amber-400'
                        : 'text-zinc-400 hover:hover:text-zinc-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Banco de Ideias
                    {savedIdeas.length > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black">
                        {savedIdeas.length}
                      </span>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setIsHowToUseOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-violet-400 px-3 py-1.5 rounded-xl hover:bg-violet-900/20 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Como Usar
                </button>
              </div>

              {/* Saved toast */}
              {savedIdeaToast && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-900/20 border border-amber-800/50 animate-in fade-in duration-200">
                  <BookmarkCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-amber-300">✅ Ideia salva no Banco de Ideias!</p>
                </div>
              )}

              {ideasView === 'generator' && (<>
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-xl shadow-violet-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest opacity-80">Motor de Ideias Infinitas</span>
                </div>
                <p className="text-lg sm:text-xl font-bold leading-snug">
                  Transforme o briefing de <span className="opacity-90">{client.brandName}</span> em conteúdo estratégico de alta conversão.
                </p>
                <p className="text-sm opacity-70 mt-1">
                  Defina os temas, escolha os formatos e deixe a IA trabalhar.
                </p>
              </div>

              {/* Etapa 1 */}
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-900/40 text-violet-400 flex items-center justify-center text-xs font-black flex-shrink-0">1</div>
                  <div>
                    <h2 className="font-bold text-sm text-white">A Matéria-Prima</h2>
                    <p className="text-xs text-zinc-400">Defina os temas que o conteúdo vai abordar</p>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {client.niche && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-900/20 text-emerald-400 border border-emerald-800/50">
                        <Target className="w-3 h-3" /> {client.niche}
                      </span>
                    )}
                    {client.idealClient && (
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 max-w-[260px] truncate">
                        👤 {client.idealClient}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Temas Manuais</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={themeInput}
                        onChange={e => setThemeInput(e.target.value)}
                        onKeyDown={handleThemeKeyDown}
                        placeholder="Ex: Dicas de confeitaria, Bastidores… (Enter para adicionar)"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-400"
                      />
                      <button
                        onClick={() => { addTheme(themeInput); setThemeInput(''); }}
                        disabled={!themeInput.trim()}
                        className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {themes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {themes.map(t => (
                        <span key={t} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-900/40 text-violet-300 border border-violet-800/50">
                          {t}
                          <button onClick={() => removeTheme(t)} className="text-violet-400 hover:text-violet-200 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex w-full items-center justify-between">
                    <button
                      onClick={handleSuggestThemes}
                      disabled={isSuggestingThemes}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-violet-700 text-violet-400 hover:bg-violet-900/20 transition-all text-sm font-bold disabled:opacity-60"
                    >
                      {isSuggestingThemes ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Sugerindo temas…</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Sugerir Temas com IA</>
                      )}
                    </button>
                    <BrandBrainBadge clientId={client.id} />
                  </div>

                  {suggestedThemes.length > 0 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Sugestões da IA — clique para adicionar</p>
                      {suggestedThemeGroups.map(group => (
                        <div key={group.label} className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            {group.emoji} {group.label}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.themes.map(t => {
                              const selected = themes.includes(t);
                              return (
                                <button
                                  key={t}
                                  onClick={() => toggleSuggestedTheme(t)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-all ${
                                    selected
                                      ? 'border-violet-500 bg-violet-900/40 text-violet-300'
                                      : 'border-zinc-700 text-zinc-400 hover:border-violet-700 hover:text-violet-400'
                                  }`}
                                >
                                  {selected ? '✓ ' : '+ '}{t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Etapa 2 */}
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-900/40 text-violet-400 flex items-center justify-center text-xs font-black flex-shrink-0">2</div>
                  <div>
                    <h2 className="font-bold text-sm text-white">A Multiplicação</h2>
                    <p className="text-xs text-zinc-400">Escolha os formatos e ângulos editoriais</p>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">📦 Embalagens (Formatos)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FORMATS.map(f => {
                        const sel = selectedFormats.includes(f);
                        return (
                          <button key={f} onClick={() => toggleFormat(f)}
                            className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all ${sel ? 'border-violet-500 bg-violet-900/20 text-violet-300' : 'border-zinc-800 text-zinc-400 hover:border-violet-700'}`}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800" />

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">🎯 Ângulos Editoriais</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ANGLES.map(a => {
                        const sel = selectedAngles.includes(a);
                        return (
                          <button key={a} onClick={() => toggleAngle(a)}
                            className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all text-left ${sel ? 'border-violet-500 bg-violet-900/20 text-violet-300' : 'border-zinc-800 text-zinc-400 hover:border-violet-700'}`}
                          >
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-zinc-800" />

                  {/* Quantidade de Ideias */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">
                      Quantidade de Ideias
                    </label>
                    <div className="flex gap-2">
                      {[1, 3, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setQuantidadeIdeias(n)}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-black transition-all ${
                            quantidadeIdeias === n
                              ? 'border-violet-500 bg-violet-900/20 text-violet-300'
                              : 'border-zinc-800 text-zinc-400 hover:border-violet-700'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Meeting / Campaign Link ── */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block">
                      Vincular a uma Reuniao/Campanha (Opcional)
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMeetingId}
                        onChange={e => setSelectedMeetingId(e.target.value)}
                        className="w-full appearance-none text-sm px-3 py-2.5 pr-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all cursor-pointer"
                      >
                        <option value="">Selecione uma reuniao...</option>
                        {availableMeetings
                          .filter(m => !m.isArchived)
                          .slice()
                          .sort((a, b) => {
                            if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
                            return (b.date || '').localeCompare(a.date || '');
                          })
                          .map(m => (
                            <option key={m.id} value={m.id}>
                              {m.title}{m.date ? ` — ${m.date}` : ''}
                            </option>
                          ))
                        }
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black text-base shadow-xl shadow-violet-500/30 hover:opacity-90 transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Gerando {quantidadeIdeias} Ideias…</>
                    ) : (
                      <><Rocket className="w-5 h-5" /> Gerar {quantidadeIdeias} Ideias</>
                    )}
                  </button>
                  {isGenerating && (
                    <p className="text-xs text-zinc-400 text-center animate-pulse -mt-2">
                      Cruzando o briefing com os ângulos selecionados…
                    </p>
                  )}
                  {generateError && (
                    <p className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 -mt-2">
                      ⚠️ {generateError}
                    </p>
                  )}
                </div>
              </section>

              {/* Etapa 3 */}
              {ideas.length > 0 && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-900/40 text-amber-400 flex items-center justify-center text-xs font-black flex-shrink-0">3</div>
                    <div>
                      <h2 className="font-bold text-sm text-white">O Ouro</h2>
                      <p className="text-xs text-zinc-400">{ideas.length} ideias geradas para {client.brandName}</p>
                    </div>
                  </div>

                  {ideas.map((idea, idx) => (
                    <div
                      key={idea.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-violet-700 transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="px-5 pt-5 pb-4 border-b border-zinc-800">
                        <h3 className="font-black text-base text-white leading-snug mb-3">{idea.title}</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {idea.tags.map(tag => (
                            <span key={tag} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-900/40 text-violet-300 border border-violet-800/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="px-5 py-4 space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">🎣 Gancho</p>
                          <p className="text-sm text-zinc-300 italic leading-relaxed">&ldquo;{idea.gancho}&rdquo;</p>
                        </div>
                        <div className="h-px bg-zinc-800" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">📋 Estrutura</p>
                          <ul className="space-y-1.5">
                            {idea.estrutura.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                <ChevronRight className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="h-px bg-zinc-800" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">📣 CTA</p>
                          <p className="text-sm font-bold text-zinc-200">{idea.cta}</p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex gap-2">
                        <button
                          onClick={() => toggleSaveIdea(idea)}
                          className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                            savedIdeas.some(s => s.id === idea.id)
                              ? 'border-amber-400 bg-amber-900/20 text-amber-500'
                              : 'border-zinc-700 text-zinc-400 hover:border-amber-700 hover:text-amber-500'
                          }`}
                          title="Salvar no Banco de Ideias"
                        >
                          {savedIdeas.some(s => s.id === idea.id)
                            ? <BookmarkCheck className="w-3.5 h-3.5" />
                            : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyStructure(idea)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-zinc-700 rounded-xl font-bold text-xs text-zinc-400 hover:border-zinc-500 transition-all"
                        >
                          {copiedId === idea.id ? (
                            <span className="text-emerald-400">✓ Copiado!</span>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> 📋 Copiar Estrutura</>
                          )}
                        </button>
                        <button
                          onClick={() => setScriptIdea(idea)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-xs shadow-md shadow-violet-500/20 hover:opacity-90 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> ✨ Criar Roteiro
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-violet-700 text-violet-400 rounded-2xl font-bold text-sm hover:bg-violet-900/20 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" /> Gerar Mais Ideias
                  </button>
                </section>
              )}

              </>)}

              {/* ── BANCO DE IDEIAS ── */}
              {ideasView === 'banco' && (
                <section className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white">Banco de Ideias</h2>
                      <p className="text-xs text-zinc-400">
                        {savedIdeas.length} {savedIdeas.length === 1 ? 'ideia salva' : 'ideias salvas'}
                      </p>
                    </div>
                  </div>

                  {savedIdeas.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-zinc-800 p-10 text-center">
                      <div className="text-4xl mb-3">⭐</div>
                      <h3 className="font-bold text-zinc-300 mb-1">Nenhuma ideia salva ainda</h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        Use o Gerador com IA para começar e salve suas favoritas aqui.
                      </p>
                      <button
                        onClick={() => setIdeasView('generator')}
                        className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:opacity-90 transition-all"
                      >
                        ✨ Ir para o Gerador
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedIdeas.map(idea => (
                        <div
                          key={idea.id}
                          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-700 transition-all hover:shadow-lg"
                        >
                          <div className="px-5 pt-5 pb-4 border-b border-zinc-800">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-black text-base text-white leading-snug">
                                {idea.title}
                              </h3>
                              <button
                                onClick={() => removeFromBank(idea.id)}
                                className="flex-shrink-0 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all"
                                title="Remover do Banco de Ideias"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {idea.tags.map(tag => (
                                <span key={tag} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-900/40 text-amber-300 border border-amber-800/50">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="px-5 py-4 space-y-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">🎣 Gancho</p>
                              <p className="text-sm text-zinc-300 italic leading-relaxed">&ldquo;{idea.gancho}&rdquo;</p>
                            </div>
                            <div className="h-px bg-zinc-800" />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">📋 Estrutura</p>
                              <ul className="space-y-1.5">
                                {idea.estrutura.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                    <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="h-px bg-zinc-800" />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">📣 CTA</p>
                              <p className="text-sm font-bold text-zinc-200">{idea.cta}</p>
                            </div>
                          </div>

                          <div className="px-5 pb-5">
                            <button
                              onClick={() => setScriptIdea(idea)}
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 hover:opacity-90 transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> ✨ Criar Roteiro
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── Modals ── */}
              {isHowToUseOpen && <HowToUseModal onClose={() => setIsHowToUseOpen(false)} />}
              {scriptIdea && (
                <ScriptModal
                  idea={scriptIdea}
                  onClose={() => setScriptIdea(null)}
                  onSendToWorkflow={addCardToWorkflow}
                  onScheduleRecording={handleScheduleRecording}
                  onSaveToRoteiros={saveToRoteiros}
                />
              )}
            </div>
          )}

          {/* ══ TAB: Workflow ══ */}
          {activeTab === 'kanban' && (
            <div className="animate-in fade-in duration-200 flex flex-col flex-1 min-h-0">
              <ClientWorkflowTab client={client} />
            </div>
          )}

          {/* ══ TAB: Agenda ══ */}
          {activeTab === 'agenda' && (
            <div className="animate-in fade-in duration-200">
              <ClientAgendaTab
                client={client}
                pendingEventTitle={pendingAgendaTitle}
                onPendingConsumed={() => setPendingAgendaTitle(null)}
              />
            </div>
          )}

          {/* ══ TAB: Sala de Roteiros ══ */}
          {activeTab === 'roteiros' && (
            <div className="animate-in fade-in duration-200">
              <ClientRoteirosTab client={client} />
            </div>
          )}

          {/* ══ TAB: Acervo ══ */}
          {activeTab === 'acervo' && (
            <div className="animate-in fade-in duration-200">
              <ClientAcervoTab client={client} onNavigateToArquivos={onNavigateToArquivos} />
            </div>
          )}

          {/* ══ TAB: Entregas & Aprovações ══ */}
          {activeTab === 'entregas' && (
            <div className="animate-in fade-in duration-200">
              <ClientEntregasTab client={client} />
            </div>
          )}

          {/* ══ TAB: Reuniões ══ */}
          {activeTab === 'reunioes' && (
            <div className="animate-in fade-in duration-200">
              <ClientReuniaoTab client={client} />
            </div>
          )}

          {/* ══ TAB: Financeiro ══ */}
          {activeTab === 'financeiro' && (
            <div className="animate-in fade-in duration-200">
              <ClientFinanceiroTab client={client} />
            </div>
          )}

          {/* ══ TAB: Documentos ══ */}
          {activeTab === 'documentos' && (
            <div className="animate-in fade-in duration-200">
              <ClientDocumentosTab client={client} />
            </div>
          )}

          {/* ══ TAB: Cérebro da Marca ══ */}
          {activeTab === 'cerebro_da_marca' && (
            <ClientBrandBrainTab client={client} />
          )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
