import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Ensure table exists (runs once per cold start effectively)
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS client_messages (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// GET — public, returns messages for a given invite token
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await ensureTable();

    // Validate token exists
    const invite = await query(
      'SELECT id FROM team_invites WHERE token = $1 LIMIT 1',
      [token]
    );
    if (invite.rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    const result = await query(
      'SELECT id, message, created_at FROM client_messages WHERE token = $1 ORDER BY created_at DESC',
      [token]
    );

    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error('GET client messages error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST — authenticated, only the producer who owns the token can post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const decoded = verifyToken(jwt);

    await ensureTable();

    // Verify this invite token belongs to the authenticated user
    const invite = await query(
      'SELECT id FROM team_invites WHERE token = $1 AND user_id = $2 LIMIT 1',
      [token, decoded.userId]
    );
    if (invite.rows.length === 0) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO client_messages (token, message) VALUES ($1, $2) RETURNING id, message, created_at',
      [token, message]
    );

    return NextResponse.json({ message: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('POST client messages error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
