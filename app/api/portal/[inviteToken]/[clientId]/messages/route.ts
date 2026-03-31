import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS client_inbox_messages (
      id SERIAL PRIMARY KEY,
      invite_token TEXT NOT NULL,
      client_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function validateToken(inviteToken: string, clientId: string) {
  const result = await query(
    `SELECT ti.user_id FROM team_invites ti
     JOIN clients c ON c.user_id::text = ti.user_id::text
     WHERE ti.token = $1 AND ti.expires_at > NOW() AND c.id::text = $2 LIMIT 1`,
    [inviteToken, clientId]
  );
  if (result.rows.length > 0) {
    // Update last access timestamp
    await query('UPDATE team_invites SET last_accessed_at = NOW() WHERE token = $1', [inviteToken]);
  }
  return result.rows.length > 0;
}

/**
 * GET — producer reads messages sent by the client.
 * ?peek=true → returns only { count } without marking as read.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ inviteToken: string; clientId: string }> }
) {
  const { inviteToken, clientId } = await params;

  try {
    await ensureTable();
    const valid = await validateToken(inviteToken, clientId);
    if (!valid) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    const peek = req.nextUrl.searchParams.get('peek') === 'true';

    if (peek) {
      const result = await query(
        `SELECT COUNT(*) FROM client_inbox_messages
         WHERE invite_token = $1 AND client_id = $2 AND is_read = false`,
        [inviteToken, clientId]
      );
      return NextResponse.json({ count: parseInt(result.rows[0].count, 10) });
    }

    const result = await query(
      `SELECT id, message, is_read, created_at FROM client_inbox_messages
       WHERE invite_token = $1 AND client_id = $2
       ORDER BY created_at DESC`,
      [inviteToken, clientId]
    );

    // Mark as read
    await query(
      `UPDATE client_inbox_messages SET is_read = true
       WHERE invite_token = $1 AND client_id = $2 AND is_read = false`,
      [inviteToken, clientId]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error('[portal-messages] GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * POST — client sends a message to the producer.
 * Authenticated by inviteToken only (no JWT required).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteToken: string; clientId: string }> }
) {
  const { inviteToken, clientId } = await params;

  try {
    await ensureTable();
    const valid = await validateToken(inviteToken, clientId);
    if (!valid) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    const body = await req.json();
    const message = body.message?.trim();
    if (!message) return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });

    const result = await query(
      `INSERT INTO client_inbox_messages (invite_token, client_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, message, is_read, created_at`,
      [inviteToken, clientId, message]
    );

    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[portal-messages] POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
