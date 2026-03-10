import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await query(`
      SELECT u.id, u.name, u.email, u.created_at,
             s.plan, s.status AS subscription_status,
             (SELECT COUNT(*) FROM clients c WHERE c.user_id = u.id) AS client_count
      FROM users u
      LEFT JOIN subscriptions s ON s.user_id = u.id
        AND s.id = (SELECT id FROM subscriptions WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1)
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, email, password, plan } = await req.json();
    if (!name || !email || !password || !plan) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
      [name, email.toLowerCase(), passwordHash]
    );
    const userId = userResult.rows[0].id;

    await query(
      `INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, 'active')`,
      [userId, plan]
    );

    return NextResponse.json({ userId, message: 'User created' }, { status: 201 });
  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
