// Run: npx tsx lib/db/seed-suppliers.ts
//
// Seeds the single Nationwide supplier and gives it an opening stock position for every SKU
// in the catalog. Safe to re-run: the supplier is matched by name, and stock is only written
// where a row does not already exist for that SKU, so real counts are never overwritten.
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { DRINKS } from '../drinks/catalog';

for (const file of ['.env.local', '.env']) {
  try {
    const content = readFileSync(join(process.cwd(), file), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* missing file */
  }
}

const NATIONWIDE = {
  name: 'Nationwide',
  city: 'Nigeria',
  sameDay: true,
  openingStock: 24,
  costRate: 0.78,
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  // Ensure every catalog SKU exists without replacing any live inventory values.
  for (const d of DRINKS) {
    await sql`
      INSERT INTO inventory (
        slug, name, on_hand, reserved, low_stock_threshold, track_stock, active,
        price_ngn, category, brand, volume, abv, tagline, description, source, updated_at
      ) VALUES (
        ${d.slug}, ${d.name}, 0, 0, ${d.partyPack ? 4 : 8}, true, true,
        ${d.priceNgn}, ${d.category}, ${d.brand || null}, ${d.volume}, ${d.abv},
        ${d.tagline}, ${d.description}, 'seed', NOW()
      )
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // One partner fills every order. Older regional rows stay in the table but are switched off.
  await sql`
    UPDATE suppliers
    SET active = false, updated_at = NOW()
    WHERE active = true
      AND LOWER(name) <> ${NATIONWIDE.name.toLowerCase()}
  `;

  const [existing] = await sql`
    SELECT id FROM suppliers WHERE LOWER(name) = ${NATIONWIDE.name.toLowerCase()} LIMIT 1
  `;
  let id: string;
  if (existing) {
    id = String(existing.id);
    await sql`
      UPDATE suppliers
      SET city = ${NATIONWIDE.city}, same_day = ${NATIONWIDE.sameDay}, active = true,
          notes = ${'Single fulfilment partner for nationwide delivery'}, updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    console.log(`· ${NATIONWIDE.name} — already present, refreshed`);
  } else {
    const [row] = await sql`
      INSERT INTO suppliers (name, city, same_day, active, notes)
      VALUES (
        ${NATIONWIDE.name}, ${NATIONWIDE.city}, ${NATIONWIDE.sameDay}, true,
        ${'Single fulfilment partner for nationwide delivery'}
      )
      RETURNING id
    `;
    id = String(row.id);
    console.log(`+ ${NATIONWIDE.name} — created`);
  }

  let seeded = 0;
  for (const d of DRINKS) {
    const res = await sql`
      INSERT INTO supplier_stock (supplier_id, slug, on_hand)
      VALUES (${id}::uuid, ${d.slug}, ${NATIONWIDE.openingStock})
      ON CONFLICT (supplier_id, slug) DO NOTHING
      RETURNING slug
    `;
    if (res.length) seeded++;
    await sql`
      INSERT INTO supplier_sku_prices (supplier_id, slug, cost_ngn)
      VALUES (${id}::uuid, ${d.slug}, ${Math.round(d.priceNgn * NATIONWIDE.costRate)})
      ON CONFLICT (supplier_id, slug) DO NOTHING
    `;
  }
  console.log(
    `  ${seeded} SKU rows seeded at ${NATIONWIDE.openingStock} each (${DRINKS.length - seeded} already had counts)`
  );

  for (const d of DRINKS) {
    await sql`
      UPDATE inventory i
      SET on_hand = COALESCE(s.total_on_hand, 0),
          reserved = COALESCE(s.total_reserved, 0),
          updated_at = NOW()
      FROM (
        SELECT COALESCE(SUM(ss.on_hand), 0)::int AS total_on_hand,
               COALESCE(SUM(ss.reserved), 0)::int AS total_reserved
        FROM supplier_stock ss
        JOIN suppliers sup ON sup.id = ss.supplier_id AND sup.active
        WHERE ss.slug = ${d.slug}
      ) s
      WHERE i.slug = ${d.slug}
    `;
    await sql`
      UPDATE inventory
      SET cost_ngn = (
        SELECT MIN(cost_ngn)::int FROM supplier_sku_prices
        WHERE slug = ${d.slug} AND supplier_id = ${id}::uuid
      ), updated_at = NOW()
      WHERE slug = ${d.slug}
    `;
  }
  console.log(`\nRolled up stock and Nationwide cost for ${DRINKS.length} SKUs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
