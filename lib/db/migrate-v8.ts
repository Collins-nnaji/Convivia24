// Run: npx tsx lib/db/migrate-v8.ts
// Adds vendor profile columns to outlet_applications + vendor_media table
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
} catch { /* no .env */ }

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  console.log('🔧 Running v8 migration (vendor profile)…\n');

  // Vendor-facing profile columns on outlet_applications
  await sql`ALTER TABLE outlet_applications ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE`;
  await sql`ALTER TABLE outlet_applications ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE outlet_applications ADD COLUMN IF NOT EXISTS full_address TEXT`;
  await sql`ALTER TABLE outlet_applications ADD COLUMN IF NOT EXISTS instagram_handle TEXT`;
  await sql`ALTER TABLE outlet_applications ADD COLUMN IF NOT EXISTS logo_url TEXT`;
  await sql`ALTER TABLE outlet_applications ADD COLUMN IF NOT EXISTS cover_url TEXT`;
  console.log('✓ outlet_applications: slug, description, full_address, instagram_handle, logo_url, cover_url');

  // Back-fill slugs from existing business_name
  await sql`
    UPDATE outlet_applications
    SET slug = LOWER(REGEXP_REPLACE(TRIM(business_name), '[^a-z0-9]+', '-', 'gi')) || '-' || SUBSTRING(id::text, 1, 6)
    WHERE slug IS NULL AND TRIM(business_name) != ''
  `;
  console.log('✓ back-filled slugs');

  // Media table: photos + videos attached to an outlet
  await sql`
    CREATE TABLE IF NOT EXISTS vendor_media (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      outlet_id   UUID NOT NULL REFERENCES outlet_applications(id) ON DELETE CASCADE,
      url         TEXT NOT NULL,
      media_type  TEXT NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
      caption     TEXT,
      sort_order  INT NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_vendor_media_outlet ON vendor_media(outlet_id, sort_order)`;
  console.log('✓ vendor_media table');

  console.log('\n✅ Migration v8 complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
