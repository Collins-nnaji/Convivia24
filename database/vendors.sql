-- Convivia24 vendor marketplace
-- Vendors onboard themselves via the public apply form; event organisers
-- browse the approved directory from the console. Run against Neon DB.

CREATE TABLE IF NOT EXISTS vendors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'other',
  contact_name  TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  whatsapp      TEXT,
  website       TEXT,
  instagram     TEXT,
  city          TEXT,
  country       TEXT,
  description   TEXT,
  services      TEXT[],
  price_from    NUMERIC,
  currency      TEXT NOT NULL DEFAULT 'NGN',
  logo_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_status     ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category   ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_city       ON vendors(city);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);
