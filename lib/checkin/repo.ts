// Daily check-ins (mood + energy + an optional highlight) — one per day.
// Backs the My 24 check-in prompt, feeds companion_memory for planning, and
// gives the recommendation engine a mood signal to lean on.

import sql from '@/lib/db';
import { MOOD_OPTIONS, ENERGY_OPTIONS } from '@/lib/checkin/options';

export interface CheckIn {
  reflect_date: string;
  highlight: string | null;
  mood: string | null;
  energy: string | null;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS daily_reflections (
          id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id      TEXT NOT NULL,
          reflect_date DATE NOT NULL,
          highlight    TEXT,
          mood         TEXT,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, reflect_date)`;
      await sql`ALTER TABLE daily_reflections ALTER COLUMN highlight DROP NOT NULL`;
      await sql`ALTER TABLE daily_reflections ADD COLUMN IF NOT EXISTS energy TEXT`;
    })().catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayCheckIn(userId: string): Promise<CheckIn | null> {
  await ensureSchema();
  const [row] = await sql`
    SELECT reflect_date, highlight, mood, energy FROM daily_reflections
    WHERE user_id = ${userId} AND reflect_date = ${todayKey()}
  `;
  return (row as unknown as CheckIn) ?? null;
}

/** Last `days` check-ins, oldest first — powers the trend view and recommendation engine. */
export async function getRecentCheckIns(userId: string, days = 14): Promise<CheckIn[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT reflect_date, highlight, mood, energy FROM daily_reflections
    WHERE user_id = ${userId} AND reflect_date >= CURRENT_DATE - ${days}::int
    ORDER BY reflect_date ASC
  `;
  return rows as unknown as CheckIn[];
}

/**
 * Save today's check-in. Any field left out keeps its previously saved value,
 * so mood/energy taps and a later highlight note don't clobber each other.
 */
export async function saveCheckIn(
  userId: string,
  fields: { highlight?: string; mood?: string; energy?: string },
): Promise<CheckIn> {
  await ensureSchema();
  if (fields.mood && !MOOD_OPTIONS.some((o) => o.value === fields.mood)) {
    throw new Error('Unknown mood option.');
  }
  if (fields.energy && !ENERGY_OPTIONS.some((o) => o.value === fields.energy)) {
    throw new Error('Unknown energy option.');
  }

  const date = todayKey();
  const highlight = fields.highlight?.trim() || null;
  const mood = fields.mood || null;
  const energy = fields.energy || null;

  const [row] = await sql`
    INSERT INTO daily_reflections (user_id, reflect_date, highlight, mood, energy)
    VALUES (${userId}, ${date}, ${highlight}, ${mood}, ${energy})
    ON CONFLICT (user_id, reflect_date) DO UPDATE SET
      highlight = COALESCE(EXCLUDED.highlight, daily_reflections.highlight),
      mood      = COALESCE(EXCLUDED.mood, daily_reflections.mood),
      energy    = COALESCE(EXCLUDED.energy, daily_reflections.energy)
    RETURNING reflect_date, highlight, mood, energy
  `;

  const memoryWrites: Promise<unknown>[] = [];
  if (highlight) {
    memoryWrites.push(sql`
      INSERT INTO companion_memory (user_id, key, value)
      VALUES (${userId}, ${`good_day_${date}`}, ${highlight})
      ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
  }
  if (mood || row.mood) {
    memoryWrites.push(sql`
      INSERT INTO companion_memory (user_id, key, value)
      VALUES (${userId}, 'mood_today', ${row.mood})
      ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
  }
  await Promise.all(memoryWrites);

  return row as unknown as CheckIn;
}
