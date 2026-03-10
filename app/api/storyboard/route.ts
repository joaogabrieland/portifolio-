import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface SceneInput {
  id: string;
  visual: string;
  audio: string;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    verifyToken(authHeader.split(' ')[1]);

    const { scenes, scriptTitle } = await req.json() as { scenes: SceneInput[]; scriptTitle: string };
    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json({ error: 'Scenes array required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const scenesText = scenes.map((sc, i) =>
      `Cena ${i + 1}: Visual: ${sc.visual || 'Não descrito'}. Áudio: ${sc.audio || 'Sem áudio.'}`
    ).join('\n');

    const prompt = `Você é um diretor de fotografia profissional. Para o roteiro "${scriptTitle || 'Sem título'}", gere descrições detalhadas de storyboard para cada cena.

Para cada cena, descreva:
- Enquadramento (plano geral, médio, close-up, etc.)
- Ângulo de câmera (nível dos olhos, plongée, contra-plongée, etc.)
- Movimento de câmera (estático, pan, tilt, tracking, etc.)
- Iluminação sugerida
- Composição visual e elementos-chave em quadro

Cenas do roteiro:
${scenesText}

Responda em JSON válido com o formato: {"storyboards": [{"sceneId": "id_da_cena", "description": "descrição detalhada do storyboard"}]}
Use exatamente os IDs das cenas: ${scenes.map(s => s.id).join(', ')}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Failed to generate storyboard' }, { status: 500 });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Storyboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
