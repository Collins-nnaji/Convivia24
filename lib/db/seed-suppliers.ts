// Run: npx tsx lib/db/seed-suppliers.ts
//
// Seeds the three regional suppliers and gives each one an opening stock position for every SKU
// in the catalog. Safe to re-run: suppliers are matched by name, and stock is only written where
// a supplier does not already hold a row for that SKU, so real counts are never overwritten.
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

const SUPPLIERS = [
  { name: 'Lagos Supplier', city: 'Lagos', sameDay: true, openingStock: 24 },
  { name: 'Abuja Supplier', city: 'Abuja', sameDay: false, openingStock: 12 },
  { name: 'Port Harcourt Supplier', city: 'Port Harcourt', sameDay: false, openingStock: 8 },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  for (const s of SUPPLIERS) {
    const [existing] = await sql`SELECT id FROM suppliers WHERE LOWER(name) = ${s.name.toLowerCase()} LIMIT 1`;
    let id: string;
    if (existing) {
      id = String(existing.id);
      await sql`UPDATE suppliers SET city = ${s.city}, same_day = ${s.sameDay}, active = true WHERE id = ${id}::uuid`;
      console.log(`· ${s.name} — already present, refreshed`);
    } else {
      const [row] = await sql`
        INSERT INTO suppliers (name, city, same_day, active, notes)
        VALUES (${s.name}, ${s.city}, ${s.sameDay}, true, ${'Regional fulfilment hub for ' + s.city})
        RETURNING id
      `;
      id = String(row.id);
      console.log(`+ ${s.name} — created`);
    }

    // Opening position, only where nothing is recorded yet.
    let seeded = 0;
    for (const d of DRINKS) {
      const res = await sql`
        INSERT INTO supplier_stock (supplier_id, slug, on_hand)
        VALUES (${id}::uuid, ${d.slug}, ${s.openingStock})
        ON CONFLICT (supplier_id, slug) DO NOTHING
        RETURNING slug
      `;
      if (res.length) seeded++;
    }
    console.log(`  ${seeded} SKU rows seeded at ${s.openingStock} each (${DRINKS.length - seeded} already had counts)`);
  }

  // Bring the inventory rollup in line with what we just wrote.
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
  }
  console.log(`\nRolled up ${DRINKS.length} SKUs into inventory.on_hand.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
