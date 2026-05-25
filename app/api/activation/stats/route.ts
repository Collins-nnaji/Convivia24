import { NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { getActivationStats } from '@/lib/activation';

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const stats = await getActivationStats(String(user.id));
    return NextResponse.json({ stats });
  } catch (e) {
    console.error('[activation/stats]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
