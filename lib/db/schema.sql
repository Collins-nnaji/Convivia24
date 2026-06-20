-- Convivia24 — The Mindful Calendar
-- Schema: a single personal calendar ("My 24") + the Companion's memory.
-- Run: npx tsx lib/db/migrate.ts

-- ═══════════════════════════════════════════════
-- CLEAN SLATE: drop tables from earlier app concepts
-- ═══════════════════════════════════════════════
DROP TABLE IF EXISTS client_users CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS audit_leads CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS pipeline_deals CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS convivium_members CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;

-- ═══════════════════════════════════════════════
-- PERSONAL TASKS ("My 24" — manual items + AI rest buffers)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS personal_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  title         TEXT NOT NULL,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low','normal','high')),
  kind          TEXT NOT NULL DEFAULT 'task'
                  CHECK (kind IN ('task','event','gathering')),
  location      TEXT,
  notes         TEXT,
  is_rest_block BOOLEAN NOT NULL DEFAULT false,
  source        TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('manual','ai_buffer','ai_destress')),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','done','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_user   ON personal_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_starts  ON personal_tasks(starts_at);

-- People invited to a personal calendar item (e.g. "dinner with friends")
CREATE TABLE IF NOT EXISTS personal_task_invitees (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES personal_tasks(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  status        TEXT NOT NULL DEFAULT 'invited'
                  CHECK (status IN ('invited','accepted','declined')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_invitees_task ON personal_task_invitees(task_id);

-- ═══════════════════════════════════════════════
-- COMPANION (the learning AI chatbot — chat history + remembered facts)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS companion_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_messages_user ON companion_messages(user_id, created_at);

-- One row per remembered fact about a user (preferences, habits, people, goals)
CREATE TABLE IF NOT EXISTS companion_memory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  key           TEXT NOT NULL,
  value         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companion_memory_user_key ON companion_memory(user_id, LOWER(key));
