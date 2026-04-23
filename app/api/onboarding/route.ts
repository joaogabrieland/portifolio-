import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

// POST /api/onboarding — create a new onboarding form token
export async function POST(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  let body: { clientId?: string; clientName?: string } = {};
  try { body = await req.json(); } catch { /* empty body is OK */ }

  const { clientId, clientName } = body;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    // If clientId provided, verify ownership
    if (clientId) {
      const clientCheck = await query(
        'SELECT id FROM clients WHERE id = $1 AND user_id = $2',
        [clientId, effectiveUserId]
      );
      if (clientCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
      }
    }

    const token = crypto.randomUUID();

    const result = await query(
      `INSERT INTO onboarding_forms (token, user_id, client_id, client_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, token, created_at, expires_at`,
      [token, effectiveUserId, clientId || null, clientName?.trim() || '']
    );

    const row = result.rows[0];
    return NextResponse.json({
      token: row.token,
      url: `/onboarding/${row.token}`,
      expiresAt: row.expires_at,
    }, { status: 201 });
  } catch (error) {
    console.error('ERRO AO CRIAR FORMULÁRIO:', error);
    return NextResponse.json({ error: 'Erro ao criar formulário' }, { status: 500 });
  }
}

// GET /api/onboarding — list all onboarding forms for the producer
export async function GET(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    const result = await query(
      `SELECT of.id, of.token, of.client_id, of.client_name, of.status,
              of.created_at, of.expires_at, of.completed_at,
              c.brand_name
       FROM onboarding_forms of
       LEFT JOIN clients c ON c.id = of.client_id
       WHERE of.user_id = $1
       ORDER BY of.created_at DESC`,
      [effectiveUserId]
    );

    const forms = result.rows.map(row => ({
      id: row.id,
      token: row.token,
      clientId: row.client_id,
      clientName: row.brand_name || row.client_name || 'Novo cliente',
      status: row.status,
      createdAt: new Date(row.created_at).getTime(),
      expiresAt: new Date(row.expires_at).getTime(),
      completedAt: row.completed_at ? new Date(row.completed_at).getTime() : null,
    }));

    return NextResponse.json({ forms });
  } catch (error) {
    console.error('ERRO AO LISTAR FORMULÁRIOS:', error);
    return NextResponse.json({ error: 'Erro ao listar formulários' }, { status: 500 });
  }
}
