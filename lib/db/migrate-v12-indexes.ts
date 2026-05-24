// Run: npx tsx lib/db/migrate-v12-indexes.ts
// Adds missing indexes for scalability on hangouts, attendees, users, and convivia24 tables.
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

  console.log('🔧 Running v12 migration (scalability indexes)…\n');

  // hangouts — the main discovery query filters by city and event_time constantly
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_city ON hangouts(city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_event_time ON hangouts(event_time)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_host_id ON hangouts(host_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_status_time ON hangouts(status, event_time)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_hangouts_category ON hangouts(category)`;
  console.log('✓ hangouts indexes');

  // attendees — N+1 fix: hangout_id lookup is the most common join
  await sql`CREATE INDEX IF NOT EXISTS idx_attendees_hangout ON attendees(hangout_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_attendees_hangout_status ON attendees(hangout_id, status)`;
  console.log('✓ attendees indexes');

  // users — people page filters by location and open_to_meet
  await sql`CREATE INDEX IF NOT EXISTS idx_users_location ON users(location)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_open_to_meet ON users(open_to_meet) WHERE open_to_meet = true`;
  console.log('✓ users indexes');

  // convivia24_guests — linked_user_id for "my invites" query
  await sql`CREATE INDEX IF NOT EXISTS idx_cv24_guests_linked_user ON convivia24_guests(linked_user_id) WHERE linked_user_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cv24_guests_rsvp_state ON convivia24_guests(event_id, rsvp_state)`;
  console.log('✓ convivia24_guests indexes');

  // convivia24_events — event_date for ordering upcoming events
  await sql`CREATE INDEX IF NOT EXISTS idx_cv24_events_date ON convivia24_events(event_date)`;
  console.log('✓ convivia24_events indexes');

  console.log('\n✅ Migration v12 complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
