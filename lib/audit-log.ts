import { query } from '@/lib/db';

export type SecurityEvent =
  | 'login_success'
  | 'login_failed'
  | 'login_blocked'
  | 'invite_invalid'
  | 'invite_expired'
  | 'unauthorized_access'
  | 'plan_limit_exceeded';

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS security_audit_log (
      id SERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      user_id TEXT,
      ip_address TEXT NOT NULL,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tableEnsured = true;
}

/**
 * Log a security event to the database.
 * Fire-and-forget — never blocks the request or throws.
 */
export async function logSecurityEvent(
  event: SecurityEvent,
  userId: string | null,
  ip: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await ensureTable();
    await query(
      `INSERT INTO security_audit_log (event, user_id, ip_address, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [event, userId, ip, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    // Never let audit logging break a request
    console.error('Audit log write failed:', err);
  }
}
