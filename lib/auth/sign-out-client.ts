'use client';

import { authClient } from '@/lib/auth/client';

const SIGNED_OUT_KEY = 'cv_signed_out';

/**
 * End Neon session and return to the public landing page (same as the earlier app).
 */
export async function signOutAndRedirect(redirectTo = '/') {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SIGNED_OUT_KEY, '1');
  }

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

  const base = redirectTo.split('?')[0] || '/';
  const target = `${base}?signed_out=1`;
  window.location.replace(target);
}

export function consumeSignedOutFlag(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(SIGNED_OUT_KEY) !== '1') return false;
  sessionStorage.removeItem(SIGNED_OUT_KEY);
  return true;
}
