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

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS taste_note TEXT;

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

CREATE TABLE IF NOT EXISTS drink_brands (
  name       TEXT PRIMARY KEY,
  origin     TEXT,
  founded    TEXT,
  history    TEXT,
  style      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- ─────────────────────────────────────────────────────────────
-- Per-supplier stock.
--
-- One SKU is held in different quantities by each regional supplier. The shop keeps showing a
-- national figure (the sum of every supplier's free stock), while checkout reserves against the
-- one supplier that will actually fill the order, chosen from the delivery city.
--
-- `inventory.on_hand` / `reserved` stay live as a rollup of this table so every existing reader
-- keeps working; `syncInventoryRollup(slug)` in lib/suppliers/stock.ts maintains them.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_stock (
  supplier_id   UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  on_hand       INTEGER NOT NULL DEFAULT 0,
  reserved      INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (supplier_id, slug),
  CONSTRAINT supplier_stock_counts_ok
    CHECK (on_hand >= 0 AND reserved >= 0 AND reserved <= on_hand)
);
CREATE INDEX IF NOT EXISTS idx_supplier_stock_slug ON supplier_stock(slug);

-- Which supplier a line was reserved against, so a release returns it to the right shelf.
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS routed_supplier_id UUID REFERENCES suppliers(id);
-- True when no supplier in the delivery city could fill it and we fell back out of region.
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS routed_out_of_city BOOLEAN NOT NULL DEFAULT false;
-- What the routed supplier quoted for this order, so margin is visible before manual sourcing.
ALTER TABLE ritual_orders ADD COLUMN IF NOT EXISTS routed_cost_ngn INTEGER
  CHECK (routed_cost_ngn IS NULL OR routed_cost_ngn >= 0);
