// Run: npx tsx lib/db/migrate-v3.ts
// Adds: match credits, premium subscriptions, reservations, match_requests
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

  console.log('🔧 Running v3 migration (premium model + reservations + match tracking)...\n');

  // ── PREMIUM / MATCH CREDITS on users ──────────────────────────────────
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS match_credits_remaining INT NOT NULL DEFAULT 1`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS match_credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free','black','black_trial','cancelled'))`;
  console.log('✓ users.match_credits_remaining, match_credits_reset_at, premium_until, subscription_status');

  // ── MATCH REQUESTS — every Skip / Delay / Join from AI Match flow ─────
  await sql`
    CREATE TABLE IF NOT EXISTS match_requests (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
      city          TEXT NOT NULL,
      area          TEXT,
      vibe          TEXT,
      energy        TEXT,
      group_size    INT NOT NULL DEFAULT 6,
      action        TEXT NOT NULL DEFAULT 'matched'
                      CHECK (action IN ('matched','joined','skipped','delayed')),
      hangout_id    UUID REFERENCES hangouts(id) ON DELETE SET NULL,
      matched_user_ids UUID[] NOT NULL DEFAULT '{}',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_match_requests_user ON match_requests(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_match_requests_city ON match_requests(city, created_at DESC)`;
  console.log('✓ match_requests');

  // ── RESERVATIONS — venue bookings ────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
      venue_id      UUID REFERENCES venues(id) ON DELETE CASCADE,
      party_size    INT NOT NULL DEFAULT 2,
      requested_for TIMESTAMPTZ,
      status        TEXT NOT NULL DEFAULT 'requested'
                      CHECK (status IN ('requested','confirmed','seated','cancelled','no_show')),
      notes         TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reservations_venue ON reservations(venue_id, created_at DESC)`;
  console.log('✓ reservations');

  // ── SUBSCRIPTIONS — premium event log ────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS subscription_events (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
      event_type    TEXT NOT NULL
                      CHECK (event_type IN ('subscribed','renewed','cancelled','trial_started','trial_ended','upgraded','downgraded')),
      tier_from     TEXT,
      tier_to       TEXT,
      amount_ngn    INT,
      currency      TEXT DEFAULT 'NGN',
      payment_ref   TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id, created_at DESC)`;
  console.log('✓ subscription_events');

  console.log('\n✅ v3 migration complete.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
