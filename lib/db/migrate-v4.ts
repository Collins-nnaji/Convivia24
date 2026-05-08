// Run: npx tsx lib/db/migrate-v4.ts
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
  console.log('🔧 Running v4 migration (user watchlist cities)…\n');

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS watchlist_cities TEXT[] NOT NULL DEFAULT '{}'
  `;
  console.log('✓ users.watchlist_cities');

  console.log('\nMigration v4 complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
