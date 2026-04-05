import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateUser } from '@/lib/auth-helpers';

// PUT /api/team/members/:memberId — Update a team member's cargo and/or role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const auth = await authenticateUser(req);
  if (auth instanceof NextResponse) return auth;

  const { memberId } = await params;

  try {
    // Verify caller is an owner
    const callerResult = await query(
      'SELECT role FROM users WHERE id = $1 LIMIT 1',
      [auth.userId]
    );
    if (callerResult.rows.length === 0 || callerResult.rows[0].role !== 'owner') {
      return NextResponse.json({ error: 'Apenas o dono da conta pode alterar cargos e roles' }, { status: 403 });
    }

    const body = await req.json();
    const { cargo, role } = body as { cargo?: string; role?: 'admin' | 'member' };

    if (cargo && (typeof cargo !== 'string' || cargo.length > 50)) {
      return NextResponse.json({ error: 'Cargo inválido' }, { status: 400 });
    }

    if (role && !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Role inválida' }, { status: 400 });
    }

    // Verify member exists and belongs to this owner
    const memberResult = await query(
      `SELECT id FROM users WHERE id = $1 AND owner_id = $2 LIMIT 1`,
      [memberId, auth.userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    // Update cargo if provided
    if (cargo) {
      await query(
        `UPDATE users SET cargo = $1 WHERE id = $2`,
        [cargo.trim(), memberId]
      );
    }

    // Update team role if provided
    if (role) {
      await query(
        `UPDATE team_members SET role = $1 WHERE member_id = $2 AND owner_id = $3`,
        [role, memberId, auth.userId]
      );
    }

    // Return updated member info
    const result = await query(
      `SELECT u.id, u.name, u.email, u.cargo, tm.role as team_role
       FROM users u
       LEFT JOIN team_members tm ON tm.member_id = u.id::text AND tm.owner_id = $1
       WHERE u.id = $2`,
      [auth.userId, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        cargo: result.rows[0].cargo,
        teamRole: result.rows[0].team_role || 'member',
      }
    });
  } catch (error) {
    console.error('PUT /api/team/members error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar membro' }, { status: 500 });
  }
}

// DELETE /api/team/members/:memberId — Remove a team member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const auth = await authenticateUser(req);
  if (auth instanceof NextResponse) return auth;

  const { memberId } = await params;

  try {
    // Verify caller is an owner
    const callerResult = await query(
      'SELECT role FROM users WHERE id = $1 LIMIT 1',
      [auth.userId]
    );
    if (callerResult.rows.length === 0 || callerResult.rows[0].role !== 'owner') {
      return NextResponse.json({ error: 'Apenas o dono da conta pode remover membros' }, { status: 403 });
    }

    // Only delete members that belong to this owner
    const result = await query(
      'DELETE FROM users WHERE id = $1 AND owner_id = $2',
      [memberId, auth.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    // Also clean up team_members table
    await query(
      'DELETE FROM team_members WHERE member_id = $1 AND owner_id = $2',
      [memberId, auth.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/team/members error:', error);
    return NextResponse.json({ error: 'Erro ao remover membro' }, { status: 500 });
  }
}
