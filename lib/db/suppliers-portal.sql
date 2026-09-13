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
