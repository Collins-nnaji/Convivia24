import { NextRequest, NextResponse } from 'next/server';
import sql, { apiErrorResponse } from '@/lib/db';
import { requireSupplier } from '@/lib/suppliers/auth';
import { removeSupplierStock, setSupplierStock, supplierShelf } from '@/lib/suppliers/stock';
import { upsertSupplierSkuPrice, deleteSupplierSkuPrice } from '@/lib/suppliers/sku-prices';
import { logSupplierAction } from '@/lib/suppliers/audit';
import { invalidateCatalog } from '@/lib/shop/catalog-cache';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

type Ctx = { params: Promise<{ slug: string }> };

async function currentHolding(supplierId: string, slug: string) {
  const [row] = await sql`
    SELECT i.name, ss.on_hand, ss.reserved, sp.cost_ngn
    FROM inventory i
    LEFT JOIN supplier_stock ss ON ss.slug = i.slug AND ss.supplier_id = ${supplierId}::uuid
    LEFT JOIN supplier_sku_prices sp ON sp.slug = i.slug AND sp.supplier_id = ${supplierId}::uuid
    WHERE i.slug = ${slug} AND i.active = true
    LIMIT 1
  `;
  if (!row) return null;
  return {
    name: String(row.name),
    onHand: row.on_hand == null ? null : Number(row.on_hand),
    reserved: Number(row.reserved ?? 0),
    costNgn: row.cost_ngn == null ? null : Number(row.cost_ngn),
  };
}

/**
 * POST { slug, onHand?, costNgn? } — set what this supplier holds and/or quotes for one SKU.
 * Listing a SKU for the first time is the same call with an `onHand`.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug: portalSlug } = await params;
  const gate = await requireSupplier(portalSlug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`supplier:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const sku = typeof body.slug === 'string' ? body.slug.trim() : '';
    if (!sku) return NextResponse.json({ error: 'Which drink?' }, { status: 400 });
    const before = await currentHolding(gate.supplier.id, sku);
    if (!before) return NextResponse.json({ error: 'That drink is not in the Convivia24 catalog.' }, { status: 404 });

    const hasQty = body.onHand !== undefined && body.onHand !== null && body.onHand !== '';
    const hasCost = body.costNgn !== undefined && body.costNgn !== null && body.costNgn !== '';
    if (!hasQty && !hasCost) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

    const supplier = gate.supplier;
    const actorLabel = supplier.contactName || supplier.name;

    if (hasQty) {
      const onHand = Number(body.onHand);
      if (!Number.isFinite(onHand) || onHand < 0) {
        return NextResponse.json({ error: 'Stock must be zero or more.' }, { status: 400 });
      }
      if (onHand < before.reserved) {
        return NextResponse.json(
          { error: `${before.reserved} of these are already reserved for paid orders — stock cannot go below that.` },
          { status: 409 }
        );
      }
      await setSupplierStock(supplier.id, sku, onHand);
      await logSupplierAction({
        supplierId: supplier.id,
        actor: 'supplier',
        actorLabel,
        action: 'stock.set',
        skuSlug: sku,
        detail: { skuName: before.name, from: before.onHand, to: Math.floor(onHand) },
      });
    }
    if (hasCost) {
      const costNgn = Number(body.costNgn);
      if (!Number.isFinite(costNgn) || costNgn < 0) {
        return NextResponse.json({ error: 'Cost must be a valid amount.' }, { status: 400 });
      }
      await upsertSupplierSkuPrice(supplier.id, sku, costNgn);
      await logSupplierAction({
        supplierId: supplier.id,
        actor: 'supplier',
        actorLabel,
        action: 'cost.set',
        skuSlug: sku,
        detail: { skuName: before.name, from: before.costNgn, to: Math.round(costNgn) },
      });
    }
    await invalidateCatalog();
    const shelf = await supplierShelf(supplier.id);
    return NextResponse.json({ ok: true, row: shelf.find((r) => r.slug === sku) ?? null });
  } catch (err) {
    captureApiError(err, { route: 'supplier/stock POST' });
    const { status, error } = apiErrorResponse(err, 'Could not update your stock.');
    return NextResponse.json({ error }, { status });
  }
}

/** DELETE ?slug= — take a SKU off the shelf. DELETE ?slug=&what=cost withdraws only the quote. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug: portalSlug } = await params;
  const gate = await requireSupplier(portalSlug);
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`supplier:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const url = new URL(req.url);
    const sku = (url.searchParams.get('slug') || '').trim();
    const what = url.searchParams.get('what') || 'stock';
    if (!sku) return NextResponse.json({ error: 'Which drink?' }, { status: 400 });
    const before = await currentHolding(gate.supplier.id, sku);
    if (!before) return NextResponse.json({ error: 'That drink is not in the catalog.' }, { status: 404 });
    const actorLabel = gate.supplier.contactName || gate.supplier.name;

    if (what === 'cost') {
      await deleteSupplierSkuPrice(gate.supplier.id, sku);
      await logSupplierAction({
        supplierId: gate.supplier.id, actor: 'supplier', actorLabel, action: 'cost.remove', skuSlug: sku,
        detail: { skuName: before.name, from: before.costNgn },
      });
    } else {
      if (before.reserved > 0) {
        return NextResponse.json(
          { error: `${before.reserved} of these are reserved for paid orders. Deliver or ask the desk to reroute them first.` },
          { status: 409 }
        );
      }
      await removeSupplierStock(gate.supplier.id, sku);
      await logSupplierAction({
        supplierId: gate.supplier.id, actor: 'supplier', actorLabel, action: 'stock.remove', skuSlug: sku,
        detail: { skuName: before.name, from: before.onHand, cost: before.costNgn },
      });
    }
    await invalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'supplier/stock DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not update your stock.');
    return NextResponse.json({ error }, { status });
  }
}
