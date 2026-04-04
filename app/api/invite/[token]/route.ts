import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const result = await query(
      `SELECT u.name, u.email
       FROM team_invites ti
       JOIN users u ON u.id::text = ti.user_id::text
       WHERE ti.token = $1 AND ti.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link de convite expirado. Solicite um novo convite.' },
        { status: 401 }
      );
    }

    const producer = result.rows[0];
    return NextResponse.json({ name: producer.name, email: producer.email });
  } catch (error) {
    console.error('Invite lookup error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate invite token and get the inviting user (check expiration)
    const inviteResult = await query(
      `SELECT ti.user_id, u.email as producer_email
       FROM team_invites ti
       JOIN users u ON u.id::text = ti.user_id::text
       WHERE ti.token = $1 AND ti.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link de convite expirado. Solicite um novo convite.' },
        { status: 401 }
      );
    }

    const invite = inviteResult.rows[0];

    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Corpo da requisição inválido' },
        { status: 400 }
      );
    }

    const { name, password } = body as { name: string; password: string };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres' }, { status: 400 });
    }

    // Generate a team member email based on the invite token
    // The team member gets an account linked to the producer's team
    const memberEmail = `team_${token.slice(0, 8)}@creatorflow.team`;

    // Check if account already exists for this invite
    const existingUser = await query(
      `SELECT id FROM users WHERE email = $1`,
      [memberEmail]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Conta já criada para este convite. Faça login.' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await query(
      `INSERT INTO users (name, email, password_hash, role, owner_id)
       VALUES ($1, $2, $3, 'member', $4) RETURNING id`,
      [name.trim(), memberEmail, passwordHash, invite.user_id]
    );

    const userId = userResult.rows[0].id;

    // Link this user as a team member of the inviting user
    // Create the team_members table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        owner_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(owner_id, member_id)
      )
    `);

    await query(
      `INSERT INTO team_members (owner_id, member_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (owner_id, member_id) DO NOTHING`,
      [invite.user_id, userId.toString()]
    );

    // Create a free subscription for the team member
    // They inherit access via the team, but need a subscription row for AuthGuard checks
    await query(
      `INSERT INTO subscriptions (user_id, plan, status, current_period_end)
       VALUES ($1, 'solo', 'active', NOW() + INTERVAL '100 years')
       ON CONFLICT DO NOTHING`,
      [userId]
    );

    // Generate JWT
    const jwtToken = signToken({ userId: userId.toString(), email: memberEmail, role: 'member' }, '30d');

    return NextResponse.json({
      token: jwtToken,
      email: memberEmail,
      name: name.trim(),
      plan: 'solo',
    }, { status: 201 });
  } catch (error) {
    console.error('Invite signup error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
