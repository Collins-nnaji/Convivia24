// Taste answers (movies/music) — gathered one question at a time from the
// companion chat, mirrored into companion_memory like onboarding answers so
// the planning AI can reference them too. Backs the recommendation engine.

import sql from '@/lib/db';
import { TASTE_QUESTIONS, describeTasteAnswer } from '@/lib/profile/tasteQuestions';

export type TasteData = Record<string, string>;

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS user_taste (
          user_id    TEXT PRIMARY KEY,
          data       JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}

export async function getTaste(userId: string): Promise<TasteData> {
  await ensureSchema();
  const [row] = await sql`SELECT data FROM user_taste WHERE user_id = ${userId}`;
  return (row?.data as TasteData) ?? {};
}

/** The next unanswered taste question, cycling through the bank in order. */
export function nextTasteQuestion(data: TasteData) {
  return TASTE_QUESTIONS.find((q) => !data[q.id]) ?? null;
}

/**
 * Save one taste answer and mirror it into companion_memory so the planning
 * AI immediately knows it too.
 */
export async function saveTasteAnswer(userId: string, questionId: string, value: string): Promise<TasteData> {
  await ensureSchema();
  const question = TASTE_QUESTIONS.find((q) => q.id === questionId);
  if (!question || !question.options.some((o) => o.value === value)) {
    throw new Error('Unknown taste question or option.');
  }

  const current = await getTaste(userId);
  const updated = { ...current, [questionId]: value };
  const json = JSON.stringify(updated);
  await sql`
    INSERT INTO user_taste (user_id, data)
    VALUES (${userId}, ${json}::jsonb)
    ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;

  const memoryValue = describeTasteAnswer(question, value).slice(0, 300);
  await sql`
    INSERT INTO companion_memory (user_id, key, value)
    VALUES (${userId}, ${question.memoryKey}, ${memoryValue})
    ON CONFLICT (user_id, LOWER(key)) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;

  return updated;
}
