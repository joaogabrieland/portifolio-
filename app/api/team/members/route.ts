import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateUser } from '@/lib/auth-helpers';

// GET /api/team/members — List team members for the authenticated owner
export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (auth instanceof NextResponse) return auth;

  try {
    // Get current user's role
    const userResult = await query(
      'SELECT role, owner_id FROM users WHERE id = $1 LIMIT 1',
      [auth.userId]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const ownerId = user.role === 'member' && user.owner_id ? user.owner_id : auth.userId;

    // Fetch all members belonging to this owner + the owner themselves
    const result = await query(
      `SELECT id, name, email, role, cargo, created_at
       FROM users
       WHERE id = $1 OR owner_id = $1
       ORDER BY role ASC, created_at ASC`,
      [ownerId]
    );

    const members = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      cargo: row.cargo || 'Membro',
      isOwner: row.role === 'owner',
      joinedAt: new Date(row.created_at).getTime(),
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('GET /api/team/members error:', error);
    return NextResponse.json({ error: 'Erro ao listar membros' }, { status: 500 });
  }
}
