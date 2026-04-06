import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/gemini';
import { verifyToken } from '@/lib/jwt';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { PlanKey } from '@/lib/stripe';
import { query } from '@/lib/db';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // ~25MB in base64 chars

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyToken(authHeader.split(' ')[1]);
    const userId = decoded.userId;

    // Get user plan for limit checking
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

    // Check transcription limit
    if (userPlan) {
      const limitCheck = await checkLimit(userId, userPlan, 'script_generator');

      if (!limitCheck.allowed) {
        return NextResponse.json({
          error: 'Limite do plano atingido',
          message: `Você atingiu o limite de ${limitCheck.limit.toLocaleString('pt-BR')} transcrições/mês do seu plano. Faça upgrade para continuar.`,
          feature: 'script_generator',
          used: limitCheck.used,
          limit: limitCheck.limit,
          upgradeUrl: '/#precos',
        }, { status: 429 });
      }
    }

    const body = await request.json();
    const { audio } = body;

    if (!audio || typeof audio !== 'string') {
      return NextResponse.json(
        { error: 'audio (base64) é obrigatório' },
        { status: 400 }
      );
    }

    // Validate base64 data URI format
    if (!audio.startsWith('data:audio/')) {
      return NextResponse.json(
        { error: 'Formato de áudio inválido.' },
        { status: 400 }
      );
    }

    // Validate size
    if (audio.length > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: 'Áudio muito grande. Máximo 25MB.' },
        { status: 413 }
      );
    }

    const transcript = await transcribeAudio(audio);

    // Increment usage after successful transcription
    if (userPlan) {
      incrementUsage(userId, 'script_generator').catch(err => {
        console.error('Failed to increment transcription usage:', err);
      });
    }

    return NextResponse.json({ transcript });
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('API /transcribe error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
