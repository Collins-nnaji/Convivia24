-- ═══════════════════════════════════════════════
-- RESTOCK REQUESTS — bottles asked of a supplier, tracked until they arrive.
-- Receiving one adds the quantity to stock (recorded as a 'restock' movement).
-- Idempotent: IF NOT EXISTS throughout.
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS restock_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL,
  supplier_id  UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  qty          INTEGER NOT NULL CHECK (qty > 0 AND qty <= 10000),
  cost_ngn     INTEGER CHECK (cost_ngn IS NULL OR cost_ngn >= 0),
  expected_at  DATE,
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','received','cancelled')),
  created_by   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_at  TIMESTAMPTZ,
  received_qty INTEGER
);
CREATE INDEX IF NOT EXISTS idx_restock_requests_open ON restock_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restock_requests_slug ON restock_requests(slug);
