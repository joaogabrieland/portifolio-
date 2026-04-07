import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

interface InvoiceRow { amount: number; status: string; }

// GET /api/clients/bi
// Returns aggregated financial data across all clients for the authenticated user.
export async function GET(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    // Fetch all client IDs for this user
    const clientsResult = await query(
      'SELECT id FROM clients WHERE user_id = $1',
      [effectiveUserId]
    );

    const clientIds: string[] = clientsResult.rows.map((r: { id: string }) => r.id);

    if (clientIds.length === 0) {
      return NextResponse.json({ totalReceived: 0, totalPending: 0 });
    }

    // Fetch all invoice data for those clients in a single query
    const placeholders = clientIds.map((_, i) => `$${i + 1}`).join(', ');
    const invoicesResult = await query(
      `SELECT data FROM client_data
       WHERE client_id IN (${placeholders}) AND data_type = 'invoices'`,
      clientIds
    );

    let totalReceived = 0;
    let totalPending = 0;

    for (const row of invoicesResult.rows) {
      const invoices: InvoiceRow[] = Array.isArray(row.data) ? row.data : [];
      for (const inv of invoices) {
        if (typeof inv.amount !== 'number') continue;
        if (inv.status === 'pago') {
          totalReceived += inv.amount;
        } else if (inv.status === 'pendente' || inv.status === 'atrasado') {
          totalPending += inv.amount;
        }
      }
    }

    return NextResponse.json({ totalReceived, totalPending });
  } catch (error) {
    console.error('[BI] GET /api/clients/bi FALHOU:', error);
    return NextResponse.json({ error: 'Erro ao calcular dados financeiros' }, { status: 500 });
  }
}
