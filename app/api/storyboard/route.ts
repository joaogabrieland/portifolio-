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
    const scenesToProcess = scenes.slice(0, 6);

    // Step 1: Generate text descriptions for all scenes using gemini-2.0-flash
    const scenesText = scenesToProcess.map((sc, i) =>
      `Cena ${i + 1}: Visual: ${sc.visual || 'Não descrito'}. Áudio: ${sc.audio || 'Sem áudio.'}`
    ).join('\n');

    const textPrompt = `Você é um diretor de fotografia. Para o roteiro "${scriptTitle || 'Sem título'}", gere uma descrição curta de storyboard para cada cena (enquadramento, ângulo, movimento de câmera, composição).

${scenesText}

Responda em JSON: {"scenes": [{"id": "ID", "label": "tipo de plano curto", "description": "descrição detalhada"}]}
IDs: ${scenesToProcess.map(s => s.id).join(', ')}`;

    let sceneDescriptions: { id: string; label: string; description: string }[] = [];
    try {
      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
        config: { temperature: 0.7 },
      });
      const raw = (textResponse.text || '').replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        sceneDescriptions = parsed.scenes || [];
      }
    } catch (textErr) {
      console.error('Storyboard text generation error:', textErr);
    }

    // Build description map
    const descMap = new Map(sceneDescriptions.map(s => [s.id, s]));

    // Step 2: Generate images — try Imagen 3 first, fallback to gemini-2.0-flash
    const generateImage = async (sceneDesc: string): Promise<string | null> => {
      const imagePrompt = `cinematic storyboard frame, vertical 9:16, black and white sketch style: ${sceneDesc}`;

      // Try Imagen 3
      try {
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: imagePrompt,
          config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });
        if (response.generatedImages?.[0]?.image?.imageBytes) {
          return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
      } catch (imagenErr) {
        console.error('Imagen 3 fallback to gemini-2.0-flash:', String(imagenErr).slice(0, 200));
      }

      // Fallback: gemini-2.0-flash with responseModalities
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ role: 'user', parts: [{ text: `Generate a storyboard illustration: ${imagePrompt}` }] }],
          config: { responseModalities: ['Text', 'Image'] },
        });
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const mime = part.inlineData.mimeType || 'image/png';
              return `data:${mime};base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (flashErr) {
        console.error('gemini-2.0-flash image fallback error:', String(flashErr).slice(0, 200));
      }

      return null;
    };

    // Step 3: Generate images in parallel
    const storyboardPromises = scenesToProcess.map(async (scene, i) => {
      const info = descMap.get(scene.id);
      const label = info?.label || `Cena ${i + 1}`;
      const description = info?.description || scene.visual || '';
      const image = await generateImage(description || scene.visual);

      return {
        sceneId: scene.id,
        label,
        description,
        image,
      };
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
