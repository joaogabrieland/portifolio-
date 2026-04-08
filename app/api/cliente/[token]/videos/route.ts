import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { query } from '@/lib/db';

// Allow up to 500MB uploads
export const runtime = 'nodejs';
export const maxDuration = 120;
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { checkStorageLimit } from '@/lib/usage';
import { PlanKey } from '@/lib/plans';

const UPLOAD_DIR = process.env.VIDEO_UPLOAD_DIR || '/data/videos';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS client_videos (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente',
      uploaded_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `);
}

async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

async function cleanupExpired() {
  try {
    const expired = await query(
      'SELECT id, filename FROM client_videos WHERE expires_at < NOW()'
    );
    for (const row of expired.rows) {
      const filePath = path.join(UPLOAD_DIR, row.filename);
      try { await unlink(filePath); } catch { /* file may already be gone */ }
    }
    if (expired.rows.length > 0) {
      await query('DELETE FROM client_videos WHERE expires_at < NOW()');
    }
  } catch (err) {
    console.error('Video cleanup error:', err);
  }
}

// GET — public, list videos for this token
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await ensureTable();
    await cleanupExpired();

    const invite = await query(
      'SELECT id FROM team_invites WHERE token = $1 LIMIT 1',
      [token]
    );
    if (invite.rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    const result = await query(
      `SELECT id, filename, original_name, size, status, uploaded_at, expires_at
       FROM client_videos
       WHERE token = $1
       ORDER BY uploaded_at DESC`,
      [token]
    );

    return NextResponse.json({ videos: result.rows });
  } catch (error) {
    console.error('GET client videos error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST — authenticated, producer uploads video
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const decoded = verifyToken(jwt);

    await ensureTable();
    await ensureUploadDir();
    await cleanupExpired();

    const invite = await query(
      'SELECT id FROM team_invites WHERE token = $1 AND user_id = $2 LIMIT 1',
      [token, decoded.userId]
    );
    if (invite.rows.length === 0) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validate it's a video
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Apenas arquivos de vídeo são aceitos' }, { status: 400 });
    }

    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 500MB)' }, { status: 400 });
    }

    // Check storage limit
    const planResult = await query(
      `SELECT s.plan FROM subscriptions s
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.created_at DESC LIMIT 1`,
      [decoded.userId]
    );
    const userPlan = (planResult.rows[0]?.plan as PlanKey) || 'solo';

    const storageCheck = await checkStorageLimit(decoded.userId, userPlan, file.size);
    if (!storageCheck.allowed) {
      return NextResponse.json({
        error: storageCheck.limitBytes === 0
          ? 'Armazenamento não incluso no seu plano.'
          : 'Limite de armazenamento atingido',
        limit: storageCheck.limitBytes,
        current: storageCheck.usedBytes,
        upgradeUrl: '/dashboard/pricing',
      }, { status: 403 });
    }

    const ext = path.extname(file.name) || '.mp4';
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS).toISOString();

    const result = await query(
      `INSERT INTO client_videos (token, filename, original_name, size, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, filename, original_name, size, status, uploaded_at, expires_at`,
      [token, filename, file.name, file.size, expiresAt]
    );

    return NextResponse.json({ video: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('POST client videos error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH — public, client approves/rejects
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    await ensureTable();

    const invite = await query(
      'SELECT id FROM team_invites WHERE token = $1 LIMIT 1',
      [token]
    );
    if (invite.rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    const body = await req.json();
    const { videoId, status } = body;
    if (!videoId || !['aprovado', 'rejeitado'].includes(status)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const result = await query(
      `UPDATE client_videos SET status = $1
       WHERE id = $2 AND token = $3
       RETURNING id, status`,
      [status, videoId, token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ video: result.rows[0] });
  } catch (error) {
    console.error('PATCH client videos error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
