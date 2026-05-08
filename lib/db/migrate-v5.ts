// Run: npx tsx lib/db/migrate-v5.ts
// Cities + outlet onboarding + staff certs + hangout area
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
  console.log('🔧 Running v5 migration (cities, outlet onboarding, certifications, hangout area)…\n');

  await sql`
    CREATE TABLE IF NOT EXISTS cities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      sort_order INT NOT NULL DEFAULT 0
    )
  `;
  console.log('✓ cities');

  await sql`
    INSERT INTO cities (name, slug, sort_order) VALUES
      ('Lagos', 'lagos', 1),
      ('Abuja', 'abuja', 2),
      ('Port Harcourt', 'port-harcourt', 3)
    ON CONFLICT (slug) DO NOTHING
  `;
  console.log('✓ cities seed');

  await sql`
    CREATE TABLE IF NOT EXISTS outlet_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      city_id UUID NOT NULL REFERENCES cities(id),
      business_name TEXT NOT NULL DEFAULT '',
      business_type TEXT,
      street_address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      cac_number TEXT,
      contact_email TEXT,
      status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft','submitted','under_review','approved','rejected')),
      submitted_at TIMESTAMPTZ,
      verification_notes TEXT,
      approved_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      admin_notes TEXT,
      reviewed_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outlet_apps_status ON outlet_applications(status)`;
  console.log('✓ outlet_applications');

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications TEXT[] NOT NULL DEFAULT '{}'`;
  console.log('✓ users.certifications');

  await sql`ALTER TABLE hangouts ADD COLUMN IF NOT EXISTS area TEXT`;
  console.log('✓ hangouts.area');

  console.log('\n✅ Migration v5 complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
