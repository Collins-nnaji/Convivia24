// Run: npx tsx lib/db/migrate-v2.ts
// Adds new columns without dropping existing data
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env */ }

async function migrate() {
  if (!process.env.DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Running v2 migration...\n');

  // users: add verified column
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false`;
  console.log('✓ users.verified');

  // hangouts: add new columns
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'social'`;
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS city TEXT`;
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS ticket_url TEXT`;
  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS ticket_price INT`;
  console.log('✓ hangouts.category, city, ticket_url, ticket_price');

  // add category check constraint if not exists (best-effort)
  try {
    await sql`ALTER TABLE hangouts ADD CONSTRAINT hangouts_category_check CHECK (category IN ('nightlife','dining','sports','gigs','outdoors','arts','social'))`;
  } catch { /* already exists */ }

  // index for city filtering
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_city ON hangouts(city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_category ON hangouts(category)`;
  console.log('✓ indexes');

  console.log('\n✅ Migration complete.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
