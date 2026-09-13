import sql from '@/lib/db';
import { CATEGORIES } from '@/lib/drinks/catalog';
import { upsertAdminProduct } from '@/lib/inventory';
import { setSupplierStock } from './stock';
import { upsertSupplierSkuPrice } from './sku-prices';
import { logSupplierAction } from './audit';

export type BottleRequest = {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  brand: string | null;
  category: string | null;
  volume: string | null;
  abv: number | null;
  costNgn: number | null;
  onHand: number;
  note: string | null;
  status: 'pending' | 'approved' | 'declined';
  decisionNote: string | null;
  createdSlug: string | null;
  createdAt: string;
  decidedAt: string | null;
};

function map(r: Record<string, unknown>): BottleRequest {
  return {
    id: String(r.id),
    supplierId: String(r.supplier_id),
    supplierName: String(r.supplier_name || ''),
    name: String(r.name),
    brand: (r.brand as string) || null,
    category: (r.category as string) || null,
    volume: (r.volume as string) || null,
    abv: r.abv == null ? null : Number(r.abv),
    costNgn: r.cost_ngn == null ? null : Number(r.cost_ngn),
    onHand: Number(r.on_hand ?? 0),
    note: (r.note as string) || null,
    status: r.status as BottleRequest['status'],
    decisionNote: (r.decision_note as string) || null,
    createdSlug: (r.created_slug as string) || null,
    createdAt: String(r.created_at),
    decidedAt: r.decided_at ? String(r.decided_at) : null,
  };
}

export type BottleRequestInput = {
  name: string;
  brand?: string | null;
  category?: string | null;
  volume?: string | null;
  abv?: number | null;
  costNgn?: number | null;
  onHand?: number;
  note?: string | null;
};

export function validateBottleRequest(i: BottleRequestInput): string | null {
  if (!i.name?.trim()) return 'Give the bottle a name.';
  if (i.name.trim().length > 120) return 'That name is too long.';
  if (i.category && !(CATEGORIES as readonly string[]).includes(i.category)) return 'Pick a category from the list.';
  if (i.costNgn != null && (!Number.isFinite(i.costNgn) || i.costNgn < 0)) return 'Cost must be zero or more.';
  if (i.onHand != null && (!Number.isFinite(i.onHand) || i.onHand < 0)) return 'Stock must be zero or more.';
  return null;
}

export async function createBottleRequest(supplierId: string, actorLabel: string | null, i: BottleRequestInput): Promise<BottleRequest> {
  const rows = await sql`
    INSERT INTO supplier_bottle_requests (supplier_id, name, brand, category, volume, abv, cost_ngn, on_hand, note)
    VALUES (
      ${supplierId}::uuid, ${i.name.trim()}, ${i.brand?.trim() || null}, ${i.category || null}, ${i.volume?.trim() || null},
      ${i.abv ?? null}, ${i.costNgn == null ? null : Math.round(i.costNgn)}, ${Math.max(0, Math.floor(i.onHand ?? 0))}, ${i.note?.trim().slice(0, 500) || null}
    )
    RETURNING *, (SELECT name FROM suppliers WHERE id = ${supplierId}::uuid) AS supplier_name
  `;
  await logSupplierAction({ supplierId, actor: 'supplier', actorLabel, action: 'stock.set', skuSlug: null, detail: { request: i.name.trim(), kind: 'bottle-request' } });
  return map(rows[0]);
}

export async function listBottleRequests(opts: { supplierId?: string; status?: BottleRequest['status'] | 'all'; limit?: number } = {}): Promise<BottleRequest[]> {
  const limit = Math.min(300, opts.limit ?? 100);
  const status = opts.status && opts.status !== 'all' ? opts.status : null;
  const rows = opts.supplierId
    ? await sql`
        SELECT r.*, s.name AS supplier_name FROM supplier_bottle_requests r JOIN suppliers s ON s.id = r.supplier_id
        WHERE r.supplier_id = ${opts.supplierId}::uuid AND (${status}::text IS NULL OR r.status = ${status})
        ORDER BY r.created_at DESC LIMIT ${limit}`
    : await sql`
        SELECT r.*, s.name AS supplier_name FROM supplier_bottle_requests r JOIN suppliers s ON s.id = r.supplier_id
        WHERE (${status}::text IS NULL OR r.status = ${status})
        ORDER BY (r.status = 'pending') DESC, r.created_at DESC LIMIT ${limit}`;
  return rows.map(map);
}

/**
 * Approve: the bottle becomes a real SKU at the retail price the desk sets, the supplier's
 * declared stock and quote go on their shelf, and the shop lists it.
 */
export async function approveBottleRequest(id: string, opts: { priceNgn: number; slug?: string | null; note?: string | null }): Promise<BottleRequest | null> {
  const [r] = await sql`SELECT * FROM supplier_bottle_requests WHERE id = ${id} AND status = 'pending' LIMIT 1`;
  if (!r) return null;
  const req = map(r);
  const product = await upsertAdminProduct({
    slug: opts.slug?.trim() || req.name,
    name: req.name,
    onHand: 0,
    priceNgn: Math.round(opts.priceNgn),
    category: req.category || 'spirits',
    brand: req.brand || undefined,
    volume: req.volume || undefined,
    abv: req.abv ?? undefined,
  });
  if (req.onHand > 0) await setSupplierStock(req.supplierId, product.slug, req.onHand);
  if (req.costNgn != null) await upsertSupplierSkuPrice(req.supplierId, product.slug, req.costNgn);
  const rows = await sql`
    UPDATE supplier_bottle_requests
    SET status = 'approved', created_slug = ${product.slug}, decision_note = ${opts.note?.trim() || null}, decided_at = NOW()
    WHERE id = ${id}
    RETURNING *, (SELECT name FROM suppliers WHERE id = supplier_id) AS supplier_name
  `;
  await logSupplierAction({ supplierId: req.supplierId, actor: 'admin', actorLabel: 'desk', action: 'stock.set', skuSlug: product.slug, detail: { skuName: req.name, from: null, to: req.onHand, approvedRequest: true } });
  return map(rows[0]);
}

export async function declineBottleRequest(id: string, note?: string | null): Promise<BottleRequest | null> {
  const rows = await sql`
    UPDATE supplier_bottle_requests
    SET status = 'declined', decision_note = ${note?.trim() || null}, decided_at = NOW()
    WHERE id = ${id} AND status = 'pending'
    RETURNING *, (SELECT name FROM suppliers WHERE id = supplier_id) AS supplier_name
  `;
  return rows[0] ? map(rows[0]) : null;
}
