import sql from '@/lib/db';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';

/** A scheduled trivia week — one sponsoring brand runs for seven days. */
export type TriviaWeek = {
  id: string;
  roundSlug: string;
  weekStart: string;
  weekEnd: string;
  published: boolean;
  live: boolean;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/** Monday of the week containing `date`, as an ISO date. */
export function weekStartOf(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  const backToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - backToMonday);
  return isoDate(d);
}

function mapRow(r: Record<string, unknown>, today: string): TriviaWeek {
  const weekStart = String(r.week_start).slice(0, 10);
  const weekEnd = addDays(weekStart, 6);
  const published = r.published !== false;
  return {
    id: String(r.id),
    roundSlug: String(r.round_slug),
    weekStart,
    weekEnd,
    published,
    live: published && weekStart <= today && today <= weekEnd,
  };
}

export async function listWeeks(): Promise<TriviaWeek[]> {
  const today = isoDate(new Date());
  const rows = await sql`SELECT * FROM trivia_weeks ORDER BY week_start DESC LIMIT 60`;
  return rows.map((r) => mapRow(r, today));
}

/**
 * The brand playing right now: the week covering today, else the most recent
 * published week that has already run, else the first catalog round so the page
 * is never empty.
 */
export async function liveRoundSlug(): Promise<{ roundSlug: string; weekStart: string | null }> {
  const today = isoDate(new Date());
  const rows = await sql`
    SELECT * FROM trivia_weeks
    WHERE published = true AND week_start <= ${today}
    ORDER BY week_start DESC
    LIMIT 1
  `;
  const week = rows[0] ? mapRow(rows[0], today) : null;
  if (week) return { roundSlug: week.roundSlug, weekStart: week.weekStart };
  return { roundSlug: TRIVIA_ROUNDS[0].slug, weekStart: null };
}

export function validateWeek(roundSlug: string, weekStart: string): string | null {
  if (!TRIVIA_ROUNDS.some((r) => r.slug === roundSlug)) return 'Unknown brand round.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return 'Week start must be a date.';
  if (Number.isNaN(new Date(`${weekStart}T00:00:00Z`).getTime())) return 'Week start is invalid.';
  return null;
}

export async function scheduleWeek(input: {
  roundSlug: string;
  weekStart: string;
  published?: boolean;
}): Promise<TriviaWeek> {
  const rows = await sql`
    INSERT INTO trivia_weeks (round_slug, week_start, published)
    VALUES (${input.roundSlug}, ${input.weekStart}, ${input.published !== false})
    ON CONFLICT (week_start) DO UPDATE SET
      round_slug = EXCLUDED.round_slug,
      published = EXCLUDED.published,
      updated_at = NOW()
    RETURNING *
  `;
  return mapRow(rows[0], isoDate(new Date()));
}

export async function deleteWeek(id: string): Promise<boolean> {
  const rows = await sql`DELETE FROM trivia_weeks WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
