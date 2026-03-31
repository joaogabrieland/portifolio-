import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Rate limit for public GET endpoint: 30 requests per minute per IP
const messageRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MSG_RATE_LIMIT_WINDOW = 60 * 1000;
const MSG_RATE_LIMIT_MAX = 30;

function checkMessageRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = messageRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    messageRateLimitMap.set(ip, { count: 1, resetTime: now + MSG_RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= MSG_RATE_LIMIT_MAX;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of messageRateLimitMap) {
    if (now > value.resetTime) messageRateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

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
    // Rate limit check
    const ip = _req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || _req.headers.get('x-real-ip') || 'unknown';
    if (!checkMessageRateLimit(ip)) {
      return NextResponse.json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' }, { status: 429 });
    }

    const { token } = await params;
    await ensureTable();

    // Validate token exists and is not expired
    const invite = await query(
      'SELECT id FROM team_invites WHERE token = $1 AND expires_at > NOW() LIMIT 1',
      [token]
    );
    if (invite.rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 404 });
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
