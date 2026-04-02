import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateUser } from '@/lib/auth-helpers';

// PUT /api/team/members/:memberId — Update a team member's cargo
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
      return NextResponse.json({ error: 'Apenas o dono da conta pode alterar cargos' }, { status: 403 });
    }

    const body = await req.json();
    const { cargo } = body as { cargo: string };

    if (!cargo || typeof cargo !== 'string' || cargo.length > 50) {
      return NextResponse.json({ error: 'Cargo inválido' }, { status: 400 });
    }

    // Only update members that belong to this owner
    const result = await query(
      `UPDATE users SET cargo = $1 WHERE id = $2 AND owner_id = $3 RETURNING id, name, email, cargo`,
      [cargo.trim(), memberId, auth.userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ member: result.rows[0] });
  } catch (error) {
    console.error('PUT /api/team/members error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cargo' }, { status: 500 });
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
