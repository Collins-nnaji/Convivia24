import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';

const OWNER_COOKIE = 'c24_planner';

/**
 * Who owns a saved party: the signed-in user when there is one, otherwise a
 * per-browser id so anonymous hosts keep their parties on the same device.
 */
export async function resolvePartyOwner(): Promise<string> {
  const user = await getCurrentUser();
  if (user) return `user:${user.id}`;

  const jar = await cookies();
  const existing = jar.get(OWNER_COOKIE)?.value;
  if (existing) return `guest:${existing}`;

  const id = crypto.randomUUID();
  jar.set(OWNER_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  });
  return `guest:${id}`;
}
