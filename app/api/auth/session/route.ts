import { NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { buildAppUserFromAuth } from '@/lib/auth/app-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session — lightweight session check for client hydration.
 * Returns the same app user shape as SSR initialUser when signed in.
 */
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await buildAppUserFromAuth(authUser);
    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    console.error('[auth/session]', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
