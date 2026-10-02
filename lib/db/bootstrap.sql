-- Legacy schema contains inventory ALTERs before ecommerce.sql runs.
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
