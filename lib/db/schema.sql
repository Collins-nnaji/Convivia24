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
                  CHECK (source IN ('footer','convivium','checkout','rituals','events')),
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

-- Private links and RSVPs for the standalone “Plan a Night” experience.
ALTER TABLE party_plans ADD COLUMN IF NOT EXISTS share_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_party_plans_share_token ON party_plans(share_token);

CREATE TABLE IF NOT EXISTS party_plan_rsvps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id      UUID NOT NULL REFERENCES party_plans(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'attending'
                  CHECK (status IN ('attending','maybe','declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (party_id, name)
);
CREATE INDEX IF NOT EXISTS idx_party_plan_rsvps_party ON party_plan_rsvps(party_id, created_at);

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

-- The original status CHECK only allowed a handful of values. The app's
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
-- SERVER-SIDE CART — signed-in users only, guests keep the localStorage cart.
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

-- ═══════════════════════════════════════════════
-- SUPPLIER SOURCING DESK
-- We do not hold every SKU we sell. A supplier fulfils the order and we keep the spread, so an
-- order records who sourced it and what they charged. Manual routing — suppliers have no logins.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  contact_name  TEXT,
  phone         TEXT,
  email         TEXT,
  city          TEXT NOT NULL DEFAULT 'Lagos',
  areas         TEXT[] NOT NULL DEFAULT '{}',
  categories    TEXT[] NOT NULL DEFAULT '{}',
  same_day      BOOLEAN NOT NULL DEFAULT false,
  notes         TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active, name);

ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS supplier_cost_ngn INTEGER
  CHECK (supplier_cost_ngn IS NULL OR supplier_cost_ngn >= 0);
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS sourced_at TIMESTAMPTZ;
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS sourcing_note TEXT;
CREATE INDEX IF NOT EXISTS idx_ritual_orders_supplier ON ritual_orders(supplier_id);

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS cost_ngn INTEGER
  CHECK (cost_ngn IS NULL OR cost_ngn >= 0);

CREATE TABLE IF NOT EXISTS supplier_sku_prices (
  supplier_id   UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  cost_ngn      INTEGER NOT NULL CHECK (cost_ngn >= 0),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (supplier_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_supplier_sku_prices_slug ON supplier_sku_prices(slug);

-- ═══════════════════════════════════════════════
-- REFERRAL PARTNERS (planners, venues, caterers, DJs)
-- They send customers and earn a cut of what those customers actually pay. Commission is only
-- ever earned on collected money: attributed at order creation, approved when the order is paid,
-- voided on cancel or refund.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS referral_partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT UNIQUE,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  company         TEXT,
  kind            TEXT NOT NULL DEFAULT 'planner'
                    CHECK (kind IN ('planner','venue','caterer','dj','decorator','photographer','mc','other')),
  commission_pct  NUMERIC NOT NULL DEFAULT 2.5 CHECK (commission_pct BETWEEN 0 AND 25),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','active','suspended')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referral_partners_status ON referral_partners(status, created_at DESC);

CREATE TABLE IF NOT EXISTS referral_attributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL UNIQUE REFERENCES ritual_orders(id) ON DELETE CASCADE,
  partner_id      UUID NOT NULL REFERENCES referral_partners(id),
  code            TEXT NOT NULL,
  commission_pct  NUMERIC NOT NULL,
  order_total_ngn INTEGER NOT NULL DEFAULT 0 CHECK (order_total_ngn >= 0),
  commission_ngn  INTEGER NOT NULL DEFAULT 0 CHECK (commission_ngn >= 0),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','paid','void')),
  payout_ref      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referral_attr_partner ON referral_attributions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_attr_status ON referral_attributions(status);

-- ═══════════════════════════════════════════════
-- BRAND PROMOTION ENQUIRIES (from /trivia)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS brand_enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand         TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  goal          TEXT NOT NULL DEFAULT 'trivia-round'
                  CHECK (goal IN ('trivia-round','sampling','event-pouring','bundle','listing','other')),
  budget_band   TEXT CHECK (budget_band IN ('under-500k','500k-2m','2m-5m','5m-plus','unsure')),
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new','contacted','won','closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_brand_enquiries_status ON brand_enquiries(status, created_at DESC);

-- Partner page applications (outlet + brand tiers) — reviewed manually; admin desk unchanged.
CREATE TABLE IF NOT EXISTS partner_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            TEXT NOT NULL CHECK (kind IN ('outlet', 'brand')),
  contact_name    TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  company_name    TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'reviewed', 'approved', 'declined')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_applications_kind ON partner_applications(kind, created_at DESC);

-- ═══════════════════════════════════════════════
-- TASTE PROFILES (drives /trivia recommendations)
-- ═══════════════════════════════════════════════
-- Guests keep their profile in localStorage; once signed in it is mirrored here
-- so the match percentages follow the account across devices.
CREATE TABLE IF NOT EXISTS taste_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      TEXT NOT NULL UNIQUE,
  spirits       TEXT[] NOT NULL DEFAULT '{}',
  flavours      TEXT[] NOT NULL DEFAULT '{}',
  occasions     TEXT[] NOT NULL DEFAULT '{}',
  price_band    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- CHALLENGE COMPLETIONS (points earned on /trivia)
-- ═══════════════════════════════════════════════
-- period_key scopes a repeatable challenge to its window ('2026-W35' for the
-- weekly trivia round, 'once' for one-off challenges) so the unique index below
-- stops the same challenge paying out twice in the same period.
CREATE TABLE IF NOT EXISTS trivia_challenge_completions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT NOT NULL,
  challenge_id    TEXT NOT NULL,
  period_key      TEXT NOT NULL DEFAULT 'once',
  ref             TEXT,
  points_awarded  INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_once
  ON trivia_challenge_completions(owner_id, challenge_id, period_key);
CREATE INDEX IF NOT EXISTS idx_challenge_owner
  ON trivia_challenge_completions(owner_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- PRODUCT REVIEWS (star ratings on /shop/[slug])
-- ═══════════════════════════════════════════════
-- One review per account per SKU. `verified_buyer` is computed at write time by
-- checking the account's paid orders for the slug — it is a claim about the
-- order history, so it is never accepted from the client.
CREATE TABLE IF NOT EXISTS product_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL,
  owner_id        TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body            TEXT NOT NULL DEFAULT '',
  verified_buyer  BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'published'
                    CHECK (status IN ('published','hidden')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_reviews_slug ON product_reviews(slug, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reviews_once ON product_reviews(slug, owner_id);

-- ═══════════════════════════════════════════════
-- REWARD REDEMPTIONS (points spent in the rewards shop)
-- ═══════════════════════════════════════════════
-- The row is the receipt: points come off loyalty_members in the same request,
-- and `code` is what the member quotes to claim the reward.
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      TEXT NOT NULL,
  reward_id     TEXT NOT NULL,
  reward_name   TEXT NOT NULL,
  category      TEXT NOT NULL,
  points_spent  INTEGER NOT NULL CHECK (points_spent >= 0),
  value_ngn     INTEGER,
  code          TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'issued'
                  CHECK (status IN ('issued','fulfilled','cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_owner
  ON reward_redemptions(owner_id, created_at DESC);

-- The events page has its own newsletter sign-up, so `source` gained a value.
-- Existing databases keep the original CHECK until it is replaced here.
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_source_check;
ALTER TABLE waitlist ADD CONSTRAINT waitlist_source_check
  CHECK (source IN ('footer','convivium','checkout','rituals','events'));

-- ═══════════════════════════════════════════════
-- BRAND PAGES: follows, ownership claims, campaigns
-- ═══════════════════════════════════════════════
-- Brand pages are written and owned by Convivia24. A brand can claim its page
-- to take over managing it; a claim is a request until we approve it.
CREATE TABLE IF NOT EXISTS brand_follows (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug    TEXT NOT NULL,
  owner_id      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_follows_once ON brand_follows(brand_slug, owner_id);
CREATE INDEX IF NOT EXISTS idx_brand_follows_brand ON brand_follows(brand_slug);

CREATE TABLE IF NOT EXISTS brand_claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug    TEXT NOT NULL,
  brand_name    TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  role          TEXT,
  website       TEXT,
  message       TEXT,
  owner_id      TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','verified','approved','rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_brand_claims_brand ON brand_claims(brand_slug, created_at DESC);
-- Only one approved owner per brand; pending claims may stack up.
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_claims_owner
  ON brand_claims(brand_slug) WHERE status = 'approved';

-- A campaign is a brand-sponsored run of tasks. Created by Convivia24 (or by an
-- approved brand owner), and published before it appears on the site.
CREATE TABLE IF NOT EXISTS brand_campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  brand_slug      TEXT NOT NULL,
  title           TEXT NOT NULL,
  tagline         TEXT,
  blurb           TEXT,
  -- What it costs to enter, and what finishing it pays.
  entry_points    INTEGER NOT NULL DEFAULT 0 CHECK (entry_points >= 0),
  reward_points   INTEGER NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  top_reward      TEXT,
  -- Ordered task list: [{ id, title, detail, points }]
  tasks           JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules           JSONB NOT NULL DEFAULT '[]'::jsonb,
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  published       BOOLEAN NOT NULL DEFAULT false,
  created_by      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_brand ON brand_campaigns(brand_slug, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_campaigns_live ON brand_campaigns(published, ends_at);

CREATE TABLE IF NOT EXISTS campaign_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES brand_campaigns(id) ON DELETE CASCADE,
  owner_id        TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  -- Task ids the participant has finished; points are derived from these.
  completed_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  points          INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_participants_once
  ON campaign_participants(campaign_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_board
  ON campaign_participants(campaign_id, points DESC, joined_at ASC);

-- ═══════════════════════════════════════════════
-- ORDER STATUS TIMELINE
-- ═══════════════════════════════════════════════
-- ritual_orders only keeps the current status, so a tracking page had no way to
-- say when an order was packed. Each transition is recorded here instead of
-- being guessed from created_at.
CREATE TABLE IF NOT EXISTS order_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES ritual_orders(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id, created_at ASC);
-- One row per status per order: re-setting a status must not duplicate history.
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_events_once ON order_events(order_id, status);
