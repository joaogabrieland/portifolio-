import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

type Answers = Record<string, unknown>;

const VOICE_MAP: Record<string, string> = {
  'Direto e objetivo': 'Autoritário',
  'Técnico e aprofundado': 'Autoritário',
  'Sério e formal': 'Autoritário',
  'Didático e explicativo': 'Educacional',
  'Leve e bem-humorado': 'Descontraído',
  'Inspirador e motivador': 'Descontraído',
  'Provocativo e opinativo': 'Agressivo',
};

function arr(v: unknown): string {
  if (Array.isArray(v)) return (v as string[]).join(', ');
  return String(v || '');
}

function join(...vals: unknown[]): string {
  return vals.map(v => arr(v)).filter(Boolean).join('\n\n');
}

function mapAnswersToClient(answers: Answers, brandName: string) {
  const styles = (answers.q17 as string[]) || [];
  const voiceTone = (VOICE_MAP[styles[0]] as 'Autoritário' | 'Descontraído' | 'Educacional' | 'Agressivo') || 'Descontraído';

  return {
    brandName: brandName || 'Novo Cliente',
    niche: Array.isArray(answers.q3) ? (answers.q3 as string[])[0] : String(answers.q3 || ''),
    subniche: '',
    idealClient: String(answers.q5 || ''),
    mainPains: String(answers.q8 || ''),
    mainDesires: arr(answers.q20),
    voiceTone,
    visualStyle: String(answers.q16 || ''),
    defaultCta: String(answers.q2 || ''),
  };
}

function mapAnswersToBrandBrain(answers: Answers) {
  const voiceLines = [
    arr(answers.q17),
    answers.q18 ? `Não quer parecer: ${answers.q18}` : '',
    answers.q19 ? `Quer ser percebido como: ${answers.q19}` : '',
  ].filter(Boolean).join('\n');

  return {
    coreTransformation: join(answers.q2, answers.q21),
    audiencePainsDesires: join(answers.q5, answers.q8),
    uniqueMechanism: join(answers.q2, answers.q9),
    commonObjections: arr(answers.q12),
    brandVoice: voiceLines,
    keywordsRules: String(answers.q19 || ''),
    visualStyle: String(answers.q16 || ''),
    inspirationBrands: String(answers.q16 || ''),
    freeDump: String(answers.q22 || ''),
  };
}

// GET /api/onboarding/[token] — public: get form metadata
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const result = await query(
      `SELECT of.id, of.status, of.client_name, of.expires_at, of.client_id,
              u.name as producer_name, c.brand_name
       FROM onboarding_forms of
       JOIN users u ON u.id = of.user_id
       LEFT JOIN clients c ON c.id = of.client_id
       WHERE of.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }

    const row = result.rows[0];
    const expired = new Date(row.expires_at) < new Date();

    return NextResponse.json({
      status: row.status,
      expired,
      producerName: row.producer_name,
      clientName: row.brand_name || row.client_name || '',
    });
  } catch (error) {
    console.error('ERRO AO BUSCAR FORMULÁRIO:', error);
    return NextResponse.json({ error: 'Erro ao buscar formulário' }, { status: 500 });
  }
}

// POST /api/onboarding/[token] — public: submit form answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let body: { answers?: Answers; brandName?: string } = {};
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const { answers, brandName } = body;
  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'answers é obrigatório' }, { status: 400 });
  }

  try {
    // Load form
    const formResult = await query(
      `SELECT id, user_id, client_id, status, expires_at FROM onboarding_forms WHERE token = $1`,
      [token]
    );

    if (formResult.rows.length === 0) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }

    const form = formResult.rows[0];

    if (form.status === 'completed') {
      return NextResponse.json({ error: 'Este formulário já foi preenchido' }, { status: 409 });
    }

    if (new Date(form.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este link expirou' }, { status: 410 });
    }

    const resolvedBrandName = brandName?.trim() || String(answers.q1 || '').split(/[.\n,]/)[0]?.trim() || 'Novo Cliente';
    const clientData = mapAnswersToClient(answers, resolvedBrandName);
    const brandBrain = mapAnswersToBrandBrain(answers);

    let clientId: string = form.client_id;

    if (clientId) {
      // Update existing client
      await query(
        `UPDATE clients SET
          niche = COALESCE(NULLIF($3, ''), niche),
          ideal_client = COALESCE(NULLIF($4, ''), ideal_client),
          main_pains = COALESCE(NULLIF($5, ''), main_pains),
          main_desires = COALESCE(NULLIF($6, ''), main_desires),
          voice_tone = $7,
          visual_style = COALESCE(NULLIF($8, ''), visual_style),
          default_cta = COALESCE(NULLIF($9, ''), default_cta),
          updated_at = NOW()
        WHERE id = $1 AND user_id = $2`,
        [
          clientId, form.user_id,
          clientData.niche, clientData.idealClient, clientData.mainPains,
          clientData.mainDesires, clientData.voiceTone, clientData.visualStyle, clientData.defaultCta,
        ]
      );
    } else {
      // Create new client
      const newClient = await query(
        `INSERT INTO clients (user_id, brand_name, niche, subniche, ideal_client, main_pains, main_desires, voice_tone, visual_style, default_cta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          form.user_id,
          clientData.brandName,
          clientData.niche,
          '',
          clientData.idealClient,
          clientData.mainPains,
          clientData.mainDesires,
          clientData.voiceTone,
          clientData.visualStyle,
          clientData.defaultCta,
        ]
      );
      clientId = newClient.rows[0].id;
    }

    // Save brand brain to client_data
    const brandBrainJson = JSON.stringify(brandBrain);
    await query(
      `INSERT INTO client_data (client_id, user_id, data_type, data)
       VALUES ($1, $2, 'brand_brain', $3::jsonb)
       ON CONFLICT (client_id, data_type)
       DO UPDATE SET data = $3::jsonb, updated_at = NOW()`,
      [clientId, form.user_id, brandBrainJson]
    );

    // Mark form as completed
    await query(
      `UPDATE onboarding_forms
       SET status = 'completed', completed_at = NOW(), client_id = $2, form_data = $3::jsonb
       WHERE token = $1`,
      [token, clientId, JSON.stringify(answers)]
    );

    return NextResponse.json({ success: true, clientId });
  } catch (error) {
    console.error('ERRO AO SUBMETER FORMULÁRIO:', error);
    return NextResponse.json({ error: 'Erro ao processar formulário' }, { status: 500 });
  }
}

// DELETE /api/onboarding/[token] — authenticated: delete a form (any status)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { token } = await params;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);
    const result = await query(
      `DELETE FROM onboarding_forms WHERE token = $1 AND user_id = $2 RETURNING id`,
      [token, effectiveUserId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ERRO AO APAGAR FORMULÁRIO:', error);
    return NextResponse.json({ error: 'Erro ao apagar formulário' }, { status: 500 });
  }
}

// PATCH /api/onboarding/[token] — authenticated: mark form as acknowledged
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { token } = await params;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);
    const result = await query(
      `UPDATE onboarding_forms SET acknowledged_at = NOW()
       WHERE token = $1 AND user_id = $2 AND status = 'completed'
       RETURNING id`,
      [token, effectiveUserId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Formulário não encontrado ou não pode ser arquivado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ERRO AO ARQUIVAR FORMULÁRIO:', error);
    return NextResponse.json({ error: 'Erro ao arquivar formulário' }, { status: 500 });
  }
}
