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

-- Secure per-invitee response token — backs the public accept/decline link
-- shared with people who aren't necessarily Convivia24 users.
ALTER TABLE personal_task_invitees ADD COLUMN IF NOT EXISTS response_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_invitees_response_token ON personal_task_invitees(response_token);

-- One secret per-user token, used to build a read-only ICS feed URL so My 24
-- can be subscribed to from Google/Apple/Outlook calendar apps.
CREATE TABLE IF NOT EXISTS calendar_feed_tokens (
  user_id     TEXT PRIMARY KEY,
  token       UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_feed_tokens_token ON calendar_feed_tokens(token);

-- ═══════════════════════════════════════════════
-- COMPANION (the learning AI chatbot — chat history + remembered facts)
-- ═══════════════════════════════════════════════

-- A single chat thread. Users can run several in parallel ("New chat").
CREATE TABLE IF NOT EXISTS companion_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  title         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_conversations_user ON companion_conversations(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS companion_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_companion_messages_user ON companion_messages(user_id, created_at);

-- Each message belongs to a conversation (nullable for rows created before threads existed).
ALTER TABLE companion_messages ADD COLUMN IF NOT EXISTS conversation_id UUID;
CREATE INDEX IF NOT EXISTS idx_companion_messages_conversation ON companion_messages(conversation_id, created_at);

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

-- ═══════════════════════════════════════════════
-- PEOPLE (the people layer — partner, friends, family for planning + invites)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS people (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  relationship  TEXT,
  email         TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_people_user ON people(user_id);

-- ═══════════════════════════════════════════════
-- USER PROFILE (onboarding answers — shapes how the companion plans)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       TEXT PRIMARY KEY,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Taste answers (movies/music) — gathered a question at a time from the
-- companion chat over time, used to power recommendations.
CREATE TABLE IF NOT EXISTS user_taste (
  user_id       TEXT PRIMARY KEY,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One evening reflection per day — feeds the companion's memory.
CREATE TABLE IF NOT EXISTS daily_reflections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,
  reflect_date  DATE NOT NULL,
  highlight     TEXT NOT NULL,
  mood          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, reflect_date);
