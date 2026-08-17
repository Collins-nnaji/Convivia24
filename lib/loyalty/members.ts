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

export { pointsFromSpend };
