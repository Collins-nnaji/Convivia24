import { Suspense } from 'react';
import type { Viewport } from 'next';
import { AppConceptBoard } from '@/components/app/AppConceptBoard';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

export const dynamic = 'force-dynamic';

/** App home: non-zoomable, fixed-scale mobile shell (installable / PWA feel) */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f8f6f2',
};

export default async function AppRootPage() {
  let initialUser: Record<string, unknown> | null = null;
  const { user: authUser } = await neonAuth();
  if (authUser) {
    try {
      const row = await getOrCreateUser(authUser);
      initialUser = {
        ...row,
        created_at:
          row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      };
    } catch (e) {
      console.error('[AppRootPage] getOrCreateUser', e);
    }
  }

  return (
    <main
      data-app-shell
      className="app-shell-root relative mx-auto w-full max-lg:max-w-[min(100%,428px)] lg:max-w-none text-neutral-900 flex flex-col font-sans bg-[#f8f6f2]
      max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:overflow-hidden max-lg:overscroll-none max-lg:touch-pan-y
      lg:min-h-[100dvh] overflow-x-hidden shadow-[0_0_0_1px_rgba(201,168,76,0.12)] lg:shadow-none"
    >
      {/* Atmosphere — scoped to shell so it moves with the mobile “device” width */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        <img
          src="/Homepage.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18] scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f6f2] via-[#f8f6f2]/92 to-cream/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/75 via-transparent to-gold/[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0ebe3]/80 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 flex w-full min-h-0 flex-col max-lg:h-full max-lg:min-h-0 max-lg:flex-1 lg:flex-none lg:h-auto">
        <Suspense fallback={<div className="flex flex-1 items-center justify-center text-neutral-400 text-sm">Loading…</div>}>
          <AppConceptBoard initialUser={initialUser} />
        </Suspense>
      </div>
    </main>
  );
}
