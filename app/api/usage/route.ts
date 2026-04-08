import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUsageSummary } from '@/lib/usage';
import { PlanKey } from '@/lib/plans';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const result = await query(
      `SELECT s.plan FROM subscriptions s
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC LIMIT 1`,
      [decoded.userId]
    );

    // Default to 'solo' plan when no active subscription
    const plan = (result.rows[0]?.plan as PlanKey) || 'solo';

    let usage;
    try {
      usage = await getUsageSummary(decoded.userId, plan);
    } catch (err) {
      console.error('getUsageSummary error (returning safe defaults):', err);
      usage = {
        features: {
          script_generator: { used: 0, limit: 0, remaining: 0, percentage: 0 },
          proposals: { used: 0, limit: 0, remaining: 0, percentage: 0 },
          image_analysis: { used: 0, limit: 0, remaining: 0, percentage: 0 },
          storyboard: { used: 0, limit: 0, remaining: 0, percentage: 0 },
        },
        storage: { usedBytes: 0, limitBytes: 0, percentage: 0 },
      };
    }

    return NextResponse.json({
      plan,
      ...usage,
    });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
