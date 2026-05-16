import { Suspense } from 'react';
import type { Viewport } from 'next';
import { AppOpenSplash } from '@/components/app/AppOpenSplash';
import { AppConceptBoard } from '@/components/app/AppConceptBoard';
import { neonAuth } from '@/lib/auth/server';
import { buildAppUserFromAuth } from '@/lib/auth/app-user';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Convivia24 · Outlet console',
  description: 'Demand, roster, post shifts, and payouts for hospitality outlets.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f8f6f2',
};

/** Outlet-only console — same Neon auth as staff; separate UI route. */
export default async function OutletAppPage() {
  let initialUser: Record<string, unknown> | null = null;
  const { user: authUser } = await neonAuth();
  if (authUser) {
    try {
      initialUser = await buildAppUserFromAuth(authUser);
    } catch (e) {
      console.error('[OutletAppPage] buildAppUserFromAuth', e);
    }
  }

  return (
    <main
      data-app-shell
      data-app-mode="outlet"
      className="app-shell-root relative mx-auto w-full max-lg:max-w-[min(100%,428px)] lg:max-w-none text-neutral-900 flex flex-col font-sans bg-[#f8f6f2]
      max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:overflow-hidden max-lg:overscroll-none max-lg:touch-pan-y
      lg:min-h-[100dvh] overflow-x-hidden shadow-[0_0_0_1px_rgba(201,168,76,0.12)] lg:shadow-none"
    >
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f6f2] via-[#f8f6f2]/92 to-cream/50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/75 via-transparent to-gold/[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0ebe3]/80 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 flex w-full min-h-0 flex-col max-lg:h-full max-lg:min-h-0 max-lg:flex-1 lg:flex-none lg:h-auto">
        <AppOpenSplash>
          <Suspense fallback={<div className="flex flex-1 items-center justify-center text-neutral-400 text-sm">Loading…</div>}>
            <AppConceptBoard appMode="outlet" initialUser={initialUser} />
          </Suspense>
        </AppOpenSplash>
      </div>
    </main>
  );
}
