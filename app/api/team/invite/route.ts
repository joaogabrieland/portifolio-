import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { getTeamMemberCount } from '@/lib/usage';
import { PLANS, PlanKey } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Ensure table exists
    await query(`
      CREATE TABLE IF NOT EXISTS team_invites (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Check if user already has an invite token
    const existing = await query(
      'SELECT token FROM team_invites WHERE user_id = $1 LIMIT 1',
      [decoded.userId]
    );

    if (existing.rows.length > 0) {
      const origin = req.nextUrl.origin;
      return NextResponse.json({
        inviteUrl: `${origin}/invite/${existing.rows[0].token}`,
      });
    }

    // Check team member limit before creating NEW token
    const planResult = await query(
      `SELECT s.plan FROM subscriptions s
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC LIMIT 1`,
      [decoded.userId]
    );
    const userPlan = (planResult.rows[0]?.plan as PlanKey) || 'solo';
    const limit = PLANS[userPlan].limits.teamMembers as number;
    const currentCount = await getTeamMemberCount(decoded.userId);

    if (currentCount >= limit) {
      return NextResponse.json({
        error: 'Limite de membros da equipe atingido',
        limit,
        current: currentCount,
        upgradeUrl: '/dashboard/pricing',
      }, { status: 403 });
    }

    // Generate new invite token
    const inviteToken = crypto.randomUUID();
    await query(
      'INSERT INTO team_invites (user_id, token) VALUES ($1, $2)',
      [decoded.userId, inviteToken]
    );

    const origin = req.nextUrl.origin;
    return NextResponse.json({
      inviteUrl: `${origin}/invite/${inviteToken}`,
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('Team invite error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
