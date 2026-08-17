import { NextResponse } from 'next/server';
import { liveRoundSlug } from '@/lib/trivia/schedule';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { captureApiError } from '@/lib/sentry';

/** Which brand round is playable this week. */
export async function GET() {
  try {
    const { roundSlug, weekStart } = await liveRoundSlug();
    return NextResponse.json({ roundSlug, weekStart });
  } catch (err) {
    captureApiError(err, { route: 'trivia/week' });
    // No schedule available — fall back to the first catalog round.
    return NextResponse.json({ roundSlug: TRIVIA_ROUNDS[0].slug, weekStart: null, degraded: true });
  }
}
