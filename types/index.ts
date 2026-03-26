
import { LucideIcon } from 'lucide-react';

export enum AgentId {
  EXECUTIVE_PRODUCER = 'executive_producer',
  PROD_EXECUTIVE_AGENT = 'prod_executive_agent',
  SCRIPT_GENERATOR = 'script_generator',
  COST_CALCULATOR = 'cost_calculator',
  BUDGET_PRICING = 'budget_pricing',
  BUDGET_SHEET = 'budget_sheet',
  SHOT_LIST = 'shot_list', // New Agent ID
  
  LIGHTING_ASSISTANT = 'lighting_assistant',
  LIGHTING_GENERATOR = 'lighting_generator',
  LIGHTING_STYLES = 'lighting_styles',
  
  EDITING_WORKFLOW = 'editing_workflow',
  EDITING_SHORTCUTS = 'editing_shortcuts',
  EDITING_IDEA = 'editing_idea',
  EDITING_TECHNIQUES = 'editing_techniques',

  SFX_ASSISTANT = 'sfx_assistant',
  SFX_SCENE_DESCRIBER = 'sfx_scene_describer',
  SFX_LIBRARY = 'sfx_library',
  SFX_PACK_CREATOR = 'sfx_pack_creator',

  STORYBOARD_GENERATOR = 'storyboard_generator',
  MEDIA_ASSISTANT = 'media_assistant',
  
  IMAGE_GENERATOR = 'image_generator',
  VIDEO_PROMPTS = 'video_prompts',
  YOUTUBE_SEO = 'youtube_seo',
  INSTAGRAM_CAPTIONS = 'instagram_captions',
}

export interface ShotItem {
  id: string;
  scene: string;
  description: string;
  isCompleted: boolean;
}

export interface ShotList {
  id: string;
  title: string;
  items: ShotItem[];
  createdAt: number;
}

export interface InstagramProfile {
  id: string;
  name: string;
  niche: string;
  audience: string;
  tone: string;
  goal: string;
  hashtags: string;
  createdAt: number;
}

export interface BrandKit {
  id: string;
  name: string;
  tone: 'Formal' | 'Criativo';
  color: string; // Hex code
  logo?: string; // Base64 Data URI
  footerText: string;
  createdAt: number;
}

export interface StudioProfile {
  name: string;
  type: 'mobile_creator' | 'solo_filmmaker' | 'produtora' | '';
  equipment: {
    cameras: string[];
    lenses: string[];
    audio: string[];
    lighting: string[];
    others: string[];
  };
}

export interface BrandBrain {
  coreTransformation:    string;
  audiencePainsDesires:  string;
  uniqueMechanism:       string;
  commonObjections:      string;
  brandVoice:            string;
  keywordsRules:         string;
  visualStyle:           string;
  inspirationBrands:     string;
  freeDump?:             string; // Quadro Branco Livre — áudio + texto livre
}

export interface Client {
  id: string;
  // Identidade
  brandName: string;
  niche: string;
  subniche: string;
  // Alvo
  idealClient: string;
  mainPains: string;
  mainDesires: string;
  // Comunicação
  voiceTone: 'Autoritário' | 'Descontraído' | 'Educacional' | 'Agressivo';
  visualStyle: string;
  defaultCta: string;
  createdAt: number;
  // Cérebro da Marca
  brandBrain?: BrandBrain;
}

export interface MeetingNextStep {
  id: string;
  text: string;
  assignedTo: 'agencia' | 'cliente';
  done: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;            // YYYY-MM-DD
  rawTranscript?: string;
  executiveSummary: string;
  decisions: string[];
  nextSteps: MeetingNextStep[];
  createdAt: number;
  isArchived?: boolean;
  archivedAt?: string;     // ISO timestamp
}

export interface Invoice {
  id: string;
  title: string;       // ex: "Fatura Fev/26"
  dueDate: string;     // YYYY-MM-DD
  amount: number;      // em BRL
  status: 'pendente' | 'pago' | 'atrasado';
  pixCode: string;     // código PIX copia e cola
  boletoLink?: string; // URL do boleto (opcional)
}

export interface HDD {
  id: string;
  name: string;
  addedAt: number;
  isArchived?: boolean;
  archivedAt?: string; // ISO timestamp
}

export interface Recording {
  id: string;
  title: string;
  clientName?: string;               // Nome do cliente / projeto (texto livre)
  clientId?: string;                 // ID do cliente vinculado (Client.id)
  summary?: string;
  recordedAt: string;                // YYYY-MM-DD

  // Vínculo de roteiro
  scriptLocation?: 'external' | 'creatorflow';
  scriptUrl?: string;                // URL externa (Notion, Docs…)
  scriptId?: string;                 // ID do roteiro no CreatorFlow (fase futura)

  // Câmeras e mídia
  mediaDevices?: string[];           // ['camera_a', 'camera_b', 'drone', 'audio_externo', 'outros']
  cameraModels?: string;             // "FX30, A7S3"
  otherEquipmentDetails?: string;    // Descrição livre de outros equipamentos

  // Armazenamento
  hddIds: string[];
  technicalNotes?: string;

  // Pendências de takes
  hasPendingTakes?: boolean;
  pendingTakesDescription?: string;

  // Tamanho e rastreio de continuações
  sizeGB?: number;           // Tamanho total do material em GB
  lastUpdated?: number;      // Timestamp da última atualização por "Continuar Backup"

  createdAt: number;
}

export interface PresetDetails {
  steps: string[];
  usage: string;
  pros: string[];
  cons: string[];
  visualGuides?: { title: string; url: string }[];
  techniques?: StylePreset[];
}

export interface StylePreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  thumbnail?: string;
  gifUrl?: string;
  audioUrl?: string;
  details?: PresetDetails;
}

export interface AgentConfig {
  id: AgentId;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  systemInstruction: string;
  placeholder: string;
  initialMessage?: string;
  stylePresets?: StylePreset[];
  isLocked?: boolean;
  externalUrl?: string;
}

export interface Feedback {
  rating: 'good' | 'bad';
  comment?: string;
  timestamp: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  audio?: string; // Base64 audio data
  timestamp: number;
  feedback?: Feedback;
}

export interface ChatSession {
  id: string;
  agentId: AgentId;
  profileId?: string;
  brandKitId?: string; // Track which brand kit was used
  title: string;
  messages: Message[];
  createdAt: number;
  lastUpdated: number;
}

// ─── Executive Assistant ──────────────────────────────────────────────────────

export type ProjectStatus = 'pre_producao' | 'captacao' | 'pos' | 'finalizado';

export type BudgetItemStatus = 'pendente' | 'aprovado' | 'recusado';

export interface BudgetItem {
  id: string;
  name: string;
  quantity: number;
  days: number;
  unitPrice: number;
  budgeted: number;     // quantity * days * unitPrice (auto-calculated)
  actualSpent: number;  // real spend (manual input)
  status: BudgetItemStatus; // approval status (default: 'pendente')
}

export interface BudgetCategory {
  id: string;
  name: string;
  items: BudgetItem[];
}

export type MemberType = 'profissional' | 'fornecedor';

export interface Freelancer {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  baseDailyRate: number;
  memberType?: MemberType;  // 'profissional' | 'fornecedor' (default: 'profissional')
}

export interface TeamMember {
  id: string;
  freelancerId: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  days: number;
  agreedRate: number;   // daily rate agreed for this project
  totalCost: number;    // days * agreedRate (auto-calculated)
  memberType?: MemberType;
}

export type MilestoneType = 'pre_producao' | 'captacao' | 'pos';

export interface Milestone {
  id: string;
  title: string;
  date: string;         // YYYY-MM-DD
  type: MilestoneType;
  done: boolean;
  descricao?: string;   // task briefing / details
  linkUtil?: string;    // external link (Drive, Notion, Milanote, etc.)
}

export type DocumentType = 'documento' | 'planilha' | 'apresentacao' | 'outro';

export interface ProjectDocument {
  id: string;
  title: string;
  url: string;
  type: DocumentType;
  addedAt: number;
  fileName?: string;    // set when added via file upload (no backend URL yet)
  customLabel?: string; // free-text category name when type === 'outro'
}

export type TransactionStatus = 'pending' | 'paid';

export interface Transaction {
  id: string;
  date: string;               // YYYY-MM-DD
  description: string;
  category: string;           // budget category name
  payee: string;              // supplier / professional
  amount: number;
  status: TransactionStatus;
  receiptUrl?: string;        // optional proof link
}

export interface ExecutiveProject {
  id: string;
  name: string;
  client: string;
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  status: ProjectStatus;
  createdAt: number;
  budgetCategories: BudgetCategory[];
  teamMembers: TeamMember[];
  milestones: Milestone[];
  documents: ProjectDocument[];
  transactions: Transaction[];
  // ── Phase 1 additions ──────────────────────────────────────────────────────
  tipoProjeto?: string;           // Publicidade | Institucional | Videoclipe | ...
  orcamentoPreAprovado?: number;  // Client-facing approved budget (R$)
  linkBriefing?: string;          // External briefing URL (Notion, Drive, etc.)
  clientLogo?: string;            // Base64 DataURL or public URL
  custoExecutado?: number;        // Phase 2: filled from transactions; Phase 1 = 0
}
