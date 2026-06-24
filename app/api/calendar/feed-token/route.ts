import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import * as repo from '@/lib/calendar/repo';

/** GET /api/calendar/feed-token — returns (creating if needed) the signed-in user's read-only ICS subscribe URL. */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const token = await repo.getOrCreateFeedToken(user.id);
    return NextResponse.json({ url: `${req.nextUrl.origin}/api/calendar/feed/${token}.ics` });
  } catch (err) {
    console.error('[GET /api/calendar/feed-token]', err);
    return NextResponse.json({ error: 'Could not load your feed link.' }, { status: 500 });
  }
}
