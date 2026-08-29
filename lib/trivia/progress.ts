import sql from '@/lib/db';
import { findSellable } from '@/lib/catalog/sellable';
import { awardPoints, getMember } from '@/lib/loyalty/members';
import {
  getChallenge,
  periodKey,
  type Challenge,
  type ChallengeMeter,
} from '@/lib/trivia/challenges';

export type ChallengeCompletion = {
  challengeId: string;
  periodKey: string;
  pointsAwarded: number;
  createdAt: string;
};

function mapRow(r: Record<string, unknown>): ChallengeCompletion {
  return {
    challengeId: String(r.challenge_id),
    periodKey: String(r.period_key),
    pointsAwarded: Number(r.points_awarded ?? 0),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function listCompletions(ownerId: string): Promise<ChallengeCompletion[]> {
  const rows = await sql`
    SELECT * FROM trivia_challenge_completions
    WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return rows.map(mapRow);
}

export type ClaimResult = {
  /** false when this challenge was already paid out for this period. */
  awarded: boolean;
  pointsAwarded: number;
  points: number;
};

/**
 * Pay out a challenge once per period. The unique index on
 * (owner_id, challenge_id, period_key) is what makes this safe against a
 * double-submit — we insert first and only move points if the row is new.
 */
export async function claimChallenge(
  ownerId: string,
  challenge: Challenge,
  opts: { weekStart: string | null; ref?: string | null }
): Promise<ClaimResult> {
  const key = periodKey(challenge, opts.weekStart);
  const rows = await sql`
    INSERT INTO trivia_challenge_completions (owner_id, challenge_id, period_key, ref, points_awarded)
    VALUES (${ownerId}, ${challenge.id}, ${key}, ${opts.ref || null}, ${challenge.points})
    ON CONFLICT (owner_id, challenge_id, period_key) DO NOTHING
    RETURNING *
  `;

  if (rows.length === 0) {
    const member = await getMember(ownerId);
    return { awarded: false, pointsAwarded: 0, points: member?.points ?? 0 };
  }

  const member = await awardPoints(ownerId, challenge.points);
  return { awarded: true, pointsAwarded: challenge.points, points: member?.points ?? 0 };
}

/**
 * How far along each countable challenge is, read from records the account
 * already owns. Nothing here is a stored counter that could drift from what
 * actually happened — the numbers are the rows.
 */
export type ChallengeMeters = Record<ChallengeMeter, number>;

const NO_METERS: ChallengeMeters = {
  'trivia-rounds': 0,
  'reviews-written': 0,
  'orders-paid': 0,
  'categories-bought': 0,
};

export async function challengeMeters(ownerId: string, email: string | null): Promise<ChallengeMeters> {
  const [rounds, reviews, orders, categories] = await Promise.all([
    sql`SELECT COUNT(*)::int AS n FROM trivia_challenge_completions
        WHERE owner_id = ${ownerId} AND challenge_id = 'trivia'`.catch(() => []),
    sql`SELECT COUNT(*)::int AS n FROM product_reviews
        WHERE owner_id = ${ownerId} AND status = 'published'`.catch(() => []),
    email
      ? sql`SELECT COUNT(*)::int AS n FROM ritual_orders
            WHERE LOWER(email) = ${email.trim().toLowerCase()}
              AND status NOT IN ('pending','awaiting_payment','cancelled')`.catch(() => [])
      : Promise.resolve([]),
    email
      ? sql`SELECT DISTINCT i.kit_slug AS slug
            FROM ritual_order_items i
            JOIN ritual_orders o ON o.id = i.order_id
            WHERE LOWER(o.email) = ${email.trim().toLowerCase()}
              AND o.status NOT IN ('pending','awaiting_payment','cancelled')`.catch(() => [])
      : Promise.resolve([]),
  ]);

  const count = (rows: Record<string, unknown>[]) => Number(rows[0]?.n ?? 0);

  // Order lines store the slug, so breadth is resolved against the catalog here
  // rather than in SQL, which has no idea what category a slug belongs to.
  const bought = new Set<string>();
  for (const row of categories) {
    const category = findSellable(String(row.slug))?.category;
    if (category) bought.add(category);
  }

  return {
    'trivia-rounds': count(rounds),
    'reviews-written': count(reviews),
    'orders-paid': count(orders),
    'categories-bought': bought.size,
  };
}

export { NO_METERS, getChallenge };
