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
  verified      BOOLEAN NOT NULL DEFAULT false,       -- identity verified via Azure Face
  open_to_meet  BOOLEAN NOT NULL DEFAULT false,       -- user is actively open to meeting people now
  -- Premium / freemium model
  match_credits_remaining INT NOT NULL DEFAULT 1,     -- 1 free AI match per week for free users
  match_credits_reset_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  premium_until           TIMESTAMPTZ,                -- when Black subscription expires
  subscription_status     TEXT NOT NULL DEFAULT 'free'
                            CHECK (subscription_status IN ('free','black','black_trial','cancelled')),
  -- Market entry profile
  company       TEXT,
  role          TEXT,
  website       TEXT,
  product_category TEXT,
  target_markets TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- APP ADMINS — platform console access
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  added_by    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_admins (email, role, added_by)
VALUES ('collinsnnaji1@gmail.com', 'owner', 'system')
ON CONFLICT (email) DO UPDATE SET role = 'owner', updated_at = NOW();

-- ─────────────────────────────────────
-- MATCH REQUESTS — AI Match flow log (Skip/Delay/Join)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  city          TEXT NOT NULL,
  area          TEXT,
  vibe          TEXT,
  energy        TEXT,
  group_size    INT NOT NULL DEFAULT 6,
  action        TEXT NOT NULL DEFAULT 'matched'
                  CHECK (action IN ('matched','joined','skipped','delayed')),
  hangout_id    UUID REFERENCES hangouts(id) ON DELETE SET NULL,
  matched_user_ids UUID[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- RESERVATIONS — Venue bookings
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  venue_id      UUID REFERENCES venues(id) ON DELETE CASCADE,
  party_size    INT NOT NULL DEFAULT 2,
  requested_for TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'requested'
                  CHECK (status IN ('requested','confirmed','seated','cancelled','no_show')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- SUBSCRIPTION EVENTS — premium audit trail
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL
                  CHECK (event_type IN ('subscribed','renewed','cancelled','trial_started','trial_ended','upgraded','downgraded')),
  tier_from     TEXT,
  tier_to       TEXT,
  amount_ngn    INT,
  currency      TEXT DEFAULT 'NGN',
  payment_ref   TEXT,
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
  category      TEXT NOT NULL DEFAULT 'walk'          -- healthy lifestyle activity category
                  CHECK (category IN ('walk','run','cook','workout','stretch','mindful','nightlife','dining','sports','fitness','gigs','outdoors','arts','social')),
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
-- SHIFT APPLICATIONS — worker applies to a shift
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS shift_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id         UUID NOT NULL REFERENCES hangouts(id) ON DELETE CASCADE,
  worker_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'shortlisted', 'confirmed', 'rejected', 'no_show')),
  payout_provider  TEXT CHECK (payout_provider IN ('OPay', 'PalmPay', 'Moniepoint')),
  payout_phone     TEXT,
  note             TEXT,
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shift_id, worker_id)
);

-- ─────────────────────────────────────
-- DAILY CHECK-INS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  pillars       TEXT[] NOT NULL DEFAULT '{}',
  feel          TEXT,
  reflection    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- CIRCLES (6–24 person groups)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS circles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  intention     TEXT NOT NULL DEFAULT 'morning',
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
-- CLIENT MARKET ENTRY PROFILES
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company         TEXT,
  role            TEXT,
  website         TEXT,
  product_category TEXT,
  target_markets  TEXT[] NOT NULL DEFAULT '{}',
  launch_goal     TEXT,
  budget_range    TEXT,
  logo_url        TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- MARKET ENTRY SPRINTS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_sprints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  market          TEXT NOT NULL DEFAULT 'Nigeria',
  category        TEXT,
  stage           TEXT NOT NULL DEFAULT 'idea'
                    CHECK (stage IN ('idea','research','testing','activation','report','complete')),
  goal            TEXT,
  audience        TEXT,
  budget          TEXT,
  asset_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','paused','complete','archived')),
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- MARKET INSIGHTS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id       UUID REFERENCES market_sprints(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  market          TEXT NOT NULL DEFAULT 'Nigeria',
  insight_type    TEXT NOT NULL DEFAULT 'consumer'
                    CHECK (insight_type IN ('consumer','pricing','competitor','channel','culture','risk')),
  summary         TEXT NOT NULL,
  recommendation  TEXT,
  confidence      INT NOT NULL DEFAULT 70,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- BRAND ACTIVATIONS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS brand_activations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id       UUID REFERENCES market_sprints(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  city            TEXT NOT NULL DEFAULT 'Lagos',
  channel         TEXT NOT NULL DEFAULT 'sampling',
  venue           TEXT,
  activation_date DATE,
  target_leads    INT DEFAULT 100,
  actual_leads    INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned','live','complete','cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────
-- BULK DRINKS SUPPLY
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS outlet_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  outlet_name     TEXT,
  outlet_type     TEXT NOT NULL DEFAULT 'nightlife',
  city            TEXT NOT NULL DEFAULT 'Lagos',
  address         TEXT,
  contact_name    TEXT,
  phone           TEXT,
  logo_url        TEXT,
  delivery_window TEXT,
  credit_terms    BOOLEAN NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drink_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,
  brand           TEXT NOT NULL,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL
                    CHECK (category IN ('beer','spirits','wine','non_alcoholic','water','energy','mixer')),
  pack_size       TEXT NOT NULL,
  unit            TEXT NOT NULL DEFAULT 'case',
  price_ngn       INT NOT NULL,
  market_price_ngn INT,
  moq             NUMERIC(8, 2) NOT NULL DEFAULT 1,
  stock_status    TEXT NOT NULL DEFAULT 'in_stock'
                    CHECK (stock_status IN ('in_stock','low_stock','preorder','out_of_stock')),
  image_url       TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drink_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  outlet_profile_id UUID REFERENCES outlet_profiles(id),
  order_type       TEXT NOT NULL DEFAULT 'regular'
                     CHECK (order_type IN ('regular','emergency')),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','dispatching','delivered','cancelled')),
  delivery_city    TEXT NOT NULL DEFAULT 'Lagos',
  delivery_address TEXT,
  delivery_window  TEXT,
  subtotal_ngn     INT NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drink_order_items (
  order_id       UUID REFERENCES drink_orders(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES drink_products(id),
  quantity       NUMERIC(8, 2) NOT NULL,
  unit_price_ngn INT NOT NULL,
  line_total_ngn INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

-- ─────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_hangouts_status ON hangouts(status);
CREATE INDEX IF NOT EXISTS idx_hangouts_type ON hangouts(type);
CREATE INDEX IF NOT EXISTS idx_hangouts_time ON hangouts(event_time);
CREATE INDEX IF NOT EXISTS idx_attendees_user ON attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_created ON checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_market_sprints_user ON market_sprints(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_insights_user ON market_insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_activations_user ON brand_activations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drink_products_category ON drink_products(category);
CREATE INDEX IF NOT EXISTS idx_drink_orders_user ON drink_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_requests_user ON match_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_requests_city ON match_requests(city, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_venue ON reservations(venue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id, created_at DESC);
