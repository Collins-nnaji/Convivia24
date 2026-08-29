import { NextRequest, NextResponse } from 'next/server';
import { getTasteProfile, resolveTasteOwner, saveTasteProfile } from '@/lib/trivia/profiles';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/** The signed-in drinker's taste profile. Guests keep theirs in localStorage. */
export async function GET() {
  const ownerId = await resolveTasteOwner();
  if (!ownerId) return NextResponse.json({ signedIn: false, profile: null });
  try {
    return NextResponse.json({ signedIn: true, profile: await getTasteProfile(ownerId) });
  } catch (err) {
    captureApiError(err, { route: 'trivia/profile GET' });
    return NextResponse.json({ signedIn: true, profile: null, degraded: true });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(`taste-profile:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const ownerId = await resolveTasteOwner();
    if (!ownerId) {
      return NextResponse.json({ error: 'Sign in to save your taste profile.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const profile = await saveTasteProfile(ownerId, body.profile ?? body);
    return NextResponse.json({ signedIn: true, profile });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Saving is paused right now. Try again shortly.' }, { status: 503 });
    }
    captureApiError(err, { route: 'trivia/profile PUT' });
    const { status, error } = apiErrorResponse(err, 'Could not save your taste profile.');
    return NextResponse.json({ error }, { status });
  }
}
