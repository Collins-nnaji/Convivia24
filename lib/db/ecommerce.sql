-- Live shop inventory + admin-uploaded products. Safe to re-run.
-- Also: npx tsx lib/db/seed-inventory.ts

CREATE TABLE IF NOT EXISTS uploads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_name     TEXT NOT NULL,
  url           TEXT NOT NULL,
  filename      TEXT,
  content_type  TEXT,
  size_bytes    INTEGER,
  context       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  slug                  TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  sku                   TEXT,
  on_hand               INTEGER NOT NULL DEFAULT 0,
  reserved              INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold   INTEGER NOT NULL DEFAULT 6,
  track_stock           BOOLEAN NOT NULL DEFAULT true,
  active                BOOLEAN NOT NULL DEFAULT true,
  image_url             TEXT,
  category              TEXT,
  brand                 TEXT,
  volume                TEXT,
  abv                   NUMERIC,
  price_ngn             INTEGER,
  tagline               TEXT,
  description           TEXT,
  source                TEXT NOT NULL DEFAULT 'seed'
                        CHECK (source IN ('seed','admin','sync')),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT inventory_counts_ok CHECK (on_hand >= 0 AND reserved >= 0 AND reserved <= on_hand)
);
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory(active);
CREATE INDEX IF NOT EXISTS idx_inventory_source ON inventory(source);

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS volume TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS abv NUMERIC;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS price_ngn INTEGER;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'seed';

CREATE TABLE IF NOT EXISTS inventory_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL,
  delta_on_hand INTEGER NOT NULL DEFAULT 0,
  delta_reserved INTEGER NOT NULL DEFAULT 0,
  reason        TEXT NOT NULL
                  CHECK (reason IN ('sync','adjust','reserve','release','fulfill','restock','manual','admin_upload')),
  order_id      UUID,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_slug ON inventory_movements(slug, created_at DESC);
