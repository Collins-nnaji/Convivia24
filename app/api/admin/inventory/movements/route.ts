import { withAudit } from '@/lib/audit/route';
import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import { captureApiError } from '@/lib/sentry';

/** GET ?slug=&limit= — the national stock ledger for one SKU: reserves, releases, fulfils, edits. */
async function handleGET(req: NextRequest) {
  const gate = await requireAdmin('inventory');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const url = new URL(req.url);
    const slug = (url.searchParams.get('slug') || '').trim();
    if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 50) || 50));
    const rows = await sql`
      SELECT m.id, m.delta_on_hand, m.delta_reserved, m.reason, m.order_id, m.note, m.created_at, m.actor, m.actor_label, s.name AS supplier_name
      FROM (
        SELECT id, delta_on_hand, delta_reserved, reason, order_id, note, created_at, actor, actor_label, supplier_id
        FROM inventory_movements WHERE slug = ${slug}
        UNION ALL
        SELECT id, 0, 0, action, order_id,
          'Supplier cost (NGN): ' || CASE WHEN detail ? 'from' THEN COALESCE(detail->>'from', 'unset') ELSE 'not recorded' END || ' → ' ||
          CASE WHEN action = 'cost.remove' THEN 'unset' ELSE COALESCE(detail->>'to', 'unset') END,
          created_at, actor, actor_label, supplier_id
        FROM supplier_audit_log WHERE sku_slug = ${slug} AND action IN ('cost.set', 'cost.remove')
      ) m LEFT JOIN suppliers s ON s.id = m.supplier_id
      ORDER BY m.created_at DESC, m.id DESC
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

export const GET = withAudit('/api/admin/inventory/movements', handleGET);
