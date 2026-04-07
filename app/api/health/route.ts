import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/init-db';
import pool from '@/lib/db';

export async function GET() {
  // Initialize database on first health check (lightweight, idempotent)
  await initializeDatabase();

  // Database (Supabase) connectivity check
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs: number | null = null;
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    dbLatencyMs = Date.now() - start;
  } catch {
    dbStatus = 'error';
  }

  const allOk = dbStatus === 'ok';

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latency_ms: dbLatencyMs,
          provider: 'supabase',
        },
      },
    },
    { status: allOk ? 200 : 503 }
  );
}
