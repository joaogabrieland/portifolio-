import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

// GET /api/onboarding/client/[clientId] — get the most recent completed form for a client
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { clientId } = await params;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    // Verify client ownership
    const clientCheck = await query(
      'SELECT id, brand_name FROM clients WHERE id = $1 AND user_id = $2',
      [clientId, effectiveUserId]
    );
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const result = await query(
      `SELECT token, form_data, completed_at, acknowledged_at, client_name
       FROM onboarding_forms
       WHERE client_id = $1 AND user_id = $2 AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT 1`,
      [clientId, effectiveUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ form: null });
    }

    const row = result.rows[0];
    return NextResponse.json({
      form: {
        token: row.token,
        formData: row.form_data,
        completedAt: new Date(row.completed_at).getTime(),
        acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at).getTime() : null,
        clientName: clientCheck.rows[0].brand_name || row.client_name,
      },
    });
  } catch (error) {
    console.error('ERRO AO BUSCAR FORMULÁRIO DO CLIENTE:', error);
    return NextResponse.json({ error: 'Erro ao buscar formulário' }, { status: 500 });
  }
}
