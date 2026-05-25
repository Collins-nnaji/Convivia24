import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { checkInGuest } from '@/lib/activation';

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
    const guest = await checkInGuest(token, String(user.id));
    return NextResponse.json({ guest });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Check-in failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
