import type { Viewport } from 'next';
import { neonAuth } from '@/lib/auth/server';
import { buildAppUserFromAuth } from '@/lib/auth/app-user';
import { HomeAuthGate } from '@/components/convivia24/HomeAuthGate';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#faf6ee',
};

export default async function AppRootPage() {
  const { user: authUser } = await neonAuth();
  let ssrUser: Record<string, unknown> | null = null;

  if (authUser) {
    ssrUser = await buildAppUserFromAuth(authUser);
  }

  return (
    <HomeAuthGate ssrAuthenticated={Boolean(authUser)} ssrUser={ssrUser} />
  );
}
