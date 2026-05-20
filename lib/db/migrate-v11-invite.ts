// Run: npx tsx lib/db/migrate-v11-invite.ts
// Adds invite_customization JSONB for per-event invite copy and display toggles.
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
} catch { /* hosted env provides DATABASE_URL directly */ }

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Running v11 invite customization migration…\n');

  await sql`
    ALTER TABLE convivia24_events
    ADD COLUMN IF NOT EXISTS invite_customization JSONB DEFAULT '{}'::jsonb
  `;
  console.log('✓ convivia24_events.invite_customization');

  console.log('\n✅ Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
