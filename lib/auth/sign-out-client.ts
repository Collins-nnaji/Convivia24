'use client';

import { authClient } from '@/lib/auth/client';

/**
 * End Neon session and hard-navigate so HomeAuthGate does not reuse stale cookies.
 */
export async function signOutAndRedirect(redirectTo = '/auth/sign-in') {
  try {
    await authClient.signOut();
  } catch (e) {
    console.warn('[signOut] authClient.signOut failed, trying API', e);
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
    } catch (fetchErr) {
      console.warn('[signOut] API fallback failed', fetchErr);
    }
  }

  const target = redirectTo.includes('?')
    ? `${redirectTo}&signed_out=1`
    : `${redirectTo}?signed_out=1`;
  window.location.replace(target);
}
