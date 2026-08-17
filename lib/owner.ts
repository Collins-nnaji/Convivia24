import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * Stable owner id for records that belong to "whoever is using this".
 * The signed-in user when there is one, otherwise a per-browser id in a cookie
 * so anonymous visitors keep their own data on the same device.
 */
export async function resolveOwner(cookieName: string, maxAgeDays = 180): Promise<string> {
  const user = await getCurrentUser();
  if (user) return `user:${user.id}`;

  const jar = await cookies();
  const existing = jar.get(cookieName)?.value;
  if (existing) return `guest:${existing}`;

  const id = crypto.randomUUID();
  jar.set(cookieName, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * maxAgeDays,
  });
  return `guest:${id}`;
}
