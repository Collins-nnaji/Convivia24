import { NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { buildAppUserFromAuth, minimalAppUser } from '@/lib/auth/app-user';
import { getOrCreateUser } from '@/lib/db/users';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session — session check for client hydration (all users).
 */
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await buildAppUserFromAuth(authUser);
    if (user) {
      return NextResponse.json({ authenticated: true, user });
    }

    try {
      const row = await getOrCreateUser(authUser);
      return NextResponse.json({
        authenticated: true,
        user: minimalAppUser(authUser, row as Record<string, unknown>),
      });
    } catch {
      return NextResponse.json({
        authenticated: true,
        user: minimalAppUser(authUser),
      });
    }
  } catch (err) {
    console.error('[auth/session]', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
