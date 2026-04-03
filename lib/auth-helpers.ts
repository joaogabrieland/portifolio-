import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { PLANS, PlanKey } from '@/lib/stripe';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logSecurityEvent } from '@/lib/audit-log';

export type AuthResult =
  | { userId: string; plan: PlanKey }
  | NextResponse;

/**
 * Extracts userId from Bearer token and verifies the user has an active
 * subscription with CRM access (Maker, Studio, or Agency).
 */
function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function authenticateAndCheckCRM(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    logSecurityEvent('unauthorized_access', null, getIp(req), { path: req.nextUrl.pathname, reason: 'no_token' });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // For members, check their owner's subscription (members inherit CRM access)
    const effectiveUserId = await resolveOwnerId(decoded.userId);

    const result = await query(
      `SELECT s.plan FROM subscriptions s
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC LIMIT 1`,
      [effectiveUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa' }, { status: 403 });
    }

    const plan = result.rows[0].plan as PlanKey;
    const planData = PLANS[plan];

    if (!planData || !planData.limits.crm) {
      return NextResponse.json(
        { error: 'CRM não disponível no plano atual. Faça upgrade para o plano Maker ou superior.' },
        { status: 403 }
      );
    }

    return { userId: decoded.userId, plan };
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      logSecurityEvent('unauthorized_access', null, getIp(req), { path: req.nextUrl.pathname, reason: 'invalid_token' });
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('Auth helper error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/** Type guard: check if the result is a successful auth (not an error response) */
export function isAuthenticated(result: AuthResult): result is { userId: string; plan: PlanKey } {
  return !(result instanceof NextResponse);
}

/**
 * Resolve the effective data-owner ID.
 * Owners get their own ID back; members get their owner_id (the account that invited them).
 */
export async function resolveOwnerId(userId: string): Promise<string> {
  const r = await query(
    'SELECT role, owner_id FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  if (r.rows.length > 0 && r.rows[0].role === 'member' && r.rows[0].owner_id) {
    return r.rows[0].owner_id;
  }
  return userId;
}

/**
 * Simple auth: extracts userId from Bearer token without CRM plan check.
 * Useful for generic user data endpoints.
 */
export async function authenticateUser(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('Auth helper error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
