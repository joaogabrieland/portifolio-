import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ dataType: string }> }) {
  const auth = await authenticateUser(req);
  if (auth instanceof NextResponse) return auth;

  const { dataType } = await params;

  try {
    const result = await query(
      'SELECT data FROM user_data WHERE user_id = $1 AND data_type = $2',
      [auth.userId, dataType]
    );
    return NextResponse.json({ data: result.rows[0]?.data ?? null });
  } catch (error) {
    console.error(`[AUDITORIA HUB] GET /api/user-data/${dataType} FALHOU:`, error);
    return NextResponse.json({ error: `Erro ao carregar ${dataType}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ dataType: string }> }) {
  const auth = await authenticateUser(req);
  if (auth instanceof NextResponse) return auth;

  const { dataType } = await params;

  try {
    const { data } = await req.json();

    if (data === undefined) {
      console.error(`[AUDITORIA HUB] PUT /api/user-data/${dataType}: campo "data" ausente no payload`);
      return NextResponse.json({ error: 'Campo "data" é obrigatório' }, { status: 400 });
    }

    await query(
      `INSERT INTO user_data (user_id, data_type, data, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (user_id, data_type)
       DO UPDATE SET data = $3::jsonb, updated_at = NOW()`,
      [auth.userId, dataType, JSON.stringify(data)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[AUDITORIA HUB] PUT /api/user-data/${dataType} FALHOU — dado NÃO SALVO:`, error);
    return NextResponse.json({ error: `Erro ao salvar ${dataType}` }, { status: 500 });
  }
}
