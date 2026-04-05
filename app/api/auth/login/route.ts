import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { logSecurityEvent } from '@/lib/audit-log';

// Per-email brute force protection
const loginAttemptsMap = new Map<string, { count: number; firstAttempt: number }>();
const LOGIN_LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 10;

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttemptsMap) {
    if (now - value.firstAttempt > LOGIN_LOCKOUT_WINDOW) loginAttemptsMap.delete(key);
  }
}, 5 * 60 * 1000);

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    // Check per-email brute force lockout
    const emailKey = email.toLowerCase().trim();
    const attempts = loginAttemptsMap.get(emailKey);
    if (attempts) {
      const elapsed = Date.now() - attempts.firstAttempt;
      if (elapsed > LOGIN_LOCKOUT_WINDOW) {
        loginAttemptsMap.delete(emailKey);
      } else if (attempts.count >= LOGIN_MAX_ATTEMPTS) {
        logSecurityEvent('login_blocked', null, ip, { email: emailKey });
        return NextResponse.json(
          { error: 'Conta temporariamente bloqueada. Tente novamente em 15 minutos.' },
          { status: 429 }
        );
      }
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.stripe_customer_id,
              s.plan, s.status as subscription_status, s.current_period_end
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       WHERE u.email = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      const entry = loginAttemptsMap.get(emailKey);
      if (entry) { entry.count++; } else { loginAttemptsMap.set(emailKey, { count: 1, firstAttempt: Date.now() }); }
      logSecurityEvent('login_failed', null, ip, { email: emailKey, reason: 'user_not_found' });
      await delay(500);
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const entry = loginAttemptsMap.get(emailKey);
      if (entry) { entry.count++; } else { loginAttemptsMap.set(emailKey, { count: 1, firstAttempt: Date.now() }); }
      logSecurityEvent('login_failed', user.id, ip, { email: emailKey, reason: 'wrong_password' });
      await delay(500);
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    // Successful login — reset failed attempts counter
    loginAttemptsMap.delete(emailKey);
    logSecurityEvent('login_success', user.id, ip, { email: emailKey });

    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = signToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan || null,
        role: user.role || 'owner',
        subscriptionStatus: user.subscription_status || 'inactive',
      },
      '7d'
    );

    // Allow login even with inactive subscription — frontend handles redirect
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan || null,
        role: user.role || 'owner',
        subscriptionStatus: user.subscription_status || 'inactive',
        currentPeriodEnd: user.current_period_end,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Login error:', errorMessage);
    console.error('Full error:', error);
    return NextResponse.json({ error: 'Erro ao fazer login', details: errorMessage }, { status: 500 });
  }
}
