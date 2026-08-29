import { NextRequest, NextResponse } from 'next/server';
import {
  createReview,
  DuplicateReviewError,
  EMPTY_SUMMARY,
  hasPurchased,
  listReviews,
  ratingSummary,
  resolveReviewOwner,
} from '@/lib/drinks/reviews';
import { findSellable } from '@/lib/catalog/sellable';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** Reviews and the rating summary for one SKU. */
export async function GET(req: NextRequest) {
  const slug = String(req.nextUrl.searchParams.get('slug') || '');
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

  const ownerId = await resolveReviewOwner().catch(() => null);
  try {
    const [reviews, summary] = await Promise.all([listReviews(slug, ownerId), ratingSummary(slug)]);
    return NextResponse.json({ signedIn: Boolean(ownerId), reviews, summary });
  } catch (err) {
    captureApiError(err, { route: 'shop/reviews GET' });
    // No review store yet — an unrated bottle is a valid state, not an error.
    return NextResponse.json({
      signedIn: Boolean(ownerId),
      reviews: [],
      summary: EMPTY_SUMMARY,
      degraded: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`product-review:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const user = await getCurrentUser();
    const ownerId = await resolveReviewOwner();
    if (!user || !ownerId) {
      return NextResponse.json({ error: 'Sign in to leave a review.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const slug = String(body.slug || '');
    if (!findSellable(slug)) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });

    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Pick a rating from 1 to 5.' }, { status: 400 });
    }

    const text = String(body.body || '').trim();
    if (text.length < 4) {
      return NextResponse.json({ error: 'Add a line about how it drinks.' }, { status: 400 });
    }

    // The badge is a claim about their order history, so we check it here.
    const verifiedBuyer = await hasPurchased(user.email, slug).catch(() => false);
    const authorName = String(body.authorName || user.name || user.email.split('@')[0] || 'Guest');

    const review = await createReview({
      slug,
      ownerId,
      authorName,
      rating,
      body: text,
      verifiedBuyer,
    });
    const summary = await ratingSummary(slug);
    return NextResponse.json({ review, summary }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateReviewError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Reviews are paused right now. Try again shortly.' }, { status: 503 });
    }
    captureApiError(err, { route: 'shop/reviews POST' });
    const { status, error } = apiErrorResponse(err, 'Could not save your review.');
    return NextResponse.json({ error }, { status });
  }
}
