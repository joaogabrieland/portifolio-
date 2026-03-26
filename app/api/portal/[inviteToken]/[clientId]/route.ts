import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Returns basic client + producer info for the public portal header.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteToken: string; clientId: string }> }
) {
  const { inviteToken, clientId } = await params;

  try {
    // Validate token → get producer
    const inviteResult = await query(
      `SELECT ti.user_id, u.name as producer_name
       FROM team_invites ti
       JOIN users u ON u.id::text = ti.user_id::text
       WHERE ti.token = $1 LIMIT 1`,
      [inviteToken]
    );
    if (inviteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const { user_id: userId, producer_name: producerName } = inviteResult.rows[0];

    // Get client info
    const clientResult = await query(
      `SELECT id, brand_name, niche FROM clients WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [clientId, userId]
    );
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }
    const client = clientResult.rows[0];

    return NextResponse.json({
      producerName,
      clientId: client.id,
      brandName: client.brand_name,
      niche: client.niche,
    });
  } catch (error) {
    console.error('[portal-info] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
