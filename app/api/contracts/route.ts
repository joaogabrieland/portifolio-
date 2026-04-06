import { NextRequest, NextResponse } from 'next/server';
import { authenticateAndCheckCRM, isAuthenticated } from '@/lib/auth-helpers';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { PlanKey } from '@/lib/stripe';
import { GoogleGenAI } from '@google/genai';
import { query } from '@/lib/db';

/** Strip HTML tags and known prompt injection patterns from input */
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')                        // strip HTML tags
    .replace(/ignore\s+(previous|above|all)/gi, '') // "ignore previous instructions"
    .replace(/system\s*:/gi, '')                     // "system:" prefix
    .replace(/assistant\s*:/gi, '')                  // "assistant:" prefix
    .replace(/#{3,}/g, '')                           // "###" separators
    .replace(/```/g, '')                             // code fences
    .trim();
}

const MAX_CLIENT_NAME = 100;
const MAX_PROJECT_SCOPE = 2000;
const MAX_FIELD = 500;

export async function POST(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  try {
    // Get user ID and plan for limit checking
    const userId = (auth as { userId: string }).userId;
    let userPlan: PlanKey | null = null;

    const planResult = await query(
      `SELECT s.plan FROM subscriptions s
       WHERE s.user_id = $1 AND s.status IN ('active', 'trial')
       ORDER BY s.created_at DESC LIMIT 1`,
      [userId]
    );
    if (planResult.rows.length > 0) {
      userPlan = planResult.rows[0].plan as PlanKey;
    }

    // Check contract limit
    if (userPlan) {
      const limitCheck = await checkLimit(userId, userPlan, 'proposals');

      if (!limitCheck.allowed) {
        return NextResponse.json({
          error: 'Limite do plano atingido',
          message: `Você atingiu o limite de ${limitCheck.limit.toLocaleString('pt-BR')} contratos/mês do seu plano. Faça upgrade para continuar.`,
          feature: 'proposals',
          used: limitCheck.used,
          limit: limitCheck.limit,
          upgradeUrl: '/#precos',
        }, { status: 429 });
      }
    }

    const { clientName, projectScope, value, deadline, paymentTerms } = await req.json();
    if (!clientName || !projectScope) {
      return NextResponse.json({ error: 'Nome do cliente e escopo do projeto são obrigatórios' }, { status: 400 });
    }

    // Validate lengths
    if (clientName.length > MAX_CLIENT_NAME) {
      return NextResponse.json({ error: `Nome do cliente deve ter no máximo ${MAX_CLIENT_NAME} caracteres` }, { status: 400 });
    }
    if (projectScope.length > MAX_PROJECT_SCOPE) {
      return NextResponse.json({ error: `Escopo do projeto deve ter no máximo ${MAX_PROJECT_SCOPE} caracteres` }, { status: 400 });
    }
    if (value && value.length > MAX_FIELD) {
      return NextResponse.json({ error: `Valor deve ter no máximo ${MAX_FIELD} caracteres` }, { status: 400 });
    }
    if (deadline && deadline.length > MAX_FIELD) {
      return NextResponse.json({ error: `Prazo deve ter no máximo ${MAX_FIELD} caracteres` }, { status: 400 });
    }
    if (paymentTerms && paymentTerms.length > MAX_FIELD) {
      return NextResponse.json({ error: `Condições de pagamento deve ter no máximo ${MAX_FIELD} caracteres` }, { status: 400 });
    }

    // Sanitize all inputs
    const safeClientName = sanitizeInput(clientName);
    const safeProjectScope = sanitizeInput(projectScope);
    const safeValue = value ? sanitizeInput(value) : 'A definir';
    const safeDeadline = deadline ? sanitizeInput(deadline) : 'A definir';
    const safePaymentTerms = paymentTerms ? sanitizeInput(paymentTerms) : '50% na assinatura, 50% na entrega';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const prompt = `Você é um advogado especializado em contratos de prestação de serviços audiovisuais no Brasil. Gere um contrato profissional completo em PT-BR.

Dados do contrato:
- CONTRATANTE: ${safeClientName}
- ESCOPO DO PROJETO: ${safeProjectScope}
- VALOR: ${safeValue}
- PRAZO DE ENTREGA: ${safeDeadline}
- CONDIÇÕES DE PAGAMENTO: ${safePaymentTerms}

O contrato deve incluir:
1. IDENTIFICAÇÃO DAS PARTES (deixar campos [___] para dados como CPF/CNPJ, endereço)
2. OBJETO DO CONTRATO
3. ESCOPO DOS SERVIÇOS (detalhado com base no projeto)
4. VALOR E FORMA DE PAGAMENTO
5. PRAZO DE EXECUÇÃO E ENTREGA
6. OBRIGAÇÕES DO CONTRATANTE
7. OBRIGAÇÕES DO CONTRATADO
8. PROPRIEDADE INTELECTUAL E DIREITOS DE USO
9. CONFIDENCIALIDADE
10. RESCISÃO
11. PENALIDADES
12. DISPOSIÇÕES GERAIS
13. FORO E JURISDIÇÃO

Use linguagem jurídica profissional brasileira. Formate com títulos em MAIÚSCULO e cláusulas numeradas.
Responda APENAS com o texto do contrato, sem explicações adicionais.`;

    const ai = new GoogleGenAI({ apiKey });

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.3, maxOutputTokens: 8192 },
      });
    } catch (geminiErr) {
      console.error('Contract Gemini SDK error:', geminiErr);
      return NextResponse.json({ error: 'Erro no serviço de IA' }, { status: 502 });
    }

    const text = response.text || '';

    if (!text) {
      return NextResponse.json({ error: 'Failed to generate contract' }, { status: 500 });
    }

    // Increment usage after successful generation
    if (userPlan) {
      incrementUsage(userId, 'proposals').catch(err => {
        console.error('Failed to increment contract usage:', err);
      });
    }

    return NextResponse.json({ contract: text });
  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
