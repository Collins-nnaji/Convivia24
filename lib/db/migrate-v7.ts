// Run: npx tsx lib/db/migrate-v7.ts
// Creates shift_applications — the worker-applies-to-shift hire loop table.
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
  console.log('🔧 Running v7 migration (shift_applications)…\n');

  await sql`
    CREATE TABLE IF NOT EXISTS shift_applications (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      shift_id         UUID NOT NULL REFERENCES hangouts(id) ON DELETE CASCADE,
      worker_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status           TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'shortlisted', 'confirmed', 'rejected', 'no_show')),
      payout_provider  TEXT CHECK (payout_provider IN ('OPay', 'PalmPay', 'Moniepoint')),
      payout_phone     TEXT,
      note             TEXT,
      applied_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (shift_id, worker_id)
    )
  `;
  console.log('✓ shift_applications');

  await sql`CREATE INDEX IF NOT EXISTS idx_shift_apps_shift ON shift_applications(shift_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_shift_apps_worker ON shift_applications(worker_id, applied_at DESC)`;
  console.log('✓ indexes');

  console.log('\n✅ Migration v7 complete.');
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
