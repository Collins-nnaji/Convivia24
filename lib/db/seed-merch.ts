// Run: npx tsx lib/db/seed-merch.ts
// Upserts Convivia merch (cap, tee, cups) into inventory for the rewards desk.
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { MERCH_SKUS } from '../loyalty/merch';

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
  console.log(`Seeding ${MERCH_SKUS.length} merch SKUs…`);

  for (const item of MERCH_SKUS) {
    await sql`
      INSERT INTO inventory (
        slug, name, on_hand, reserved, low_stock_threshold, track_stock, active,
        image_url, category, brand, volume, abv, price_ngn, cost_ngn,
        tagline, description, source, updated_at
      ) VALUES (
        ${item.slug},
        ${item.name},
        ${item.onHand},
        0,
        ${item.lowStockThreshold},
        true,
        true,
        ${item.image},
        'merch',
        'Convivia24',
        ${item.volume},
        0,
        ${item.valueNgn},
        ${item.costNgn},
        ${item.detail},
        ${item.detail},
        'admin',
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        image_url = EXCLUDED.image_url,
        category = 'merch',
        brand = 'Convivia24',
        volume = EXCLUDED.volume,
        price_ngn = EXCLUDED.price_ngn,
        cost_ngn = EXCLUDED.cost_ngn,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        track_stock = true,
        active = true,
        source = 'admin',
        updated_at = NOW()
    `;
    console.log(`  · ${item.name} (${item.slug})`);
  }

  console.log('Merch inventory ready.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
