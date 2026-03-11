import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { PLANS, PlanKey } from '@/lib/stripe';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export type AuthResult =
  | { userId: string; plan: PlanKey }
  | NextResponse;

/**
 * Extracts userId from Bearer token and verifies the user has an active
 * subscription with CRM access (Maker, Studio, or Agency).
 */
export async function authenticateAndCheckCRM(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await query(
      `SELECT s.plan FROM subscriptions s
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC LIMIT 1`,
      [decoded.userId]
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
