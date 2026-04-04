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

    // Ensure table exists with expiration and access tracking columns
    await query(`
      CREATE TABLE IF NOT EXISTS team_invites (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
        last_accessed_at TIMESTAMPTZ
      )
    `);
    // Add columns if table already exists without them
    await query(`ALTER TABLE team_invites ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')`);
    await query(`ALTER TABLE team_invites ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ`);

    // Check if user already has a non-expired invite token
    const existing = await query(
      'SELECT token, expires_at FROM team_invites WHERE user_id = $1 AND expires_at > NOW() LIMIT 1',
      [decoded.userId]
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorflowia.com';

    if (existing.rows.length > 0) {
      return NextResponse.json({
        inviteUrl: `${baseUrl}/invite/${existing.rows[0].token}`,
        expiresAt: existing.rows[0].expires_at,
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

    // Generate new invite token with 7-day expiration
    const inviteToken = crypto.randomUUID();
    const result = await query(
      `INSERT INTO team_invites (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING expires_at`,
      [decoded.userId, inviteToken]
    );

    return NextResponse.json({
      inviteUrl: `${baseUrl}/invite/${inviteToken}`,
      expiresAt: result.rows[0].expires_at,
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('Team invite error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
