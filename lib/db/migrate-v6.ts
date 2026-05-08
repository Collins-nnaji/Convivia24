// Run: npx tsx lib/db/migrate-v6.ts
// Drops legacy feature tables not used by the hospitality staffing app shell.
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

const envPath = join(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
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
  /* no .env */
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  console.log('🔧 Running v6 migration (drop unused legacy tables)…\n');

  const drops = [
    'DROP TABLE IF EXISTS drink_order_items CASCADE',
    'DROP TABLE IF EXISTS drink_orders CASCADE',
    'DROP TABLE IF EXISTS drink_products CASCADE',
    'DROP TABLE IF EXISTS outlet_profiles CASCADE',
    'DROP TABLE IF EXISTS brand_activations CASCADE',
    'DROP TABLE IF EXISTS market_insights CASCADE',
    'DROP TABLE IF EXISTS market_sprints CASCADE',
    'DROP TABLE IF EXISTS client_profiles CASCADE',
    'DROP TABLE IF EXISTS checkins CASCADE',
    'DROP TABLE IF EXISTS circle_members CASCADE',
    'DROP TABLE IF EXISTS circles CASCADE',
    'DROP TABLE IF EXISTS reservations CASCADE',
  ];

  for (const stmt of drops) {
    await sql.query(stmt);
    console.log(`✓ ${stmt}`);
  }

  console.log('\n✅ Migration v6 complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
