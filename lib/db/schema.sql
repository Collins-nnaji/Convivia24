-- Convivia24 Pipeline Suite Schema
-- Run once against your Neon database

-- Users table (mirrors Neon Auth users, with role)
CREATE TABLE IF NOT EXISTS app_users (
  id          TEXT PRIMARY KEY,          -- matches Neon Auth user id
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  image       TEXT,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed admin accounts
INSERT INTO app_users (id, email, name, role)
VALUES
  ('admin-collins', 'collinsnnaji1@gmail.com', 'Collins Nnaji',  'admin'),
  ('admin-tojo',    'speak2tojo@gmail.com',    'Tojo',           'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Clients (businesses Convivia24 manages)
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  industry        TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  assigned_admin  TEXT REFERENCES app_users(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipeline deals
CREATE TABLE IF NOT EXISTS pipeline_deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  stage       TEXT NOT NULL DEFAULT 'lead' CHECK (
                stage IN ('lead','qualified','proposal','negotiation','closed_won','closed_lost')
              ),
  value       NUMERIC(12,2),
  currency    TEXT NOT NULL DEFAULT 'GBP',
  notes       TEXT,
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages (client <-> admin thread per client)
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_id    TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  sender_role  TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  body         TEXT NOT NULL,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents (stored on iDrive e2)
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by   TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  idrive_key    TEXT NOT NULL UNIQUE,
  url           TEXT NOT NULL,
  size_bytes    BIGINT,
  mime_type     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit leads (from /audit form)
CREATE TABLE IF NOT EXISTS audit_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  company         TEXT,
  answers         JSONB,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (
                    status IN ('new','contacted','converted','rejected')
                  ),
  assigned_client UUID REFERENCES clients(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client user link (which app_user account belongs to which client)
CREATE TABLE IF NOT EXISTS client_users (
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, user_id)
);

-- Listings (items to sell; partner companies submit, Convivia24 sells and earns commission)
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_client ON pipeline_deals(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_leads_status ON audit_leads(status);
CREATE INDEX IF NOT EXISTS idx_listings_client ON listings(client_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
