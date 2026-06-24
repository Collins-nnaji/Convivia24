import { NextResponse } from 'next/server';
import { getCuratedEvents, getDiscoverCities } from '@/lib/events/repo';

/** GET /api/events?city=London — curated Discover feed, public (no sign-in required). */
export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get('city') || undefined;
  try {
    const [events, cities] = await Promise.all([getCuratedEvents(city), getDiscoverCities()]);
    return NextResponse.json({ events, cities });
  } catch (err) {
    console.error('[GET /api/events]', err);
    return NextResponse.json({ error: 'Could not load the Discover feed.' }, { status: 500 });
  }
}
