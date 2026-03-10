import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await params;
    const { plan, status } = await req.json();

    if (plan) {
      await query(
        `UPDATE subscriptions SET plan = $1 WHERE user_id = $2
         AND id = (SELECT id FROM subscriptions WHERE user_id = $2 ORDER BY created_at DESC LIMIT 1)`,
        [plan, userId]
      );
    }
    if (status) {
      await query(
        `UPDATE subscriptions SET status = $1 WHERE user_id = $2
         AND id = (SELECT id FROM subscriptions WHERE user_id = $2 ORDER BY created_at DESC LIMIT 1)`,
        [status, userId]
      );
    }

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('Admin user PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await params;
    await query(
      `UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1
       AND id = (SELECT id FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)`,
      [userId]
    );

    return NextResponse.json({ message: 'Deactivated' });
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
