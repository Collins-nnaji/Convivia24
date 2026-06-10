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

INSERT INTO events (slug, title, tagline, description, category, organizer_name, venue, address, city, country, starts_at, ends_at, cover_image, currency, capacity, age_restriction, lineup, tags, is_featured, status)
VALUES
  ('lagos-after-dark', 'Lagos After Dark', 'The city''s loudest night',
   'An all-night Afrobeats and Amapiano takeover on the Victoria Island waterfront. Three rooms, ten DJs, and a rooftop that does not close until the sun is up. Dress to be seen.',
   'nightlife', 'Convivia Live', 'The Terrace, Victoria Island', '24 Ozumba Mbadiwe Ave, Victoria Island', 'Lagos', 'Nigeria',
   NOW() + INTERVAL '14 days' + INTERVAL '22 hours', NOW() + INTERVAL '15 days' + INTERVAL '4 hours',
   '/The Spaces2.png', 'NGN', 600, '18+', ARRAY['DJ Spinall','Obi the DJ','TMXO'], ARRAY['afrobeats','amapiano','rooftop'], true, 'published'),
  ('the-gathering-summit', 'The Gathering — Founders'' Dinner', 'One room. One night a year.',
   'Our annual dinner-summit. A keynote, a long table, and the people shaping African business in one room. Limited to 120 seats. Dinner, wine pairing and after-party included.',
   'conference', 'Convivia Live', 'Convivia24 Flagship', 'Victoria Island', 'Lagos', 'Nigeria',
   NOW() + INTERVAL '30 days' + INTERVAL '18 hours', NOW() + INTERVAL '30 days' + INTERVAL '23 hours',
   '/Convivium2.png', 'NGN', 120, '21+', ARRAY['Keynote Address','Long Table Dinner','After Party'], ARRAY['business','dinner','network'], true, 'published'),
  ('sunday-jazz-brunch', 'Sunday Jazz Brunch', 'The slowest, best morning of your week',
   'A live jazz quartet, a bottomless brunch menu and a terrace in the sun. The most civilised way to spend a Sunday in Lagos. Every Sunday, 12pm til 5pm.',
   'food', 'Convivia Live', 'The Terrace', 'Victoria Island', 'Lagos', 'Nigeria',
   NOW() + INTERVAL '5 days' + INTERVAL '12 hours', NOW() + INTERVAL '5 days' + INTERVAL '17 hours',
   '/Convivium3.png', 'NGN', 150, 'All ages', ARRAY['The Convivia Quartet'], ARRAY['jazz','brunch','live'], false, 'published'),
  ('abuja-amapiano-festival', 'Abuja Amapiano Festival', 'The capital turns up',
   'A full-day open-air festival bringing the biggest Amapiano acts to Abuja. Food village, art market, and a main stage that runs from noon til midnight.',
   'festival', 'Convivia Live', 'Jabi Lake Arena', 'Jabi, Abuja', 'Abuja', 'Nigeria',
   NOW() + INTERVAL '45 days' + INTERVAL '12 hours', NOW() + INTERVAL '45 days' + INTERVAL '24 hours',
   '/conv1.png', 'NGN', 3000, '16+', ARRAY['Kabza headline','Major League','Local opener'], ARRAY['amapiano','festival','outdoor'], true, 'published'),
  ('london-diaspora-mixer', 'London Diaspora Mixer', 'Mayfair meets the motherland',
   'An evening of cocktails, connection and culture for the African diaspora in London. Curated guest list, live sax, and the Convivia24 cocktail programme.',
   'party', 'Convivia Live', 'Convivia24 London', 'Mayfair, London', 'London', 'United Kingdom',
   NOW() + INTERVAL '21 days' + INTERVAL '19 hours', NOW() + INTERVAL '22 days' + INTERVAL '1 hours',
   '/Convivium.png', 'GBP', 200, '21+', ARRAY['Live Sax Set','Guest DJ'], ARRAY['cocktails','network','diaspora'], false, 'published'),
  ('comedy-at-the-floor', 'Comedy at The Floor', 'Laugh til it hurts',
   'An intimate stand-up night with the best comedians on the continent. Two-drink minimum, no phones, and front-row seats close enough to get picked on.',
   'comedy', 'Convivia Live', 'The Floor', 'Victoria Island, Lagos', 'Lagos', 'Nigeria',
   NOW() + INTERVAL '10 days' + INTERVAL '20 hours', NOW() + INTERVAL '10 days' + INTERVAL '23 hours',
   '/dealrooms.png', 'NGN', 90, '18+', ARRAY['Headline act TBA','Two support sets'], ARRAY['comedy','standup','live'], false, 'published')
ON CONFLICT (slug) DO NOTHING;

-- Ticket tiers for each seeded event
INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
SELECT e.id, v.name, v.description, v.price, e.currency, v.quantity, v.max_per_order, v.perks, v.sort_order
FROM events e, (VALUES
  ('Early Bird',  'Limited release. The cheapest way in.',                    8000,  200, 6, ARRAY['Entry before 11pm'],                       1),
  ('General',     'Standard admission to the main event.',                    12000, 300, 8, ARRAY['All-night entry'],                          2),
  ('VIP Table',   'Reserved table, bottle service and priority entry.',       80000, 30,  4, ARRAY['Reserved table','Bottle on arrival','Skip the line'], 3)
) AS v(name, description, price, quantity, max_per_order, perks, sort_order)
WHERE e.slug = 'lagos-after-dark'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
SELECT e.id, v.name, v.description, v.price, e.currency, v.quantity, v.max_per_order, v.perks, v.sort_order
FROM events e, (VALUES
  ('Seat at the Table', 'Dinner, keynote, wine pairing and after-party.', 150000, 120, 2, ARRAY['Three-course dinner','Wine pairing','After party'], 1),
  ('Host a Table',      'Reserve a table of eight. The best seats in the room.', 1100000, 15, 1, ARRAY['Table for 8','Premium placement','Champagne on arrival'], 2)
) AS v(name, description, price, quantity, max_per_order, perks, sort_order)
WHERE e.slug = 'the-gathering-summit'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
SELECT e.id, v.name, v.description, v.price, e.currency, v.quantity, v.max_per_order, v.perks, v.sort_order
FROM events e, (VALUES
  ('Brunch Seat',   'A seat at brunch with bottomless soft drinks.', 18000, 100, 8, ARRAY['Bottomless soft drinks'], 1),
  ('Bottomless',    'Everything, plus bottomless mimosas for two hours.', 28000, 50, 8, ARRAY['Bottomless mimosas','Priority seating'], 2)
) AS v(name, description, price, quantity, max_per_order, perks, sort_order)
WHERE e.slug = 'sunday-jazz-brunch'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
SELECT e.id, v.name, v.description, v.price, e.currency, v.quantity, v.max_per_order, v.perks, v.sort_order
FROM events e, (VALUES
  ('Day Pass',    'Full-day festival access.', 15000, 2000, 10, ARRAY['All stages','Food village access'], 1),
  ('VIP Pass',    'Raised viewing deck, fast lane and VIP bar.', 60000, 400, 6, ARRAY['VIP deck','Fast lane','VIP bar'], 2),
  ('Cabana',      'Private cabana for up to six guests.', 350000, 40, 1, ARRAY['Private cabana','Dedicated host','Bottle package'], 3)
) AS v(name, description, price, quantity, max_per_order, perks, sort_order)
WHERE e.slug = 'abuja-amapiano-festival'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
SELECT e.id, v.name, v.description, v.price, e.currency, v.quantity, v.max_per_order, v.perks, v.sort_order
FROM events e, (VALUES
  ('Guest List', 'Entry, welcome cocktail and canapés.', 45, 200, 4, ARRAY['Welcome cocktail','Canapés'], 1)
) AS v(name, description, price, quantity, max_per_order, perks, sort_order)
WHERE e.slug = 'london-diaspora-mixer'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (event_id, name, description, price, currency, quantity, max_per_order, perks, sort_order)
SELECT e.id, v.name, v.description, v.price, e.currency, v.quantity, v.max_per_order, v.perks, v.sort_order
FROM events e, (VALUES
  ('General',   'Standard seating.', 7000, 70, 6, ARRAY['Reserved seat'], 1),
  ('Front Row', 'Front-row seats. Brave souls only.', 15000, 20, 4, ARRAY['Front-row seat','Two drinks included'], 2)
) AS v(name, description, price, quantity, max_per_order, perks, sort_order)
WHERE e.slug = 'comedy-at-the-floor'
ON CONFLICT DO NOTHING;
