import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
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
