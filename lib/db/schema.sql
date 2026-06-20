-- Convivia24 — AI-Powered Events & Ticketing Platform
-- Full Production Schema
-- Run: npx tsx lib/db/migrate.ts

-- ═══════════════════════════════════════════════
-- CLEAN SLATE: Drop legacy restaurant tables
-- ═══════════════════════════════════════════════
DROP TABLE IF EXISTS client_users CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS audit_leads CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS pipeline_deals CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS convivium_members CASCADE;

-- ═══════════════════════════════════════════════
-- ORGANIZERS (people / brands who run events)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS organizers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL,
  phone         TEXT,
  bio           TEXT,
  logo_url      TEXT,
  verified      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_organizers_email ON organizers(email);

-- ═══════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  tagline         TEXT,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'party'
                    CHECK (category IN ('party','concert','festival','nightlife','conference','comedy','sports','food','arts','community','workshop','other')),
  organizer_id    UUID REFERENCES organizers(id) ON DELETE SET NULL,
  organizer_name  TEXT,
  venue           TEXT,
  address         TEXT,
  city            TEXT NOT NULL DEFAULT 'Lagos',
  country         TEXT NOT NULL DEFAULT 'Nigeria',
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  timezone        TEXT NOT NULL DEFAULT 'Africa/Lagos',
  cover_image     TEXT,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  capacity        INTEGER,
  age_restriction TEXT,
  lineup          TEXT[],
  tags            TEXT[],
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'published'
                    CHECK (status IN ('draft','published','cancelled','completed')),
  ai_generated    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_status   ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_starts   ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_city     ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);

-- ═══════════════════════════════════════════════
-- TICKET TYPES (tiers per event)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ticket_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  quantity        INTEGER NOT NULL DEFAULT 100,
  sold            INTEGER NOT NULL DEFAULT 0,
  max_per_order   INTEGER NOT NULL DEFAULT 10,
  sales_end       TIMESTAMPTZ,
  perks           TEXT[],
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);

-- ═══════════════════════════════════════════════
-- ORDERS (a checkout / RSVP)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT NOT NULL UNIQUE,
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT,
  buyer_name      TEXT NOT NULL,
  buyer_email     TEXT NOT NULL,
  buyer_phone     TEXT,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  fees            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  status          TEXT NOT NULL DEFAULT 'paid'
                    CHECK (status IN ('pending','paid','cancelled','refunded')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(LOWER(buyer_email));
CREATE INDEX IF NOT EXISTS idx_orders_user  ON orders(user_id);
-- Ensure user_id exists on databases migrated before auth was added
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT;
-- Optional Face Check-in: a selfie enrolled by the buyer, verified at the door
ALTER TABLE orders ADD COLUMN IF NOT EXISTS face_image_url TEXT;

-- ═══════════════════════════════════════════════
-- TICKETS (one scannable ticket per attendee)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id  UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  ticket_type_name TEXT,
  attendee_name   TEXT,
  price           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  status          TEXT NOT NULL DEFAULT 'valid'
                    CHECK (status IN ('valid','used','void')),
  checked_in_at   TIMESTAMPTZ,
  checked_in_by   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ═══════════════════════════════════════════════
-- INQUIRIES (organizer / partnership / support)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS inquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT,
  inquiry_type  TEXT NOT NULL DEFAULT 'General Enquiry',
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'read', 'responded', 'archived')),
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- ═══════════════════════════════════════════════
-- WAITLIST (early-access / newsletter)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  name       TEXT,
  company    TEXT,
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'invited', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(LOWER(email));

-- ═══════════════════════════════════════════════
-- PERSONAL TASKS ("My 24" calendar — manual items + AI rest buffers)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personal_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  title         TEXT NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low','normal','high')),
  is_rest_block BOOLEAN NOT NULL DEFAULT false,
  source        TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('manual','ai_buffer','ai_destress')),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','done','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_user  ON personal_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_starts ON personal_tasks(starts_at);

-- People invited to a personal calendar item (e.g. "dinner with friends")
CREATE TABLE IF NOT EXISTS personal_task_invitees (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES personal_tasks(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  status        TEXT NOT NULL DEFAULT 'invited'
                  CHECK (status IN ('invited','accepted','declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_invitees_task ON personal_task_invitees(task_id);

-- ═══════════════════════════════════════════════
-- COMPANION (the learning AI chatbot — chat history + remembered facts)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS companion_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_messages_user ON companion_messages(user_id, created_at);

-- One row per remembered fact about a user (preferences, habits, people, goals)
CREATE TABLE IF NOT EXISTS companion_memory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  key           TEXT NOT NULL,
  value         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companion_memory_user_key ON companion_memory(user_id, LOWER(key));

-- ═══════════════════════════════════════════════
-- IMAGE UPLOADS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS uploads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_name   TEXT NOT NULL UNIQUE,
  url         TEXT NOT NULL,
  filename    TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes  BIGINT,
  context     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- ═══════════════════════════════════════════════
-- SEED: A demo organizer + flagship events with ticket tiers
-- ═══════════════════════════════════════════════
INSERT INTO organizers (name, slug, email, bio, verified) VALUES
  ('Convivia Live', 'convivia-live', 'live@convivia24.com', 'The in-house events arm of Convivia24. Parties, concerts and culture across Lagos, Abuja and London.', true)
ON CONFLICT (slug) DO NOTHING;

-- Event + ticket-tier sample data now lives in lib/seed.ts (run by migrate.ts
-- and the admin "Seed sample events" action) so it stays idempotent and global.
