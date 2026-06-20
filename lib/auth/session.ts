import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

function authBase(): string | null {
  const base = process.env.NEON_AUTH_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

export function authConfigured(): boolean {
  return !!authBase();
}

/**
 * Resolve the currently signed-in user by validating the session cookie against
 * Neon Auth (Better Auth) `/get-session`. Returns null when signed out or when
 * auth is not configured. Never throws.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const base = authBase();
  if (!base) return null;
  try {
    const cookieHeader = (await cookies()).toString();
    if (!cookieHeader) return null;

    const res = await fetch(`${base}/get-session`, {
      headers: { cookie: cookieHeader, accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = await res.json().catch(() => null);
    const u = data?.user;
    if (!u?.id || !u?.email) return null;

    return {
      id: String(u.id),
      email: String(u.email),
      name: u.name ?? null,
      image: u.image ?? u.avatar_url ?? null,
    };
  } catch {
    return null;
  }
}
