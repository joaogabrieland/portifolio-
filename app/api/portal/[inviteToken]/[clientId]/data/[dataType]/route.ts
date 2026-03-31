import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const VALID_DATA_TYPES = new Set([
  'roteiros', 'entregas', 'meetings', 'invoices', 'metrics',
  'generated_ideas', 'saved_ideas',
]);

/**
 * Public read-only portal API.
 * Authentication: inviteToken identifies the producer; clientId must belong to that producer.
 * No producer JWT required — safe for client-facing sharing.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteToken: string; clientId: string; dataType: string }> }
) {
  const { inviteToken, clientId, dataType } = await params;

  if (!VALID_DATA_TYPES.has(dataType)) {
    return NextResponse.json({ error: `Tipo inválido: "${dataType}"` }, { status: 400 });
  }

  try {
    // 1. Validate inviteToken → resolve producer user_id (check expiration)
    const inviteResult = await query(
      'SELECT user_id FROM team_invites WHERE token = $1 AND expires_at > NOW() LIMIT 1',
      [inviteToken]
    );
    if (inviteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }
    const userId = inviteResult.rows[0].user_id;

    // Update last access timestamp
    await query('UPDATE team_invites SET last_accessed_at = NOW() WHERE token = $1', [inviteToken]);

    // 2. Verify clientId belongs to this producer
    const clientCheck = await query(
      'SELECT id, brand_name FROM clients WHERE id = $1 AND user_id = $2 LIMIT 1',
      [clientId, userId]
    );
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // 3. Return requested data (read-only)
    const result = await query(
      'SELECT data FROM client_data WHERE client_id = $1 AND data_type = $2',
      [clientId, dataType]
    );
    const data = result.rows.length > 0 ? result.rows[0].data : [];
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[portal-api] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
