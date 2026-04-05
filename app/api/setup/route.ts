import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/db/migrate';

/**
 * POST /api/setup — Run database migrations
 * Only intended for development/initialization
 */
export async function POST() {
  try {
    await runMigrations();
    return NextResponse.json({
      status: 'success',
      message: 'Migrations completed',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Erro ao executar migrations', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/setup — Check if migrations have been run
 */
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to run migrations',
    example: 'curl -X POST http://localhost:3000/api/setup',
  });
}
