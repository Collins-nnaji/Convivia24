-- Listings (items to sell): run against existing Neon DB to add the table
-- Partner companies submit items; Convivia24 sells and earns variable commission per product.

CREATE TABLE IF NOT EXISTS listings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  description             TEXT,
  asking_price           NUMERIC(12,2),
  currency               TEXT NOT NULL DEFAULT 'GBP',
  commission_pct          NUMERIC(5,2),
  status                 TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft','submitted','price_agreed','listed','sold','withdrawn')
  ),
  agreed_price           NUMERIC(12,2),
  agreed_commission_pct   NUMERIC(5,2),
  sold_at                TIMESTAMPTZ,
  sale_value             NUMERIC(12,2),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_client ON listings(client_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
