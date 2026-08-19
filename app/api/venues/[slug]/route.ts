import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { getVenueBySlug, getVenueReviews } from '@/lib/venues/repo';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    const venue = await getVenueBySlug(slug, user?.id ?? null);
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    const reviews = await getVenueReviews(venue.id);
    return NextResponse.json({ venue, reviews });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load venue.');
    return NextResponse.json({ error }, { status });
  }
}
