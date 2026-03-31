import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated } from '@/lib/auth-helpers';

// GET /api/clients — List all clients for the authenticated user
export async function GET(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  try {
    const result = await query(
      `SELECT id, brand_name, niche, subniche, ideal_client, main_pains, main_desires,
              voice_tone, visual_style, default_cta, created_at
       FROM clients
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [auth.userId]
    );

    const clients = result.rows.map(row => ({
      id: row.id,
      brandName: row.brand_name,
      niche: row.niche,
      subniche: row.subniche,
      idealClient: row.ideal_client,
      mainPains: row.main_pains,
      mainDesires: row.main_desires,
      voiceTone: row.voice_tone,
      visualStyle: row.visual_style,
      defaultCta: row.default_cta,
      createdAt: new Date(row.created_at).getTime(),
    }));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('ERRO AO LISTAR CLIENTES:', error);
    return NextResponse.json({ error: 'Erro ao listar clientes' }, { status: 500 });
  }
}

// POST /api/clients — Create a new client
export async function POST(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido (JSON malformado)' }, { status: 400 });
  }

  const { brandName, niche, subniche, idealClient, mainPains, mainDesires, voiceTone, visualStyle, defaultCta } = body as Record<string, string>;

  if (!brandName || !brandName.trim()) {
    return NextResponse.json({ error: 'Nome da marca é obrigatório' }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO clients (user_id, brand_name, niche, subniche, ideal_client, main_pains, main_desires, voice_tone, visual_style, default_cta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, brand_name, niche, subniche, ideal_client, main_pains, main_desires, voice_tone, visual_style, default_cta, created_at`,
      [
        auth.userId,
        brandName.trim(),
        niche || '',
        subniche || '',
        idealClient || '',
        mainPains || '',
        mainDesires || '',
        voiceTone || 'Descontraído',
        visualStyle || '',
        defaultCta || '',
      ]
    );

    const row = result.rows[0];
    const client = {
      id: row.id,
      brandName: row.brand_name,
      niche: row.niche,
      subniche: row.subniche,
      idealClient: row.ideal_client,
      mainPains: row.main_pains,
      mainDesires: row.main_desires,
      voiceTone: row.voice_tone,
      visualStyle: row.visual_style,
      defaultCta: row.default_cta,
      createdAt: new Date(row.created_at).getTime(),
    };

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR CLIENTE:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar cliente' },
      { status: 500 }
    );
  }
}
