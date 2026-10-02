import sql from '@/lib/db';
import { adminStockList } from '@/lib/inventory';
import { derivedPackCost, isDerivedCostSku } from './pack-cost';

export type SupplierSkuPrice = {
  supplierId: string;
  slug: string;
  costNgn: number;
  updatedAt: string;
};

export type SupplierCatalogRow = {
  slug: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  priceNgn: number | null;
  defaultCostNgn: number | null;
  costs: Record<string, number>;
  /** True for party packs: costs above are summed from the bottles and cannot be edited. */
  derived: boolean;
};

export async function listSupplierCatalog(): Promise<SupplierCatalogRow[]> {
  const items = await adminStockList();
  const priceRows = await sql`
    SELECT supplier_id, slug, cost_ngn FROM supplier_sku_prices ORDER BY slug ASC
  `;
  const costsBySlug = new Map<string, Record<string, number>>();
  for (const row of priceRows) {
    const slug = String(row.slug);
    const supplierId = String(row.supplier_id);
    const costNgn = Number(row.cost_ngn);
    if (!costsBySlug.has(slug)) costsBySlug.set(slug, {});
    costsBySlug.get(slug)![supplierId] = costNgn;
  }

  const defaultCostBySlug = new Map(items.map((i) => [i.slug, i.cost_ngn ?? null]));
  const supplierIds = new Set(priceRows.map((r) => String(r.supplier_id)));

  return items.map((item) => {
    if (isDerivedCostSku(item.slug)) {
      const costs: Record<string, number> = {};
      for (const sid of supplierIds) {
        const c = derivedPackCost(item.slug, (part) => costsBySlug.get(part)?.[sid]);
        if (c != null) costs[sid] = c;
      }
      return {
        slug: item.slug,
        name: item.name,
        category: item.category,
        imageUrl: item.image_url ?? null,
        priceNgn: item.price_ngn,
        defaultCostNgn: derivedPackCost(item.slug, (part) => defaultCostBySlug.get(part)),
        costs,
        derived: true,
      };
    }
    return {
      slug: item.slug,
      name: item.name,
      category: item.category,
      imageUrl: item.image_url ?? null,
      priceNgn: item.price_ngn,
      defaultCostNgn: item.cost_ngn ?? null,
      costs: costsBySlug.get(item.slug) || {},
      derived: false,
    };
  });
}

export class DerivedCostError extends Error {
  constructor(slug: string) {
    super(`${slug} is a party pack — its cost comes from the bottles inside it and cannot be set directly.`);
    this.name = 'DerivedCostError';
  }
}

export async function upsertSupplierSkuPrice(
  supplierId: string,
  slug: string,
  costNgn: number,
  actorLabel?: string
): Promise<SupplierSkuPrice> {
  if (isDerivedCostSku(slug)) throw new DerivedCostError(slug);
  const cost = Math.max(0, Math.floor(costNgn));
  const rows = await sql`
    WITH previous AS MATERIALIZED (
      SELECT cost_ngn FROM supplier_sku_prices WHERE supplier_id = ${supplierId}::uuid AND slug = ${slug} FOR UPDATE
    ), changed AS (
    INSERT INTO supplier_sku_prices (supplier_id, slug, cost_ngn)
    VALUES ((SELECT ${supplierId}::uuid FROM (SELECT count(*) FROM previous) lock_previous), ${slug}, ${cost})
    ON CONFLICT (supplier_id, slug) DO UPDATE SET
      cost_ngn = EXCLUDED.cost_ngn,
      updated_at = NOW()
    RETURNING supplier_id, slug, cost_ngn, updated_at
    ), logged AS (
      INSERT INTO supplier_audit_log (supplier_id, sku_slug, actor, actor_label, action, detail)
      SELECT c.supplier_id, c.slug, 'admin', ${actorLabel || null}, 'cost.set',
        jsonb_build_object('from', p.cost_ngn, 'to', c.cost_ngn)
      FROM changed c LEFT JOIN previous p ON true
      WHERE ${Boolean(actorLabel)} AND c.cost_ngn IS DISTINCT FROM p.cost_ngn
      RETURNING id
    ) SELECT * FROM changed
  `;
  await syncDefaultCostFromSuppliers(slug);
  const row = rows[0];
  return {
    supplierId: String(row.supplier_id),
    slug: String(row.slug),
    costNgn: Number(row.cost_ngn),
    updatedAt: String(row.updated_at),
  };
}

export async function deleteSupplierSkuPrice(supplierId: string, slug: string, actorLabel?: string): Promise<void> {
  await sql`
    WITH removed AS (
      DELETE FROM supplier_sku_prices WHERE supplier_id = ${supplierId}::uuid AND slug = ${slug}
      RETURNING *
    )
    INSERT INTO supplier_audit_log (supplier_id, sku_slug, actor, actor_label, action, detail)
    SELECT supplier_id, slug, 'admin', ${actorLabel || null}, 'cost.remove', jsonb_build_object('from', cost_ngn, 'to', null)
    FROM removed WHERE ${Boolean(actorLabel)}
  `;
  await syncDefaultCostFromSuppliers(slug);
}

/** Keep inventory.cost_ngn aligned with the lowest known supplier quote for a SKU. */
async function syncDefaultCostFromSuppliers(slug: string): Promise<void> {
  const [row] = await sql`
    SELECT MIN(cost_ngn)::int AS min_cost FROM supplier_sku_prices WHERE slug = ${slug}
  `;
  const minCost = row?.min_cost != null ? Number(row.min_cost) : null;
  await sql`
    UPDATE inventory SET cost_ngn = ${minCost}, updated_at = NOW() WHERE slug = ${slug}
  `;
}
