import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

// ONE-TIME USE: delete this file after running
export async function GET() {
  const email = 'teste@creatorflowia.com';
  const password = 'Miguelzim1@';
  const name = 'Admin';
  const plan = 'agency';

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ message: 'Usuário já existe', email });
    }

    const hash = await bcrypt.hash(password, 12);
    const res = await query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'owner') RETURNING id`,
      [name, email, hash]
    );
    const userId = res.rows[0].id;

    await query(
      `INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, 'active')`,
      [userId, plan]
    );

    return NextResponse.json({ ok: true, email, plan, userId });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
