// Run: npx tsx lib/db/migrate-v9.ts
// Adds database-backed app admins and seeds the owner admin.
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

const envPath = join(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (!key || process.env[key]) continue;
    process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
  }
} catch {
  // Hosted environments provide DATABASE_URL directly.
}

const OWNER_EMAIL = 'collinsnnaji1@gmail.com';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Running v9 migration (app admins)…\n');

  await sql`
    CREATE TABLE IF NOT EXISTS app_admins (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT NOT NULL UNIQUE,
      role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
      added_by    TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ app_admins table');

  await sql`
    INSERT INTO app_admins (email, role, added_by)
    VALUES (${OWNER_EMAIL}, 'owner', 'system')
    ON CONFLICT (email) DO UPDATE SET role = 'owner', updated_at = NOW()
  `;
  console.log(`✓ seeded owner admin: ${OWNER_EMAIL}`);

  console.log('\n✅ Migration v9 complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
