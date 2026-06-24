import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getRecommendations } from '@/lib/recommend/engine';

/** GET /api/recommendations — movies/tracks for the signed-in user, from learned taste. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const recs = await getRecommendations(user.id);
    return NextResponse.json(recs);
  } catch (err) {
    console.error('[GET /api/recommendations]', err);
    return NextResponse.json({ error: 'Could not load recommendations.' }, { status: 500 });
  }
}
