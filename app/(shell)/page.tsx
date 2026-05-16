import type { Viewport } from 'next';
import { neonAuth } from '@/lib/auth/server';
import { buildAppUserFromAuth } from '@/lib/auth/app-user';
import { HomeAuthGate } from '@/components/convivia24/HomeAuthGate';
import { LandingPage } from '@/components/convivia24/LandingPage';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#faf6ee',
};

/**
 * Same pattern as the earlier app: no session → landing, session → app.
 * HomeAuthGate re-checks in the browser when SSR misses Neon cookies.
 */
export default async function AppRootPage() {
  const { user: authUser } = await neonAuth();

  if (!authUser) {
    return <HomeAuthGate ssrAuthenticated={false} ssrUser={null} />;
  }

  let ssrUser: Record<string, unknown> | null = null;
  try {
    ssrUser = await buildAppUserFromAuth(authUser);
  } catch (e) {
    console.error('[AppRootPage] buildAppUserFromAuth', e);
  }

  if (!ssrUser) {
    return <LandingPage />;
  }

  return <HomeAuthGate ssrAuthenticated ssrUser={ssrUser} />;
}
