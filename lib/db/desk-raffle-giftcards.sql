-- ═══════════════════════════════════════════════
-- GIFT CARDS: who it is for, when it lapses, whether we mailed it.
-- TRIVIA DRAWS: every raffle the desk runs, with its winner, so a draw can be audited and resent.
-- All statements are idempotent.
-- ═══════════════════════════════════════════════

ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS recipient_name  TEXT;
ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS expires_at      TIMESTAMPTZ;
ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS sent_at         TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient ON gift_cards(LOWER(recipient_email));

CREATE TABLE IF NOT EXISTS trivia_draws (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_slug       TEXT NOT NULL,
  week_start       DATE,
  winner_entry_id  UUID NOT NULL REFERENCES trivia_entries(id) ON DELETE RESTRICT,
  eligible_count   INTEGER NOT NULL,
  prize_label      TEXT NOT NULL,
  drawn_by         TEXT NOT NULL DEFAULT 'desk',
  drawn_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  winner_notified_at   TIMESTAMPTZ,
  others_notified_at   TIMESTAMPTZ,
  others_notified_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_trivia_draws_round ON trivia_draws(round_slug, drawn_at DESC);

-- Stock movements record who moved the bottles: the desk, a supplier from their portal, or the system.
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS actor TEXT NOT NULL DEFAULT 'system';
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS actor_label TEXT;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- "Tell me when it's back": one row per email per bottle, cleared once the email goes out.
CREATE TABLE IF NOT EXISTS restock_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE (slug, email)
);
CREATE INDEX IF NOT EXISTS idx_restock_alerts_pending ON restock_alerts(slug) WHERE notified_at IS NULL;
