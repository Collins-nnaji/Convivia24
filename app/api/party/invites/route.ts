import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getInvitedEventsForUser } from '@/lib/convivia24';
import { captureApiError } from '@/lib/sentry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ invites: [], authRequired: true });
  }
  try {
    const invites = await getInvitedEventsForUser(user.id);
    return NextResponse.json({ invites });
  } catch (err) {
    captureApiError(err, { route: 'party/invites GET' });
    return NextResponse.json({ invites: [], error: 'Could not load invites' }, { status: 500 });
  }
}
