import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import * as repo from '@/lib/support/repo';

/** GET /api/support/supporters — the active supporter directory, sign-in gated like every other personal/social data view in the app. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const supporters = await repo.listActiveSupporters(user.id);
    return NextResponse.json({ supporters });
  } catch (err) {
    console.error('[GET /api/support/supporters]', err);
    return NextResponse.json({ error: 'Could not load supporters.' }, { status: 500 });
  }
}
