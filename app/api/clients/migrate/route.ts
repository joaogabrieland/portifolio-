import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated } from '@/lib/auth-helpers';

const VALID_DATA_TYPES = [
  'kanban', 'agenda', 'roteiros', 'entregas',
  'meetings', 'invoices', 'metrics', 'saved_ideas',
] as const;

interface MigrationClient {
  id: string;
  brandName: string;
  niche: string;
  subniche: string;
  idealClient: string;
  mainPains: string;
  mainDesires: string;
  voiceTone: string;
  visualStyle: string;
  defaultCta: string;
  createdAt: number;
  subData?: Record<string, unknown>;
}

// POST /api/clients/migrate — Bulk migrate localStorage data to DB
export async function POST(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  try {
    const body = await req.json();
    const { clients } = body as { clients: MigrationClient[] };

    if (!Array.isArray(clients) || clients.length === 0) {
      return NextResponse.json({ migrated: true, count: 0 });
    }

    let count = 0;

    for (const c of clients) {
      if (!c.brandName?.trim()) continue;

      // Insert client (ON CONFLICT by id DO NOTHING for idempotency)
      const insertResult = await query(
        `INSERT INTO clients (id, user_id, brand_name, niche, subniche, ideal_client, main_pains, main_desires, voice_tone, visual_style, default_cta, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp($12 / 1000.0))
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [
          c.id,
          auth.userId,
          c.brandName.trim(),
          c.niche || '',
          c.subniche || '',
          c.idealClient || '',
          c.mainPains || '',
          c.mainDesires || '',
          c.voiceTone || 'Descontraído',
          c.visualStyle || '',
          c.defaultCta || '',
          c.createdAt || Date.now(),
        ]
      );

      if (insertResult.rowCount === 0) continue; // Already migrated
      count++;

      // Insert sub-data if present
      if (c.subData) {
        for (const dataType of VALID_DATA_TYPES) {
          const data = c.subData[dataType];
          if (data !== undefined && data !== null) {
            await query(
              `INSERT INTO client_data (client_id, user_id, data_type, data)
               VALUES ($1, $2, $3, $4::jsonb)
               ON CONFLICT (client_id, data_type) DO NOTHING`,
              [c.id, auth.userId, dataType, JSON.stringify(data)]
            );
          }
        }
      }
    }

    return NextResponse.json({ migrated: true, count });
  } catch (error) {
    console.error('POST /api/clients/migrate error:', error);
    return NextResponse.json({ error: 'Erro ao migrar dados' }, { status: 500 });
  }

}
