import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAndCheckCRM, isAuthenticated, resolveOwnerId } from '@/lib/auth-helpers';

// PUT /api/clients/:clientId — Update client profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { clientId } = await params;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);
    const body = await req.json();
    const { brandName, niche, subniche, idealClient, mainPains, mainDesires, voiceTone, visualStyle, defaultCta } = body;

    const result = await query(
      `UPDATE clients SET
        brand_name = COALESCE($3, brand_name),
        niche = COALESCE($4, niche),
        subniche = COALESCE($5, subniche),
        ideal_client = COALESCE($6, ideal_client),
        main_pains = COALESCE($7, main_pains),
        main_desires = COALESCE($8, main_desires),
        voice_tone = COALESCE($9, voice_tone),
        visual_style = COALESCE($10, visual_style),
        default_cta = COALESCE($11, default_cta),
        updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, brand_name, niche, subniche, ideal_client, main_pains, main_desires, voice_tone, visual_style, default_cta, created_at`,
      [
        clientId,
        effectiveUserId,
        brandName ?? null,
        niche ?? null,
        subniche ?? null,
        idealClient ?? null,
        mainPains ?? null,
        mainDesires ?? null,
        voiceTone ?? null,
        visualStyle ?? null,
        defaultCta ?? null,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const row = result.rows[0];
    const client = {
      id: row.id,
      brandName: row.brand_name,
      niche: row.niche,
      subniche: row.subniche,
      idealClient: row.ideal_client,
      mainPains: row.main_pains,
      mainDesires: row.main_desires,
      voiceTone: row.voice_tone,
      visualStyle: row.visual_style,
      defaultCta: row.default_cta,
      createdAt: new Date(row.created_at).getTime(),
    };

    return NextResponse.json({ client });
  } catch (error) {
    console.error(`[AUDITORIA HUB] PUT /api/clients/${clientId} FALHOU:`, error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

// DELETE /api/clients/:clientId — Delete client (cascades to client_data)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const auth = await authenticateAndCheckCRM(req);
  if (!isAuthenticated(auth)) return auth;

  const { clientId } = await params;

  try {
    const effectiveUserId = await resolveOwnerId(auth.userId);
    const result = await query(
      'DELETE FROM clients WHERE id = $1 AND user_id = $2',
      [clientId, effectiveUserId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[AUDITORIA HUB] DELETE /api/clients/${clientId} FALHOU:`, error);
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 });
  }
}
