-- Convivia24 — Ritual Commerce + Convivium + Mindful Calendar (soft-parked)
-- Schema: ritual orders / waitlist / membership interest + My 24 + Companion.
-- Run: npx tsx lib/db/migrate.ts

-- ═══════════════════════════════════════════════
-- CLEAN SLATE: drop tables from earlier app concepts
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
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS circle_likes CASCADE;
DROP TABLE IF EXISTS circle_members CASCADE;
DROP TABLE IF EXISTS circle_posts CASCADE;
DROP TABLE IF EXISTS circles CASCADE;
DROP TABLE IF EXISTS crew_cart_items CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS companion_messages CASCADE;
DROP TABLE IF EXISTS companion_conversations CASCADE;

-- ═══════════════════════════════════════════════
-- PERSONAL TASKS ("My 24" — manual items + AI rest buffers)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personal_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  title         TEXT NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low','normal','high')),
  kind          TEXT NOT NULL DEFAULT 'task'
                  CHECK (kind IN ('task','event','gathering')),
  location      TEXT,
  notes         TEXT,
  is_rest_block BOOLEAN NOT NULL DEFAULT false,
  source        TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('manual','ai_buffer','ai_destress')),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','done','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_user   ON personal_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_starts  ON personal_tasks(starts_at);

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

-- Secure per-invitee response token — backs the public accept/decline link
-- shared with people who aren't necessarily Convivia24 users.
ALTER TABLE personal_task_invitees ADD COLUMN IF NOT EXISTS response_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_invitees_response_token ON personal_task_invitees(response_token);

-- One secret per-user token, used to build a read-only ICS feed URL so My 24
-- can be subscribed to from Google/Apple/Outlook calendar apps.
CREATE TABLE IF NOT EXISTS calendar_feed_tokens (
  user_id     TEXT PRIMARY KEY,
  token       UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_feed_tokens_token ON calendar_feed_tokens(token);

-- ═══════════════════════════════════════════════
-- MEMORY (facts from onboarding + reflections — used by My 24 planning)
-- ═══════════════════════════════════════════════

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
-- PEOPLE (the people layer — partner, friends, family for planning + invites)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS people (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  relationship  TEXT,
  email         TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_people_user ON people(user_id);

-- ═══════════════════════════════════════════════
-- USER PROFILE (onboarding answers — shapes how the companion plans)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       TEXT PRIMARY KEY,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One evening reflection per day — feeds the companion's memory.
CREATE TABLE IF NOT EXISTS daily_reflections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  reflect_date  DATE NOT NULL,
  highlight     TEXT NOT NULL,
  mood          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, reflect_date);

-- ═══════════════════════════════════════════════
-- RITUAL COMMERCE (Lagos-first kits + Convivium)
-- Re-created after clean-slate drops above.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS waitlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  company       TEXT,
  source        TEXT NOT NULL DEFAULT 'footer'
                  CHECK (source IN ('footer','convivium','checkout','rituals')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ritual_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL DEFAULT 'Lagos',
  area            TEXT,
  notes           TEXT,
  subtotal_ngn    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','awaiting_payment','paid','fulfilled','cancelled')),
  payment_ref     TEXT,
  payment_provider TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ritual_orders_email ON ritual_orders(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_ritual_orders_status ON ritual_orders(status);

CREATE TABLE IF NOT EXISTS ritual_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES ritual_orders(id) ON DELETE CASCADE,
  kit_slug      TEXT NOT NULL,
  kit_name      TEXT NOT NULL,
  prefer_track  TEXT NOT NULL DEFAULT 'mixed'
                  CHECK (prefer_track IN ('spirit','zero','mixed')),
  unit_price_ngn INTEGER NOT NULL,
  qty           INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ritual_order_items_order ON ritual_order_items(order_id);

CREATE TABLE IF NOT EXISTS convivium_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  tier          TEXT NOT NULL DEFAULT 'resident'
                  CHECK (tier IN ('resident','founding','patron')),
  status        TEXT NOT NULL DEFAULT 'waitlist'
                  CHECK (status IN ('waitlist','applied','active','declined')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- NIGHT EVENTS (admin-managed listings on /events)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS night_events (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  venue_slug    TEXT NOT NULL,
  tag           TEXT NOT NULL DEFAULT 'Lounge',
  blurb         TEXT NOT NULL DEFAULT '',
  expected      TEXT NOT NULL DEFAULT '',
  cover_ngn     INTEGER,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  published     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_night_events_published ON night_events(published, starts_at);

-- ═══════════════════════════════════════════════
-- PARTY PLANS (saved from the shop-side planning tool)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS party_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      TEXT NOT NULL,
  name          TEXT NOT NULL,
  occasion      TEXT,
  event_date    DATE,
  venue         TEXT,
  guests        INTEGER NOT NULL DEFAULT 40 CHECK (guests > 0),
  hours         INTEGER NOT NULL DEFAULT 5 CHECK (hours > 0),
  vibe          TEXT NOT NULL DEFAULT 'balanced',
  budget_ngn    INTEGER,
  plan          JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_party_plans_owner ON party_plans(owner_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- TRIVIA DRAW ENTRIES (brand rounds on /trivia)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trivia_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  round_slug    TEXT NOT NULL,
  brand         TEXT NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  score         INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'entered'
                  CHECK (status IN ('entered','won','claimed','void')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trivia_entries_round ON trivia_entries(round_slug, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trivia_entries_once ON trivia_entries(round_slug, LOWER(email));

-- ═══════════════════════════════════════════════
-- TRIVIA SCHEDULE (one sponsoring brand per week)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trivia_weeks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_slug    TEXT NOT NULL,
  week_start    DATE NOT NULL UNIQUE,
  published     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trivia_weeks_start ON trivia_weeks(week_start DESC);

-- ═══════════════════════════════════════════════
-- PARTNER OUTLETS + MENU PRICING TOOL
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS partner_outlets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT NOT NULL UNIQUE,
  venue_name      TEXT NOT NULL,
  email           TEXT NOT NULL,
  contact         TEXT,
  area            TEXT,
  venue_kind      TEXT NOT NULL DEFAULT 'lounge',
  seats           INTEGER,
  target_margin_pct INTEGER NOT NULL DEFAULT 72
                    CHECK (target_margin_pct BETWEEN 1 AND 95),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partner_pricing_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id           UUID NOT NULL REFERENCES partner_outlets(id) ON DELETE CASCADE,
  slug                TEXT,
  name                TEXT NOT NULL,
  category            TEXT,
  bottle_cost_ngn     INTEGER NOT NULL DEFAULT 0 CHECK (bottle_cost_ngn >= 0),
  sell_price_ngn      INTEGER NOT NULL DEFAULT 0 CHECK (sell_price_ngn >= 0),
  servings_per_bottle INTEGER NOT NULL DEFAULT 12 CHECK (servings_per_bottle > 0),
  bottles_per_month   INTEGER NOT NULL DEFAULT 0 CHECK (bottles_per_month >= 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_pricing_outlet ON partner_pricing_items(outlet_id);

-- ═══════════════════════════════════════════════
-- LOYALTY MEMBERS (server-side points, so tier discounts can be trusted)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS loyalty_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL,
  name            TEXT,
  points          INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  lifetime_points INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_email ON loyalty_members(LOWER(email));

-- Orders carry the loyalty discount that was actually applied.
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS loyalty_discount_ngn INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS total_ngn INTEGER;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS loyalty_owner_id TEXT;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS loyalty_points_awarded INTEGER NOT NULL DEFAULT 0;

-- The original status CHECK only allowed a handful of values; the app's
-- OrderStatus type (lib/commerce/status.ts) also drives orders through
-- processing/packed/out_for_delivery/delivered/refunded. Widen the constraint
-- to match, or those transitions fail at the DB with a check violation.
ALTER TABLE ritual_orders DROP CONSTRAINT IF EXISTS ritual_orders_status_check;
ALTER TABLE ritual_orders ADD CONSTRAINT ritual_orders_status_check
  CHECK (status IN (
    'pending', 'awaiting_payment', 'paid', 'processing', 'packed',
    'out_for_delivery', 'delivered', 'fulfilled', 'cancelled', 'refunded'
  ));

-- ═══════════════════════════════════════════════
-- GIFT CARDS — admin-issued, DB-backed, single-use at checkout.
-- Separate from the partner portal's localStorage perk-conversion demo,
-- which stays a self-contained sales demo with no real money behind it.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS gift_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  value_ngn         INTEGER NOT NULL CHECK (value_ngn > 0),
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'void')),
  issued_by         TEXT NOT NULL,
  note              TEXT,
  redeemed_order_id UUID REFERENCES ritual_orders(id),
  redeemed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);

-- ═══════════════════════════════════════════════
-- DELIVERY TRACKING + REFUNDS + GIFT-CARD DISCOUNT (ritual_orders extensions)
-- ═══════════════════════════════════════════════
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS rider_phone TEXT;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS eta_at TIMESTAMPTZ;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS tracking_note TEXT;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS refund_ref TEXT;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS refunded_ngn INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS gift_card_discount_ngn INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS gift_card_id UUID REFERENCES gift_cards(id);
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS stock_consumed BOOLEAN NOT NULL DEFAULT false;

-- ═══════════════════════════════════════════════
-- SERVER-SIDE CART — signed-in users only; guests keep the localStorage cart.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS carts (
  user_id     TEXT PRIMARY KEY,
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- CIRCLES — vibe-tagged interest groups, join/leave.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS circles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  vibe_tag      TEXT NOT NULL,
  description   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
  circle_id     UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

INSERT INTO circles (slug, name, vibe_tag, description) VALUES
  ('rooftop-lagos', 'Rooftop Lagos', 'Skyline', 'Sundowners and skyline views across VI and Ikoyi.'),
  ('afrobeats-heads', 'Afrobeats Heads', 'Dance floor', 'For the ones who move first when the DJ drops the intro.'),
  ('whisky-society', 'Whisky Society', 'Sip & savor', 'Slow pours, cask talk, and the good glassware.'),
  ('ladies-night', 'Ladies Night', 'Girls night', 'Coordinating drops and tables for a night out with the girls.'),
  ('after-hours', 'After Hours', 'Late night', 'For the crews still going after the lounges close.')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════
-- PARTNER WHOLESALE + PREMIUM POINTS
-- Real, DB-backed replacement for the old localStorage partner desk — tied
-- to the same partner_outlets record the (real) margin-pricing tool uses.
-- Wholesale/points/perk-conversion routes additionally require an actual
-- signed-in Neon Auth owner (owner_id LIKE 'user:%'), not the anonymous
-- guest-cookie identity the free pricing tool allows.
-- ═══════════════════════════════════════════════
ALTER TABLE partner_outlets ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0);
ALTER TABLE partner_outlets ADD COLUMN IF NOT EXISTS lifetime_points INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0);

CREATE TABLE IF NOT EXISTS partner_inventory (
  outlet_id   UUID NOT NULL REFERENCES partner_outlets(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  on_hand     INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (outlet_id, slug)
);

CREATE TABLE IF NOT EXISTS partner_wholesale_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id     UUID NOT NULL REFERENCES partner_outlets(id) ON DELETE CASCADE,
  items         JSONB NOT NULL,
  total_ngn     INTEGER NOT NULL CHECK (total_ngn >= 0),
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_wholesale_outlet ON partner_wholesale_orders(outlet_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- SMS / WHATSAPP DELIVERY LOG (Termii) — best-effort, mirrors email sends.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sms_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES ritual_orders(id) ON DELETE SET NULL,
  to_phone    TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'generic' CHECK (channel IN ('generic', 'whatsapp', 'dnd')),
  status      TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sms_log_order ON sms_log(order_id);
