# CreatorFlow — PRD (Product Requirements Document)
> Documento de referência completo para reescrita do zero.
> Stack: .NET 9 (backend) + Next.js 15 / React (frontend) + PostgreSQL
> Arquitetura: DDD + Clean Architecture
> Versão: 1.0 — 2026-04-21

---

## ÍNDICE

1. [Visão do Produto](#1-visão-do-produto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Schema do Banco de Dados](#4-schema-do-banco-de-dados)
5. [Contrato de API (.NET)](#5-contrato-de-api-net)
6. [Rotas e Páginas do Frontend](#6-rotas-e-páginas-do-frontend)
7. [Especificação de Funcionalidades](#7-especificação-de-funcionalidades)
8. [Agentes de IA — Configuração Completa](#8-agentes-de-ia--configuração-completa)
9. [Planos e Modelo de Tokens](#9-planos-e-modelo-de-tokens)
10. [Integrações Externas](#10-integrações-externas)
11. [Segurança](#11-segurança)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)
13. [Fases de Desenvolvimento](#13-fases-de-desenvolvimento)

---

## 1. Visão do Produto

### O que é
CreatorFlow é um SaaS B2B multi-tenant voltado para videomakers, produtoras e criadores de conteúdo brasileiros. Centraliza toda a operação de produção audiovisual: geração de conteúdo com IA, gestão de clientes (CRM), contratos, aprovações e portal do cliente.

### Público-alvo
- Videomakers autônomos (plano Start)
- Produtores com carteira de clientes (plano Maker)
- Produtoras pequenas/médias (plano Studio)
- Agências de vídeo (plano Agency)

### Proposta de valor central
> "Do roteiro ao contrato assinado, tudo em um lugar — com IA que entende produção audiovisual."

### Idioma e mercado
- Interface 100% em Português (Brasil)
- Moeda: BRL
- Gateway de pagamento: Asaas (brasileiro)
- Documentos jurídicos em conformidade com legislação brasileira

---

## 2. Stack Tecnológica

### Backend


### Frontend
| Item | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| UI Base | React 19 |
| Estilo | Tailwind CSS 4 |
| Componentes | shadcn/ui + Radix UI |
| Animações | Framer Motion |
| Drag & Drop | @dnd-kit |
| Estado servidor | TanStack Query v5 |
| Estado cliente | Zustand |
| Formulários | React Hook Form + Zod |
| HTTP Client | Axios |
| Ícones | Lucide React |
| Fontes | Geist (Vercel) |

### Infraestrutura
| Item | Decisão |
|---|---|
| Banco de dados | Supabase (PostgreSQL gerenciado) |
| Storage de arquivos | Supabase Storage (S3-compatible) |
| Email | SMTP Hostinger |
| Pagamento | Asaas API v3 |
| IA | Google Gemini API |
| Rate limiting | Redis (substituir in-memory) |

---

## 3. Arquitetura do Sistema

### Visão geral

```
┌─────────────────────┐         ┌──────────────────────────┐
│   Next.js 15        │  REST   │   ASP.NET Core 9         │
│   (Frontend puro)   │◄───────►│   (Backend .NET)         │
│   Port: 3000        │  JSON   │   Port: 5000             │
└─────────────────────┘         └──────────┬───────────────┘
                                            │
                          ┌─────────────────┼─────────────────┐
                          │                 │                 │
                    ┌─────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐
                    │ PostgreSQL│   │  Gemini API │  │  Asaas API  │
                    │ (Supabase)│   │  (Google)   │  │  (Payment)  │
                    └───────────┘   └─────────────┘  └─────────────┘
```

### Estrutura do Backend (.NET) — Clean Architecture

```

```

### Estrutura do Frontend (Next.js 15)

```
creatorflow-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── cadastro/page.tsx
│   │   │   └── pagamento/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              ← AuthGuard + sidebar
│   │   │   ├── dashboard/page.tsx      ← home
│   │   │   ├── central/page.tsx        ← hub de criação
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [clientId]/page.tsx
│   │   │   ├── arquivos/page.tsx
│   │   │   ├── equipe/page.tsx
│   │   │   └── conta/page.tsx
│   │   ├── portal/
│   │   │   └── [token]/
│   │   │       └── [clientId]/page.tsx ← portal público
│   │   ├── cliente/
│   │   │   └── [token]/page.tsx        ← portal simplificado
│   │   ├── convite/
│   │   │   └── [token]/page.tsx        ← aceitar convite de equipe
│   │   ├── layout.tsx
│   │   └── page.tsx                    ← landing page
│   │
│   ├── components/
│   │   ├── ui/                         ← shadcn/ui base
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── agents/
│   │   │   ├── AgentChat.tsx           ← interface de chat
│   │   │   ├── AgentCard.tsx
│   │   │   ├── HubView.tsx
│   │   │   └── StreamingMessage.tsx    ← SSE renderer
│   │   ├── crm/
│   │   │   ├── ClientList.tsx
│   │   │   ├── ClientProfile.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── MeetingList.tsx
│   │   │   └── ApprovalView.tsx
│   │   ├── portal/
│   │   │   ├── PortalLayout.tsx
│   │   │   ├── ScriptApproval.tsx
│   │   │   ├── VideoApproval.tsx
│   │   │   └── PortalMessages.tsx
│   │   └── shared/
│   │       ├── UsageBar.tsx
│   │       ├── PlanGate.tsx
│   │       └── FileUpload.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAgentChat.ts             ← SSE streaming
│   │   ├── useClientData.ts
│   │   └── useUsage.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               ← axios instance + interceptors
│   │   │   ├── auth.ts
│   │   │   ├── clients.ts
│   │   │   ├── ai.ts
│   │   │   ├── portal.ts
│   │   │   └── team.ts
│   │   └── utils/
│   │
│   ├── store/
│   │   ├── authStore.ts                ← Zustand
│   │   ├── chatStore.ts
│   │   └── uiStore.ts
│   │
│   └── types/
│       ├── api.ts                      ← response types
│       ├── agents.ts
│       ├── crm.ts
│       └── portal.ts
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## 4. Schema do Banco de Dados

> Usar EF Core Code-First com migrations. Schema PostgreSQL completo abaixo.

```sql
-- =============================================
-- USERS & AUTH
-- =============================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  cpf_cnpj      VARCHAR(20),
  role          VARCHAR(50) NOT NULL DEFAULT 'owner',  -- owner | member
  owner_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  cargo         VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- =============================================
-- SUBSCRIPTIONS & BILLING
-- =============================================

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                    VARCHAR(50) NOT NULL,  -- start | maker | studio | agency
  status                  VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
  -- pending_payment | trial | active | past_due | canceled
  asaas_customer_id       VARCHAR(255),
  asaas_subscription_id   VARCHAR(255),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- USAGE TRACKING (token-based)
-- =============================================

CREATE TABLE usage (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  tokens_used    BIGINT NOT NULL DEFAULT 0,
  tokens_limit   BIGINT NOT NULL,            -- snapshot do limite no momento
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, period_start)
);

-- =============================================
-- CRM — CLIENTS
-- =============================================

CREATE TABLE clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_name    VARCHAR(255) NOT NULL,
  niche         VARCHAR(255) DEFAULT '',
  subniche      VARCHAR(255) DEFAULT '',
  ideal_client  TEXT DEFAULT '',
  main_pains    TEXT DEFAULT '',
  main_desires  TEXT DEFAULT '',
  voice_tone    VARCHAR(50) DEFAULT 'Descontraído',
  visual_style  TEXT DEFAULT '',
  default_cta   TEXT DEFAULT '',
  invite_token  VARCHAR(255) UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CLIENT DATA (flexible JSONB per feature)
-- =============================================

CREATE TABLE client_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_type   VARCHAR(50) NOT NULL,
  -- kanban | agenda | meetings | invoices | roteiros | entregas
  -- storyboard_usage | metrics | generated_ideas | messages
  data        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, data_type)
);

-- =============================================
-- USER DATA (flexible JSONB per feature)
-- =============================================

CREATE TABLE user_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_type   VARCHAR(50) NOT NULL,
  -- hubArquivos | recordings | executiveProjects | freelancers | studioProfile
  data        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, data_type)
);

-- =============================================
-- TEAM
-- =============================================

CREATE TABLE team_invites (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token            VARCHAR(255) NOT NULL UNIQUE,
  expires_at       TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(50) NOT NULL DEFAULT 'member',  -- member | admin
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (owner_id, member_id)
);

-- =============================================
-- PORTAL — MESSAGES
-- =============================================

CREATE TABLE client_inbox_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_token VARCHAR(255) NOT NULL,
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender       VARCHAR(50) NOT NULL DEFAULT 'client',  -- client | producer
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- PORTAL SIMPLIFICADO — VIDEOS
-- =============================================

CREATE TABLE client_videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         VARCHAR(255) NOT NULL,
  storage_key   VARCHAR(500) NOT NULL,     -- Supabase Storage key
  original_name VARCHAR(500) NOT NULL,
  size_bytes    BIGINT NOT NULL,
  status        VARCHAR(50) NOT NULL DEFAULT 'pendente',  -- pendente | aprovado | rejeitado
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL       -- uploaded_at + 7 days
);

CREATE TABLE client_simple_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- STOCK ASSETS (SFX / Música)
-- =============================================

CREATE TABLE stock_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_key      VARCHAR(500) NOT NULL,   -- Supabase Storage key
  original_name    VARCHAR(500) NOT NULL,
  type             VARCHAR(50) NOT NULL,    -- sfx | music
  tags             TEXT,
  size_bytes       BIGINT NOT NULL,
  duration_seconds INT DEFAULT 0,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SECURITY
-- =============================================

CREATE TABLE security_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  VARCHAR(100) NOT NULL,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address  VARCHAR(50) NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_owner ON users(owner_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_asaas_sub ON subscriptions(asaas_subscription_id);
CREATE INDEX idx_subscriptions_asaas_cust ON subscriptions(asaas_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_usage_user_period ON usage(user_id, period_start);
CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_client_data_lookup ON client_data(client_id, data_type);
CREATE INDEX idx_user_data_lookup ON user_data(user_id, data_type);
CREATE INDEX idx_team_invites_token ON team_invites(token);
CREATE INDEX idx_inbox_token_client ON client_inbox_messages(invite_token, client_id);
CREATE INDEX idx_client_videos_token ON client_videos(token);
CREATE INDEX idx_stock_user ON stock_assets(user_id);
CREATE INDEX idx_audit_user ON security_audit_log(user_id);
CREATE INDEX idx_audit_created ON security_audit_log(created_at DESC);
```

---

## 5. Contrato de API (.NET)

> Base URL: `https://api.creatorflowia.com` (prod) / `http://localhost:5000` (dev)
> Autenticação: `Authorization: Bearer {jwt_token}` em todas as rotas protegidas.
> Formato: JSON. Charset: UTF-8.

### Auth

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Cria conta + inicia assinatura no Asaas |
| POST | `/auth/login` | ❌ | Retorna JWT (7 dias) |
| GET | `/auth/me` | ✅ | Retorna perfil do usuário autenticado |
| POST | `/auth/refresh` | ✅ | Renova JWT |

**POST /auth/register — Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 8)",
  "cpfCnpj": "string",
  "plan": "start | maker | studio | agency"
}
```

**POST /auth/login — Body:**
```json
{ "email": "string", "password": "string" }
```

**Resposta de login:**
```json
{
  "token": "jwt_string",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "owner | member",
    "plan": "start | maker | studio | agency",
    "subscriptionStatus": "trial | active | past_due | canceled | pending_payment"
  }
}
```

---

### Subscriptions

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/subscriptions/subscribe` | ✅ | Registra cartão + ativa trial no Asaas |
| GET | `/subscriptions/current` | ✅ | Retorna subscription ativa do usuário |
| GET | `/subscriptions/usage` | ✅ | Retorna tokens usados e limites do mês |
| POST | `/webhooks/asaas` | ❌ | Webhook de eventos do Asaas |

**POST /subscriptions/subscribe — Body:**
```json
{
  "asaasCustomerId": "string",
  "creditCard": {
    "holderName": "string",
    "number": "string",
    "expiryMonth": "string",
    "expiryYear": "string",
    "ccv": "string"
  },
  "creditCardHolderInfo": {
    "name": "string",
    "email": "string",
    "cpfCnpj": "string",
    "postalCode": "string",
    "addressNumber": "string"
  }
}
```

---

### Clients (CRM)

| Método | Rota | Auth | Plano | Descrição |
|---|---|---|---|---|
| GET | `/clients` | ✅ | Maker+ | Lista clientes do usuário |
| POST | `/clients` | ✅ | Maker+ | Cria novo cliente |
| GET | `/clients/{id}` | ✅ | Maker+ | Retorna cliente por ID |
| PUT | `/clients/{id}` | ✅ | Maker+ | Atualiza cliente |
| DELETE | `/clients/{id}` | ✅ | Maker+ | Remove cliente (cascade client_data) |

**POST/PUT /clients — Body:**
```json
{
  "brandName": "string (required)",
  "niche": "string",
  "subniche": "string",
  "idealClient": "string",
  "mainPains": "string",
  "mainDesires": "string",
  "voiceTone": "Autoritário | Descontraído | Educacional | Agressivo",
  "visualStyle": "string",
  "defaultCta": "string"
}
```

---

### Client Data (JSONB por módulo)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/clients/{id}/data/{dataType}` | ✅ | Retorna dados JSONB do módulo |
| PUT | `/clients/{id}/data/{dataType}` | ✅ | Salva dados JSONB do módulo (upsert) |

**dataType válidos:** `kanban`, `agenda`, `meetings`, `invoices`, `roteiros`, `entregas`, `metrics`, `generated_ideas`

**PUT Body:**
```json
{ "data": [...] }
```

---

### AI — Chat e Geração

| Método | Rota | Auth | Limite | Descrição |
|---|---|---|---|---|
| POST | `/ai/chat` | ✅ | tokens | Envia mensagem para agente (streaming SSE) |
| POST | `/ai/storyboard` | ✅ | tokens | Gera storyboard com imagens |
| POST | `/ai/contracts` | ✅ | tokens | Gera contrato em PDF |
| POST | `/ai/transcribe` | ✅ | tokens | Transcreve áudio |

**POST /ai/chat — Body:**
```json
{
  "agentId": "script_generator",
  "message": "string (max 50.000 chars)",
  "history": [
    { "role": "user | model", "text": "string", "image": "base64?" }
  ],
  "image": "data:image/...;base64,...",
  "audio": "data:audio/...;base64,...",
  "imageSize": "1K | 2K | 4K"
}
```

**Resposta (Server-Sent Events):**
```
data: {"text": "chunk parcial..."}
data: {"text": "mais texto..."}
data: {"done": true, "totalTokensUsed": 3842}
```

**POST /ai/storyboard — Body:**
```json
{
  "scenes": [
    { "visual": "descrição visual", "audio": "descrição de áudio" }
  ]
}
```

**POST /ai/contracts — Body:**
```json
{
  "clientName": "string",
  "projectScope": "string (max 2000)",
  "value": "string",
  "deadline": "string",
  "paymentTerms": "string"
}
```

---

### Portal do Cliente (Acesso Público via Token)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/portal/{token}/{clientId}` | Token | Valida token + retorna info do cliente |
| GET | `/portal/{token}/{clientId}/data/{dataType}` | Token | Lê dados de módulo |
| PUT | `/portal/{token}/{clientId}/data/{dataType}` | JWT | Produtor atualiza dados via portal |
| GET | `/portal/{token}/{clientId}/messages` | Token | Lista mensagens (auto-marca como lidas) |
| POST | `/portal/{token}/{clientId}/messages` | Token | Cliente envia mensagem |

---

### Portal Simplificado

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/cliente/{token}/videos` | Token | Lista vídeos pendentes de aprovação |
| POST | `/cliente/{token}/videos` | JWT | Produtor faz upload de vídeo |
| PATCH | `/cliente/{token}/videos/{videoId}` | Token | Cliente aprova ou rejeita |
| GET | `/cliente/{token}/messages` | Token | Lê mensagens do produtor |
| POST | `/cliente/{token}/messages` | JWT | Produtor envia mensagem |

---

### Team

| Método | Rota | Auth | Plano | Descrição |
|---|---|---|---|---|
| GET | `/team/invite` | ✅ | Studio+ | Gera/retorna token de convite (7 dias) |
| POST | `/team/invite/accept` | ❌ | — | Membro aceita convite e cria conta |
| GET | `/team/invite/validate/{token}` | ❌ | — | Valida se token ainda é válido |
| GET | `/team/members` | ✅ | Studio+ | Lista membros da equipe |
| PUT | `/team/members/{memberId}` | ✅ | Studio+ | Atualiza cargo/role do membro |
| DELETE | `/team/members/{memberId}` | ✅ | Studio+ | Remove membro |

---

### User Data

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/user-data/{dataType}` | ✅ | Retorna dados do usuário |
| PUT | `/user-data/{dataType}` | ✅ | Salva dados do usuário (upsert) |

**dataType válidos:** `hubArquivos`, `recordings`, `executiveProjects`, `freelancers`, `studioProfile`

---

### Stock Assets

| Método | Rota | Auth | Plano | Descrição |
|---|---|---|---|---|
| GET | `/stock` | ✅ | Maker+ | Lista assets do usuário (`?type=sfx|music`) |
| POST | `/stock` | ✅ | Maker+ | Upload de asset de áudio |
| DELETE | `/stock/{id}` | ✅ | Maker+ | Remove asset |
| GET | `/stock/{storageKey}/download` | ✅ | Maker+ | Retorna URL de download temporária |

---

### Admin

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/admin/users` | Admin | Lista todos os usuários com dados de subscription |
| POST | `/admin/users` | Admin | Cria usuário manualmente |
| PATCH | `/admin/users/{id}/subscription` | Admin | Altera plano ou status |
| DELETE | `/admin/users/{id}` | Admin | Desativa usuário (cancela subscription) |

---

## 6. Rotas e Páginas do Frontend

| Rota Next.js | Tipo | Auth | Descrição |
|---|---|---|---|
| `/` | Pública | ❌ | Landing page |
| `/login` | Pública | ❌ | Formulário de login |
| `/cadastro` | Pública | ❌ | Formulário de cadastro + seleção de plano |
| `/pagamento` | Pública | ❌ | Registro de cartão + ativação trial |
| `/convite/[token]` | Pública | ❌ | Aceitar convite de equipe |
| `/dashboard` | Privada | ✅ | Hub home — cards de navegação |
| `/central` | Privada | ✅ | Central de criação (agentes de IA) |
| `/clientes` | Privada | ✅ Maker+ | Lista de clientes CRM |
| `/clientes/[id]` | Privada | ✅ Maker+ | Dashboard do cliente (kanban, agenda, etc.) |
| `/arquivos` | Privada | ✅ | Hub de arquivos e gravações |
| `/equipe` | Privada | ✅ Studio+ | Diretório da equipe |
| `/conta` | Privada | ✅ | Perfil + configurações |
| `/portal/[token]/[clientId]` | Pública | Token | Portal completo do cliente |
| `/cliente/[token]` | Pública | Token | Portal simplificado de aprovação |

---

## 7. Especificação de Funcionalidades

### 7.1 Onboarding & Auth

#### Cadastro
- Campos: nome, email, senha (mín. 8 chars), CPF/CNPJ, plano
- Valida CPF: 11 dígitos, não todos iguais
- Valida CNPJ: 14 dígitos
- Cria user (role='owner') + subscription (status='pending_payment') + customer no Asaas
- **Regra:** Se Asaas falhar, rollback da criação do usuário

#### Login
- Brute-force por email: 10 tentativas em 15 min → lockout
- 500ms delay proposital em falha (mitigar timing attacks)
- JWT expira em 7 dias
- Login funciona mesmo com subscription 'past_due' (frontend decide redirecionar)
- Registrar evento em security_audit_log

#### JWT Payload
```json
{
  "userId": "uuid",
  "email": "string",
  "name": "string",
  "role": "owner | member",
  "plan": "start | maker | studio | agency",
  "subscriptionStatus": "string",
  "iat": 0,
  "exp": 0
}
```

#### Resolução de permissão para membros de equipe
- Membros (`role='member'`) herdam o plano do owner
- Toda query de dados usa `owner_id` do membro para buscar recursos
- Função: `ResolveOwnerId(userId)` → retorna `owner_id` se member, ou próprio `userId` se owner

---

### 7.2 Subscriptions

#### Trial
- Duração: 7 dias
- Ativo após POST /subscriptions/subscribe com cartão válido
- Status: `pending_payment` → `trial`

#### Estados da Subscription
```
pending_payment → trial → active → past_due → canceled
                              ↑         |
                              └─────────┘  (reativação após pagamento)
```

#### Webhook Asaas
| Evento | Ação |
|---|---|
| `PAYMENT_RECEIVED` | status='active', period_end=NOW()+30d |
| `PAYMENT_CONFIRMED` | status='active', period_end=NOW()+30d |
| `PAYMENT_OVERDUE` | status='past_due' |
| `SUBSCRIPTION_DELETED` | status='canceled' |

**Regra crítica:** Sempre responder 200 OK no webhook, mesmo com erro interno.

---

### 7.3 CRM — Clientes

#### Campos do Perfil (tabela `clients`)
| Campo | Tipo | Obrigatório |
|---|---|---|
| brandName | string | ✅ |
| niche | string | ❌ |
| subniche | string | ❌ |
| idealClient | text | ❌ |
| mainPains | text | ❌ |
| mainDesires | text | ❌ |
| voiceTone | enum | ❌ (default: Descontraído) |
| visualStyle | text | ❌ |
| defaultCta | text | ❌ |

#### Módulos por cliente (tabela `client_data`, JSONB)

**kanban** — Array de `KanbanColumn[]`
```typescript
interface KanbanCard {
  id: string
  title: string
  priority: 'Urgente' | 'Alta' | 'Normal' | 'Baixa'
  startDate?: string    // YYYY-MM-DD
  dueDate?: string      // YYYY-MM-DD
  notes?: string
  assignedTo?: string
}
interface KanbanColumn {
  id: string
  emoji: string
  title: string
  cards: KanbanCard[]
  isArchived?: boolean
}
```
Colunas padrão: `Pré-produção`, `Para Gravar`, `Em Edição`, `Ag. Aprovação`, `Finalizado`
Cards em "Finalizado" são auto-arquivados.

**meetings** — Array de `Meeting[]`
```typescript
interface MeetingNextStep {
  id: string
  text: string
  assignedTo: 'agencia' | 'cliente'
  done: boolean
}
interface Meeting {
  id: string
  title: string
  date: string            // YYYY-MM-DD
  rawTranscript?: string
  executiveSummary: string
  decisions: string[]
  nextSteps: MeetingNextStep[]
  createdAt: number
  isArchived?: boolean
}
```

**invoices** — Array de `Invoice[]`
```typescript
interface Invoice {
  id: string
  title: string           // ex: "Fatura Mar/26"
  dueDate: string         // YYYY-MM-DD
  amount: number          // BRL
  status: 'pendente' | 'pago' | 'atrasado'
  pixCode: string
  boletoLink?: string
}
```

**roteiros** — Array de `ScriptPackage[]`
```typescript
interface ScriptScene {
  visual: string
  audio: string
}
interface ScriptDocument {
  id: string
  title: string
  hook?: string
  scenes?: ScriptScene[]
  cta?: string
}
interface ScriptPackage {
  id: string
  title: string
  portalStatus?: 'aguardando_cliente' | 'aprovado' | 'revisao'
  scripts?: ScriptDocument[]
}
```

**entregas** — Array de `Deliverable[]`
```typescript
interface Deliverable {
  id: string
  title: string
  status: 'em_producao' | 'entregue' | 'revisao' | 'aprovado'
  dueDate?: string
  shareLink?: string      // URL externa (Drive, Vimeo etc.)
  notes?: string
}
```

---

### 7.4 Portal do Cliente

#### Portal Completo (`/portal/[token]/[clientId]`)
- Autenticação: token UUID em `team_invites` (expira 7 dias)
- Atualiza `last_accessed_at` a cada visita
- Retorna 401 se token expirado ou inválido
- Tabs: Dashboard, Roteiros, Vídeos, Reuniões, Financeiro, Mensagens
- Cliente pode: aprovar/reprovar roteiros, ver faturas com PIX, enviar mensagens

#### Portal Simplificado (`/cliente/[token]`)
- Upload de vídeo pelo produtor (max 500MB, `video/*`)
- Vídeo expira em 7 dias (armazenado no Supabase Storage)
- Cliente assiste e clica Aprovar/Rejeitar (sem login)
- Mensagens unidirecionais (produtor → cliente)

---

### 7.5 Equipe

- Owner gera token de convite (TTL 7 dias)
- Membro preenche nome, email, senha no link
- User criado com `role='member'`, `owner_id` = id do owner
- Inserção em `team_members` com role ('member' ou 'admin')
- Subscription criada como `solo` com status `active`, `period_end` = 100 anos (marcador)
- Membro herda plano do owner para todas as features

**Limites de membros por plano:**
- start: 1 (só owner)
- maker: 1 (só owner)
- studio: 5
- agency: 50

---

### 7.6 Hub de Arquivos

Dados em `user_data` (JSONB). Sem upload real — apenas metadados.
- `hubArquivos`: estrutura de HDs e pastas
- `recordings`: biblioteca de gravações com metadata
- `executiveProjects`: projetos e orçamentos executivos
- `freelancers`: cadastro de colaboradores

---

## 8. Agentes de IA — Configuração Completa

> Todos os agentes usam `POST /ai/chat` com o `agentId` correspondente.
> O backend decide modelo, temperatura e flags baseado no agentId.

### Mapa de Agentes

| agentId | Nome UI | Modelo | Temp | Thinking | Search | Input Multimodal | Bucket |
|---|---|---|---|---|---|---|---|
| `script_generator` | Gerador de Roteiros | gemini-2.5-pro | 0.8 | ✅ 16K | ❌ | ❌ | tokens |
| `shot_list` | Lista de Gravação | gemini-2.5-flash | 0.7 | ❌ | ❌ | ❌ | tokens |
| `media_assistant` | Imagens e B-Roll | gemini-2.5-flash | 0.4 | ❌ | ✅ | ❌ | tokens |
| `storyboard_generator` | Gerador de Storyboard | gemini-2.0-flash | 0.8 | ✅ | ❌ | ❌ | tokens |
| `lighting_generator` | Gerador de Iluminação | gemini-2.5-flash | 0.7 | ❌ | ❌ | ✅ imagem | tokens |
| `lighting_styles` | Iluminações Famosas | gemini-2.5-flash | 0.7 | ❌ | ❌ | ❌ | tokens |
| `editing_shortcuts` | Atalhos de Edição | gemini-2.5-flash | 0.1 | ❌ | ❌ | ❌ | tokens |
| `editing_idea` | Como Fazer Esse Efeito? | gemini-2.5-flash | 0.4 | ❌ | ✅ | ❌ | tokens |
| `editing_techniques` | Técnicas Famosas | gemini-2.5-flash | 0.7 | ❌ | ❌ | ❌ | tokens |
| `sfx_scene_describer` | Descreva sua Cena | gemini-2.5-flash | 0.7 | ❌ | ❌ | ✅ imagem | tokens |
| `sfx_library` | Biblioteca SFX Pro | gemini-2.5-flash | 0.7 | ❌ | ❌ | ❌ | tokens |
| `image_generator` | Prompt para Imagem | gemini-2.5-flash | 0.8 | ❌ | ❌ | ❌ | tokens |
| `video_prompts` | Prompt para Vídeos | gemini-2.5-flash | 0.9 | ❌ | ❌ | ❌ | tokens |
| `youtube_seo` | YouTube SEO | gemini-2.5-flash | 0.4 | ❌ | ✅ | ❌ | tokens |
| `instagram_captions` | Legendas Instagram | gemini-2.5-flash | 0.7 | ❌ | ❌ | ❌ | tokens |
| `budget_pricing` | Assistente de Precificação | gemini-2.5-pro | 0.8 | ✅ 16K | ❌ | ❌ | tokens |
| `cost_calculator` | Calculadora de Custos | gemini-2.5-flash | 0.4 | ❌ | ✅ | ❌ | tokens |
| `budget_sheet` | Gerador de Proposta | gemini-2.5-flash | 0.1 | ❌ | ❌ | ❌ | tokens |
| `prod_executive_agent` | Produção Executiva | gemini-2.5-flash | 0.7 | ❌ | ❌ | ❌ | tokens |

### Storyboard (endpoint dedicado `/ai/storyboard`)
- **Etapa 1:** gemini-2.0-flash gera JSON descritivo das cenas (com thinking)
- **Etapa 2:** Imagen 3 (`imagen-3.0-generate-002`) gera imagem por cena em paralelo
- **Fallback:** Se Imagen falhar → gemini-2.0-flash com `responseModalities: ['Text', 'Image']`
- **Formato imagem:** JPEG base64, aspect ratio 9:16, estilo sketch preto e branco

### Contratos (endpoint dedicado `/ai/contracts`)
- Modelo: gemini-2.5-flash
- Temperatura: 0.3 (precisão jurídica)
- Max output tokens: 8192
- Saída: contrato completo em PT-BR com 13 seções
- Geração de PDF: PuppeteerSharp (HTML → PDF)

### Regras do chat
- Mensagem máxima: 50.000 caracteres
- Histórico máximo: 100 mensagens
- Fallback de cota: se Pro retornar quota_exceeded → retenta com Flash
- Sanitização: remover HTML e padrões de prompt injection antes de enviar para Gemini
- Tokens consumidos: registrar `usage.totalTokenCount` da resposta do Gemini

### Streaming SSE — fluxo
```
1. Client abre EventSource para POST /ai/chat
2. Backend chama Gemini com streaming habilitado
3. Para cada chunk recebido: envia `data: {"text": "chunk"}`
4. Ao finalizar: envia `data: {"done": true, "tokensUsed": N}`
5. Backend registra tokens no banco (async, não bloqueia)
6. Se limite excedido: fecha stream com `data: {"error": "limit_exceeded", "upgradeUrl": "/conta"}`
```

---

## 9. Planos e Modelo de Tokens

### Definição dos Planos

| | Start | Maker | Studio | Agency |
|---|---|---|---|---|
| **Preço mensal** | R$ 79,90* | R$ 149,90* | R$ 297,00* | R$ 897,00* |
| **Preço anual (÷12)** | R$ 63,90 | R$ 119,90 | R$ 237,60 | R$ 717,60 |
| **Tokens/mês** | 600.000 | 1.200.000 | 3.500.000 | 12.000.000 |
| **Membros de equipe** | 1 | 1 | 5 | 50 |
| **Storage** | 0 GB | 10 GB | 50 GB | 200 GB |
| **CRM & Portal** | ❌ | ✅ | ✅ | ✅ |
| **Trial** | 7 dias | 7 dias | 7 dias | 7 dias |

*Preços sugeridos para a nova versão. Verificar com o negócio antes de implementar.

### Modelo de tokens (substituição dos 4 contadores)
- Um único campo `tokens_used` por período mensal
- Descontado a cada resposta de IA: `response.usageMetadata.totalTokenCount`
- Verificado ANTES de cada chamada de IA
- Renovado no 1º dia de cada mês

### Controle no backend
```csharp
// Antes de chamar Gemini:
var usage = await _usageRepo.GetCurrentMonthAsync(userId);
var limit = _plans.GetTokenLimit(plan);
if (usage.TokensUsed >= limit)
    return StatusCode(429, new { error = "token_limit_exceeded", upgradeUrl = "/conta" });

// Após resposta do Gemini (async):
await _usageRepo.IncrementTokensAsync(userId, response.UsageMetadata.TotalTokenCount);
```

### Overage (pacotes extras)
| Pack | Tokens | Preço (BRL) |
|---|---|---|
| Pack Mini | 250.000 | R$ 12,90 |
| Pack Standard | 600.000 | R$ 27,90 |
| Pack Pro | 2.000.000 | R$ 79,90 |

### Rollover
- Tokens não utilizados no mês: carregam para o mês seguinte (máx. 1 mês)
- Não acumulam indefinidamente

---

## 10. Integrações Externas

### Google Gemini API
- **SDK:** Google.AI.Generative (NuGet)
- **Autenticação:** API Key em header
- **Endpoint:** `https://generativelanguage.googleapis.com`
- **Streaming:** Habilitado via `GenerateContentStreamAsync`
- **Modelos usados:** gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash, imagen-3.0-generate-002
- **Thinking:** `ThinkingConfig { ThinkingBudget = 16000 }`
- **Google Search:** `Tools = [new Tool { GoogleSearch = new GoogleSearch() }]`

### Asaas (Payment Gateway)
- **Ambiente prod:** `https://api.asaas.com/v3`
- **Ambiente sandbox:** `https://sandbox.asaas.com/api/v3`
- **Auth:** Header `access_token: $aact_...`
- **Endpoints utilizados:**
  - `POST /customers` — criar cliente
  - `POST /subscriptions` — criar assinatura com cartão
- **Webhook:** `POST /webhooks/asaas` (endpoint público, sem auth)
- **Sempre retornar 200 OK** no webhook

### Supabase Storage
- Substituição do disco local para arquivos de vídeo e stock assets
- Gerar URLs pré-assinadas (expiração configurável) para download
- Buckets: `stock-assets`, `client-videos`

### SMTP (Email)
- **Host:** smtp.hostinger.com
- **Porta:** 465 (SSL)
- **Lib .NET:** MailKit
- **Emails disparados:**
  1. Boas-vindas após cadastro
  2. Trial ativado
  3. Pagamento confirmado
  4. Aviso de limite de tokens atingido (80%)

---

## 11. Segurança

### JWT
- Algoritmo: HS256
- Expiração: 7 dias (login normal), 30 dias (aceitar convite de equipe)
- Secret: variável de ambiente `JWT_SECRET` (mín. 32 chars)
- Claims obrigatórios: userId, email, role, plan, subscriptionStatus

### Senhas
- Algoritmo: BCrypt, work factor 12
- Nunca logar ou retornar senha ou hash

### Rate Limiting (usar Redis na nova versão)
- Global: 200 req/min por IP
- Login: 5 req/min por IP
- Register: 3 req/min por IP
- Portal público: 30 req/min por IP
- Retorna `429 Too Many Requests` com header `Retry-After: 60`

### Brute-force por email
- 10 falhas de login em 15 min → lockout do email por 15 min
- Armazenar em Redis com TTL
- Registrar em `security_audit_log`

### CORS
```
Allowed: https://creatorflowia.com, https://www.creatorflowia.com, http://localhost:3000
```

### Security Headers (ASP.NET Core Middleware)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### Sanitização de input
- Antes de enviar para Gemini: remover tags HTML e padrões de prompt injection
- Validação com FluentValidation em todos os endpoints

### Audit Log
- Fire-and-forget (nunca bloquear a request)
- Eventos: `login_success`, `login_failed`, `login_blocked`, `invite_invalid`, `invite_expired`, `unauthorized_access`, `token_limit_exceeded`

---

## 12. Variáveis de Ambiente

### Backend (.NET) — `appsettings.json` / variáveis de ambiente

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=creatorflow;Username=...;Password=..."
  },
  "Jwt": {
    "Secret": "min-32-chars-secret",
    "ExpiresInDays": 7
  },
  "Gemini": {
    "ApiKey": "AIzaSy..."
  },
  "Asaas": {
    "ApiKey": "$aact_prod_...",
    "BaseUrl": "https://api.asaas.com/v3"
  },
  "Smtp": {
    "Host": "smtp.hostinger.com",
    "Port": 465,
    "User": "noreply@creatorflowia.com",
    "Password": "...",
    "FromName": "CreatorFlow"
  },
  "Supabase": {
    "Url": "https://xxx.supabase.co",
    "ServiceKey": "eyJ..."
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "App": {
    "FrontendUrl": "https://creatorflowia.com",
    "AdminEmails": ["admin@creatorflowia.com"]
  }
}
```

### Frontend (Next.js) — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Nunca expor API keys no frontend. Todas as chamadas de IA são feitas pelo backend.

---

## 13. Fases de Desenvolvimento

### Fase 1 — Fundação (Semanas 1-2)
**Objetivo:** App rodando com auth e navegação básica

- [ ] Setup do projeto .NET (Clean Architecture, EF Core, Postgres)
- [ ] Migrations do banco de dados
- [ ] `POST /auth/register` com integração Asaas
- [ ] `POST /auth/login` com brute-force protection
- [ ] `GET /auth/me`
- [ ] JWT middleware no .NET
- [ ] Setup Next.js 15 com Tailwind + shadcn/ui
- [ ] Páginas: login, cadastro, pagamento
- [ ] AuthGuard + Zustand store de auth
- [ ] Dashboard home (estático)
- [ ] Webhook Asaas básico

**Critério de aceite:** Usuário consegue se cadastrar, pagar e ver o dashboard.

---

### Fase 2 — Central de Criação (Semanas 3-4)
**Objetivo:** Agentes de IA funcionando com streaming e controle de tokens

- [ ] `POST /ai/chat` com SSE streaming
- [ ] Controle de tokens (tabela `usage`, check + increment)
- [ ] 5 agentes priority: script_generator, shot_list, youtube_seo, instagram_captions, editing_shortcuts
- [ ] Componente `AgentChat.tsx` com streaming em tempo real
- [ ] Componente `HubView.tsx` com cards de agentes
- [ ] Upload de imagem no chat (base64)
- [ ] Histórico de conversa (client-side, Zustand)

**Critério de aceite:** Usuário envia mensagem para agente e vê resposta em streaming.

---

### Fase 3 — Storyboard & Contratos (Semana 5)
**Objetivo:** Features de geração especial

- [ ] `POST /ai/storyboard` com Imagen 3
- [ ] `POST /ai/contracts` com PDF (PuppeteerSharp)
- [ ] Demais agentes (lighting, sfx, media, etc.)
- [ ] Transcrição de áudio

**Critério de aceite:** Storyboard com imagens gerado. Contrato baixado como PDF.

---

### Fase 4 — CRM & Portal (Semanas 6-7)
**Objetivo:** Hub de clientes completo

- [ ] CRUD de clientes
- [ ] Todos os módulos JSONB (kanban, meetings, invoices, roteiros, entregas)
- [ ] Kanban com @dnd-kit
- [ ] `POST /team/invite/accept` + geração de token
- [ ] Portal completo (`/portal/[token]/[clientId]`)
- [ ] Portal simplificado (`/cliente/[token]`) com upload via Supabase Storage
- [ ] Mensagens bidirecionais

**Critério de aceite:** Produtor cria cliente, preenche kanban, gera link de portal, cliente acessa e aprova roteiro.

---

### Fase 5 — Equipe, Stock & Polimento (Semana 8)
**Objetivo:** Features secundárias + qualidade

- [ ] Gestão de equipe completa
- [ ] Stock assets (upload/listagem via Supabase Storage)
- [ ] Hub de arquivos (user_data JSONB)
- [ ] Painel de uso de tokens
- [ ] Admin panel
- [ ] Rate limiting via Redis
- [ ] Emails transacionais (MailKit)
- [ ] Testes de integração críticos
- [ ] Planos anuais (desconto 20%)
- [ ] Token packs (overage)

**Critério de aceite:** App completo em staging, pronto para migração de usuários.

---

### Fase 6 — Migração & Launch
- [ ] Script de migração dos dados do app atual (PostgreSQL → PostgreSQL)
- [ ] Migração especial do JSONB: validar e tipar dados legados
- [ ] Período de beta com usuários atuais
- [ ] Switch de DNS
- [ ] Monitoramento (Serilog → Datadog ou Sentry)

---

## Notas Importantes para o Desenvolvedor

### Sobre o JSONB
O app atual usa JSONB livre sem schema. Na reescrita, **manter JSONB** para os módulos de `client_data` e `user_data` é uma decisão consciente de flexibilidade — mas validar os dados com Zod (frontend) e FluentValidation (backend) antes de salvar.

### Sobre o Portal Público
Rotas `/portal` e `/cliente` são públicas — sem JWT, autenticadas apenas pelo token da URL. O backend valida o token contra `team_invites` e garante que o acesso é apenas ao cliente correto.

### Sobre Streaming
O endpoint `/ai/chat` usa Server-Sent Events (SSE). No .NET, usar `Response.ContentType = "text/event-stream"` e escrever diretamente no `Response.Body`. No Next.js, usar `EventSource` ou `fetch` com `ReadableStream`.

### Sobre membros de equipe
Todo acesso a dados (clients, client_data, user_data) deve primeiro chamar `ResolveOwnerId(userId)`. Membros enxergam exatamente os mesmos dados que o owner.

### Sobre o Asaas
- Usar sandbox para desenvolvimento: `https://sandbox.asaas.com/api/v3`
- Webhook deve sempre retornar 200 OK
- Salvar `asaas_subscription_id` ANTES de atualizar o status da subscription (race condition com webhook)

### Sobre tokens de IA
Registrar `response.usageMetadata.totalTokenCount` (input + output + thinking) para descontar do saldo. O Gemini retorna isso em toda resposta.
