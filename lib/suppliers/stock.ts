import sql from '@/lib/db';
import { logMovement } from '@/lib/inventory';
import { DRINKS } from '@/lib/drinks/catalog';
import { derivedPackCost, isDerivedCostSku } from './pack-cost';
import { getPackageBySlug } from '@/lib/packages/catalog';

/**
 * Per-supplier stock, and the routing that decides which supplier fills an order.
 *
 * The shop advertises a national figure — the sum of every active supplier's free stock — because
 * we do not know where a shopper is delivering until checkout. Reservation is the moment that
 * becomes concrete: the delivery city picks a supplier and the units come off that supplier's row.
 */

export type SupplierStockRow = {
  supplierId: string;
  supplierName: string;
  city: string;
  slug: string;
  onHand: number;
  reserved: number;
  available: number;
};

/** Normalises "  lagos " / "Lagos State" style input to a comparable city key. */
export function cityKey(city: string | null | undefined): string {
  return String(city || '')
    .toLowerCase()
    .replace(/\bstate\b/g, '')
    .replace(/[^a-z]/g, '');
}

/**
 * Keep `inventory.on_hand` / `reserved` equal to the sum across suppliers.
 *
 * Everything already reading `inventory` — the shop grid, low-stock digests, the admin table —
 * keeps working untouched because of this rollup. It is the single place the two models meet.
 */
export async function syncInventoryRollup(slug: string): Promise<void> {
  await sql`
    UPDATE inventory i
    SET
      on_hand = COALESCE(s.total_on_hand, 0),
      reserved = COALESCE(s.total_reserved, 0),
      updated_at = NOW()
    FROM (
      SELECT
        COALESCE(SUM(ss.on_hand), 0)::int  AS total_on_hand,
        COALESCE(SUM(ss.reserved), 0)::int AS total_reserved
      FROM supplier_stock ss
      JOIN suppliers sup ON sup.id = ss.supplier_id AND sup.active
      WHERE ss.slug = ${slug}
    ) s
    WHERE i.slug = ${slug}
  `;
}

/** Every supplier's holding of one SKU, including suppliers holding none. */
export async function stockForSlug(slug: string): Promise<SupplierStockRow[]> {
  const rows = await sql`
    SELECT
      sup.id AS supplier_id, sup.name AS supplier_name, sup.city,
      COALESCE(ss.on_hand, 0)  AS on_hand,
      COALESCE(ss.reserved, 0) AS reserved
    FROM suppliers sup
    LEFT JOIN supplier_stock ss ON ss.supplier_id = sup.id AND ss.slug = ${slug}
    WHERE sup.active
    ORDER BY sup.name ASC
  `;
  return rows.map((r) => {
    const onHand = Number(r.on_hand ?? 0);
    const reserved = Number(r.reserved ?? 0);
    return {
      supplierId: String(r.supplier_id),
      supplierName: String(r.supplier_name),
      city: String(r.city || ''),
      slug,
      onHand,
      reserved,
      available: Math.max(0, onHand - reserved),
    };
  });
}

/** The whole board, for the admin stock table. Keyed by slug. */
export async function allSupplierStock(): Promise<Record<string, SupplierStockRow[]>> {
  const rows = await sql`
    SELECT
      ss.slug, ss.on_hand, ss.reserved,
      sup.id AS supplier_id, sup.name AS supplier_name, sup.city
    FROM supplier_stock ss
    JOIN suppliers sup ON sup.id = ss.supplier_id
    WHERE sup.active
    ORDER BY ss.slug ASC, sup.name ASC
  `;
  const out: Record<string, SupplierStockRow[]> = {};
  for (const r of rows) {
    const slug = String(r.slug);
    const onHand = Number(r.on_hand ?? 0);
    const reserved = Number(r.reserved ?? 0);
    (out[slug] ||= []).push({
      supplierId: String(r.supplier_id),
      supplierName: String(r.supplier_name),
      city: String(r.city || ''),
      slug,
      onHand,
      reserved,
      available: Math.max(0, onHand - reserved),
    });
  }
  return out;
}

/** Set one supplier's holding of one SKU, then refresh the rollup. */
export async function setSupplierStock(
  supplierId: string,
  slug: string,
  onHand: number,
  actor: { kind: 'admin' | 'supplier'; label?: string | null } = { kind: 'admin', label: 'desk' }
): Promise<void> {
  const qty = Math.max(0, Math.floor(onHand));
  const [before] = await sql`SELECT on_hand FROM supplier_stock WHERE supplier_id = ${supplierId}::uuid AND slug = ${slug} LIMIT 1`;
  const previous = Number(before?.on_hand ?? 0);
  await sql`
    INSERT INTO supplier_stock (supplier_id, slug, on_hand)
    VALUES (${supplierId}, ${slug}, ${qty})
    ON CONFLICT (supplier_id, slug) DO UPDATE
      SET on_hand = EXCLUDED.on_hand, updated_at = NOW()
  `;
  await syncInventoryRollup(slug);
  if (qty !== previous) {
    const [sup] = await sql`SELECT name FROM suppliers WHERE id = ${supplierId}::uuid LIMIT 1`;
    await logMovement(slug, { onHand: qty - previous }, 'adjust', `${String(sup?.name || 'Supplier')} shelf ${previous} → ${qty}`, undefined, {
      kind: actor.kind,
      label: actor.label,
      supplierId,
    });
  }
}

export type RoutingDecision = {
  supplierId: string;
  supplierName: string;
  /** True when the delivery city had no supplier able to fill the order. */
  outOfCity: boolean;
  /** This supplier's quoted cost for the whole order, or null if they have no full quote. */
  expectedCostNgn: number | null;
};

/**
 * Pick the supplier for an order.
 *
 * 1. A supplier in the delivery city that can cover every line.
 * 2. Failing that, any active supplier that can — flagged as an out-of-city fill so the desk
 *    knows the delivery will take longer.
 * 3. Failing that, null: the order stays unrouted and an admin sources it by hand. We never
 *    assign a supplier who cannot actually fill the order, because that reads as done when it is not.
 */
export async function routeOrder(
  city: string | null | undefined,
  lines: { slug: string; qty: number }[]
): Promise<RoutingDecision | null> {
  if (lines.length === 0) return null;

  const suppliers = await sql`
    SELECT id, name, city FROM suppliers WHERE active ORDER BY name ASC
  `;
  if (suppliers.length === 0) return null;

  const slugs = lines.map((l) => l.slug);
  const stock = await sql`
    SELECT supplier_id, slug, (on_hand - reserved) AS available
    FROM supplier_stock
    WHERE slug = ANY(${slugs})
  `;

  const bySupplier = new Map<string, Map<string, number>>();
  for (const r of stock) {
    const id = String(r.supplier_id);
    if (!bySupplier.has(id)) bySupplier.set(id, new Map());
    bySupplier.get(id)!.set(String(r.slug), Number(r.available ?? 0));
  }

  const canFill = (supplierId: string) => {
    const held = bySupplier.get(supplierId);
    if (!held) return false;
    return lines.every((l) => (held.get(l.slug) ?? 0) >= l.qty);
  };

  /**
   * What this order would cost us from a given supplier, using their own quotes.
   *
   * Suppliers quote different prices for the same bottle, so among those who can fill the order we
   * take the cheapest — the customer pays one national retail price either way, so supplier choice
   * is purely our margin. Suppliers with no quote on file sort last rather than counting as free.
   */
  const quotes = await sql`
    SELECT supplier_id, slug, cost_ngn FROM supplier_sku_prices WHERE slug = ANY(${slugs})
  `;
  const quoteBy = new Map<string, Map<string, number>>();
  for (const r of quotes) {
    const id = String(r.supplier_id);
    if (!quoteBy.has(id)) quoteBy.set(id, new Map());
    quoteBy.get(id)!.set(String(r.slug), Number(r.cost_ngn ?? 0));
  }

  function costFor(supplierId: string): number | null {
    const q = quoteBy.get(supplierId);
    if (!q) return null;
    let total = 0;
    for (const l of lines) {
      const unit = q.get(l.slug);
      if (unit == null) return null; // an incomplete quote is not a comparable price
      total += unit * l.qty;
    }
    return total;
  }

  /** Cheapest first; anyone without a full quote falls to the back but is still usable. */
  function pickCheapest(pool: { id: string; name: string }[]): { id: string; name: string; costNgn: number | null } | null {
    const usable = pool.filter((s) => canFill(s.id));
    if (usable.length === 0) return null;
    return usable
      .map((s) => ({ ...s, costNgn: costFor(s.id) }))
      .sort((a, b) => {
        if (a.costNgn == null && b.costNgn == null) return 0;
        if (a.costNgn == null) return 1;
        if (b.costNgn == null) return -1;
        return a.costNgn - b.costNgn;
      })[0];
  }

  const all = suppliers.map((s) => ({ id: String(s.id), name: String(s.name), city: String(s.city || '') }));
  const wanted = cityKey(city);

  const local = pickCheapest(all.filter((s) => cityKey(s.city) === wanted));
  if (local) {
    return { supplierId: local.id, supplierName: local.name, outOfCity: false, expectedCostNgn: local.costNgn };
  }
  const anywhere = pickCheapest(all);
  if (anywhere) {
    return { supplierId: anywhere.id, supplierName: anywhere.name, outOfCity: true, expectedCostNgn: anywhere.costNgn };
  }
  return null;
}

/**
 * Move units from a supplier's free stock into reserved.
 *
 * The national reservation in `lib/inventory.ts` has already decided the order is fillable; this
 * records *whose* shelf it comes off. Clamped so a routing race can never push `reserved` past
 * `on_hand` and trip the table's check constraint.
 */
export async function reserveSupplierStock(
  supplierId: string,
  lines: { slug: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await sql`
      UPDATE supplier_stock
      SET reserved = LEAST(on_hand, reserved + ${line.qty}), updated_at = NOW()
      WHERE supplier_id = ${supplierId}::uuid AND slug = ${line.slug}
    `;
  }
}

/** Give reserved units back — order cancelled or refunded before it shipped. */
export async function releaseSupplierStock(
  supplierId: string,
  lines: { slug: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await sql`
      UPDATE supplier_stock
      SET reserved = GREATEST(0, reserved - ${line.qty}), updated_at = NOW()
      WHERE supplier_id = ${supplierId}::uuid AND slug = ${line.slug}
    `;
  }
}

/** Order delivered — the units leave the supplier's shelf for good. */
export async function fulfillSupplierStock(
  supplierId: string,
  lines: { slug: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    await sql`
      UPDATE supplier_stock
      SET on_hand  = GREATEST(0, on_hand - ${line.qty}),
          reserved = GREATEST(0, reserved - ${line.qty}),
          updated_at = NOW()
      WHERE supplier_id = ${supplierId}::uuid AND slug = ${line.slug}
    `;
  }
}

/** Take a SKU off a supplier's shelf entirely (their holding and their quote), then re-roll up. */
export async function removeSupplierStock(supplierId: string, slug: string): Promise<void> {
  await sql`DELETE FROM supplier_stock WHERE supplier_id = ${supplierId}::uuid AND slug = ${slug}`;
  await sql`DELETE FROM supplier_sku_prices WHERE supplier_id = ${supplierId}::uuid AND slug = ${slug}`;
  await syncInventoryRollup(slug);
}

export type ShelfRow = {
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  retailNgn: number | null;
  /** Null when the supplier has never listed this SKU. */
  onHand: number | null;
  reserved: number;
  available: number;
  costNgn: number | null;
  /** Party packs: the price is summed from the bottles and cannot be typed. */
  derivedCost: boolean;
  updatedAt: string | null;
};

/**
 * The whole catalog from one supplier's point of view: what they hold, what they quote, and the
 * SKUs they could add. Retail is included so they can see the margin they leave us.
 */
/** Bottle shot for a SKU: the inventory row's own upload, else the catalog's. Same rule as the shop. */
function catalogImage(slug: string): string | null {
  const d = DRINKS.find((x) => x.slug === slug);
  return d?.image || d?.packImages?.[0] || null;
}

export async function supplierShelf(supplierId: string): Promise<ShelfRow[]> {
  const rows = await sql`
    SELECT
      i.slug, i.name, i.brand, i.category, i.image_url, i.price_ngn,
      ss.on_hand, ss.reserved, ss.updated_at AS stock_updated_at,
      sp.cost_ngn
    FROM inventory i
    LEFT JOIN supplier_stock ss ON ss.slug = i.slug AND ss.supplier_id = ${supplierId}::uuid
    LEFT JOIN supplier_sku_prices sp ON sp.slug = i.slug AND sp.supplier_id = ${supplierId}::uuid
    WHERE i.active = true
    ORDER BY (ss.on_hand IS NULL) ASC, i.name ASC
  `;
  const quoteBySlug = new Map(rows.map((r) => [String(r.slug), r.cost_ngn == null ? null : Number(r.cost_ngn)]));
  return rows.map((r) => {
    const onHand = r.on_hand == null ? null : Number(r.on_hand);
    const reserved = Number(r.reserved ?? 0);
    const slug = String(r.slug);
    const derivedCost = isDerivedCostSku(slug);
    return {
      slug: String(r.slug),
      name: String(r.name),
      brand: (r.brand as string) || null,
      category: (r.category as string) || null,
      imageUrl: (r.image_url as string) || catalogImage(String(r.slug)),
      retailNgn: r.price_ngn == null ? null : Number(r.price_ngn),
      onHand,
      reserved,
      available: onHand == null ? 0 : Math.max(0, onHand - reserved),
      costNgn: derivedCost ? derivedPackCost(slug, (part) => quoteBySlug.get(part)) : r.cost_ngn == null ? null : Number(r.cost_ngn),
      derivedCost,
      updatedAt: r.stock_updated_at ? String(r.stock_updated_at) : null,
    };
  });
}

export type SupplierOrder = {
  id: string;
  status: string;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  area: string | null;
  city: string | null;
  notes: string | null;
  courierName: string | null;
  riderPhone: string | null;
  etaAt: string | null;
  trackingNote: string | null;
  outOfCity: boolean;
  /** What we expect to pay this supplier — their own quote at routing time, or the sourced cost. */
  costNgn: number | null;
  createdAt: string;
  items: { slug: string; name: string; qty: number; imageUrl: string | null }[];
};

/**
 * Orders this supplier is filling: routed to them at checkout or assigned by the desk. Money
 * (retail totals, customer email) deliberately stays out — a supplier needs the address and the
 * bottles, not the customer's bill.
 */
export async function supplierOrders(supplierId: string, opts: { limit?: number } = {}): Promise<SupplierOrder[]> {
  const limit = Math.min(300, Math.max(1, opts.limit ?? 150));
  const rows = await sql`
    SELECT
      o.id, o.status, o.full_name, o.phone, o.address_line1, o.address_line2, o.area, o.city, o.notes,
      o.courier_name, o.rider_phone, o.eta_at, o.tracking_note, o.routed_out_of_city,
      COALESCE(o.supplier_cost_ngn, o.routed_cost_ngn) AS cost_ngn, o.created_at,
      COALESCE(
        json_agg(json_build_object('slug', i.kit_slug, 'name', i.kit_name, 'qty', i.qty) ORDER BY i.created_at)
          FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) AS items
    FROM ritual_orders o
    LEFT JOIN ritual_order_items i ON i.order_id = o.id
    WHERE (o.routed_supplier_id = ${supplierId}::uuid OR o.supplier_id = ${supplierId}::uuid)
      AND o.status NOT IN ('pending', 'awaiting_payment')
    GROUP BY o.id
    ORDER BY
      CASE WHEN o.status IN ('paid', 'processing', 'packed', 'out_for_delivery') THEN 0 ELSE 1 END,
      o.created_at DESC
    LIMIT ${limit}
  `;
  // One lookup for every bottle on every order, so each line can show its picture.
  const slugs = [...new Set(rows.flatMap((r) => ((r.items as { slug: string }[]) || []).map((i) => i.slug)).filter(Boolean))];
  const uploads = slugs.length
    ? await sql`SELECT slug, image_url FROM inventory WHERE slug = ANY(${slugs}) AND image_url IS NOT NULL`
    : [];
  const uploaded = new Map(uploads.map((u) => [String(u.slug), String(u.image_url)]));

  return rows.map((r) => ({
    id: String(r.id),
    status: String(r.status),
    fullName: String(r.full_name),
    phone: (r.phone as string) || null,
    addressLine1: String(r.address_line1 || ''),
    addressLine2: (r.address_line2 as string) || null,
    area: (r.area as string) || null,
    city: (r.city as string) || null,
    notes: (r.notes as string) || null,
    courierName: (r.courier_name as string) || null,
    riderPhone: (r.rider_phone as string) || null,
    etaAt: r.eta_at ? String(r.eta_at) : null,
    trackingNote: (r.tracking_note as string) || null,
    outOfCity: r.routed_out_of_city === true,
    costNgn: r.cost_ngn == null ? null : Number(r.cost_ngn),
    createdAt: String(r.created_at),
    // A supplier packs bottles, not "packs" — a pack line is shown as the bottles inside it.
    items: ((r.items as { slug: string; name: string; qty: number }[]) || []).flatMap((i) => {
      const pkg = getPackageBySlug(i.slug);
      if (!pkg) return [{ ...i, imageUrl: uploaded.get(i.slug) || catalogImage(i.slug) }];
      return pkg.components.map((c) => ({
        slug: c.slug,
        name: `${DRINKS.find((d) => d.slug === c.slug)?.name || c.slug} (${i.name})`,
        qty: c.qty * i.qty,
        imageUrl: uploaded.get(c.slug) || catalogImage(c.slug),
      }));
    }),
  }));
}

/** True when this supplier is on the hook for the order — the only orders they may touch. */
export async function supplierOwnsOrder(supplierId: string, orderId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM ritual_orders
    WHERE id = ${orderId} AND (routed_supplier_id = ${supplierId}::uuid OR supplier_id = ${supplierId}::uuid)
    LIMIT 1
  `;
  return rows.length > 0;
}
