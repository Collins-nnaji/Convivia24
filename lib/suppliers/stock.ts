import sql from '@/lib/db';

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
  onHand: number
): Promise<void> {
  const qty = Math.max(0, Math.floor(onHand));
  await sql`
    INSERT INTO supplier_stock (supplier_id, slug, on_hand)
    VALUES (${supplierId}, ${slug}, ${qty})
    ON CONFLICT (supplier_id, slug) DO UPDATE
      SET on_hand = EXCLUDED.on_hand, updated_at = NOW()
  `;
  await syncInventoryRollup(slug);
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
