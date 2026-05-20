import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { neonAuth } from '@/lib/auth/server';
import { isConviviaAdminAsync } from '@/lib/admin';

/**
 * One-time migration runner — call POST /api/admin/run-migrations?secret=<MIGRATION_SECRET>
 * from your browser or curl after deploying, to create the Convene tables.
 * Only accessible to platform admins or with the MIGRATION_SECRET env var.
 */
export async function POST(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get('secret');
  const envSecret = process.env.MIGRATION_SECRET;

  // Auth: either platform admin or matching secret
  if (envSecret && secret !== envSecret) {
    const { user } = await neonAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = await isConviviaAdminAsync(user.email);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);
  const results: string[] = [];

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_events (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id         TEXT NOT NULL,
        slug            TEXT UNIQUE,
        title           TEXT NOT NULL DEFAULT 'My Event',
        event_type      TEXT NOT NULL DEFAULT 'wedding',
        host_name       TEXT NOT NULL,
        event_date      DATE,
        event_time      TEXT,
        city            TEXT,
        venue           TEXT,
        address         TEXT,
        capacity        INT DEFAULT 150,
        dress_code      TEXT,
        invite_direction TEXT DEFAULT 'editorial',
        invite_live     BOOLEAN DEFAULT false,
        cover_url       TEXT,
        rsvp_deadline   DATE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_events');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_events_user ON convivia24_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_events_slug ON convivia24_events(slug)`;

    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_guests (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id        UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
        name            TEXT NOT NULL,
        email           TEXT,
        phone           TEXT,
        party_size      INT DEFAULT 1,
        table_id        UUID,
        rsvp_state      TEXT NOT NULL DEFAULT 'pending',
        dietary         TEXT,
        relation        TEXT,
        song_request    TEXT,
        message         TEXT,
        pass_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
        arrived_at      TIMESTAMPTZ,
        invite_sent_at  TIMESTAMPTZ,
        invite_opened_at TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_guests');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_guests_event ON convivia24_guests(event_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_guests_token ON convivia24_guests(pass_token)`;

    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_seating_tables (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id    UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        shape       TEXT DEFAULT 'round',
        seats       INT DEFAULT 8,
        x_pos       FLOAT DEFAULT 50,
        y_pos       FLOAT DEFAULT 50,
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_seating_tables');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_tables_event ON convivia24_seating_tables(event_id, sort_order)`;

    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_photos (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id       UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
        uploader_name  TEXT,
        url            TEXT NOT NULL,
        caption        TEXT,
        blob_name      TEXT,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_photos');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_photos_event ON convivia24_photos(event_id, created_at DESC)`;

    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_gifts (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id        UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
        title           TEXT NOT NULL,
        kind            TEXT DEFAULT 'item',
        amount_target   NUMERIC,
        amount_pledged  NUMERIC DEFAULT 0,
        image_label     TEXT,
        claimed         BOOLEAN DEFAULT false,
        sort_order      INT DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_gifts');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_gifts_event ON convivia24_gifts(event_id, sort_order)`;

    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_event_vendors (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id    UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
        category    TEXT NOT NULL,
        name        TEXT NOT NULL,
        contact     TEXT,
        status      TEXT DEFAULT 'inquiry',
        notes       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_event_vendors');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_vendors_event ON convivia24_event_vendors(event_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS convivia24_schedule (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id    UUID NOT NULL REFERENCES convivia24_events(id) ON DELETE CASCADE,
        time_label  TEXT NOT NULL,
        title       TEXT NOT NULL,
        subtitle    TEXT,
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    results.push('✓ convivia24_schedule');

    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_schedule_event ON convivia24_schedule(event_id, sort_order)`;

    // v11: link guests to signed-in user accounts
    await sql`
      ALTER TABLE convivia24_guests
      ADD COLUMN IF NOT EXISTS linked_user_id TEXT
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_convivia24_guests_user ON convivia24_guests(linked_user_id) WHERE linked_user_id IS NOT NULL`;
    results.push('✓ convivia24_guests.linked_user_id (v11)');

    await sql`
      ALTER TABLE convivia24_events
      ADD COLUMN IF NOT EXISTS invite_customization JSONB DEFAULT '{}'::jsonb
    `;
    results.push('✓ convivia24_events.invite_customization');

    results.push('✅ Migration complete — all Convene tables created.');
    return NextResponse.json({ ok: true, results });

  } catch (err) {
    console.error('[convivia24/migrate]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, partial_results: results }, { status: 500 });
  }
}
