-- Invite-gated sign-up: run against Neon DB to add the invite table.
-- Admins create rows here; the token goes in the invite URL.

CREATE TABLE IF NOT EXISTS signup_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token        TEXT NOT NULL UNIQUE,
  email        TEXT,                        -- optional: pre-fill or enforce on sign-up
  created_by   TEXT,                        -- admin email who created the invite
  expires_at   TIMESTAMPTZ NOT NULL,
  used_at      TIMESTAMPTZ,                 -- NULL = still valid
  used_by      TEXT,                        -- email of user who consumed it
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON signup_invites(token);
