import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export type ProductReview = {
  id: string;
  slug: string;
  authorName: string;
  rating: number;
  body: string;
  verifiedBuyer: boolean;
  createdAt: string;
  /** True when this row belongs to the account asking for it. */
  mine?: boolean;
};

/** Star counts 1–5 plus the average, ready for the rating bars. */
export type RatingSummary = {
  average: number;
  count: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export const EMPTY_SUMMARY: RatingSummary = {
  average: 0,
  count: 0,
  breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export class DuplicateReviewError extends Error {
  constructor(message = 'You have already reviewed this bottle.') {
    super(message);
    this.name = 'DuplicateReviewError';
  }
}

export async function resolveReviewOwner(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `user:${user.id}` : null;
}

function mapRow(r: Record<string, unknown>, ownerId?: string | null): ProductReview {
  const owner = String(r.owner_id);
  return {
    id: String(r.id),
    slug: String(r.slug),
    authorName: String(r.author_name),
    rating: Number(r.rating ?? 0),
    body: String(r.body || ''),
    verifiedBuyer: r.verified_buyer === true,
    createdAt: new Date(r.created_at as string).toISOString(),
    mine: ownerId ? owner === ownerId : undefined,
  };
}

export async function listReviews(slug: string, ownerId?: string | null): Promise<ProductReview[]> {
  const rows = await sql`
    SELECT * FROM product_reviews
    WHERE slug = ${slug} AND status = 'published'
    ORDER BY verified_buyer DESC, created_at DESC
    LIMIT 200
  `;
  return rows.map((r) => mapRow(r, ownerId));
}

export async function ratingSummary(slug: string): Promise<RatingSummary> {
  const rows = await sql`
    SELECT rating, COUNT(*)::int AS n
    FROM product_reviews
    WHERE slug = ${slug} AND status = 'published'
    GROUP BY rating
  `;
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as RatingSummary['breakdown'];
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    const rating = Number(r.rating) as 1 | 2 | 3 | 4 | 5;
    const n = Number(r.n ?? 0);
    if (rating >= 1 && rating <= 5) breakdown[rating] = n;
    total += n;
    sum += rating * n;
  }
  return {
    average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    count: total,
    breakdown,
  };
}

/**
 * Has this account actually bought the bottle? Drives the "Verified buyer"
 * badge, so it reads the order history rather than trusting the submission.
 */
export async function hasPurchased(email: string, slug: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM ritual_order_items i
    JOIN ritual_orders o ON o.id = i.order_id
    WHERE i.kit_slug = ${slug}
      AND LOWER(o.email) = ${email.trim().toLowerCase()}
      AND o.status NOT IN ('pending', 'awaiting_payment', 'cancelled')
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function createReview(input: {
  slug: string;
  ownerId: string;
  authorName: string;
  rating: number;
  body: string;
  verifiedBuyer: boolean;
}): Promise<ProductReview> {
  try {
    const rows = await sql`
      INSERT INTO product_reviews (slug, owner_id, author_name, rating, body, verified_buyer)
      VALUES (
        ${input.slug}, ${input.ownerId}, ${input.authorName.trim().slice(0, 60)},
        ${Math.min(5, Math.max(1, Math.round(input.rating)))},
        ${input.body.trim().slice(0, 1200)}, ${input.verifiedBuyer}
      )
      RETURNING *
    `;
    return mapRow(rows[0], input.ownerId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('idx_product_reviews_once') || message.includes('duplicate key')) {
      throw new DuplicateReviewError();
    }
    throw err;
  }
}
