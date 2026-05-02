-- Convivia24 App Schema
-- Run: npx tsx lib/db/migrate.ts

-- Drop old tables that are no longer needed
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS circle_members CASCADE;
DROP TABLE IF EXISTS circles CASCADE;
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS hangouts CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─────────────────────────────────────
-- USERS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id       TEXT UNIQUE,                          -- Neon Auth user ID
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  location      TEXT DEFAULT 'Lagos',
  tier          TEXT NOT NULL DEFAULT 'standard'      -- 'standard' or 'black'
                  CHECK (tier IN ('standard', 'black')),
  rating        NUMERIC(3, 2) DEFAULT 0,
  hangouts_count INT DEFAULT 0,
  verified      BOOLEAN NOT NULL DEFAULT false,       -- identity verified (stub — wire to Twilio/KYC later)
  open_to_meet  BOOLEAN NOT NULL DEFAULT false,       -- user is actively open to meeting people now
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- VENUES (partner spaces, not owned)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS venues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,                        -- e.g. 'Arrival Lounge', 'Curated Dining'
  category      TEXT NOT NULL DEFAULT 'dining'        -- 'dining', 'lounge', 'boardroom', 'accommodations', 'wellness'
                  CHECK (category IN ('dining', 'lounge', 'boardroom', 'accommodations', 'wellness')),
  tagline       TEXT,
  description   TEXT,
  image_url     TEXT,
  capacity      TEXT,
  partner_name  TEXT,                                 -- real outlet name e.g. "Noir Lagos"
  address       TEXT,                                 -- physical address
  minimum_spend INT,                                  -- per-person minimum in Naira
  availability  TEXT,                                 -- e.g. "Mon–Wed evenings"
  rating        NUMERIC(2, 1) DEFAULT 4.5,
  city          TEXT NOT NULL DEFAULT 'Lagos',        -- Lagos, Abuja, London
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- HANGOUTS (The Gathering / Event)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS hangouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  vibe          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'social'        -- 'nightlife','dining','sports','fitness','gigs','outdoors','arts','social'
                  CHECK (category IN ('nightlife','dining','sports','fitness','gigs','outdoors','arts','social')),
  type          TEXT NOT NULL DEFAULT 'open'           -- 'open' or 'curated'
                  CHECK (type IN ('open', 'curated')),
  status        TEXT NOT NULL DEFAULT 'pending'       -- 'pending', 'confirmed', 'completed', 'dissolved'
                  CHECK (status IN ('pending', 'confirmed', 'completed', 'dissolved')),
  event_time    TIMESTAMPTZ NOT NULL,
  location      TEXT NOT NULL,
  city          TEXT,                                 -- detected city from Places autocomplete
  venue_id      UUID REFERENCES venues(id),
  cover_image   TEXT,                                 -- Azure Blob URL
  ticket_url    TEXT,                                 -- external ticket link (Eventbrite etc.)
  ticket_price  INT,                                  -- price in Naira, NULL = free
  max_guests    INT NOT NULL DEFAULT 6,
  current_guests INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- ATTENDEES (RSVP)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendees (
  hangout_id    UUID REFERENCES hangouts(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'attending'     -- 'attending', 'ghosted'
                  CHECK (status IN ('attending', 'ghosted')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (hangout_id, user_id)
);

-- ─────────────────────────────────────
-- CIRCLES (6–24 person groups)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS circles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  created_by    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- CIRCLE MEMBERS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS circle_members (
  circle_id     UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

-- ─────────────────────────────────────
-- CONNECTIONS (People You've Met)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  user_id_1     UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id_2     UUID REFERENCES users(id) ON DELETE CASCADE,
  rating        INT,
  connected_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id_1, user_id_2)
);

-- ─────────────────────────────────────
-- INQUIRIES
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT,
  inquiry_type  TEXT NOT NULL DEFAULT 'General Inquiry',
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'read', 'responded', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- WAITLIST
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  company       TEXT,
  name          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_hangouts_status ON hangouts(status);
CREATE INDEX IF NOT EXISTS idx_hangouts_type ON hangouts(type);
CREATE INDEX IF NOT EXISTS idx_hangouts_time ON hangouts(event_time);
CREATE INDEX IF NOT EXISTS idx_attendees_user ON attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(LOWER(email));
