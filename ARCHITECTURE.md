# CreatorFlow AI — Documentação de Arquitetura

> Sistema Operacional para o Audiovisual — plataforma completa de gestão de produção audiovisual com IA integrada.

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Banco de Dados](#4-banco-de-dados)
5. [Autenticação e Autorização](#5-autenticação-e-autorização)
6. [Funcionalidades e Casos de Uso](#6-funcionalidades-e-casos-de-uso)
7. [Planos e Limites](#7-planos-e-limites)
8. [API Routes](#8-api-routes)
9. [Integrações Externas](#9-integrações-externas)
10. [Middleware e Segurança](#10-middleware-e-segurança)
11. [Variáveis de Ambiente](#11-variáveis-de-ambiente)
12. [Fluxos Principais](#12-fluxos-principais)
13. [Desenvolvimento Local](#13-desenvolvimento-local)

---

## 1. Visão Geral do Produto

**CreatorFlow AI** é uma plataforma SaaS B2B voltada para profissionais e equipes do audiovisual brasileiro. Funciona como um sistema operacional completo para produção de vídeo, combinando:

- **IA generativa** (Google Gemini) para roteiros, storyboards, contratos, SEO e mais de 25 agentes especializados
- **CRM de clientes** com portal de aprovação para o cliente final
- **Gestão de projetos** com orçamentos, freelancers, cronogramas e controle financeiro
- **Gerador de contratos** jurídicos com PDF exportável
- **Sistema de assinaturas** com trial de 7 dias integrado ao Asaas (gateway brasileiro)

**Público-alvo:**
- Videomakers e produtores solo
- Studios de produção de conteúdo
- Agências de produção audiovisual
- Equipes de mídia corporativa

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 15.3.0 |
| Linguagem | TypeScript | 5.8.2 |
| UI | React | 19.2.3 |
| Estilização | Tailwind CSS | 4.0.0 |
| Banco de Dados | PostgreSQL | — |
| ORM/Query | pg (node-postgres) | 8.19.0 |
| Autenticação | JWT (jsonwebtoken) | 9.0.3 |
| Hash de senha | bcryptjs | 3.0.3 |
| IA | Google Gemini (GenAI SDK) | 1.35.0 |
| Pagamentos BR | Asaas API | v3 |
| Email | Nodemailer (SMTP) | 8.0.4 |
| PDF | Puppeteer (headless Chrome) | 24.40.0 |
| Animações | Framer Motion | 12.38.0 |
| 3D / Efeitos | Three.js + React Three Fiber | 0.182.0 / 9.5.0 |
| Ícones | Lucide React | 0.562.0 |
| Drag & Drop | Hello Pangea DnD | 18.0.1 |

---

## 3. Estrutura de Diretórios

```
creatorflow/
├── app/                        # Next.js App Router
│   ├── (root)/                 # Landing page pública
│   ├── login/                  # Página de login
│   ├── signup/                 # Página de cadastro
│   ├── pagamento/              # Página de pagamento/checkout
│   ├── subscription-inactive/  # Tela de assinatura inativa
│   ├── invite/[token]/         # Aceitação de convite de equipe
│   ├── proposta/[id]/          # Visualização de proposta
│   ├── portal/[inviteToken]/   # Portal do cliente (acesso público)
│   ├── cliente/[token]/        # Portal simplificado do cliente
│   ├── admin/                  # Área administrativa interna
│   ├── debug/                  # Utilitários de debug
│   ├── dashboard/              # Dashboard principal (autenticado)
│   │   ├── page.tsx            # Hub de agentes e navegação
│   │   ├── storyboard/         # Ferramenta de storyboard
│   │   ├── gerador-contratos/  # Wizard de contratos
│   │   ├── profile/            # Configurações do usuário
│   │   ├── team/               # Gerenciamento de equipe
│   │   └── pricing/            # Comparativo de planos
│   └── api/                    # API Routes (REST)
│       ├── auth/               # Login, registro, /me
│       ├── clients/            # CRUD de clientes e dados
│       ├── portal/             # Endpoints do portal público
│       ├── cliente/            # Endpoints portal simplificado
│       ├── chat/               # Agentes de IA (Gemini)
│       ├── transcribe/         # Transcrição de áudio
│       ├── contracts/          # Geração de contratos
│       ├── storyboard/         # Geração de storyboard
│       ├── generate-pdf/       # Exportação de PDF
│       ├── asaas/              # Assinatura e webhook Asaas
│       ├── team/               # Convites e membros
│       ├── usage/              # Uso mensal do plano
│       ├── plan/               # Limites do plano
│       ├── user-data/          # Dados pessoais do usuário
│       ├── stock/              # Assets do creator stock
│       ├── videos/             # Arquivos de vídeo
│       ├── invite/             # Validação de convite
│       ├── setup/              # Configuração inicial / migração
│       ├── health/             # Health check
│       ├── test-email/         # Teste de email
│       ├── debug/              # Debug de usuário
│       └── admin/              # Gerenciamento admin
├── components/                 # Componentes React reutilizáveis
│   ├── landing/                # Seções da landing page
│   ├── AgentView.tsx           # Interface de chat com agentes IA
│   ├── ClientsHub.tsx          # Hub de gestão de clientes
│   ├── ClientDashboard.tsx     # Dashboard principal do cliente
│   ├── ClientPortalView.tsx    # Portal visão do cliente
│   ├── ExecutiveAssistantView.tsx # CRM / Assistente executivo
│   ├── ProposalWizard.tsx      # Wizard de criação de proposta
│   ├── IaraDrawer.tsx          # Assistente IA flutuante (Iara)
│   ├── HubArquivos.tsx         # Gerenciamento de arquivos
│   └── Executive*.tsx          # Ferramentas executivas (Budget, Financial, etc.)
├── lib/                        # Lógica de negócio e utilitários
│   ├── db/
│   │   ├── index.ts            # Pool de conexão PostgreSQL
│   │   ├── schema.sql          # Schema completo do banco
│   │   └── migrate.ts          # Utilitários de migração
│   ├── auth-helpers.ts         # Verificação JWT e controle de acesso
│   ├── jwt.ts                  # Geração e verificação de tokens
│   ├── gemini.ts               # Cliente Google Gemini AI
│   ├── asaas.ts                # Integração Asaas
│   ├── plans.ts                # Definições de planos e limites
│   ├── email.ts                # Templates e envio de email
│   ├── usage.ts                # Rastreamento de uso por plano
│   ├── audit-log.ts            # Log de eventos de segurança
│   ├── admin-auth.ts           # Autenticação admin
│   ├── admin-emails.ts         # Notificações admin
│   ├── agency-storage.ts       # Storage de agência
│   ├── clients-api.ts          # Helpers de API de clientes
│   ├── api.ts                  # Utilitários de API
│   └── hooks/
│       ├── useClientData.ts    # Hook para dados de cliente
│       └── useUserData.ts      # Hook para dados do usuário
├── types/
│   └── index.ts                # Interfaces e enums TypeScript
├── public/                     # Assets estáticos (imagens, vídeos)
├── scripts/                    # Scripts de migração de banco
├── middleware.ts               # CORS, rate limiting, bot protection
├── next.config.ts              # Configuração Next.js
└── .env.local                  # Variáveis de ambiente (não commitado)
```

---

## 4. Banco de Dados

O banco é PostgreSQL. A conexão usa pool via `pg`. O schema completo está em `lib/db/schema.sql`.

### Tabela: `users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `name` | VARCHAR(255) | Nome completo |
| `email` | VARCHAR(255) UNIQUE | Email de acesso |
| `password_hash` | VARCHAR(255) | Hash bcrypt da senha |
| `cpf_cnpj` | VARCHAR(20) | CPF ou CNPJ |
| `role` | VARCHAR(50) | `owner` ou `member` |
| `owner_id` | UUID (FK → users) | Para membros: ID do dono da conta |
| `cargo` | VARCHAR(100) | Cargo do membro na equipe |
| `last_login_at` | TIMESTAMP | Último login registrado |
| `created_at` | TIMESTAMP | Data de criação |

### Tabela: `subscriptions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `user_id` | UUID (FK → users) | Dono da assinatura |
| `plan` | VARCHAR(50) | `solo`, `maker`, `studio`, `agency` |
| `status` | VARCHAR(50) | `trial`, `active`, `past_due`, `canceled`, `pending_payment` |
| `asaas_subscription_id` | VARCHAR(255) | ID no Asaas |
| `asaas_customer_id` | VARCHAR(255) | ID do cliente no Asaas |
| `current_period_start` | TIMESTAMP | Início do período atual |
| `current_period_end` | TIMESTAMP | Fim do período atual |
| `cancel_at_period_end` | BOOLEAN | Cancelamento agendado |
| `canceled_at` | TIMESTAMP | Data de cancelamento |
| `created_at` | TIMESTAMP | — |

### Tabela: `clients`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | — |
| `user_id` | UUID (FK → users) | Produtor dono do cliente |
| `brand_name` | VARCHAR(255) | Nome da marca |
| `niche` | VARCHAR(255) | Nicho principal |
| `subniche` | VARCHAR(255) | Subnicho |
| `ideal_client` | TEXT | Perfil do cliente ideal |
| `main_pains` | TEXT | Principais dores |
| `main_desires` | TEXT | Principais desejos |
| `voice_tone` | VARCHAR(255) | Tom de voz da marca |
| `visual_style` | VARCHAR(255) | Estilo visual |
| `default_cta` | VARCHAR(255) | CTA padrão |
| `invite_token` | VARCHAR(255) | Token de acesso ao portal |
| `created_at` / `updated_at` | TIMESTAMP | — |

### Tabela: `client_data`

Armazena dados estruturados por tipo em JSONB (flexível, sem necessidade de ALTER TABLE para novos módulos).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `client_id` | UUID (FK → clients) | — |
| `user_id` | UUID (FK → users) | — |
| `data_type` | VARCHAR(100) | Tipo dos dados: `kanban`, `agenda`, `meetings`, `invoices`, `videos`, `roteiros`, etc. |
| `value` | JSONB | Dados estruturados do módulo |
| `updated_at` | TIMESTAMP | — |
| UNIQUE | (`client_id`, `data_type`) | Um registro por tipo por cliente |

### Tabela: `user_data`

Mesma abordagem JSONB, mas para dados que pertencem ao usuário (não a um cliente).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `user_id` | UUID (FK → users) | — |
| `data_type` | VARCHAR(100) | `executive_projects`, `freelancers`, `recordings`, `hdds`, `studio_profile`, etc. |
| `value` | JSONB | Dados do módulo |
| `updated_at` | TIMESTAMP | — |
| UNIQUE | (`user_id`, `data_type`) | Um registro por tipo por usuário |

### Tabela: `usage`

Rastreia uso mensal de features por plano.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `user_id` | UUID (FK → users) | — |
| `period_start` | DATE | Início do período (1º do mês) |
| `period_end` | DATE | Fim do período |
| `script_generator` | INTEGER | Roteiros gerados no período |
| `proposals` | INTEGER | Propostas geradas |
| `image_analysis` | INTEGER | Análises de imagem |
| `storyboard` | INTEGER | Storyboards gerados |

### Tabela: `team_invites` (criada dinamicamente)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `user_id` | UUID (FK → users) | Dono que enviou o convite |
| `token` | VARCHAR(255) UNIQUE | Token único de convite |
| `created_at` | TIMESTAMP | — |
| `expires_at` | TIMESTAMP | Expira em 7 dias |

### Tabela: `security_audit_log` (criada dinamicamente)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `event_type` | VARCHAR(100) | Ex: `login_failed`, `plan_limit_exceeded` |
| `user_id` | UUID | Usuário envolvido (nullable) |
| `ip_address` | INET | IP da requisição |
| `details` | JSONB | Contexto adicional |
| `created_at` | TIMESTAMP | — |

### Tabela: `stock_assets`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL (PK) | — |
| `user_id` | UUID (FK → users) | — |
| `filename` | VARCHAR(255) | Nome do arquivo |
| `size` | BIGINT | Tamanho em bytes |
| `created_at` | TIMESTAMP | — |

### Relacionamentos

```
users (1) ──── (N) subscriptions
users (1) ──── (N) clients
users (1) ──── (N) user_data
users (1) ──── (N) team_invites
users (owner) (1) ──── (N) users (member via owner_id)
clients (1) ──── (N) client_data
```

---

## 5. Autenticação e Autorização

### Fluxo de Autenticação

1. Usuário faz `POST /api/auth/login` com email e senha
2. Senha verificada com `bcrypt.compare()` (hash de 12 rounds)
3. JWT gerado via `lib/jwt.ts` com payload: `{ userId, email, name, plan, role, subscriptionStatus }`
4. Token retornado e armazenado no browser como `localStorage['cf_token']`
5. Requisições autenticadas enviam `Authorization: Bearer <token>`
6. Cada endpoint protegido chama `authenticateAndCheckCRM()` ou `verifyToken()` em `lib/auth-helpers.ts`

### Roles

| Role | Descrição |
|------|-----------|
| `owner` | Dono da conta. Acesso total, billing, gestão de equipe |
| `member` | Membro convidado. Herda o plano e CRM do owner |
| Admin | Email específico no env `ADMIN_EMAIL`. Acesso ao painel admin |

**Resolução de owner para membros:** `resolveOwnerId()` em `auth-helpers.ts` retorna o `owner_id` se o usuário for membro, garantindo que as queries usem os dados corretos do plano.

### Proteção contra Brute Force

- 10 tentativas falhas de login por email → bloqueio de 15 minutos
- Rate limiting no middleware: 5 tentativas de login/minuto por IP, 3 cadastros/minuto por IP
- Delay fixo de 500ms em falhas (mitigação de timing attack)
- Eventos registrados em `security_audit_log`

---

## 6. Funcionalidades e Casos de Uso

### 6.1 Agentes de IA (25+ agentes)

Interface principal: `components/AgentView.tsx` | API: `POST /api/chat`

Cada agente tem configurações próprias de temperatura e modo de raciocínio no Gemini:

| Agente | Função | Temperatura |
|--------|--------|-------------|
| Produtor Executivo | Orientação geral de produção | 0.7 |
| Gerador de Roteiros | Roteiros visuais em formato de tabela | 0.8 |
| Assistente de Iluminação | Design e setup de iluminação | 0.7 |
| SFX Tools | Descrição de cena para efeitos sonoros | 0.7 |
| Workflow de Edição | Guias de edição e atalhos | 0.1 |
| Gerador de Storyboard | Imagens de planejamento visual | 0.8 |
| YouTube SEO | Metadados e otimização | 0.6 |
| Legendas Instagram | Conteúdo para redes sociais | 0.9 |
| Calculadora de Custo | Pesquisa de preços com busca web | 0.4 |
| Precificação | Cálculo de margens de projeto | 0.5 |
| Gerador de Vídeo Prompts | Inspiração criativa | 0.9 |
| Media Assistant | Gestão de assets de vídeo | 0.6 |

### 6.2 CRM de Clientes

Componente: `components/ClientsHub.tsx` | Dados: tabela `clients` + `client_data`

- Cadastro de clientes com: nome da marca, nicho, subnicho, tom de voz, estilo visual, CTA padrão, perfil do cliente ideal, dores e desejos
- Cada cliente possui dados modulares via JSONB:
  - **Kanban** — quadro de tarefas da produção
  - **Agenda** — calendário de atividades
  - **Meetings** — atas de reunião com decisões e próximos passos
  - **Invoices** — cobranças com valor, vencimento e status (pendente/pago/atrasado)
  - **Roteiros** — scripts produzidos para o cliente
  - **Videos** — entregáveis com status de aprovação
  - **Perfis Instagram** — contas das redes sociais do cliente

> **Requer plano Maker ou superior.**

### 6.3 Portal do Cliente

Componente: `components/ClientPortalView.tsx` | Rotas: `/portal/[inviteToken]/[clientId]`

Acesso público (sem login), via token de convite com expiração de 7 dias.

Abas disponíveis para o cliente:
- **Dashboard** — visão geral do projeto e status
- **Roteiros** — aprovação de scripts (aprovado / em revisão / em produção)
- **Videos** — aprovação de entregáveis com comentários
- **Reuniões** — atas e decisões
- **Financeiro** — faturas com links de PIX/boleto
- **Mensagens** — comunicação direta com o produtor

### 6.4 Portal Simplificado

Rotas: `/cliente/[token]`

Versão leve do portal para entrega simples:
- Upload e aprovação de vídeos (aprovado / rejeitado)
- Caixa de mensagens
- Gerenciamento de entrega de arquivos

### 6.5 Gerador de Contratos

Componente: `components/ContractGenerator.tsx` (wizard 6 etapas) | API: `POST /api/contracts`

Etapas do wizard:
1. **As Partes** — dados do cliente e do produtor
2. **O Projeto** — título, descrição, tipo
3. **As Entregas** — vídeos, formatos, rodadas de revisão
4. **Prazos** — datas de início, entrega e formato
5. **Financeiro** — valor total, forma de pagamento, condições (50-50, 30-70, 100% antecipado, parcelado)
6. **Blindagem Legal** — cláusulas de multa, confidencialidade, propriedade intelectual

Fluxo:
- IA (Gemini) gera o contrato em linguagem jurídica brasileira
- PDF exportado via Puppeteer (`POST /api/generate-pdf`)
- Histórico de versões armazenado

### 6.6 Assistente Executivo / CRM Avançado

Componente: `components/ExecutiveAssistantView.tsx` | Dados: tabela `user_data`

Módulos:
- **Projetos** — status, fases (pré-produção, produção, pós-produção), milestones
- **Orçamento** — categorias, itens, aprovações
- **Equipe / Freelancers** — banco de fornecedores com diárias
- **Controle Financeiro** — transações, receitas, despesas
- **Reuniões** — summaries executivos com atribuição de tarefas
- **Documentos** — briefings, contratos, apresentações

### 6.7 Transcrição de Áudio

API: `POST /api/transcribe`

- Input: áudio em base64 (mp3, wav, webm, ogg, m4a)
- Processado pelo Gemini com suporte nativo ao português
- Output: texto transcrito sem timestamps

### 6.8 Storyboard

Página: `/dashboard/storyboard` | API: `POST /api/storyboard`

- Geração de imagens de storyboard a partir de descrição de cena
- Modelo visual do Gemini (`gemini-2.0-flash`)

### 6.9 Gerenciamento de Equipe

Página: `/dashboard/team` | APIs: `/api/team/*`

- Owner convida membros por email
- Tokens de convite com expiração de 7 dias
- Membros herdam plano e acesso CRM do owner
- Limites de membros por plano (ver seção 7)
- Remoção de membros via `DELETE /api/team/members/[memberId]`

### 6.10 Creator Stock

API: `/api/stock/`

- Biblioteca de assets do produtor (imagens, refs visuais)
- Upload com controle de tamanho por plano (storage limit)
- Acesso via `GET /api/stock/[filename]`

---

## 7. Planos e Limites

| Feature | Solo (Start) | Maker | Studio | Agency |
|---------|-------------|-------|--------|--------|
| **Preço mensal** | R$ 49,90 | R$ 67,90 | R$ 197,90 | R$ 497,90 |
| **Roteiros/mês** | 20 | 50 | Ilimitado | Ilimitado |
| **Propostas/mês** | 10 | 20 | 100 | Ilimitado |
| **Storyboards/mês** | 5 | 10 | 40 | 120 |
| **Análises de imagem/mês** | 20 | 30 | 150 | Ilimitado |
| **CRM de Clientes** | Não | Sim | Sim | Sim |
| **Portal do Cliente** | Não | Sim | Sim | Sim |
| **Membros de equipe** | 0 | 1 | 5 | 50 |
| **Storage** | — | 10 GB | 50 GB | 200 GB |

O controle de limites é feito em `lib/usage.ts` via função `checkLimit()`. Quando excedido, a API retorna `429 Too Many Requests` com URL de upgrade.

---

## 8. API Routes

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro com CPF/CNPJ, cria cliente Asaas e assinatura em trial |
| POST | `/api/auth/login` | Login com proteção contra brute force, retorna JWT |
| GET | `/api/auth/me` | Retorna dados do usuário autenticado |

### Clientes (CRM)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clients` | Lista clientes do usuário |
| POST | `/api/clients` | Cria novo cliente |
| GET | `/api/clients/[clientId]` | Busca cliente por ID |
| PUT | `/api/clients/[clientId]` | Atualiza dados do cliente |
| DELETE | `/api/clients/[clientId]` | Remove cliente |
| GET | `/api/clients/[clientId]/data/[dataType]` | Busca dados JSONB por tipo |
| PUT | `/api/clients/[clientId]/data/[dataType]` | Salva dados JSONB por tipo |
| POST | `/api/clients/migrate` | Migra dados de localStorage para o banco |

### Portal do Cliente (público)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/portal/[inviteToken]/[clientId]` | Valida token e retorna dados do portal |
| GET | `/api/portal/[inviteToken]/[clientId]/data/[dataType]` | Lê dados do portal |
| PUT | `/api/portal/[inviteToken]/[clientId]/data/[dataType]` | Salva dados via portal |
| GET | `/api/portal/[inviteToken]/[clientId]/messages` | Lista mensagens |
| POST | `/api/portal/[inviteToken]/[clientId]/messages` | Envia mensagem |

### IA e Conteúdo

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/chat` | Chat com agente de IA (Gemini). Valida agente e limites de uso |
| POST | `/api/transcribe` | Transcrição de áudio em português |
| POST | `/api/storyboard` | Geração de storyboard visual |
| POST | `/api/contracts` | Geração de contrato via IA |
| POST | `/api/generate-pdf` | Exportação de contrato em PDF |

### Pagamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/asaas/subscribe` | Cria assinatura no Asaas com cartão de crédito |
| POST | `/api/asaas/webhook` | Webhook Asaas (PAYMENT_RECEIVED, PAYMENT_OVERDUE, etc.) |

### Equipe

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/team/invite` | Gera link de convite com token de 7 dias |
| GET | `/api/team/invite/validate` | Valida token de convite |
| GET | `/api/team/members` | Lista membros da equipe |
| POST | `/api/team/members` | Adiciona membro via token validado |
| DELETE | `/api/team/members/[memberId]` | Remove membro |
| POST | `/api/invite/[token]` | Aceita convite e cria conta de membro |

### Dados e Storage

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/user-data/[dataType]` | Busca dados JSONB do usuário |
| POST | `/api/user-data/[dataType]` | Salva dados JSONB do usuário |
| GET | `/api/stock/[filename]` | Acessa asset do creator stock |
| POST | `/api/stock` | Upload de asset |
| GET | `/api/videos/[filename]` | Acessa vídeo do cliente |
| POST | `/api/videos/[filename]` | Upload de vídeo |

### Utilitários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/usage` | Uso mensal atual (features + storage) |
| GET | `/api/plan/limits` | Limites do plano atual |
| GET | `/api/health` | Health check (inicializa DB se necessário) |
| POST | `/api/setup` | Setup inicial / migrações |
| POST | `/api/test-email` | Dispara email de teste |
| GET | `/api/debug/user-info` | Debug: dados completos do usuário |

### Admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/users` | Lista todos os usuários (admin only) |
| PUT | `/api/admin/users/[userId]` | Atualiza dados de usuário |
| DELETE | `/api/admin/users/[userId]` | Remove usuário |

---

## 9. Integrações Externas

### 9.1 Google Gemini AI

**Arquivo:** `lib/gemini.ts`

- **Modelos utilizados:**
  - `gemini-2.5-flash-preview-05-20` — Padrão para agentes
  - `gemini-2.0-flash` — Geração de imagens (storyboard)
  - `gemini-2.5-pro-preview-05-06` — Modo de raciocínio aprofundado (contratos)
- **Capacidades:** texto, áudio (transcrição), imagem (análise + geração)
- **Configuração por agente:** temperatura, `thinkingMode`, busca web (`grounding`)
- **Quota handling:** trata erro `429 RESOURCE_EXHAUSTED` com fallback

### 9.2 Asaas

**Arquivo:** `lib/asaas.ts`

- Gateway de pagamento brasileiro
- Endpoints utilizados:
  - `POST /v3/customers` — cria cliente
  - `POST /v3/subscriptions` — cria assinatura com dados do cartão
- Planos mapeados:
  - `solo` → R$ 47,90/mês
  - `maker` → R$ 67,00/mês
  - `studio` → R$ 197,00/mês
  - `agency` → R$ 497,00/mês
- Trial de 7 dias configurado no `billingType`
- Webhook em `POST /api/asaas/webhook`

**Eventos do webhook Asaas:**

| Evento | Ação |
|--------|------|
| `PAYMENT_RECEIVED` | Ativa assinatura (fim do trial) |
| `PAYMENT_CONFIRMED` | Confirma pagamento recorrente |
| `PAYMENT_OVERDUE` | Marca como `past_due` |
| `SUBSCRIPTION_DELETED` | Marca como `canceled` |

### 9.3 Email SMTP

**Arquivo:** `lib/email.ts`

- Provedor: Hostinger (SMTP configurável)
- Transport: SSL na porta 465
- Templates HTML com design escuro e gradiente roxo/rosa da marca
- Emails disparados:
  - **Boas-vindas** (após cadastro + assinatura)
  - **Ativação do trial**
  - **Convite de equipe**
  - **Notificações admin**

### 9.4 Puppeteer (PDF)

- Renderização server-side via headless Chrome
- Endpoint: `POST /api/generate-pdf`
- Uso: exportação de contratos gerados por IA

---

## 10. Middleware e Segurança

**Arquivo:** `middleware.ts`

### CORS

Origens permitidas: `creatorflowia.com`, `www.creatorflowia.com`, `localhost:3000/3001/3002`
Métodos: `GET, POST, OPTIONS`

### Rate Limiting

| Escopo | Limite |
|--------|--------|
| Geral | 200 req/min por IP |
| Login | 5 tentativas/min por IP |
| Cadastro | 3 req/min por IP |

Limpeza automática de entradas antigas a cada 5 minutos.

Rota isenta: `/api/health`

### Bot Protection

Rejeita `User-Agent` de: `python-requests`, `curl`, `wget`, `Java`, `node-fetch`, `axios`, `Postman`, `Go-http`, `Ruby`, `PHP`.
Requisições sem `User-Agent` retornam 403.

### Limite de Tamanho

| Rota | Limite |
|------|--------|
| APIs gerais | 50 MB |
| Upload de vídeos | 500 MB |

### Security Headers

| Header | Valor |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | CSP customizado permitindo Gemini, fontes Google |
| `Permissions-Policy` | Camera e microfone permitidos; geolocalização bloqueada |
| `X-Request-ID` | UUID único por requisição (para rastreamento) |

---

## 11. Variáveis de Ambiente

### Obrigatórias

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Segredo para assinar tokens JWT |
| `GEMINI_API_KEY` | Chave da API Google Gemini |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação (ex: `https://creatorflowia.com`) |
| `ASAAS_API_KEY` | Chave da API Asaas (formato: `$aact_...`) |
| `ADMIN_EMAIL` | Email do administrador do sistema |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Mesmo que acima (público, para frontend) |

### Email SMTP

| Variável | Descrição |
|----------|-----------|
| `SMTP_HOST` | Host do servidor SMTP (ex: `smtp.hostinger.com`) |
| `SMTP_PORT` | Porta SMTP (padrão: `465`) |
| `SMTP_USER` | Usuário/email SMTP |
| `SMTP_PASS` | Senha SMTP |

### Opcionais

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Chave Gemini para uso no cliente (se necessário) |
| `NODE_ENV` | `production` ou `development` |

---

## 12. Fluxos Principais

### 12.1 Registro e Ativação

```
1. Usuário acessa /signup
2. Preenche nome, email, CPF/CNPJ, senha, plano
3. POST /api/auth/register
   ├── Valida unicidade de email
   ├── Valida CPF/CNPJ
   ├── Cria hash da senha (bcrypt, 12 rounds)
   ├── Insere em `users`
   ├── Cria cliente no Asaas
   ├── Insere em `subscriptions` (status: pending_payment)
   └── Retorna JWT token
4. Frontend redireciona para /pagamento
5. POST /api/asaas/subscribe
   ├── Cria assinatura no Asaas com dados do cartão
   ├── Atualiza `subscriptions` (status: trial, asaas_ids)
   └── Dispara email de boas-vindas
6. Webhook Asaas (PAYMENT_RECEIVED) → atualiza status para `active`
```

### 12.2 Acesso ao Portal do Cliente

```
1. Produtor gera token de convite no CRM do cliente
   └── Salvo em `clients.invite_token` e `team_invites`
2. Link gerado: /portal/[inviteToken]/[clientId]
3. Cliente acessa o link (sem necessidade de login)
4. GET /api/portal/[inviteToken]/[clientId]
   ├── Valida token + clientId
   └── Retorna dados do projeto
5. Cliente navega pelas abas (videos, roteiros, financeiro, mensagens)
6. Ações do cliente (aprovação, comentários) via PUT /api/portal/.../data/[dataType]
```

### 12.3 Chat com Agente de IA

```
1. Usuário seleciona agente no dashboard
2. POST /api/chat com { agentId, message, history, attachments? }
3. Servidor valida:
   ├── JWT token (autenticação)
   ├── Agente válido (whitelist de IDs)
   └── Limite de uso mensal (lib/usage.ts → checkLimit())
4. Se tiver attachment (imagem/áudio): converte para formato Gemini
5. Chama Gemini com system prompt do agente
6. Incrementa contador em `usage`
7. Retorna resposta streamada ou completa
```

---

## 13. Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Contas/chaves: Google Gemini, Asaas, SMTP

### Setup

```bash
# 1. Clonar e instalar dependências
git clone <repo>
cd creatorflow
npm install

# 2. Configurar variáveis de ambiente
cp .env.production.example .env.local
# Editar .env.local com suas credenciais

# 3. Criar banco de dados
createdb creatorflow

# 4. Rodar migrations (schema completo em lib/db/schema.sql)
psql -d creatorflow -f lib/db/schema.sql

# 5. Iniciar em desenvolvimento
npm run dev
```

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Roda ESLint |

### Deploy

O projeto usa `output: 'standalone'` no `next.config.ts`, compatível com Docker. O build gera uma pasta `.next/standalone` autossuficiente.

### Endpoints úteis em dev

| URL | Descrição |
|-----|-----------|
| `/api/health` | Verifica conexão com banco |
| `/api/debug/user-info` | Inspeciona dados do usuário logado |
| `/api/test-email` | Dispara email de teste |
| `/admin` | Painel administrativo (requer ADMIN_EMAIL) |

---

*Última atualização: Abril 2026*
