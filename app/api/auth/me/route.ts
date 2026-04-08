import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.owner_id,
              s.plan, s.status as subscription_status, s.current_period_end, s.cancel_at_period_end
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status IN ('active', 'trial')
       WHERE u.id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = result.rows[0];

    // For members, get their team role from team_members table
    let teamRole = null;
    if (user.role === 'member' && user.owner_id) {
      const teamResult = await query(
        `SELECT role FROM team_members WHERE member_id = $1 AND owner_id = $2 LIMIT 1`,
        [user.id.toString(), user.owner_id]
      );
      if (teamResult.rows.length > 0) {
        teamRole = teamResult.rows[0].role;
      }
    }

    // Determine final role: owner | admin | member
    let finalRole = user.role || 'owner';
    if (user.role === 'member' && teamRole === 'admin') {
      finalRole = 'admin';
    } else if (user.role === 'member') {
      finalRole = 'member';
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: finalRole,
        plan: user.plan,
        subscriptionStatus: user.subscription_status || 'inactive',
        currentPeriodEnd: user.current_period_end,
        cancelAtPeriodEnd: user.cancel_at_period_end,
      },
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('Auth /me error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
