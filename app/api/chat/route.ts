import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToAgent } from '@/lib/gemini';
import { AgentId } from '@/types';
import { checkLimit, incrementUsage, TrackableFeature } from '@/lib/usage';
import { PlanKey } from '@/lib/plans';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

const VALID_AGENT_IDS = new Set(Object.values(AgentId));
const MAX_HISTORY_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 50000; // 50k chars

// Map agent IDs to trackable feature categories
const AGENT_FEATURE_MAP: Record<string, TrackableFeature> = {
  // Script/text generation agents
  script_generator: 'script_generator',
  executive_producer: 'script_generator',
  prod_executive_agent: 'script_generator',
  youtube_seo: 'script_generator',
  instagram_captions: 'script_generator',
  video_prompts: 'script_generator',
  editing_workflow: 'script_generator',
  editing_shortcuts: 'script_generator',
  editing_idea: 'script_generator',
  editing_techniques: 'script_generator',
  sfx_assistant: 'script_generator',
  sfx_scene_describer: 'script_generator',
  sfx_library: 'script_generator',
  sfx_pack_creator: 'script_generator',
  media_assistant: 'script_generator',

  // Proposal/spreadsheet agents
  cost_calculator: 'proposals',
  budget_pricing: 'proposals',
  budget_sheet: 'proposals',

  // Image analysis agents
  lighting_assistant: 'image_analysis',
  lighting_generator: 'image_analysis',
  lighting_styles: 'image_analysis',
  image_generator: 'image_analysis',

  // Storyboard agents
  storyboard_generator: 'storyboard',
  shot_list: 'storyboard',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message, image, audio, history, systemInstruction, imageSize } = body;

    // Validate required fields
    if (!agentId || (!message && !audio && !image)) {
      return NextResponse.json(
        { error: 'agentId e message/audio/image são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate agentId
    if (!VALID_AGENT_IDS.has(agentId)) {
      return NextResponse.json(
        { error: 'Agente inválido.' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message && typeof message === 'string' && message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: 'Mensagem muito longa.' },
        { status: 400 }
      );
    }

    // Validate history
    if (history && Array.isArray(history) && history.length > MAX_HISTORY_LENGTH) {
      return NextResponse.json(
        { error: 'Histórico muito longo. Inicie uma nova conversa.' },
        { status: 400 }
      );
    }

    // Validate imageSize
    const validSizes = ['1K', '2K', '4K'];
    if (imageSize && !validSizes.includes(imageSize)) {
      return NextResponse.json(
        { error: 'Tamanho de imagem inválido.' },
        { status: 400 }
      );
    }

    // --- Plan limit enforcement ---
    let userId: string | null = null;
    let userPlan: PlanKey | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        userId = decoded.userId;

        // Get fresh plan from DB (JWT plan may be stale)
        const planResult = await query(
          `SELECT s.plan FROM subscriptions s
           WHERE s.user_id = $1 AND s.status = 'active'
           ORDER BY s.created_at DESC LIMIT 1`,
          [decoded.userId]
        );
        if (planResult.rows.length > 0) {
          userPlan = planResult.rows[0].plan as PlanKey;
        }
      } catch {
        // Token invalid — don't block, AuthGuard handles redirect
      }
    }

    const feature = AGENT_FEATURE_MAP[agentId] || 'script_generator';

    if (userId && userPlan) {
      const limitCheck = await checkLimit(userId, userPlan, feature);

      if (!limitCheck.allowed) {
        const featureLabels: Record<TrackableFeature, string> = {
          script_generator: 'roteiros',
          proposals: 'propostas e planilhas',
          image_analysis: 'análises de imagem',
          storyboard: 'storyboards',
        };
        return NextResponse.json({
          error: 'Limite do plano atingido',
          message: `Você atingiu o limite de ${limitCheck.limit.toLocaleString('pt-BR')} ${featureLabels[feature]}/mês do seu plano. Faça upgrade para continuar.`,
          feature,
          used: limitCheck.used,
          limit: limitCheck.limit,
          upgradeUrl: '/#precos',
        }, { status: 429 });
      }
    }

    const result = await sendMessageToAgent(
      agentId,
      message || '',
      image || null,
      history || [],
      systemInstruction || '',
      audio || null,
      imageSize || '1K'
    );

    // Increment usage after successful response
    if (userId) {
      incrementUsage(userId, feature).catch(err => {
        console.error('Failed to increment usage:', err);
      });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API /chat error:', errorMessage);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
