import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { captureApiError } from '@/lib/sentry';

/** GET ?slug=&limit= — the national stock ledger for one SKU: reserves, releases, fulfils, edits. */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get('slug') || '').trim();
    if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 50) || 50));
    const rows = await sql`
      SELECT m.id, m.delta_on_hand, m.delta_reserved, m.reason, m.order_id, m.note, m.created_at, m.actor, m.actor_label, s.name AS supplier_name
      FROM inventory_movements m LEFT JOIN suppliers s ON s.id = m.supplier_id
      WHERE m.slug = ${slug}
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `;
    return NextResponse.json({
      movements: rows.map((r) => ({
        id: String(r.id),
        deltaOnHand: Number(r.delta_on_hand ?? 0),
        deltaReserved: Number(r.delta_reserved ?? 0),
        reason: String(r.reason),
        orderId: (r.order_id as string) || null,
        note: (r.note as string) || null,
        actor: String(r.actor || 'system'),
        actorLabel: (r.actor_label as string) || null,
        supplierName: (r.supplier_name as string) || null,
        createdAt: String(r.created_at),
      })),
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/inventory/movements GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load stock history.');
    return NextResponse.json({ error }, { status });
  }
}
