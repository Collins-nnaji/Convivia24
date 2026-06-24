'use client';

// Browser-side Neon Auth client. Talks to the same-origin /api/auth/* routes
// mounted by lib/auth/server.ts's `auth.handler()`, so session cookies are
// always first-party regardless of where the upstream Neon Auth host lives.

import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

function toSessionUser(u: { id: string; email: string; name?: string | null; image?: string | null }): SessionUser {
  return { id: u.id, email: u.email, name: u.name ?? null, image: u.image ?? null };
}

function absoluteUrl(path: string): string {
  // Neon Auth runs on a separate host from this app, so callback URLs must be
  // absolute — a relative path resolves against the auth server's own origin,
  // not ours, and gets rejected by its host validation.
  return new URL(path, window.location.origin).toString();
}

/** Start a Google sign-in. Redirects the browser to Google then back to `callbackURL`. */
export async function signInWithGoogle(callbackURL = '/'): Promise<void> {
  const { data, error } = await authClient.signIn.social({
    provider: 'google',
    callbackURL: absoluteUrl(callbackURL),
    errorCallbackURL: absoluteUrl('/signin?error=1'),
  });
  if (error) throw new Error(error.message || 'Could not start Google sign-in.');
  if (data && 'url' in data && data.url) {
    window.location.href = data.url;
  }
}

/** Sign in with an email + password account. */
export async function signInWithEmail(email: string, password: string): Promise<SessionUser> {
  const { data, error } = await authClient.signIn.email({ email, password });
  if (error) throw new Error(error.message || 'Invalid email or password.');
  return toSessionUser(data.user);
}

/** Create a new email + password account. */
export async function signUpWithEmail(name: string, email: string, password: string): Promise<SessionUser> {
  const { data, error } = await authClient.signUp.email({ name, email, password });
  if (error) throw new Error(error.message || 'Could not create your account.');
  return toSessionUser(data.user);
}

/** Sign the current user out and clear the session cookie. */
export async function signOut(): Promise<void> {
  await authClient.signOut();
}
