import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    verifyToken(authHeader.split(' ')[1]);

    const { clientName, projectScope, value, deadline, paymentTerms } = await req.json();
    if (!clientName || !projectScope) {
      return NextResponse.json({ error: 'clientName and projectScope are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const prompt = `Você é um advogado especializado em contratos de prestação de serviços audiovisuais no Brasil. Gere um contrato profissional completo em PT-BR.

Dados do contrato:
- CONTRATANTE: ${clientName}
- ESCOPO DO PROJETO: ${projectScope}
- VALOR: ${value || 'A definir'}
- PRAZO DE ENTREGA: ${deadline || 'A definir'}
- CONDIÇÕES DE PAGAMENTO: ${paymentTerms || '50% na assinatura, 50% na entrega'}

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

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      return NextResponse.json({ error: 'Failed to generate contract' }, { status: 500 });
    }

    return NextResponse.json({ contract: text });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Contract API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
