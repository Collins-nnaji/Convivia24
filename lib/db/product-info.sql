-- Product taste notes + brand stories for shop info panels. Safe to re-run.

CREATE TABLE IF NOT EXISTS drink_brands (
  name      TEXT PRIMARY KEY,
  origin    TEXT,
  founded   TEXT,
  history   TEXT,
  style     TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS taste_note TEXT;
