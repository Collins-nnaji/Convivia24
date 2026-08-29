import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { findSellable } from '@/lib/catalog/sellable';
import { getRound } from '@/lib/trivia/catalog';
import { captureApiError } from '@/lib/sentry';

export type ActivityItem = {
  id: string;
  kind: 'review' | 'order' | 'challenge' | 'redemption';
  title: string;
  detail: string;
  slug?: string;
  at: string;
};

/**
 * A merged timeline of what the account has actually done — reviews written,
 * orders placed, rounds passed, rewards redeemed. Every entry is a row that
 * exists; nothing is inferred, so an empty feed is an honest answer.
 */
export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ signedIn: false, activity: [] });

  const ownerId = `user:${user.id}`;
  const email = user.email.trim().toLowerCase();

  try {
    const [reviews, orders, challenges, redemptions] = await Promise.all([
      sql`SELECT id, slug, rating, created_at FROM product_reviews
          WHERE owner_id = ${ownerId} AND status = 'published'
          ORDER BY created_at DESC LIMIT 10`.catch(() => []),
      sql`SELECT id, total_ngn, subtotal_ngn, created_at FROM ritual_orders
          WHERE LOWER(email) = ${email} AND status NOT IN ('pending','awaiting_payment','cancelled')
          ORDER BY created_at DESC LIMIT 10`.catch(() => []),
      sql`SELECT id, challenge_id, ref, points_awarded, created_at FROM trivia_challenge_completions
          WHERE owner_id = ${ownerId}
          ORDER BY created_at DESC LIMIT 10`.catch(() => []),
      sql`SELECT id, reward_name, points_spent, created_at FROM reward_redemptions
          WHERE owner_id = ${ownerId}
          ORDER BY created_at DESC LIMIT 10`.catch(() => []),
    ]);

    const activity: ActivityItem[] = [
      ...reviews.map((r) => ({
        id: `review-${r.id}`,
        kind: 'review' as const,
        title: `Rated ${findSellable(String(r.slug))?.name ?? String(r.slug)}`,
        detail: `${Number(r.rating)} out of 5`,
        slug: String(r.slug),
        at: new Date(r.created_at as string).toISOString(),
      })),
      ...orders.map((o) => ({
        id: `order-${o.id}`,
        kind: 'order' as const,
        title: 'Placed an order',
        detail: `₦${Number(o.total_ngn ?? o.subtotal_ngn ?? 0).toLocaleString()}`,
        at: new Date(o.created_at as string).toISOString(),
      })),
      ...challenges.map((c) => ({
        id: `challenge-${c.id}`,
        kind: 'challenge' as const,
        title: `Passed the ${getRound(String(c.ref || ''))?.brand ?? 'brand'} round`,
        detail: `+${Number(c.points_awarded ?? 0)} pts`,
        at: new Date(c.created_at as string).toISOString(),
      })),
      ...redemptions.map((r) => ({
        id: `redemption-${r.id}`,
        kind: 'redemption' as const,
        title: `Redeemed ${String(r.reward_name)}`,
        detail: `−${Number(r.points_spent ?? 0)} pts`,
        at: new Date(r.created_at as string).toISOString(),
      })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 12);

    return NextResponse.json({ signedIn: true, activity });
  } catch (err) {
    captureApiError(err, { route: 'account/activity' });
    return NextResponse.json({ signedIn: true, activity: [], degraded: true });
  }
}
