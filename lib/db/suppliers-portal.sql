-- ═══════════════════════════════════════════════
-- SUPPLIER PORTAL
-- Each supplier gets their own URL (/supplier/<slug>) and an access key issued by the desk.
-- Everything they change lands in supplier_audit_log alongside the admin's own edits, so the
-- main desk always sees who moved which bottle.
-- All statements are idempotent — safe to re-run.
-- ═══════════════════════════════════════════════

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS access_key_hash TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS access_key_issued_at TIMESTAMPTZ;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Backfill slugs from names, then de-dupe by appending a bit of the id to the newer row.
UPDATE suppliers
SET slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

UPDATE suppliers s
SET slug = s.slug || '-' || left(s.id::text, 4)
WHERE EXISTS (
  SELECT 1 FROM suppliers o
  WHERE o.slug = s.slug AND o.id <> s.id AND o.created_at < s.created_at
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_slug ON suppliers(slug);

CREATE TABLE IF NOT EXISTS supplier_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id   UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  -- 'supplier' when done from the portal, 'admin' from the desk, 'system' from routing/fulfilment.
  actor         TEXT NOT NULL CHECK (actor IN ('supplier', 'admin', 'system')),
  actor_label   TEXT,
  action        TEXT NOT NULL,
  sku_slug      TEXT,
  order_id      UUID,
  detail        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supplier_audit_supplier ON supplier_audit_log(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_audit_created ON supplier_audit_log(created_at DESC);

-- Extra sign-in emails per supplier. Anyone on the list opens the portal with a normal
-- Convivia24 account login — no access key needed. The supplier's own contact email always counts.
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS portal_emails TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_suppliers_portal_emails ON suppliers USING GIN (portal_emails);

-- Bottles a supplier would like to stock that are not in the catalog yet. The desk approves
-- (creating the SKU with a retail price) or declines, and the supplier sees the outcome.
CREATE TABLE IF NOT EXISTS supplier_bottle_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id   UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  brand         TEXT,
  category      TEXT,
  volume        TEXT,
  abv           NUMERIC(4,1),
  cost_ngn      INTEGER CHECK (cost_ngn IS NULL OR cost_ngn >= 0),
  on_hand       INTEGER NOT NULL DEFAULT 0 CHECK (on_hand >= 0),
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  decision_note TEXT,
  created_slug  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_supplier_bottle_requests_status ON supplier_bottle_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_bottle_requests_supplier ON supplier_bottle_requests(supplier_id, created_at DESC);
