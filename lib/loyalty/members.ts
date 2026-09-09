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
  const member = mapRow(rows[0]);

  // Older checkouts could be created before the shopper activated loyalty. Link those orders by
  // their authenticated email, then catch up any that have already reached delivery.
  await sql`
    UPDATE ritual_orders
    SET loyalty_owner_id = ${ownerId}
    WHERE loyalty_owner_id IS NULL AND LOWER(email) = ${member.email}
  `;
  const delivered = await sql`
    SELECT id FROM ritual_orders
    WHERE loyalty_owner_id = ${ownerId}
      AND status IN ('delivered', 'fulfilled')
      AND loyalty_points_awarded = 0
  `;
  for (const order of delivered) await reconcileOrderPoints(String(order.id));

  return (await getMember(ownerId)) || member;
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
 * Make an order's points match its fulfilment state. Delivery awards once;
 * cancellation/refund removes that exact award. The order column is the
 * idempotency receipt, so repeated status updates cannot duplicate either action.
 */
export async function reconcileOrderPoints(orderId: string): Promise<void> {
  const [order] = await sql`
    SELECT id, status, loyalty_owner_id, loyalty_points_awarded, subtotal_ngn, total_ngn
    FROM ritual_orders WHERE id = ${orderId} LIMIT 1
  `;
  if (!order) return;
  const ownerId = (order.loyalty_owner_id as string) || '';
  if (!ownerId) return;
  const current = Number(order.loyalty_points_awarded ?? 0);
  const delivered = order.status === 'delivered' || order.status === 'fulfilled';
  const reversed = order.status === 'cancelled' || order.status === 'refunded';
  if (!delivered && !reversed) return;
  const chargedNgn = Number(order.total_ngn ?? order.subtotal_ngn);
  const desired = delivered ? pointsFromSpend(chargedNgn) : 0;
  const delta = desired - current;
  if (delta === 0) return;
  try {
    const claimed = await sql`
      UPDATE ritual_orders SET loyalty_points_awarded = ${desired}
      WHERE id = ${orderId} AND loyalty_points_awarded = ${current}
      RETURNING id
    `;
    if (claimed.length === 0) return;
    if (delta > 0) {
      await awardPoints(ownerId, delta);
    } else {
      await sql`
        UPDATE loyalty_members
        SET
          points = GREATEST(0, points + ${delta}),
          lifetime_points = GREATEST(0, lifetime_points + ${delta}),
          updated_at = NOW()
        WHERE owner_id = ${ownerId}
      `;
    }
  } catch {
    // Put the receipt back so a later profile/order refresh can retry the credit or reversal.
    await sql`
      UPDATE ritual_orders SET loyalty_points_awarded = ${current}
      WHERE id = ${orderId} AND loyalty_points_awarded = ${desired}
    `.catch(() => {});
    /* loyalty reconciliation must never prevent an operational status update */
  }
}

/** Backwards-compatible name for older call sites; only delivered orders now receive points. */
export const awardOrderPoints = reconcileOrderPoints;

export { pointsFromSpend };
