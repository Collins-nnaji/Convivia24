'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { Convivia24App } from '@/components/convivia24/Convivia24App';
import { LandingPage } from '@/components/convivia24/LandingPage';

type AuthState = 'loading' | 'signed-out' | 'signed-in';

async function fetchSession(): Promise<{
  authenticated: boolean;
  user: Record<string, unknown> | null;
}> {
  const res = await fetch('/api/auth/session', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) return { authenticated: false, user: null };
  return res.json();
}

function AppShell({ user }: { user: Record<string, unknown> | null }) {
  return (
    <main
      data-app-shell
      className="app-shell-root relative mx-auto w-full max-lg:max-w-[min(100%,428px)] lg:max-w-none
        max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:overflow-hidden max-lg:overscroll-none max-lg:touch-pan-y
        lg:h-[100dvh] lg:overflow-hidden overflow-x-hidden"
      style={{ background: 'var(--cv-ivory)' }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen" style={{ background: 'var(--cv-ivory)' }}>
            <div
              style={{
                fontFamily: 'var(--font-instrument, serif)',
                fontStyle: 'italic',
                fontSize: 18,
                color: 'var(--cv-muted-2)',
              }}
            >
              Loading…
            </div>
          </div>
        }
      >
        <Convivia24App initialUser={user} />
      </Suspense>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main
      className="flex items-center justify-center min-h-[100dvh]"
      style={{ background: 'var(--cv-ivory)' }}
    >
      <div
        style={{
          fontFamily: 'var(--font-instrument, serif)',
          fontStyle: 'italic',
          fontSize: 18,
          color: 'var(--cv-muted-2)',
        }}
      >
        Loading…
      </div>
    </main>
  );
}

interface HomeAuthGateProps {
  /** From SSR when cookies are visible server-side */
  ssrAuthenticated?: boolean;
  ssrUser?: Record<string, unknown> | null;
}

/**
 * Client session gate: Neon cookies are often missing on SSR but present in the browser.
 * Always reconcile via /api/auth/session so sign-in works for all users, not only when SSR sees cookies.
 */
export function HomeAuthGate({ ssrAuthenticated, ssrUser }: HomeAuthGateProps) {
  const [state, setState] = useState<AuthState>(
    ssrAuthenticated && ssrUser ? 'signed-in' : 'loading',
  );
  const [user, setUser] = useState<Record<string, unknown> | null>(ssrUser ?? null);

  const syncSession = useCallback(async () => {
    try {
      const data = await fetchSession();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setState('signed-in');
      } else {
        setUser(null);
        setState('signed-out');
      }
    } catch {
      setState(ssrAuthenticated ? 'signed-in' : 'signed-out');
    }
  }, [ssrAuthenticated]);

  useEffect(() => {
    syncSession();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncSession();
    };
    window.addEventListener('focus', syncSession);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', syncSession);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [syncSession]);

  if (state === 'loading') return <LoadingScreen />;
  if (state === 'signed-out') return <LandingPage />;
  return <AppShell user={user} />;
}
