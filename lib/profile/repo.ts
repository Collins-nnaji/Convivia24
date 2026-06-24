// User profile (onboarding answers) — Postgres-backed, with a lazy schema
// ensure so it works even before the SQL migration has been run.

import sql from '@/lib/db';
import { ONBOARDING_QUESTIONS, describeAnswer, type ProfileData } from '@/lib/profile/questions';

export type { ProfileData };

export interface Profile {
  data: ProfileData;
  onboarded: boolean;
  onboarded_at: string | null;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id      TEXT PRIMARY KEY,
          data         JSONB NOT NULL DEFAULT '{}'::jsonb,
          onboarded_at TIMESTAMPTZ,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}

export async function getProfile(userId: string): Promise<Profile> {
  await ensureSchema();
  const [row] = await sql`SELECT data, onboarded_at FROM user_profiles WHERE user_id = ${userId}`;
  if (!row) return { data: {}, onboarded: false, onboarded_at: null };
  return {
    data: (row.data as ProfileData) ?? {},
    onboarded: !!row.onboarded_at,
    onboarded_at: row.onboarded_at ? new Date(row.onboarded_at as string).toISOString() : null,
  };
}

/**
 * Save the user's onboarding answers and mirror them into companion_memory so
 * the planning AI (companion + plan-day) immediately uses them.
 */
export async function saveProfile(userId: string, answers: ProfileData): Promise<Profile> {
  await ensureSchema();

  // Keep only known questions / valid option values.
  const clean: ProfileData = {};
  for (const q of ONBOARDING_QUESTIONS) {
    const picked = (answers[q.id] || []).filter((v) => q.options.some((o) => o.value === v));
    if (picked.length) clean[q.id] = q.multi ? picked.slice(0, q.options.length) : picked.slice(0, 1);
  }

  const json = JSON.stringify(clean);
  await sql`
    INSERT INTO user_profiles (user_id, data, onboarded_at)
    VALUES (${userId}, ${json}::jsonb, NOW())
    ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, onboarded_at = NOW(), updated_at = NOW()
  `;

  // Mirror into the companion's long-term memory as readable facts.
  for (const q of ONBOARDING_QUESTIONS) {
    const values = clean[q.id];
    if (!values?.length) continue;
    const value = describeAnswer(q, values).slice(0, 300);
    await sql`
      INSERT INTO companion_memory (user_id, key, value)
      VALUES (${userId}, ${q.memoryKey}, ${value})
      ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }

  return getProfile(userId);
}
