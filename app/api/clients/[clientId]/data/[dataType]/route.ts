import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

const VALID_DATA_TYPES = new Set([
  'kanban', 'archive', 'agenda', 'roteiros', 'storyboard_usage',
  'entregas', 'meetings', 'invoices', 'metrics',
  'generated_ideas', 'saved_ideas',
]);

// GET /api/clients/:clientId/data/:dataType
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; dataType: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { clientId, dataType } = await params;

  if (!VALID_DATA_TYPES.has(dataType)) {
    console.error(`[AUDITORIA HUB] GET /api/clients/${clientId}/data/${dataType}: tipo inválido solicitado`);
    return NextResponse.json({ error: `Tipo de dado inválido: "${dataType}"` }, { status: 400 });
  }

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    // Verify client ownership (members access their owner's clients)
    const clientCheck = await query(
      'SELECT id FROM clients WHERE id = $1 AND user_id = $2',
      [clientId, effectiveUserId]
    );
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const result = await query(
      'SELECT data FROM client_data WHERE client_id = $1 AND data_type = $2',
      [clientId, dataType]
    );

    const data = result.rows.length > 0 ? result.rows[0].data : [];
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`[AUDITORIA HUB] GET /api/clients/${clientId}/data/${dataType} FALHOU:`, error);
    return NextResponse.json({ error: `Erro ao carregar ${dataType}` }, { status: 500 });
  }
}

// PUT /api/clients/:clientId/data/:dataType
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string; dataType: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { clientId, dataType } = await params;

  if (!VALID_DATA_TYPES.has(dataType)) {
    console.error(`[AUDITORIA HUB] PUT /api/clients/${clientId}/data/${dataType}: tipo inválido — dado DESCARTADO`);
    return NextResponse.json({ error: `Tipo de dado inválido: "${dataType}"` }, { status: 400 });
  }

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    // Verify client ownership (members access their owner's clients)
    const clientCheck = await query(
      'SELECT id FROM clients WHERE id = $1 AND user_id = $2',
      [clientId, effectiveUserId]
    );
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { data } = body;

    if (data === undefined) {
      console.error(`[AUDITORIA HUB] PUT /api/clients/${clientId}/data/${dataType}: campo "data" ausente no payload`);
      return NextResponse.json({ error: 'Campo "data" é obrigatório' }, { status: 400 });
    }

    const serialized = JSON.stringify(data);

    await query(
      `INSERT INTO client_data (client_id, user_id, data_type, data)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (client_id, data_type)
       DO UPDATE SET data = $4::jsonb, updated_at = NOW()`,
      [clientId, effectiveUserId, dataType, serialized]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[AUDITORIA HUB] PUT /api/clients/${clientId}/data/${dataType} FALHOU — dado NÃO SALVO:`, error);
    return NextResponse.json({ error: `Erro ao salvar ${dataType}` }, { status: 500 });
  }
}
