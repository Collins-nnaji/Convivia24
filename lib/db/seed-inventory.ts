// Run: npx tsx lib/db/seed-inventory.ts
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

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const ecommerce = readFileSync(join(process.cwd(), 'lib/db/ecommerce.sql'), 'utf-8');
  const statements = ecommerce
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      const lines = s.split('\n').filter((l) => l.trim() && !l.trim().startsWith('--'));
      return lines.length > 0;
    });

  console.log(`Applying ecommerce schema (${statements.length} statements)…`);
  for (const stmt of statements) {
    await sql.query(stmt);
  }

  console.log(`Seeding inventory for ${DRINKS.length} SKUs…`);
  for (let i = 0; i < DRINKS.length; i++) {
    const d = DRINKS[i];
    const base = d.partyPack ? 18 : d.featured ? 42 : d.deal ? 34 : 28;
    const onHand = base + ((i * 7) % 37);
    const reserved = Math.min(Math.floor(onHand * 0.1), 5);
    const low = d.partyPack ? 4 : 8;
    await sql`
      INSERT INTO inventory (slug, name, on_hand, reserved, low_stock_threshold, track_stock, active, price_ngn, category, brand, volume, abv, tagline, description, source, updated_at)
      VALUES (
        ${d.slug}, ${d.name}, ${onHand}, ${reserved}, ${low}, true, true,
        ${d.priceNgn}, ${d.category}, ${d.brand || null}, ${d.volume}, ${d.abv},
        ${d.tagline}, ${d.description}, 'seed', NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        on_hand = EXCLUDED.on_hand,
        reserved = EXCLUDED.reserved,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        price_ngn = EXCLUDED.price_ngn,
        category = EXCLUDED.category,
        brand = EXCLUDED.brand,
        volume = EXCLUDED.volume,
        abv = EXCLUDED.abv,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        track_stock = true,
        active = true,
        updated_at = NOW()
    `;
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM inventory`;
  console.log(`Inventory live: ${count} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
