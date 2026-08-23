// Run: npx tsx lib/db/seed-product-info.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { DRINKS } from '../drinks/catalog';
import { BRAND_INFO, TASTE_NOTES } from '../drinks/brand-guide';

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
    /* missing */
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const ddl = readFileSync(join(process.cwd(), 'lib/db/product-info.sql'), 'utf-8');
  for (const stmt of ddl.split(';').map((s) => s.trim()).filter(Boolean)) {
    await sql.query(stmt);
  }

  let brands = 0;
  for (const [name, info] of Object.entries(BRAND_INFO)) {
    await sql`
      INSERT INTO drink_brands (name, origin, founded, history, style, updated_at)
      VALUES (${name}, ${info.origin}, ${info.founded}, ${info.history}, ${info.style}, NOW())
      ON CONFLICT (name) DO UPDATE SET
        origin = EXCLUDED.origin,
        founded = EXCLUDED.founded,
        history = EXCLUDED.history,
        style = EXCLUDED.style,
        updated_at = NOW()
    `;
    brands += 1;
  }

  let tastes = 0;
  for (const drink of DRINKS) {
    const note = TASTE_NOTES[drink.slug];
    if (!note) continue;
    await sql`
      UPDATE inventory SET taste_note = ${note}, updated_at = NOW() WHERE slug = ${drink.slug}
    `;
    tastes += 1;
  }

  console.log(`Seeded ${brands} brands and ${tastes} taste notes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
