import { NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getInvitedEventsForUser } from '@/lib/convivia24';

export async function GET() {
  const { user } = await neonAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await getInvitedEventsForUser(user.id);
  return NextResponse.json({ events });
}
