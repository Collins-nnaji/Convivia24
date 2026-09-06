// Run: npx tsx lib/db/prune-inventory.ts
//
// Deactivates inventory rows whose SKU no longer exists in the catalog (or as an event package).
// Rows are deactivated, never deleted — historic order lines still reference these slugs, and a
// delete would orphan them. Re-run any time the catalog shrinks.
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { DRINKS } from '../drinks/catalog';
import { EVENT_PACKAGES } from '../packages/catalog';

for (const file of ['.env.local', '.env']) {
  try {
    const content = readFileSync(join(process.cwd(), file), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* missing file */ }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const known = [...DRINKS.map((d) => d.slug), ...EVENT_PACKAGES.map((p) => p.slug)];

  // Admin-created SKUs are deliberately not in the static catalog — leave them alone.
  const stale = await sql`
    SELECT slug, name FROM inventory
    WHERE active = true AND source <> 'admin' AND slug <> ALL(${known})
    ORDER BY name ASC
  `;

  if (stale.length === 0) {
    console.log('Nothing to prune — every active SKU is in the catalog.');
    return;
  }

  console.log(`Deactivating ${stale.length} SKU(s) no longer in the catalog:`);
  for (const r of stale) console.log(`  · ${r.name} (${r.slug})`);

  await sql`
    UPDATE inventory SET active = false, updated_at = NOW()
    WHERE active = true AND source <> 'admin' AND slug <> ALL(${known})
  `;
  console.log('\nDone. They stay in the table so past orders keep resolving.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
