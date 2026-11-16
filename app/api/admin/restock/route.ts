import { NextRequest, NextResponse } from 'next/server';
import { withAudit } from '@/lib/audit/route';
import { requireAdmin } from '@/lib/admin';
import sql, { apiErrorResponse } from '@/lib/db';
import { editStockRow, getInventory } from '@/lib/inventory';
import { setSupplierStock, stockForSlug } from '@/lib/suppliers/stock';
import { invalidateCatalog } from '@/lib/shop/catalog-cache';
import { notifyRestockAlerts } from '@/lib/shop/restock-alerts';
import { captureApiError } from '@/lib/sentry';

/**
 * Restock requests: ask a supplier for more of a bottle, track it, and receive it into stock.
 * Receiving adds the quantity once — the status flip is atomic, so a double click cannot add twice.
 */

const UUID = /^[0-9a-f-]{36}$/i;

async function handleGET() {
  const gate = await requireAdmin('inventory');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rows = await sql`
      SELECT r.*, i.name, i.image_url, s.name AS supplier_name
      FROM restock_requests r
      LEFT JOIN inventory i ON i.slug = r.slug
      LEFT JOIN suppliers s ON s.id = r.supplier_id
      WHERE r.status = 'requested' OR r.created_at > NOW() - INTERVAL '30 days'
      ORDER BY (r.status = 'requested') DESC, COALESCE(r.expected_at, r.created_at::date) ASC, r.created_at DESC
      LIMIT 200
    `;
    const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v ? String(v) : null);
    return NextResponse.json({
      requests: rows.map((r) => ({
        id: String(r.id),
        slug: String(r.slug),
        name: r.name ? String(r.name) : String(r.slug),
        imageUrl: r.image_url ? String(r.image_url) : null,
        supplierId: r.supplier_id ? String(r.supplier_id) : null,
        supplierName: r.supplier_name ? String(r.supplier_name) : null,
        qty: Number(r.qty),
        costNgn: r.cost_ngn == null ? null : Number(r.cost_ngn),
        expectedAt: iso(r.expected_at)?.slice(0, 10) ?? null,
        note: r.note ? String(r.note) : null,
        status: String(r.status),
        createdBy: String(r.created_by),
        createdAt: iso(r.created_at),
        receivedAt: iso(r.received_at),
        receivedQty: r.received_qty == null ? null : Number(r.received_qty),
      })),
    });
  } catch (err) {
    captureApiError(err, { route: 'admin/restock GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load restock requests. Run the database migration if this is new.');
    return NextResponse.json({ error }, { status });
  }
}

async function handlePOST(req: NextRequest) {
  const gate = await requireAdmin('inventory');
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const actor = gate.actorLabel || gate.actor;
  try {
    const body = await req.json().catch(() => ({}));

    if (body.action === 'create') {
      const slug = String(body.slug || '').trim();
      const qty = Math.floor(Number(body.qty));
      if (!slug || !(await getInventory(slug))) return NextResponse.json({ error: 'Choose a bottle.' }, { status: 400 });
      if (!Number.isFinite(qty) || qty <= 0 || qty > 10000) return NextResponse.json({ error: 'Enter how many bottles to order.' }, { status: 400 });
      const supplierId = UUID.test(String(body.supplierId || '')) ? String(body.supplierId) : null;
      const cost = body.costNgn === '' || body.costNgn == null ? null : Math.round(Number(body.costNgn));
      if (cost != null && (!Number.isFinite(cost) || cost < 0)) return NextResponse.json({ error: 'Cost must be zero or more.' }, { status: 400 });
      const expected = /^\d{4}-\d{2}-\d{2}$/.test(String(body.expectedAt || '')) ? String(body.expectedAt) : null;
      const [row] = await sql`
        INSERT INTO restock_requests(slug, supplier_id, qty, cost_ngn, expected_at, note, created_by)
        VALUES(${slug}, ${supplierId}::uuid, ${qty}, ${cost}, ${expected}::date, ${String(body.note || '').trim().slice(0, 300) || null}, ${actor})
        RETURNING id
      `;
      await sql`INSERT INTO admin_audit(actor, action, subject, detail) VALUES(${gate.actor}, 'restock.requested', ${slug}, ${JSON.stringify({ qty, supplierId })}::jsonb)`;
      return NextResponse.json({ ok: true, id: String(row.id) }, { status: 201 });
    }

    const id = String(body.id || '');
    if (!UUID.test(id)) return NextResponse.json({ error: 'Unknown request.' }, { status: 400 });

    if (body.action === 'cancel') {
      const done = await sql`UPDATE restock_requests SET status = 'cancelled' WHERE id = ${id}::uuid AND status = 'requested' RETURNING id`;
      if (!done.length) return NextResponse.json({ error: 'That request is no longer open.' }, { status: 409 });
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'receive') {
      const [open] = await sql`SELECT qty FROM restock_requests WHERE id = ${id}::uuid AND status = 'requested'`;
      if (!open) return NextResponse.json({ error: 'That request is no longer open.' }, { status: 409 });
      const qty = body.qty == null || body.qty === '' ? Number(open.qty) : Math.floor(Number(body.qty));
      if (!Number.isFinite(qty) || qty <= 0 || qty > 10000) return NextResponse.json({ error: 'Enter how many bottles arrived.' }, { status: 400 });
      // Claim it first — only one receive can win.
      const [claimed] = await sql`
        UPDATE restock_requests SET status = 'received', received_at = NOW(), received_qty = ${qty}
        WHERE id = ${id}::uuid AND status = 'requested' RETURNING slug, supplier_id
      `;
      if (!claimed) return NextResponse.json({ error: 'That request was just received by someone else.' }, { status: 409 });
      const slug = String(claimed.slug);
      const supplierId = claimed.supplier_id ? String(claimed.supplier_id) : null;

      // Bottles held per supplier roll up into the SKU, so add to that supplier's shelf; otherwise to the SKU.
      const shelves = await stockForSlug(slug);
      const shelf = supplierId ? shelves.find((r) => r.supplierId === supplierId) : undefined;
      const perSupplier = shelves.some((r) => r.onHand > 0 || r.reserved > 0);
      if (perSupplier && shelf) {
        await setSupplierStock(supplierId!, slug, shelf.onHand + qty, { kind: 'admin', label: `${actor} (restock)` });
      } else {
        const inv = await getInventory(slug);
        await editStockRow(
          slug,
          { onHand: (inv?.on_hand ?? 0) + qty, stockReason: 'restock', stockNote: `Restock request${shelf ? ` from ${shelf.supplierName}` : ''}` },
          { kind: 'admin', label: actor }
        );
      }
      await invalidateCatalog();
      notifyRestockAlerts(slug).catch(() => {});
      await sql`INSERT INTO admin_audit(actor, action, subject, detail) VALUES(${gate.actor}, 'restock.received', ${slug}, ${JSON.stringify({ id, qty })}::jsonb)`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    captureApiError(err, { route: 'admin/restock POST' });
    const { status, error } = apiErrorResponse(err, 'Could not update the restock request.');
    return NextResponse.json({ error }, { status });
  }
}

export const GET = withAudit('/api/admin/restock', handleGET);
export const POST = withAudit('/api/admin/restock', handlePOST);
