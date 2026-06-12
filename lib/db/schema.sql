-- Convivia24 — Full Production Schema
-- Run: npx tsx lib/db/migrate.ts

-- ═══════════════════════════════════════════════
-- CLEAN SLATE: Drop old/unused tables
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
DROP TABLE IF EXISTS cleaning_checklists CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS security_incidents CASCADE;
DROP TABLE IF EXISTS security_patrol_logs CASCADE;
DROP TABLE IF EXISTS security_patrol_routes CASCADE;
DROP TABLE IF EXISTS service_bundles CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS shift_schedules CASCADE;
DROP TABLE IF EXISTS staff_assignments CASCADE;
DROP TABLE IF EXISTS training_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS signup_invites CASCADE;

-- ═══════════════════════════════════════════════
-- INQUIRIES (contact / reservation requests)
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
CREATE INDEX IF NOT EXISTS idx_inquiries_email      ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_type       ON inquiries(inquiry_type);

-- ═══════════════════════════════════════════════
-- WAITLIST (Convivium membership interest)
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
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);

-- ═══════════════════════════════════════════════
-- RESERVATIONS (dining bookings)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  party_size      INTEGER NOT NULL CHECK (party_size >= 1),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  space           TEXT NOT NULL DEFAULT 'The Floor'
                    CHECK (space IN ('The Floor', 'The Table', 'The Bar', 'The Terrace', 'Private Dining', 'The Lounge')),
  occasion        TEXT,
  special_requests TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'no-show', 'completed')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reservations_date    ON reservations(reservation_date DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_email   ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_status  ON reservations(status);

-- ═══════════════════════════════════════════════
-- MENU CATEGORIES
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS menu_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  section     TEXT NOT NULL CHECK (section IN ('food', 'drinks')),
  note        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_categories_section ON menu_categories(section);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort   ON menu_categories(sort_order);

-- ═══════════════════════════════════════════════
-- MENU ITEMS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  price         TEXT,
  is_highlight  BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  allergens     TEXT[],
  image_url     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_category   ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active     ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort       ON menu_items(sort_order);

-- ═══════════════════════════════════════════════
-- EVENTS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
  event_type    TEXT NOT NULL CHECK (event_type IN ('weekly', 'signature', 'private', 'special')),
  frequency     TEXT,
  day_of_week   TEXT,
  time_start    TEXT,
  time_end      TEXT,
  access_level  TEXT NOT NULL DEFAULT 'public'
                  CHECK (access_level IN ('public', 'member', 'invitation', 'private')),
  access_note   TEXT,
  image_url     TEXT,
  booking_required BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_type   ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);

-- ═══════════════════════════════════════════════
-- CONVIVIUM MEMBERS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS convivium_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  member_type     TEXT NOT NULL DEFAULT 'regular'
                    CHECK (member_type IN ('regular', 'host', 'creative', 'executive', 'local')),
  member_number   TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'lapsed', 'pending')),
  joined_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date    DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_members_email   ON convivium_members(email);
CREATE INDEX IF NOT EXISTS idx_members_status  ON convivium_members(status);
CREATE INDEX IF NOT EXISTS idx_members_type    ON convivium_members(member_type);

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
CREATE INDEX IF NOT EXISTS idx_uploads_context    ON uploads(context);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- ═══════════════════════════════════════════════
-- SEED: Menu categories
-- ═══════════════════════════════════════════════
INSERT INTO menu_categories (name, slug, section, note, sort_order) VALUES
  ('Brunch',           'brunch',       'food',   'Saturday & Sunday · 11am – 4pm', 1),
  ('Small Plates',     'small-plates', 'food',   'Available all day',               2),
  ('Mains',            'mains',        'food',   'Lunch & Dinner',                  3),
  ('Desserts',         'desserts',     'food',   NULL,                              4),
  ('Cocktails',        'cocktails',    'drinks', 'The Bar · Opens 4pm',            1),
  ('Spirits',          'spirits',      'drinks', 'Ask your bartender for the current pour list', 2),
  ('Wine',             'wine',         'drinks', 'Rotating seasonally · Ask for the current list', 3),
  ('Non-Alcoholic',    'non-alcoholic','drinks', 'All day',                         4)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Brunch items
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.sort_order
FROM menu_categories c, (VALUES
  ('Suya Benedict',      'Poached eggs, suya-spiced beef, toasted brioche, hollandaise', '₦8,500', 1),
  ('Agege French Toast', 'Thick-cut brioche, bone marrow butter, soft-boiled egg, bottarga', '₦7,500', 2),
  ('The Floor Shakshuka','Ewa agoyin tomatoes, berbere spice, West African peppers, feta, sourdough', '₦7,000', 3),
  ('Plantain Stack',     'Caramelised plantain, smoked salmon, crème fraîche, pickled shallot', '₦9,000', 4),
  ('Akara & Eggs',       'Black-eyed pea fritters, scrambled eggs, scotch bonnet butter, herbs', '₦6,500', 5)
) AS v(name, description, price, sort_order)
WHERE c.slug = 'brunch'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Small Plates
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.sort_order
FROM menu_categories c, (VALUES
  ('Asun Skewers',        'Spiced goat, scotch bonnet glaze, cucumber yogurt, flatbread', '₦6,000', 1),
  ('Pepper Soup Dumplings','Catfish and uziza, ukpaka dipping sauce, crispy shallot', '₦7,500', 2),
  ('Puff Puff',           'Truffle honey, aged parmesan, aleppo pepper', '₦4,500', 3),
  ('Crab Akara',          'Blue crab fritters, mango avocado, pickled cucumber, sour cream', '₦9,000', 4),
  ('Barbecued Yam',       'Charred yam, smoked butter, egusi crumble, fresh herbs', '₦5,500', 5)
) AS v(name, description, price, sort_order)
WHERE c.slug = 'small-plates'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Mains
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.sort_order
FROM menu_categories c, (VALUES
  ('Wagyu Suya',          'Wagyu beef tenderloin, suya spice rub, tiger nut salsa, roasted pepper sauce', '₦32,000', 1),
  ('Whole Bream',         'Jollof-smoked butter, charred spring onion, yam purée, palm oil beurre blanc', '₦18,000', 2),
  ('Ẹ̀gúsí Risotto',     'Toasted melon seed, confit tomato, parmesan, soft herbs, truffle oil', '₦16,000', 3),
  ('Whole Chicken Yassa', 'Caramelised onion, Dijon mustard, lemon, jollof rice — served family-style', '₦22,000', 4),
  ('Oha Leaf Pasta',      'Handmade pappardelle, oha leaf pesto, crayfish, crispy garlic, parmesan', '₦14,000', 5)
) AS v(name, description, price, sort_order)
WHERE c.slug = 'mains'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Desserts
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.sort_order
FROM menu_categories c, (VALUES
  ('Puff Puff Donut',    'Condensed milk ice cream, palmnut caramel, sesame brittle', '₦5,500', 1),
  ('Chocolate Fondant',  '72% dark chocolate, cocoa nib praline, baobab cream, cocoa powder', '₦6,000', 2),
  ('Chin Chin Cheesecake','Vanilla cream, chin chin crust, mango coulis, fresh mango', '₦5,500', 3)
) AS v(name, description, price, sort_order)
WHERE c.slug = 'desserts'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Cocktails
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.sort_order
FROM menu_categories c, (VALUES
  ('Convivia Negroni',   'Palm wine-washed gin, Campari, sweet vermouth, orange bitters', '₦7,500', 1),
  ('Lagos Sour',         'Nigerian rum, tamarind syrup, lime juice, egg white, Angostura bitters', '₦8,000', 2),
  ('The 24',             'A daily-changing cocktail made with whatever the bar is obsessing over. Just ask.', 'Ask', 3),
  ('Zobo Smash',         'Hibiscus-infused gin, fresh mint, cucumber, lime, soda', '₦7,000', 4),
  ('Palm Wine Spritz',   'Traditional palm wine, elderflower cordial, prosecco, fresh cucumber', '₦8,500', 5),
  ('Afrobeats Martini',  'Vodka, Cointreau, hibiscus syrup, fresh lime, champagne float', '₦9,000', 6),
  ('Eko Mule',           'Nigerian ginger beer, bourbon, fresh lime, ginger, mint', '₦7,000', 7)
) AS v(name, description, price, sort_order)
WHERE c.slug = 'cocktails'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Spirits highlights
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, is_highlight, sort_order)
SELECT c.id, v.name, v.description, true, v.sort_order
FROM menu_categories c, (VALUES
  ('Whisky',          'Scotch, Irish, American, and Japanese. Single malts, small-batch bourbons. The list rotates.', 1),
  ('Cognac & Brandy', 'The continent''s boardroom spirit. Hennessy, Rémy Martin, and rare expressions for those who know.', 2),
  ('Rum',             'Nigerian sugarcane rum, Jamaican and Barbadian classics, aged agricole from Martinique.', 3),
  ('Gin',             'African botanical gins, London dry classics, and seasonal house infusions.', 4)
) AS v(name, description, sort_order)
WHERE c.slug = 'spirits'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Wine highlights
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, is_highlight, sort_order)
SELECT c.id, v.name, v.description, true, v.sort_order
FROM menu_categories c, (VALUES
  ('By the Glass',          'Six reds, six whites, two champagnes. The selection rotates quarterly with the season.', 1),
  ('Champagne & Sparkling', 'Moët, Veuve Clicquot, and a curated selection of grower champagnes by glass and bottle.', 2),
  ('By the Bottle',         'South African, French, and Italian selections. Private dining menus available on request.', 3),
  ('Natural Wine',          'A growing list of minimal-intervention wines. Ask the floor team for the current edit.', 4)
) AS v(name, description, sort_order)
WHERE c.slug = 'wine'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Non-Alcoholic
-- ═══════════════════════════════════════════════
INSERT INTO menu_items (category_id, name, description, price, sort_order)
SELECT c.id, v.name, v.description, v.price, v.sort_order
FROM menu_categories c, (VALUES
  ('Zobo Rouge',        'House-brewed hibiscus, fresh ginger, citrus, mint', '₦3,500', 1),
  ('Alata',             'Spiced ginger beer, lime, turmeric, black pepper', '₦3,500', 2),
  ('Chapman Special',   'The Nigerian classic — Fanta, Sprite, grenadine, cucumber, citrus — elevated', '₦4,000', 3),
  ('African Botanical', 'A non-alcoholic spirit made from West African botanicals. Served long over ice.', '₦5,000', 4),
  ('Cold Brew',         'Single-origin Nigerian coffee, cold-brewed for 24 hours', '₦4,500', 5)
) AS v(name, description, price, sort_order)
WHERE c.slug = 'non-alcoholic'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════
-- SEED: Events
-- ═══════════════════════════════════════════════
INSERT INTO events (name, description, event_type, frequency, day_of_week, time_start, time_end, access_level, access_note, image_url, booking_required, sort_order) VALUES
  ('Jazz Brunch',       'A live jazz quartet, an extended brunch menu, and bottomless mimosas. The slowest, best morning of your week. Walk-ins welcome.', 'weekly', 'Weekly', 'Saturday & Sunday', '12pm', '5pm', 'public', NULL, '/Convivium3.png', true, 1),
  ('The Listening Room','Curated vinyl sets in The Lounge. The kitchen runs a late-night bar menu. A quieter, more considered night than the weekend — but just as long.', 'weekly', 'Weekly', 'Thursday', '9pm', '1am', 'public', NULL, '/Convivium.png', false, 2),
  ('Late Night',        'The kitchen closes. The bar does not. DJs on the floor, bar menu until 2am, The Lounge open until 3am. Dress for the occasion.', 'weekly', 'Weekly', 'Friday & Saturday', '11pm', '3am', 'public', NULL, '/The Spaces2.png', false, 3),
  ('Convivia Dinner',   'Twelve people. One table. A menu written the morning of. The guest list is curated — Convivium members may bring one guest. No menus printed. No phones on the table.', 'signature', 'Monthly', NULL, NULL, NULL, 'member', 'Member & guest invitations only', '/conv1.png', false, 1),
  ('Founder''s Table',  'An intimate dinner for six founders, convened by a Convivium member host. Everyone brings a problem; everyone leaves with at least one solution. Dinner is included.', 'signature', 'Quarterly', NULL, NULL, NULL, 'member', 'By application — Convivium members only', '/dealrooms.png', false, 2),
  ('The Gathering',     'Our annual dinner-summit. One evening, one room, the people who matter most in the city that night. A keynote address, a long table, and the kind of conversation you only have once a year.', 'signature', 'Annual', NULL, NULL, NULL, 'invitation', 'Invitation only — waitlist open', '/Convivium2.png', false, 3)
ON CONFLICT DO NOTHING;
