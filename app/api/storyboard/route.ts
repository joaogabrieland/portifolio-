import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';

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

    const ai = new GoogleGenAI({ apiKey });

    // Generate one image per scene in parallel (max 6)
    const scenesToProcess = scenes.slice(0, 6);

    const storyboardPromises = scenesToProcess.map(async (scene, i) => {
      const sceneDesc = scene.visual || 'Cena sem descrição';
      const prompt = `Gere uma ilustração de storyboard profissional para a seguinte cena de vídeo.
Título do roteiro: "${scriptTitle || 'Sem título'}"
Cena ${i + 1}: ${sceneDesc}
${scene.audio ? `Áudio/Narração: ${scene.audio}` : ''}

Estilo: ilustração cinematográfica de storyboard, formato vertical 9:16, traços limpos, preto e branco com tons de cinza.
Descreva brevemente o enquadramento e ângulo de câmera escolhidos.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-preview-image-generation',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseModalities: ['Text', 'Image'],
            temperature: 0.7,
          },
        });

        let description = '';
        let image: string | null = null;

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.text) description += part.text;
            if (part.inlineData) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              image = `data:${mimeType};base64,${part.inlineData.data}`;
            }
          }
        }

        if (!description && response.text) {
          description = response.text;
        }

        return {
          sceneId: scene.id,
          description: description || `Storyboard para cena ${i + 1}`,
          image,
        };
      } catch (sceneErr) {
        console.error(`Storyboard scene ${i + 1} error:`, sceneErr);
        return {
          sceneId: scene.id,
          description: `Erro ao gerar imagem para cena ${i + 1}. Descrição: ${sceneDesc}`,
          image: null,
        };
      }
    });

    const storyboards = await Promise.all(storyboardPromises);
    return NextResponse.json({ storyboards });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Storyboard API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
