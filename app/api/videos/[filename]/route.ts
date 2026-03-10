import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.VIDEO_UPLOAD_DIR || '/data/videos';

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Sanitize: only allow uuid-style filenames with extension
    if (!/^[a-f0-9-]+\.\w+$/.test(filename)) {
      return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    // Check file exists
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Video serve error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
