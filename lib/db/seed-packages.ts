// Run: npx tsx lib/db/seed-packages.ts
//
// Event packages are sold as ordinary inventory SKUs so the cart → checkout → order → Flutterwave
// path carries them with no special-casing. They are `track_stock = false`: the components are what
// hold real stock, and reserving a package would double-count against them.
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import {
  EVENT_PACKAGES,
  bottleCount,
  componentsTotalNgn,
  resolveComponents,
  savingsNgn,
} from '../packages/catalog';

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

/** Bottle-weighted average ABV, so the PDP can show something honest for a mixed pack. */
function averageAbv(pkgSlug: string): number | null {
  const pkg = EVENT_PACKAGES.find((p) => p.slug === pkgSlug);
  if (!pkg) return null;
  const parts = resolveComponents(pkg);
  const units = parts.reduce((n, c) => n + c.qty, 0);
  if (!units) return null;
  const weighted = parts.reduce((n, c) => n + c.product.abv * c.qty, 0);
  return Math.round((weighted / units) * 10) / 10;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Fail loudly rather than seeding a package that points at a SKU we no longer sell.
  for (const pkg of EVENT_PACKAGES) {
    const missing = pkg.components.length - resolveComponents(pkg).length;
    if (missing > 0) {
      console.error(`${pkg.slug}: ${missing} component slug(s) not found in the catalog. Aborting.`);
      process.exit(1);
    }
  }

  console.log(`Seeding ${EVENT_PACKAGES.length} event packages…`);
  for (const pkg of EVENT_PACKAGES) {
    const bottles = bottleCount(pkg);
    await sql`
      INSERT INTO inventory (
        slug, name, on_hand, reserved, low_stock_threshold, track_stock, active,
        price_ngn, category, brand, volume, abv, tagline, description, source, updated_at
      ) VALUES (
        ${pkg.slug}, ${pkg.name}, 0, 0, 0, false, true,
        ${pkg.priceNgn}, 'party-packs', 'Convivia24',
        ${`${bottles} bottles · ~${pkg.guests} guests`},
        ${averageAbv(pkg.slug)},
        ${pkg.tagline}, ${pkg.description}, 'seed', NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        price_ngn = EXCLUDED.price_ngn,
        category = EXCLUDED.category,
        brand = EXCLUDED.brand,
        volume = EXCLUDED.volume,
        abv = EXCLUDED.abv,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        track_stock = false,
        active = true,
        updated_at = NOW()
    `;
    const full = componentsTotalNgn(pkg);
    const save = savingsNgn(pkg);
    console.log(
      `  ${pkg.slug.padEnd(24)} ₦${pkg.priceNgn.toLocaleString()}` +
        ` (parts ₦${full.toLocaleString()}, save ₦${save.toLocaleString()})`
    );
  }

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM inventory WHERE track_stock = false
  `;
  console.log(`Packages live: ${count} untracked SKUs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
