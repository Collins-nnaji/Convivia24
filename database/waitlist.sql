-- Convivia24 — Waitlist table (run if adding to existing DB)
-- For fresh setup, schema.sql already includes this.

CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  company    TEXT,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
