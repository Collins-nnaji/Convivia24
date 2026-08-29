import sql from '@/lib/db';
import { getMember, refundPoints, spendPoints } from '@/lib/loyalty/members';
import { LOYALTY_TIERS, tierForPoints } from '@/lib/loyalty/program';
import type { Reward } from '@/lib/loyalty/rewards';

export type Redemption = {
  id: string;
  rewardId: string;
  rewardName: string;
  category: string;
  pointsSpent: number;
  valueNgn: number | null;
  code: string;
  status: string;
  createdAt: string;
};

export class InsufficientPointsError extends Error {
  constructor(message = 'You do not have enough points for this reward.') {
    super(message);
    this.name = 'InsufficientPointsError';
  }
}

export class TierLockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TierLockedError';
  }
}

function mapRow(r: Record<string, unknown>): Redemption {
  return {
    id: String(r.id),
    rewardId: String(r.reward_id),
    rewardName: String(r.reward_name),
    category: String(r.category),
    pointsSpent: Number(r.points_spent ?? 0),
    valueNgn: r.value_ngn != null ? Number(r.value_ngn) : null,
    code: String(r.code),
    status: String(r.status || 'issued'),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

/** Claim reference the member quotes, e.g. CV24-RW-8KQ2. */
function makeCode(): string {
  const body = Math.random().toString(36).slice(2, 6).toUpperCase();
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CV24-${body}-${tail}`;
}

export async function listRedemptions(ownerId: string): Promise<Redemption[]> {
  const rows = await sql`
    SELECT * FROM reward_redemptions
    WHERE owner_id = ${ownerId}
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return rows.map(mapRow);
}

/**
 * Spend points on a reward.
 *
 * Points come off first, guarded by a balance check in the UPDATE, so a
 * double-submit cannot issue two rewards for one balance. If writing the
 * receipt then fails we hand the points straight back rather than leaving the
 * member short with nothing to show for it.
 */
export async function redeemReward(ownerId: string, reward: Reward): Promise<Redemption> {
  const member = await getMember(ownerId);
  if (!member) throw new InsufficientPointsError('Activate your Guest Card before redeeming.');

  const tier = tierForPoints(member.points);
  const required = LOYALTY_TIERS.find((t) => t.id === reward.minTier);
  if (required && tier.minPoints < required.minPoints) {
    throw new TierLockedError(`${reward.name} unlocks at ${required.name} tier.`);
  }
  if (member.points < reward.costPoints) throw new InsufficientPointsError();

  const spent = await spendPoints(ownerId, reward.costPoints);
  if (!spent) throw new InsufficientPointsError();

  try {
    const rows = await sql`
      INSERT INTO reward_redemptions (owner_id, reward_id, reward_name, category, points_spent, value_ngn, code)
      VALUES (
        ${ownerId}, ${reward.id}, ${reward.name}, ${reward.category},
        ${reward.costPoints}, ${reward.valueNgn ?? null}, ${makeCode()}
      )
      RETURNING *
    `;
    return mapRow(rows[0]);
  } catch (err) {
    // Give the points back — the member paid and got nothing.
    await refundPoints(ownerId, reward.costPoints).catch(() => null);
    throw err;
  }
}
