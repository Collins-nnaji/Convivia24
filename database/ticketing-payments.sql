-- Ticketing & payments foundation (run after experiential-platform.sql)
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS

-- ─── Order payment metadata ───────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS organizer_net NUMERIC(12,2);

-- Extend status values for payment lifecycle
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','paid','cancelled','refunded','failed','expired'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency
  ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_ref
  ON orders(payment_provider, payment_reference)
  WHERE payment_provider IS NOT NULL AND payment_reference IS NOT NULL;

-- ─── Line items (snapshot at checkout) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_line_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ticket_type_id  UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  ticket_type_name TEXT NOT NULL,
  unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity        INTEGER NOT NULL DEFAULT 1,
  line_total      NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'NGN',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_line_items_order ON order_line_items(order_id);

-- ─── Payment webhook / provider event log ─────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider        TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  provider_ref    TEXT,
  payload         JSONB NOT NULL DEFAULT '{}',
  processed       BOOLEAN NOT NULL DEFAULT false,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_provider_ref ON payment_events(provider, provider_ref);

-- ─── Ticket type sales windows ────────────────────────────────────────────
ALTER TABLE ticket_types ADD COLUMN IF NOT EXISTS sales_start TIMESTAMPTZ;
