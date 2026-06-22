-- Convivia24 — Drop all old tables and create only the inquiries table
-- Run: npx tsx lib/db/migrate.ts

-- Drop old sales-firm tables (reverse dependency order)
DROP TABLE IF EXISTS client_users CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS audit_leads CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS pipeline_deals CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Drop old enquiries table from previous era
DROP TABLE IF EXISTS enquiries CASCADE;

-- Drop old misc tables
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS cleaning_checklists CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS security_incidents CASCADE;
DROP TABLE IF EXISTS security_patrol_logs CASCADE;
DROP TABLE IF EXISTS security_patrol_routes CASCADE;
DROP TABLE IF EXISTS service_bundles CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS shift_schedules CASCADE;
DROP TABLE IF EXISTS staff_assignments CASCADE;
DROP TABLE IF EXISTS training_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS signup_invites CASCADE;

-- Create the only table we need
CREATE TABLE IF NOT EXISTS inquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  company       TEXT,
  inquiry_type  TEXT NOT NULL DEFAULT 'General Inquiry',
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'read', 'responded', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_email      ON inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_type       ON inquiries(inquiry_type);

-- Waitlist: low-friction signup for Convivium interest
CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  company    TEXT,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
