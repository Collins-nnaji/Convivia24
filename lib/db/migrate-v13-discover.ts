// Run: npx tsx lib/db/migrate-v13-discover.ts
// Adds social discovery tables: public_event_listings, event_group_requests
// and extends users with interest graph columns.
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

  console.log('🔧 Running v13 migration (social discovery)…\n');

  // Extend users with interest graph
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS interest_tags TEXT[] NOT NULL DEFAULT '{}'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS social_vibe TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS event_types_i_attend TEXT[] NOT NULL DEFAULT '{}'`;
  console.log('✓ users: interest_tags, social_vibe, event_types_i_attend');

  // Public event listings — "I'm attending X"
  await sql`
    CREATE TABLE IF NOT EXISTS public_event_listings (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
      title           TEXT NOT NULL,
      event_type      TEXT NOT NULL DEFAULT 'concert'
                        CHECK (event_type IN ('concert','sports','festival','networking','conference','nightlife','university','fitness','travel','dining','arts','other')),
      venue           TEXT,
      event_date      DATE NOT NULL,
      event_time      TEXT,
      city            TEXT NOT NULL DEFAULT 'Lagos',
      vibe_tags       TEXT[] NOT NULL DEFAULT '{}',
      description     TEXT,
      max_group_size  INT NOT NULL DEFAULT 6,
      is_open         BOOLEAN NOT NULL DEFAULT true,
      cover_emoji     TEXT NOT NULL DEFAULT '🎉',
      ticket_url      TEXT,
      slug            TEXT UNIQUE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ public_event_listings table');

  // Group join requests
  await sql`
    CREATE TABLE IF NOT EXISTS event_group_requests (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id      UUID REFERENCES public_event_listings(id) ON DELETE CASCADE,
      requester_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      host_id         UUID REFERENCES users(id) ON DELETE CASCADE,
      message         TEXT,
      status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','accepted','declined')),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (listing_id, requester_id)
    )
  `;
  console.log('✓ event_group_requests table');

  // Indexes for discovery feed queries
  await sql`CREATE INDEX IF NOT EXISTS idx_pel_city ON public_event_listings(city)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_pel_event_date ON public_event_listings(event_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_pel_event_type ON public_event_listings(event_type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_pel_is_open ON public_event_listings(is_open) WHERE is_open = true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_pel_user_id ON public_event_listings(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_egr_listing ON event_group_requests(listing_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_egr_requester ON event_group_requests(requester_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_egr_host ON event_group_requests(host_id)`;
  console.log('✓ discovery indexes');

  console.log('\n✅ Migration v13 complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
