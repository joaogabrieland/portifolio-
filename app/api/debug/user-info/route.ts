import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, resolveOwnerId } from '@/lib/auth-helpers';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (auth instanceof NextResponse) return auth;

  try {
    // Get user info
    const userResult = await query(
      'SELECT id, email, name, role, owner_id FROM users WHERE id = $1 LIMIT 1',
      [auth.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const effectiveOwnerId = await resolveOwnerId(auth.userId);

    // Get team member info if applicable
    let teamMemberInfo = null;
    if (user.role === 'member') {
      const tmResult = await query(
        'SELECT role as team_role FROM team_members WHERE member_id = $1 LIMIT 1',
        [auth.userId]
      );
      teamMemberInfo = tmResult.rows[0] || null;
    }

    // Check how many clients owner has
    const clientsResult = await query(
      'SELECT COUNT(*) as count FROM clients WHERE user_id = $1',
      [effectiveOwnerId]
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        owner_id: user.owner_id,
      },
      effectiveOwnerId,
      teamMember: teamMemberInfo,
      ownerClientCount: clientsResult.rows[0].count,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Erro ao obter informações', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
