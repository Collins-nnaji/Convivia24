-- ═══════════════════════════════════════════════
-- STOREFRONT — merchandising fields on inventory + editorial blocks.
-- Idempotent: every statement is IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- ═══════════════════════════════════════════════

-- "Was" price. compare_at_ngn > price_ngn means the bottle is on offer (SAVE ₦X).
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS compare_at_ngn INTEGER;
-- Handpicked for you / Recommended sort.
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS featured BOOLEAN;
-- One merchandising ribbon per bottle.
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS badge TEXT;
-- Country of origin — the Country facet.
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS origin TEXT;
-- Manual ordering inside Recommended; higher first.
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS merch_rank INTEGER NOT NULL DEFAULT 0;
-- First time the SKU was listed — "New in".
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE inventory ADD CONSTRAINT inventory_badge_ok
    CHECK (badge IS NULL OR badge IN ('new','best-seller','staff-pick','exclusive','limited','gift'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE inventory ADD CONSTRAINT inventory_compare_at_ok
    CHECK (compare_at_ngn IS NULL OR compare_at_ngn >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory(featured) WHERE featured = true;

-- Every editorial slot on the storefront: hero banners, the announcement bar,
-- highlight tiles and "Get inspired" cards. Scheduled rows render only inside
-- their window, so seasonal campaigns can be loaded ahead of time.
CREATE TABLE IF NOT EXISTS storefront_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        TEXT NOT NULL CHECK (kind IN ('hero','announcement','highlight','editorial')),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cta_label   TEXT,
  href        TEXT,
  image_url   TEXT,
  theme       TEXT NOT NULL DEFAULT 'ember'
                CHECK (theme IN ('ember','night','palm','gold','cream')),
  position    INTEGER NOT NULL DEFAULT 0,
  published   BOOLEAN NOT NULL DEFAULT true,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_storefront_blocks_kind ON storefront_blocks(kind, position);
