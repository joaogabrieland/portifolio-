import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PLANS } from '@/lib/plans';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await query(
      `SELECT s.plan, s.status FROM subscriptions s
       WHERE s.user_id = $1 AND s.status IN ('active', 'trial')
       ORDER BY s.created_at DESC LIMIT 1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 });
    }

    const planKey = result.rows[0].plan as keyof typeof PLANS;
    const plan = PLANS[planKey];

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 500 });
    }

    return NextResponse.json({
      plan: planKey,
      name: plan.name,
      limits: plan.limits,
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Plan limits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
