import { Suspense } from 'react';
import type { Viewport } from 'next';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { isConviviaAdminAsync } from '@/lib/admin';
import { Convivia24App } from '@/components/convivia24/Convivia24App';
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

export default async function AppRootPage() {
  let initialUser: Record<string, unknown> | null = null;

  const { user: authUser } = await neonAuth();

  // Not signed in — show the public landing page
  if (!authUser) {
    return <LandingPage />;
  }

  try {
    const row = await getOrCreateUser(authUser);
    const isPlatformAdmin = await isConviviaAdminAsync(authUser.email);
    initialUser = {
      ...row,
      created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      is_platform_admin: isPlatformAdmin,
    };
  } catch (e) {
    console.error('[AppRootPage] getOrCreateUser', e);
  }

  return (
    <main
      data-app-shell
      className="app-shell-root relative mx-auto w-full max-lg:max-w-[min(100%,428px)] lg:max-w-none
        max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:overflow-hidden max-lg:overscroll-none max-lg:touch-pan-y
        lg:h-[100dvh] lg:overflow-hidden overflow-x-hidden"
      style={{ background: 'var(--cv-ivory)' }}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen" style={{ background: 'var(--cv-ivory)' }}>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--cv-muted-2)' }}>
            Loading…
          </div>
        </div>
      }>
        <Convivia24App initialUser={initialUser} />
      </Suspense>
    </main>
  );
}
