// Browser-side helpers that talk to the same-origin Neon Auth proxy (/api/auth).

const BASE = process.env.NEXT_PUBLIC_NEON_AUTH_BASE_URL || '/api/auth';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
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
  // Neon Auth runs on a separate host from this app, so callback URLs must be
  // absolute — a relative path resolves against the auth server's own origin,
  // not ours, and gets rejected by its host validation.
  const origin = window.location.origin;
  const absoluteCallback = new URL(callbackURL, origin).toString();
  const absoluteErrorCallback = new URL('/signin?error=1', origin).toString();
  const res = await fetch(`${BASE}/sign-in/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', callbackURL: absoluteCallback, errorCallbackURL: absoluteErrorCallback }),
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Upstream returned a non-JSON body (HTML error page, empty response, etc).
  }
  if (data?.url) {
    window.location.href = data.url;
    return;
  }
  const detail = data?.error?.message || data?.message || text.slice(0, 300);
  throw new Error(detail ? `Could not start Google sign-in (HTTP ${res.status}): ${detail}` : `Could not start Google sign-in (HTTP ${res.status}).`);
}

/** Sign the current user out and clear the session cookie. */
export async function signOut(): Promise<void> {
  await fetch(`${BASE}/sign-out`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
}
