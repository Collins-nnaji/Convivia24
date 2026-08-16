import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';

const HOST_COOKIE = 'c24_party_host';

/** Prefer signed-in user; otherwise stable anonymous host id for party planning. */
export async function resolvePartyHostId(): Promise<string> {
  const user = await getCurrentUser();
  if (user?.id) return user.id;

  const jar = await cookies();
  const existing = jar.get(HOST_COOKIE)?.value;
  if (existing && existing.length >= 8) return existing;

  const id = `host_${crypto.randomUUID()}`;
  jar.set(HOST_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
  });
  return id;
}
