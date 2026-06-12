import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isAdmin: boolean;
}

const ADMIN_EMAILS = (process.env.CONVIVIA_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

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

    const email = String(u.email);
    return {
      id: String(u.id),
      email,
      name: u.name ?? null,
      image: u.image ?? u.avatar_url ?? null,
      isAdmin: ADMIN_EMAILS.includes(email.toLowerCase()),
    };
  } catch {
    return null;
  }
}

/** True if the request carries the legacy admin secret (back-compat / break-glass). */
function hasAdminSecret(req: { headers: { get(name: string): string | null } }): boolean {
  const secret = req.headers.get('x-admin-secret');
  return !!process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET;
}

/** For API routes: returns the user if signed in, else null. */
export async function requireUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}

/**
 * For API routes: authorize an admin. Accepts a valid admin session OR the
 * legacy x-admin-secret header (so the console keeps working before Neon Auth
 * is configured, and for automated/break-glass access).
 */
export async function isAdminRequest(req: { headers: { get(name: string): string | null } }): Promise<boolean> {
  if (hasAdminSecret(req)) return true;
  const user = await getCurrentUser();
  return !!user?.isAdmin;
}
