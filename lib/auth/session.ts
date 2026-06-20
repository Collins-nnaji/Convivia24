import { auth, authConfigured } from './server';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export { authConfigured };

/**
 * Resolve the currently signed-in user from the Neon Auth session. Returns null
 * when signed out or when auth is not configured. Never throws.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!authConfigured) return null;
  try {
    const { data } = await auth.getSession();
    const u = data?.user;
    if (!u?.id || !u?.email) return null;

    return {
      id: String(u.id),
      email: String(u.email),
      name: u.name ?? null,
      image: u.image ?? null,
    };
  } catch {
    return null;
  }
}
