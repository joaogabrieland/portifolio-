import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/init-db';

export async function GET() {
  // Initialize database on first health check (lightweight, idempotent)
  await initializeDatabase();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
