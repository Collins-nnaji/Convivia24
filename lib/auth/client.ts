// Browser-side helpers that talk to the same-origin Neon Auth proxy (/api/auth).

const BASE = process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL || '/api/auth';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isAdmin: boolean;
}

/** Fetch the current user (or null) from our server-validated endpoint. */
export async function fetchMe(): Promise<{ user: SessionUser | null; authConfigured: boolean }> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return { user: null, authConfigured: false };
    return await res.json();
  } catch {
    return { user: null, authConfigured: false };
  }
}

/** Start a Google sign-in. Redirects the browser to Google then back to `callbackURL`. */
export async function signInWithGoogle(callbackURL = '/'): Promise<void> {
  const res = await fetch(`${BASE}/sign-in/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', callbackURL, errorCallbackURL: '/signin?error=1' }),
  });
  const data = await res.json().catch(() => null);
  if (data?.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data?.error?.message || data?.message || 'Could not start Google sign-in.');
  }
}

/** Sign the current user out and clear the session cookie. */
export async function signOut(): Promise<void> {
  await fetch(`${BASE}/sign-out`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
}
