import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const result = await query(
      `SELECT u.name, u.email
       FROM team_invites ti
       JOIN users u ON u.id::text = ti.user_id::text
       WHERE ti.token = $1
       LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Convite não encontrado ou expirado' },
        { status: 404 }
      );
    }

    const producer = result.rows[0];
    return NextResponse.json({ name: producer.name, email: producer.email });
  } catch (error) {
    console.error('Invite lookup error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
