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
  sales_start     TIMESTAMPTZ,
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
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','cancelled','refunded','failed','expired')),
  payment_provider TEXT,
  payment_reference TEXT,
  payment_intent_id TEXT,
  payment_method    TEXT,
  paid_at           TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  idempotency_key   TEXT,
  platform_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  organizer_net     NUMERIC(12,2),
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

CREATE TABLE IF NOT EXISTS order_line_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_type_id  UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  ticket_type_name TEXT NOT NULL,
  unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity        INTEGER NOT NULL DEFAULT 1,
  line_total      NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_line_items_order ON order_line_items(order_id);

CREATE TABLE IF NOT EXISTS payment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider        TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  provider_ref    TEXT,
  payload         JSONB NOT NULL DEFAULT '{}',
  processed       BOOLEAN NOT NULL DEFAULT false,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);

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

-- ═══════════════════════════════════════════════
-- EXPERIENTIAL PLATFORM EXTENSIONS
-- Guestlist approval, lounge, broadcasts, memory wall, per-event theming
-- ═══════════════════════════════════════════════
ALTER TABLE events ADD COLUMN IF NOT EXISTS guestlist_mode TEXT NOT NULL DEFAULT 'open'
  CHECK (guestlist_mode IN ('open', 'approval'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS theme_mode TEXT NOT NULL DEFAULT 'day'
  CHECK (theme_mode IN ('day', 'night'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS theme_accent TEXT DEFAULT '#c9a84c';
ALTER TABLE events ADD COLUMN IF NOT EXISTS lounge_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS memory_wall_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS payout_split JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS guestlist_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  applicant_name  TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  linkedin_url    TEXT,
  instagram_url   TEXT,
  application_text TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, applicant_email)
);
CREATE INDEX IF NOT EXISTS idx_guestlist_event ON guestlist_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_guestlist_status ON guestlist_applications(status);

CREATE TABLE IF NOT EXISTS broadcasts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  channel         TEXT NOT NULL DEFAULT 'email'
                    CHECK (channel IN ('email', 'sms', 'both')),
  scheduled_for   TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  attachment_url        TEXT,
  attachment_blob_name  TEXT,
  created_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_broadcasts_event ON broadcasts(event_id);

CREATE TABLE IF NOT EXISTS event_guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  headline        TEXT,
  avatar_url      TEXT,
  intent_badge    TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT true,
  ticket_id       UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_guests_event ON event_guests(event_id);

CREATE TABLE IF NOT EXISTS guest_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  from_user_id    TEXT NOT NULL,
  to_user_id      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'declined')),
  message         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, from_user_id, to_user_id)
);
CREATE INDEX IF NOT EXISTS idx_connections_event ON guest_connections(event_id);

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
CREATE INDEX IF NOT EXISTS idx_memory_event ON memory_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_memory_created ON memory_posts(created_at DESC);

-- ═══════════════════════════════════════════════
-- VENDOR MARKETPLACE
-- Vendors onboard themselves; organisers browse an approved directory.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vendors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'other',
  contact_name  TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  whatsapp      TEXT,
  website       TEXT,
  instagram     TEXT,
  city          TEXT,
  country       TEXT,
  description   TEXT,
  services      TEXT[],
  price_from    NUMERIC,
  currency      TEXT NOT NULL DEFAULT 'NGN',
  logo_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vendors_status     ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category   ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city       ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);
