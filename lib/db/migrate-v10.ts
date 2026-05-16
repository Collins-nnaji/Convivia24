// Run: npx tsx lib/db/migrate-v10.ts
// Creates Convene party-planning tables: events, guests, seating, photos, gifts, vendors, schedule.
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

  console.log('🔧 Running v10 migration (Convene platform)…\n');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_events (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          TEXT NOT NULL,
      slug             TEXT UNIQUE,
      title            TEXT NOT NULL DEFAULT 'My Event',
      event_type       TEXT NOT NULL DEFAULT 'wedding',
      host_name        TEXT NOT NULL,
      event_date       DATE,
      event_time       TEXT,
      city             TEXT,
      venue            TEXT,
      address          TEXT,
      capacity         INT DEFAULT 150,
      dress_code       TEXT,
      invite_direction TEXT DEFAULT 'editorial',
      invite_live      BOOLEAN DEFAULT false,
      cover_url        TEXT,
      rsvp_deadline    DATE,
      days_out         INT GENERATED ALWAYS AS (GREATEST(0, EXTRACT(DAY FROM event_date - CURRENT_DATE)::INT)) STORED,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_events_user ON convivia24_events(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_events_slug ON convivia24_events(slug)`;
  console.log('✓ convivia24_events');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_guests (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id         UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
      name             TEXT NOT NULL,
      email            TEXT,
      phone            TEXT,
      party_size       INT DEFAULT 1,
      table_id         UUID,
      rsvp_state       TEXT NOT NULL DEFAULT 'pending',
      dietary          TEXT,
      relation         TEXT,
      song_request     TEXT,
      message          TEXT,
      pass_token       TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
      arrived_at       TIMESTAMPTZ,
      invite_sent_at   TIMESTAMPTZ,
      invite_opened_at TIMESTAMPTZ,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_guests_event ON convivia24_guests(event_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_guests_token ON convivia24_guests(pass_token)`;
  console.log('✓ convivia24_guests');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_seating_tables (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id   UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      shape      TEXT DEFAULT 'round',
      seats      INT DEFAULT 8,
      x_pos      FLOAT DEFAULT 50,
      y_pos      FLOAT DEFAULT 50,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_tables_event ON convivia24_seating_tables(event_id, sort_order)`;
  console.log('✓ convivia24_seating_tables');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_photos (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id      UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
      uploader_name TEXT,
      url           TEXT NOT NULL,
      caption       TEXT,
      blob_name     TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_photos_event ON convivia24_photos(event_id, created_at DESC)`;
  console.log('✓ convivia24_photos');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_gifts (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id       UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
      title          TEXT NOT NULL,
      kind           TEXT DEFAULT 'item',
      amount_target  NUMERIC,
      amount_pledged NUMERIC DEFAULT 0,
      image_label    TEXT,
      claimed        BOOLEAN DEFAULT false,
      sort_order     INT DEFAULT 0,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_gifts_event ON convivia24_gifts(event_id, sort_order)`;
  console.log('✓ convivia24_gifts');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_event_vendors (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id   UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
      category   TEXT NOT NULL,
      name       TEXT NOT NULL,
      contact    TEXT,
      status     TEXT DEFAULT 'inquiry',
      notes      TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_vendors_event ON convivia24_event_vendors(event_id)`;
  console.log('✓ convivia24_event_vendors');

  await sql`
    CREATE TABLE IF NOT EXISTS convivia24_schedule (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id   UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
      time_label TEXT NOT NULL,
      title      TEXT NOT NULL,
      subtitle   TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_schedule_event ON convivia24_schedule(event_id, sort_order)`;
  console.log('✓ convivia24_schedule');

  await sql`
    INSERT INTO convivia24_events (user_id, title, event_type, host_name)
    VALUES ('system-seed', 'Your first event', 'wedding', 'Host')
    ON CONFLICT DO NOTHING
  `;
  console.log('✓ seeded example event');

  console.log('\n✅ Migration v10 complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
