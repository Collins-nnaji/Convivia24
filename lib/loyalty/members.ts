import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { nextTier, pointsFromSpend, shopDiscountPct, tierForPoints } from '@/lib/loyalty/program';

/**
 * Server-side loyalty record. The browser wallet is fine for display, but a
 * discount that comes off a real charge has to be derived from points the
 * server owns — so tiers and points live here, keyed to the signed-in account.
 */
export type Member = {
  id: string;
  ownerId: string;
  email: string;
  name: string | null;
  points: number;
  lifetimePoints: number;
};

function mapRow(r: Record<string, unknown>): Member {
  return {
    id: String(r.id),
    ownerId: String(r.owner_id),
    email: String(r.email),
    name: (r.name as string) || null,
    points: Number(r.points ?? 0),
    lifetimePoints: Number(r.lifetime_points ?? 0),
  };
}

/** Loyalty is account-bound: no signed-in user, no member record. */
export async function resolveMemberOwner(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `user:${user.id}` : null;
}

export async function getMember(ownerId: string): Promise<Member | null> {
  const rows = await sql`SELECT * FROM loyalty_members WHERE owner_id = ${ownerId} LIMIT 1`;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function claimMember(ownerId: string, input: { email: string; name?: string | null }): Promise<Member> {
  const rows = await sql`
    INSERT INTO loyalty_members (owner_id, email, name)
    VALUES (${ownerId}, ${input.email.trim().toLowerCase()}, ${input.name || null})
    ON CONFLICT (owner_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, loyalty_members.name),
      updated_at = NOW()
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function awardPoints(ownerId: string, points: number): Promise<Member | null> {
  const delta = Math.max(0, Math.floor(points));
  if (delta === 0) return getMember(ownerId);
  const rows = await sql`
    UPDATE loyalty_members
    SET points = points + ${delta}, lifetime_points = lifetime_points + ${delta}, updated_at = NOW()
    WHERE owner_id = ${ownerId}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Take points off a member's balance for a redemption.
 *
 * The balance check lives in the WHERE clause rather than in a read-then-write
 * pair, so two redemptions racing each other cannot both pass the check and
 * push the balance negative — the second simply matches no row. Returns null
 * when the member cannot afford it (or does not exist); lifetime points are
 * untouched, because spending does not undo what was earned.
 */
export async function spendPoints(ownerId: string, points: number): Promise<Member | null> {
  const cost = Math.max(0, Math.floor(points));
  const rows = await sql`
    UPDATE loyalty_members
    SET points = points - ${cost}, updated_at = NOW()
    WHERE owner_id = ${ownerId} AND points >= ${cost}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

/**
 * Put points back after a redemption fails to write its receipt. Deliberately
 * not `awardPoints`: lifetime points were never reduced by the spend, so
 * crediting them again would inflate the member's tier.
 */
export async function refundPoints(ownerId: string, points: number): Promise<Member | null> {
  const delta = Math.max(0, Math.floor(points));
  if (delta === 0) return getMember(ownerId);
  const rows = await sql`
    UPDATE loyalty_members
    SET points = points + ${delta}, updated_at = NOW()
    WHERE owner_id = ${ownerId}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export type MemberStanding = {
  claimed: boolean;
  points: number;
  tierId: string;
  tierName: string;
  discountPct: number;
  nextTierName: string | null;
  pointsToNextTier: number;
};

export function standingFor(member: Member | null): MemberStanding {
  const points = member?.points ?? 0;
  const tier = tierForPoints(points);
  const upcoming = nextTier(points);
  return {
    claimed: Boolean(member),
    points,
    tierId: tier.id,
    tierName: tier.name,
    discountPct: member ? shopDiscountPct(points) : 0,
    nextTierName: upcoming?.name ?? null,
    pointsToNextTier: upcoming ? Math.max(0, upcoming.minPoints - points) : 0,
  };
}

/** The discount a member's tier takes off a subtotal, in naira. */
export function loyaltyDiscountNgn(subtotalNgn: number, member: Member | null): { pct: number; ngn: number } {
  const pct = member ? shopDiscountPct(member.points) : 0;
  return { pct, ngn: Math.round(Math.max(0, subtotalNgn) * (pct / 100)) };
}

/**
 * Award loyalty points for a paid order, once. loyalty_points_awarded doubles
 * as the guard so a repeated payment callback (webhook retry + verify racing
 * each other) can never bank the same points twice.
 */
export async function awardOrderPoints(orderId: string): Promise<void> {
  const [order] = await sql`
    SELECT id, loyalty_owner_id, loyalty_points_awarded, subtotal_ngn, total_ngn
    FROM ritual_orders WHERE id = ${orderId} LIMIT 1
  `;
  if (!order) return;
  const ownerId = (order.loyalty_owner_id as string) || '';
  if (!ownerId || Number(order.loyalty_points_awarded ?? 0) > 0) return;
  const chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn);
  const points = pointsFromSpend(chargedNgn);
  if (points <= 0) return;
  try {
    const claimed = await sql`
      UPDATE ritual_orders SET loyalty_points_awarded = ${points}
      WHERE id = ${orderId} AND loyalty_points_awarded = 0
      RETURNING id
    `;
    if (claimed.length === 0) return;
    await awardPoints(ownerId, points);
  } catch {
    /* points are a bonus — never fail a verified payment over them */
  }
}

export { pointsFromSpend };
