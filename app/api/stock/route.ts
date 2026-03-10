import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const UPLOAD_DIR = process.env.STOCK_UPLOAD_DIR || '/data/stock';

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS stock_assets (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('sfx','music')),
      tags TEXT,
      size INT NOT NULL,
      duration_seconds INT DEFAULT 0,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function getAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.split(' ')[1]);
}

// GET — list user's assets, optional ?type=sfx|music
export async function GET(req: NextRequest) {
  try {
    const decoded = getAuth(req);
    if (!decoded) return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });

    await ensureTable();

    const typeFilter = req.nextUrl.searchParams.get('type');
    let sql = 'SELECT * FROM stock_assets WHERE user_id = $1';
    const params: (string | number)[] = [decoded.userId];

    if (typeFilter === 'sfx' || typeFilter === 'music') {
      sql += ' AND type = $2';
      params.push(typeFilter);
    }
    sql += ' ORDER BY uploaded_at DESC';

    const result = await query(sql, params);
    return NextResponse.json({ assets: result.rows });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('GET stock error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST — upload audio file
export async function POST(req: NextRequest) {
  try {
    const decoded = getAuth(req);
    if (!decoded) return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });

    await ensureTable();
    await ensureDir();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;
    const tags = (formData.get('tags') as string) || '';

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Apenas arquivos de áudio são aceitos' }, { status: 400 });
    }
    if (!['sfx', 'music'].includes(type)) {
      return NextResponse.json({ error: 'Tipo deve ser sfx ou music' }, { status: 400 });
    }
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 100MB)' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.mp3';
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const result = await query(
      `INSERT INTO stock_assets (user_id, filename, original_name, type, tags, size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [decoded.userId, filename, file.name, type, tags, file.size]
    );

    return NextResponse.json({ asset: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('POST stock error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE — remove asset by id (passed as ?id=123)
export async function DELETE(req: NextRequest) {
  try {
    const decoded = getAuth(req);
    if (!decoded) return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });

    await ensureTable();

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const result = await query(
      'DELETE FROM stock_assets WHERE id = $1 AND user_id = $2 RETURNING filename',
      [id, decoded.userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Asset não encontrado' }, { status: 404 });
    }

    const filePath = path.join(UPLOAD_DIR, result.rows[0].filename);
    try { await unlink(filePath); } catch { /* file may already be gone */ }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    console.error('DELETE stock error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
