import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

interface InvoiceRow { amount: number; status: string; dueDate?: string; }
interface KanbanCol  { id: string; cards: unknown[]; }

const FUNNEL_IDS = ['preproducao', 'gravar', 'edicao', 'aprovacao', 'finalizado'] as const;

// GET /api/clients/bi
export async function GET(req: NextRequest) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);

    const clientsResult = await query(
      'SELECT id FROM clients WHERE user_id = $1',
      [effectiveUserId]
    );
    const clientIds: string[] = clientsResult.rows.map((r: { id: string }) => r.id);

    if (clientIds.length === 0) {
      return NextResponse.json({
        totalReceived: 0, totalPending: 0,
        renewals: [], topClients: [],
        funnelCounts: Object.fromEntries(FUNNEL_IDS.map(id => [id, 0])),
      });
    }

    // Single query fetches both invoices and kanban data
    const placeholders = clientIds.map((_, i) => `$${i + 1}`).join(', ');
    const dataResult = await query(
      `SELECT cd.data, cd.data_type, c.brand_name
       FROM client_data cd
       JOIN clients c ON c.id = cd.client_id
       WHERE cd.client_id IN (${placeholders}) AND cd.data_type IN ('invoices', 'kanban')`,
      clientIds
    );

    // Date helpers
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];
    const in30 = new Date(now);
    in30.setDate(now.getDate() + 30);
    const in30Str = in30.toISOString().split('T')[0];

    // Aggregations
    let totalReceived = 0;
    let totalPending = 0;
    const renewals: { clientName: string; dueDate: string; daysLeft: number; amount: number }[] = [];
    const paidByClient = new Map<string, number>();
    const funnelCounts: Record<string, number> = Object.fromEntries(FUNNEL_IDS.map(id => [id, 0]));

    for (const row of dataResult.rows) {
      const clientName: string = row.brand_name ?? '';

      if (row.data_type === 'invoices') {
        const invoices: InvoiceRow[] = Array.isArray(row.data) ? row.data : [];
        for (const inv of invoices) {
          if (typeof inv.amount !== 'number') continue;
          const due = inv.dueDate ?? '';

          // Faturamento: filter by current month
          if (due >= monthStart && due <= monthEnd) {
            if (inv.status === 'pago') {
              totalReceived += inv.amount;
            } else if (inv.status === 'pendente' || inv.status === 'atrasado') {
              totalPending += inv.amount;
            }
          }

          // Vencimentos próximos: unpaid, due in next 30 days
          if ((inv.status === 'pendente' || inv.status === 'atrasado') && due >= todayStr && due <= in30Str) {
            const daysLeft = Math.round((new Date(due).getTime() - now.getTime()) / 86_400_000);
            renewals.push({ clientName, dueDate: due, daysLeft, amount: inv.amount });
          }

          // Top clientes: all-time paid invoices
          if (inv.status === 'pago') {
            paidByClient.set(clientName, (paidByClient.get(clientName) ?? 0) + inv.amount);
          }
        }
      }

      if (row.data_type === 'kanban') {
        const rawData = row.data;
        // Normalize: handle both array and possible wrapped formats
        const cols: KanbanCol[] = Array.isArray(rawData)
          ? rawData
          : (rawData && Array.isArray((rawData as Record<string, unknown>).columns))
            ? (rawData as Record<string, unknown>).columns as KanbanCol[]
            : [];

        console.log(`[BI] kanban client=${clientName} rawIsArray=${Array.isArray(rawData)} cols=${cols.length}`,
          cols.map(c => ({ id: c.id, cards: Array.isArray(c.cards) ? c.cards.length : typeof c.cards }))
        );

        for (const col of cols) {
          if (col.id in funnelCounts && Array.isArray(col.cards)) {
            funnelCounts[col.id] += col.cards.length;
          }
        }
      }
    }

    renewals.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const topClients = Array.from(paidByClient.entries())
      .map(([clientName, amount]) => ({ clientName, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return NextResponse.json({ totalReceived, totalPending, renewals, topClients, funnelCounts });
  } catch (error) {
    console.error('[BI] GET /api/clients/bi FALHOU:', error);
    return NextResponse.json({ error: 'Erro ao calcular dados financeiros' }, { status: 500 });
  }
}
