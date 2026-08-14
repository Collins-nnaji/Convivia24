-- Convivia24 — gatherings, moments and menus
--
-- Everything the app currently keeps in localStorage and IndexedDB, moved
-- server-side so a gathering is one shared thing rather than a copy per phone.
--
-- Run:  npx tsx lib/db/migrate.ts
-- Or:   paste this whole file into the Neon SQL editor.
--
-- Safe to run repeatedly — every statement is IF NOT EXISTS.
--
-- Two conventions worth knowing before reading:
--
--   * Money is stored in KOBO (integer minor units), never naira decimals.
--     ₦8,500 is 850000. Floats and money do not mix, and a split divides
--     amounts by the number of people carrying them.
--   * Rates are stored in BASIS POINTS. 7.5% VAT is 750, 10% service is 1000.
--     Same reason.
--
-- The runner in lib/db/migrate.ts splits this file on the semicolon, so there
-- are no function bodies or DO blocks here -- and no semicolons in comments
-- either, which would cut a statement in half. Rules needing procedural logic
-- (seat limits, updated_at bumps) live in the application layer, flagged below.

-- ═══════════════════════════════════════════════
-- VENUES & MENUS
-- Currently hardcoded in lib/dining/venues.ts. Once these tables are
-- populated, that file becomes the seed rather than the source.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS venues (
  slug                  TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  area                  TEXT NOT NULL,
  city                  TEXT NOT NULL,
  cuisine               TEXT NOT NULL,
  blurb                 TEXT,
  image_url             TEXT,
  price_band            SMALLINT NOT NULL DEFAULT 2
                          CHECK (price_band BETWEEN 1 AND 4),
  -- What one person typically spends before service and VAT.
  typical_per_head_kobo BIGINT NOT NULL DEFAULT 0
                          CHECK (typical_per_head_kobo >= 0),
  service_charge_bp     INTEGER NOT NULL DEFAULT 0
                          CHECK (service_charge_bp BETWEEN 0 AND 10000),
  vat_bp                INTEGER NOT NULL DEFAULT 750
                          CHECK (vat_bp BETWEEN 0 AND 10000),
  is_published          BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city, is_published);

CREATE TABLE IF NOT EXISTS venue_menu_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_slug  TEXT NOT NULL REFERENCES venues(slug) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('food','drink')),
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_sections_venue ON venue_menu_sections(venue_slug, position);

-- Item ids are the human-readable slugs the client already uses ('ter-asun'),
-- not UUIDs — existing share links carry them, and they read well in logs.
CREATE TABLE IF NOT EXISTS venue_menu_items (
  id             TEXT PRIMARY KEY,
  venue_slug     TEXT NOT NULL REFERENCES venues(slug) ON DELETE CASCADE,
  section_id     UUID REFERENCES venue_menu_sections(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  note           TEXT,
  price_kobo     BIGINT NOT NULL CHECK (price_kobo >= 0),
  is_signature   BOOLEAN NOT NULL DEFAULT false,
  is_vegetarian  BOOLEAN NOT NULL DEFAULT false,
  is_shareable   BOOLEAN NOT NULL DEFAULT false,
  -- Soft-delete: an item pulled from the menu must not vanish from bills that
  -- already reference it.
  is_available   BOOLEAN NOT NULL DEFAULT true,
  position       INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_venue   ON venue_menu_items(venue_slug, is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_section ON venue_menu_items(section_id, position);

-- ═══════════════════════════════════════════════
-- MEMBER PROFILES
-- The device profile (name + usual spend), per account instead of per phone.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS member_profiles (
  user_id             TEXT PRIMARY KEY,
  display_name        TEXT NOT NULL,
  default_budget_kobo BIGINT CHECK (default_budget_kobo IS NULL OR default_budget_kobo >= 0),
  home_city           TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- GATHERINGS
-- A private plan and a public "open table" are the same row. `visibility`
-- is the only difference, which is why joining a stranger's table and
-- opening your own dinner land in identical screens.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gatherings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id      TEXT NOT NULL,
  title             TEXT NOT NULL,
  venue_slug        TEXT REFERENCES venues(slug) ON DELETE SET NULL,
  starts_at         TIMESTAMPTZ NOT NULL,
  note              TEXT,
  tip_bp            INTEGER NOT NULL DEFAULT 0
                      CHECK (tip_bp BETWEEN 0 AND 10000),
  visibility        TEXT NOT NULL DEFAULT 'private'
                      CHECK (visibility IN ('private','open')),
  -- Open tables only: the line people actually decide on, and the host's note.
  vibe              TEXT,
  host_note         TEXT,
  -- NULL means no cap. Enforced in the application layer, not by a trigger.
  seats             SMALLINT CHECK (seats IS NULL OR seats > 0),
  budget_guide_kobo BIGINT CHECK (budget_guide_kobo IS NULL OR budget_guide_kobo >= 0),
  status            TEXT NOT NULL DEFAULT 'planned'
                      CHECK (status IN ('planned','happening','done','cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gatherings_host  ON gatherings(host_user_id, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_gatherings_venue ON gatherings(venue_slug, starts_at);
-- The /discover query: open, upcoming, not cancelled, soonest first.
CREATE INDEX IF NOT EXISTS idx_gatherings_open
  ON gatherings(starts_at)
  WHERE visibility = 'open' AND status IN ('planned','happening');

-- People at the table. `user_id` is NULL for someone added by name who has no
-- account — the app must keep working for the friend who never signs up.
CREATE TABLE IF NOT EXISTS gathering_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id  UUID NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  user_id       TEXT,
  display_name  TEXT NOT NULL,
  budget_kobo   BIGINT CHECK (budget_kobo IS NULL OR budget_kobo >= 0),
  role          TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('host','guest')),
  status        TEXT NOT NULL DEFAULT 'going'
                  CHECK (status IN ('invited','going','declined')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gathering_members_gathering ON gathering_members(gathering_id);
CREATE INDEX IF NOT EXISTS idx_gathering_members_user      ON gathering_members(user_id, joined_at DESC);
-- One seat per account per gathering. Partial, so unclaimed name-only rows
-- (user_id NULL) are not caught by it.
CREATE UNIQUE INDEX IF NOT EXISTS idx_gathering_members_unique_user
  ON gathering_members(gathering_id, user_id)
  WHERE user_id IS NOT NULL;

-- ═══════════════════════════════════════════════
-- THE ORDER
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gathering_order_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id    UUID NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  menu_item_id    TEXT NOT NULL REFERENCES venue_menu_items(id) ON DELETE RESTRICT,
  qty             SMALLINT NOT NULL DEFAULT 1 CHECK (qty > 0),
  -- Captured at order time on purpose. If the venue raises a price next month,
  -- a bill someone already settled must not silently change underneath them.
  unit_price_kobo BIGINT NOT NULL CHECK (unit_price_kobo >= 0),
  added_by        UUID REFERENCES gathering_members(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_lines_gathering ON gathering_order_lines(gathering_id, created_at);

-- Who carries a line. One row is a personal plate, several is a shared one, and
-- the line total divides evenly across exactly these people.
CREATE TABLE IF NOT EXISTS gathering_order_line_payers (
  line_id    UUID NOT NULL REFERENCES gathering_order_lines(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES gathering_members(id) ON DELETE CASCADE,
  PRIMARY KEY (line_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_line_payers_member ON gathering_order_line_payers(member_id);

-- ═══════════════════════════════════════════════
-- INVITES
-- The server-backed version of the share link. Today the whole plan rides in
-- the URL fragment (lib/meetup/share.ts). With this it becomes a short token.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gathering_invites (
  token         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id  UUID NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  created_by    TEXT NOT NULL,
  expires_at    TIMESTAMPTZ,
  max_uses      SMALLINT CHECK (max_uses IS NULL OR max_uses > 0),
  uses          INTEGER NOT NULL DEFAULT 0 CHECK (uses >= 0),
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gathering_invites_gathering ON gathering_invites(gathering_id);

-- ═══════════════════════════════════════════════
-- MOMENTS
-- Photos live in object storage (Vercel Blob / S3), never in Postgres — only
-- the URL is kept here. A 1400px WebP is ~150KB and there is no reason to pay
-- to stream that out of a database.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS moments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable: a moment can outlive its gathering, or never have had one.
  gathering_id    UUID REFERENCES gatherings(id) ON DELETE SET NULL,
  author_user_id  TEXT NOT NULL,
  venue_slug      TEXT REFERENCES venues(slug) ON DELETE SET NULL,
  caption         TEXT,
  photo_url       TEXT,
  photo_width     INTEGER CHECK (photo_width IS NULL OR photo_width > 0),
  photo_height    INTEGER CHECK (photo_height IS NULL OR photo_height > 0),
  visibility      TEXT NOT NULL DEFAULT 'table'
                    CHECK (visibility IN ('private','table','public')),
  happened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A moment has to be something. Empty rows are a bug, not a feature.
  CONSTRAINT moments_have_content CHECK (
    (caption IS NOT NULL AND LENGTH(TRIM(caption)) > 0) OR photo_url IS NOT NULL
  )
);
CREATE INDEX IF NOT EXISTS idx_moments_author    ON moments(author_user_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_moments_gathering ON moments(gathering_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_moments_venue     ON moments(venue_slug, happened_at DESC);

-- Who was there. Kept by name as well as id so a tag survives the member row
-- being deleted — the memory is the point, the foreign key is bookkeeping.
CREATE TABLE IF NOT EXISTS moment_people (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id  UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  member_id  UUID REFERENCES gathering_members(id) ON DELETE SET NULL,
  name       TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_moment_people_unique ON moment_people(moment_id, LOWER(name));

CREATE TABLE IF NOT EXISTS moment_reactions (
  moment_id   UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (moment_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS idx_moment_reactions_moment ON moment_reactions(moment_id);

-- ═══════════════════════════════════════════════
-- SPLIT VIEWS
-- Only the part that needs a join is done here. Service, VAT and tip are flat
-- multipliers off each person's subtotal — those stay in lib/split/compute.ts
-- so there is one implementation of the rounding, not two that drift.
-- ═══════════════════════════════════════════════

-- Each member's share of each line, in kobo, before service and tax.
CREATE OR REPLACE VIEW gathering_member_line_shares AS
SELECT
  l.gathering_id,
  p.member_id,
  l.id AS line_id,
  l.menu_item_id,
  l.qty,
  l.unit_price_kobo,
  COUNT(*) OVER (PARTITION BY p.line_id) AS shared_between,
  (l.unit_price_kobo * l.qty)::NUMERIC
    / COUNT(*) OVER (PARTITION BY p.line_id) AS share_kobo
FROM gathering_order_line_payers p
JOIN gathering_order_lines l ON l.id = p.line_id;

-- One row per person: what they are carrying before the multipliers.
CREATE OR REPLACE VIEW gathering_member_subtotals AS
SELECT
  m.gathering_id,
  m.id AS member_id,
  m.user_id,
  m.display_name,
  m.budget_kobo,
  COALESCE(SUM(s.share_kobo), 0)::BIGINT AS subtotal_kobo,
  COUNT(s.line_id)                       AS line_count
FROM gathering_members m
LEFT JOIN gathering_member_line_shares s ON s.member_id = m.id
GROUP BY m.gathering_id, m.id, m.user_id, m.display_name, m.budget_kobo;

-- Backs the /discover list without a second round trip for seat counts.
CREATE OR REPLACE VIEW open_tables AS
SELECT
  g.id,
  g.title,
  g.vibe,
  g.host_note,
  g.host_user_id,
  g.venue_slug,
  g.starts_at,
  g.seats,
  g.budget_guide_kobo,
  COUNT(m.id) FILTER (WHERE m.status = 'going') AS taken,
  GREATEST(0, COALESCE(g.seats, 0) - COUNT(m.id) FILTER (WHERE m.status = 'going')) AS seats_left
FROM gatherings g
LEFT JOIN gathering_members m ON m.gathering_id = g.id
WHERE g.visibility = 'open'
  AND g.status IN ('planned','happening')
GROUP BY g.id;
