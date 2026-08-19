import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { getVenueBySlug, followVenue, unfollowVenue } from '@/lib/venues/repo';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to follow venues.' }, { status: 401 });

    const venue = await getVenueBySlug(slug);
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    await followVenue(venue.id, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not follow venue.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const venue = await getVenueBySlug(slug);
    if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    await unfollowVenue(venue.id, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not unfollow venue.');
    return NextResponse.json({ error }, { status });
  }
}
