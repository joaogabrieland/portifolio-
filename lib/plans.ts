// Plan definitions — payment-provider-agnostic.
// Imported by lib/usage.ts, lib/auth-helpers.ts, and any API route that
// enforces plan limits. These values must match the plans configured in Asaas.

export const PLANS = {
  solo: {
    name: 'Start',
    price: 4990, // R$ 49,90 in centavos
    limits: {
      crm: false,                    // CRM/Kanban/Agenda — Não incluso
      storage: 0,                    // Armazenamento — Não incluso (in GB)
      teamMembers: 1,                // Membros da equipe
      scriptGenerator: 20,           // Gerador de roteiros por mês
      proposals: 10,                 // Propostas e planilhas por mês
      imageAnalysis: 20,             // Análise de imagens (iluminador e som) por mês
      storyboard: 5,                 // Storyboard por mês
    },
    costPerUser: '2 a 4',           // Custo médio por usuário
  },
  maker: {
    name: 'Maker',
    subtitle: 'Solo',
    price: 6790, // R$ 67,90 in centavos
    limits: {
      crm: true,                     // CRM/Kanban/Agenda — Ilimitado
      storage: 10,                   // 10GB
      teamMembers: 1,                // 1 membro
      scriptGenerator: 50,           // 50 por mês
      proposals: 20,                 // 20 por mês
      imageAnalysis: 30,             // 30 por mês
      storyboard: 10,                // 10 por mês
    },
    costPerUser: '3 a 5',
  },
  studio: {
    name: 'Studio',
    subtitle: 'Equipe',
    price: 19790, // R$ 197,90 in centavos
    popular: true,
    limits: {
      crm: true,                     // Ilimitado
      storage: 50,                   // 50GB
      teamMembers: 5,                // 5 membros
      scriptGenerator: 999999,       // Ilimitado
      proposals: 100,                // 100 por mês
      imageAnalysis: 150,            // 150 por mês
      storyboard: 40,                // 40 por mês
    },
    costPerUser: '8 a 15',
  },
  agency: {
    name: 'Agency',
    subtitle: 'Ilimitado',
    price: 49790, // R$ 497,90 in centavos
    limits: {
      crm: true,                     // Ilimitado
      storage: 200,                  // 200GB
      teamMembers: 50,               // 50 membros
      scriptGenerator: 999999,       // Ilimitado
      proposals: 999999,             // Ilimitado
      imageAnalysis: 500,            // 500 por mês
      storyboard: 120,               // 120 por mês
    },
    costPerUser: '20 a 35',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type PlanLimits = typeof PLANS[PlanKey]['limits'];
