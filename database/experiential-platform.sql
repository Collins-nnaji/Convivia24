-- ═══════════════════════════════════════════════════════════════════════════════
-- Convivia24 — Experiential Platform migration (run this directly in Neon SQL)
--
-- Safe to run on an existing events DB. All statements are idempotent.
-- Paste into Neon Console → SQL Editor, or: psql $DATABASE_URL -f database/experiential-platform.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- Per-event experiential settings
ALTER TABLE events ADD COLUMN IF NOT EXISTS guestlist_mode TEXT NOT NULL DEFAULT 'open';
ALTER TABLE events ADD COLUMN IF NOT EXISTS theme_mode TEXT NOT NULL DEFAULT 'day';
ALTER TABLE events ADD COLUMN IF NOT EXISTS theme_accent TEXT DEFAULT '#c9a84c';
ALTER TABLE events ADD COLUMN IF NOT EXISTS lounge_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS memory_wall_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS payout_split JSONB DEFAULT '[]'::jsonb;

-- Drop old check constraints if re-running (Postgres names vary; ignore errors)
DO $$ BEGIN
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_guestlist_mode_check;
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_theme_mode_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE events ADD CONSTRAINT events_guestlist_mode_check
  CHECK (guestlist_mode IN ('open', 'approval'));
ALTER TABLE events ADD CONSTRAINT events_theme_mode_check
  CHECK (theme_mode IN ('day', 'night'));

-- Approval-only guestlists
CREATE TABLE IF NOT EXISTS guestlist_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id          TEXT NOT NULL,
  applicant_name   TEXT NOT NULL,
  applicant_email  TEXT NOT NULL,
  linkedin_url     TEXT,
  instagram_url    TEXT,
  application_text TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  reviewed_by      TEXT,
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, applicant_email)
);
CREATE INDEX IF NOT EXISTS idx_guestlist_event  ON guestlist_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_guestlist_status ON guestlist_applications(status);

-- Organizer → guest broadcasts
CREATE TABLE IF NOT EXISTS broadcasts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id              UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subject               TEXT NOT NULL,
  body                  TEXT NOT NULL,
  channel               TEXT NOT NULL DEFAULT 'email'
                          CHECK (channel IN ('email', 'sms', 'both')),
  scheduled_for         TIMESTAMPTZ,
  sent_at               TIMESTAMPTZ,
  recipient_count       INTEGER NOT NULL DEFAULT 0,
  attachment_url        TEXT,
  attachment_blob_name  TEXT,
  created_by            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_broadcasts_event ON broadcasts(event_id);

-- Add attachment columns if table already existed without them
ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS attachment_blob_name TEXT;

-- Digital lounge profiles
CREATE TABLE IF NOT EXISTS event_guests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  headline      TEXT,
  avatar_url    TEXT,
  intent_badge  TEXT,
  is_public     BOOLEAN NOT NULL DEFAULT true,
  ticket_id     UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_guests_event ON event_guests(event_id);

-- Guest-to-guest connections (Resonate)
CREATE TABLE IF NOT EXISTS guest_connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  from_user_id TEXT NOT NULL,
  to_user_id   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'declined')),
  message      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, from_user_id, to_user_id)
);
CREATE INDEX IF NOT EXISTS idx_connections_event ON guest_connections(event_id);

-- Post-event memory wall
CREATE TABLE IF NOT EXISTS memory_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  media_url       TEXT NOT NULL,
  media_type      TEXT NOT NULL DEFAULT 'image'
                    CHECK (media_type IN ('image', 'video')),
  blob_name       TEXT,
  caption         TEXT,
  tagged_user_ids TEXT[],
  reactions       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_memory_event   ON memory_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_memory_created ON memory_posts(created_at DESC);

ALTER TABLE memory_posts ADD COLUMN IF NOT EXISTS blob_name TEXT;
