import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/brands/catalog';
import { followerCount, isFollowing, resolveBrandOwner, toggleFollow } from '@/lib/brands/store';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** Follower count for a brand, plus whether the caller follows it. */
export async function GET(req: NextRequest) {
  const slug = String(req.nextUrl.searchParams.get('brand') || '');
  if (!getBrand(slug)) return NextResponse.json({ error: 'Unknown brand.' }, { status: 400 });

  const ownerId = await resolveBrandOwner().catch(() => null);
  try {
    const [followers, following] = await Promise.all([
      followerCount(slug),
      ownerId ? isFollowing(slug, ownerId) : Promise.resolve(false),
    ]);
    return NextResponse.json({ signedIn: Boolean(ownerId), followers, following });
  } catch (err) {
    captureApiError(err, { route: 'brands/follow GET' });
    // No follow store yet — zero followers is the honest answer, not an error.
    return NextResponse.json({ signedIn: Boolean(ownerId), followers: 0, following: false, degraded: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`brand-follow:${clientIp(req)}`, 30, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const ownerId = await resolveBrandOwner();
    if (!ownerId) return NextResponse.json({ error: 'Sign in to follow a brand.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const brand = getBrand(String(body.brand || ''));
    if (!brand) return NextResponse.json({ error: 'Unknown brand.' }, { status: 400 });

    return NextResponse.json(await toggleFollow(brand.slug, ownerId));
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Following is paused right now.' }, { status: 503 });
    }
    captureApiError(err, { route: 'brands/follow POST' });
    const { status, error } = apiErrorResponse(err, 'Could not update your follow.');
    return NextResponse.json({ error }, { status });
  }
}
