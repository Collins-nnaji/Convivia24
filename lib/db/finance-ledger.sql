-- ═══════════════════════════════════════════════
-- FINANCE LEDGER — manual expenses and every payout the business makes
-- (profit share to partners, supplier settlements, other payments).
-- Idempotent: every statement is IF NOT EXISTS.
-- ═══════════════════════════════════════════════

-- Operating costs entered by hand on the Finance desk. They reduce net profit before the
-- partner split. Rows are voided, never deleted, so the books keep their history.
CREATE TABLE IF NOT EXISTS business_expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spent_on     DATE NOT NULL,
  category     TEXT NOT NULL CHECK (category IN (
                 'delivery','marketing','salaries','rent','software','logistics',
                 'packaging','equipment','fees','tax','other')),
  description  TEXT NOT NULL,
  amount_ngn   BIGINT NOT NULL CHECK (amount_ngn > 0),
  paid_to      TEXT,
  reference    TEXT,
  created_by   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  voided_at    TIMESTAMPTZ,
  void_reason  TEXT
);
CREATE INDEX IF NOT EXISTS idx_business_expenses_spent ON business_expenses(spent_on DESC);

-- Money owed or paid out. `payee_key` is the partner email, the supplier id, or free text.
-- pending → paid (with a transfer reference) or void. Paid rows are never edited.
CREATE TABLE IF NOT EXISTS payouts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind         TEXT NOT NULL CHECK (kind IN ('profit_share','supplier','other')),
  payee_key    TEXT NOT NULL,
  payee_name   TEXT NOT NULL,
  -- Profit-share month, 'YYYY-MM'. Null for supplier and other payouts.
  period       TEXT CHECK (period IS NULL OR period ~ '^[0-9]{4}-[0-9]{2}$'),
  amount_ngn   BIGINT NOT NULL CHECK (amount_ngn > 0),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','void')),
  reference    TEXT,
  note         TEXT,
  created_by   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at      TIMESTAMPTZ,
  paid_by      TEXT
);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_payee ON payouts(kind, payee_key);
-- One live profit-share line per partner per month, so the monthly close can re-run safely.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_payouts_profit_share
  ON payouts(payee_key, period) WHERE kind = 'profit_share' AND status <> 'void';

-- Photo or PDF of the receipt, uploaded from the Expenses page.
ALTER TABLE business_expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
