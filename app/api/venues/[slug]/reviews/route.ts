import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { getVenueBySlug, addVenueReview, getVenueReviews } from '@/lib/venues/repo';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const venue = await getVenueBySlug(slug);
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    const reviews = await getVenueReviews(venue.id);
    return NextResponse.json({ reviews });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not load reviews.');
    return NextResponse.json({ error, reviews: [] }, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to leave a review.' }, { status: 401 });

    const venue = await getVenueBySlug(slug);
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    const { rating, body } = await req.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5.' }, { status: 400 });
    }
    if (!body || body.trim().length < 3) {
      return NextResponse.json({ error: 'Review text is too short.' }, { status: 400 });
    }

    const review = await addVenueReview({
      venueId: venue.id,
      userId: user.id,
      authorName: user.name || user.email.split('@')[0],
      rating: Number(rating),
      body: body.trim(),
    });

    return NextResponse.json({ review });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not post review.');
    return NextResponse.json({ error }, { status });
  }
}
