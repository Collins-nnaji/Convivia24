-- Venues — DB-backed venue profiles (replaces static catalog)
-- Supports admin-created venues + partner submissions awaiting approval.

CREATE TABLE IF NOT EXISTS venues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  kind            TEXT NOT NULL DEFAULT 'lounge'
                    CHECK (kind IN ('club','lounge','rooftop','beach','live','restaurant','bar')),
  area_id         TEXT NOT NULL,
  area            TEXT NOT NULL,
  address         TEXT NOT NULL DEFAULT '',
  lat             DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng             DOUBLE PRECISION NOT NULL DEFAULT 0,
  tagline         TEXT NOT NULL DEFAULT '',
  about           TEXT NOT NULL DEFAULT '',
  hours           TEXT NOT NULL DEFAULT '',
  cover_ngn       INTEGER,
  card_perk       TEXT NOT NULL DEFAULT '',
  card_discount_pct INTEGER NOT NULL DEFAULT 0,
  photo_url       TEXT,
  gallery         JSONB NOT NULL DEFAULT '[]'::jsonb,
  phone           TEXT,
  instagram       TEXT,
  website         TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('pending','active','suspended')),
  source          TEXT NOT NULL DEFAULT 'admin'
                    CHECK (source IN ('admin','partner_submission')),
  submitted_by    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_venues_area ON venues(area_id);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

-- Venue followers
CREATE TABLE IF NOT EXISTS venue_followers (
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  followed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (venue_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_venue_followers_user ON venue_followers(user_id);

-- Venue reviews (DB-backed, replacing localStorage)
CREATE TABLE IF NOT EXISTS venue_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body            TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_venue_reviews_user_venue ON venue_reviews(venue_id, user_id);

-- Event-circle linking: users can link an event to a circle for group discussion
CREATE TABLE IF NOT EXISTS event_circles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        TEXT NOT NULL,
  circle_id       UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  created_by      TEXT NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_circles_event ON event_circles(event_id);
CREATE INDEX IF NOT EXISTS idx_event_circles_circle ON event_circles(circle_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_circles_unique ON event_circles(event_id, circle_id);

-- Circle messages (for discussing event plans within a circle)
CREATE TABLE IF NOT EXISTS circle_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  body            TEXT NOT NULL,
  event_id        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_circle_messages_circle ON circle_messages(circle_id, created_at DESC);

-- Update night_events to reference venue UUID instead of slug (keep slug for backward compat)
ALTER TABLE night_events ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id);
