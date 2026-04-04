import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logSecurityEvent } from '@/lib/audit-log';

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function GET(req: NextRequest) {
  try {
    const ip = getIp(req);
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    // Check if token exists at all (to distinguish invalid from expired)
    const existsCheck = await query(
      'SELECT expires_at FROM team_invites WHERE token = $1 LIMIT 1',
      [token]
    );

    if (existsCheck.rows.length === 0) {
      logSecurityEvent('invite_invalid', null, ip, { token: token.slice(0, 8) + '...' });
      return NextResponse.json(
        { error: 'Convite não encontrado ou expirado' },
        { status: 404 }
      );
    }

    const isExpired = new Date(existsCheck.rows[0].expires_at) <= new Date();
    if (isExpired) {
      logSecurityEvent('invite_expired', null, ip, { token: token.slice(0, 8) + '...' });
      return NextResponse.json(
        { error: 'Link de convite expirado. Solicite um novo convite.' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT u.name as agency_name
       FROM team_invites ti
       JOIN users u ON u.id::text = ti.user_id::text
       WHERE ti.token = $1 AND ti.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0) {
      logSecurityEvent('invite_invalid', null, ip, { token: token.slice(0, 8) + '...' });
      return NextResponse.json(
        { error: 'Convite não encontrado ou expirado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      agencyName: result.rows[0].agency_name,
    });
  } catch (error) {
    console.error('Invite validate error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
