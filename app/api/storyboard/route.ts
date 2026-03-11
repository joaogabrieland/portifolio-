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

    let geminiRes: Response;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 },
          }),
        }
      );
    } catch (fetchErr) {
      console.error('Storyboard Gemini fetch error:', fetchErr);
      return NextResponse.json({ error: 'Failed to connect to AI service', details: String(fetchErr) }, { status: 502 });
    }

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Storyboard Gemini API error:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'AI service error', status: geminiRes.status, details: data.error?.message || JSON.stringify(data) },
        { status: 502 }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      console.error('Storyboard Gemini empty response:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'AI returned empty response', details: data.candidates?.[0]?.finishReason || 'no candidates' },
        { status: 500 }
      );
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    console.error('Storyboard Gemini no JSON in response:', text.substring(0, 500));
    return NextResponse.json({ error: 'Failed to parse storyboard from AI response' }, { status: 500 });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Storyboard API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
