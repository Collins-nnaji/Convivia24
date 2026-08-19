import { cookies } from 'next/headers';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { getCurrentUser } from '@/lib/auth/session';

const ADMIN_COOKIE = 'c24_admin';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function adminEmails(): string[] {
  return (process.env.CONVIVIA_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The cookie never carries the admin password — only a signed, expiring
 * token. The signing key is derived from the password so it changes when
 * the password does, without ever putting the password itself on the wire.
 */
function signingKey(password: string): Buffer {
  return createHash('sha256').update(password).digest();
}

function sign(expiresAt: number, password: string): string {
  return createHmac('sha256', signingKey(password)).update(String(expiresAt)).digest('hex');
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function verifySessionToken(token: string, password: string): boolean {
  const [expiresAtRaw, sig] = token.split('.');
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAtRaw || !sig || !Number.isFinite(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;
  return constantTimeEqual(sig, sign(expiresAt, password));
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (user?.email && adminEmails().includes(user.email.toLowerCase())) return true;

  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token, password);
}

export async function requireAdmin(): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (await isAdmin()) return { ok: true };
  return { ok: false, status: 401, error: 'Admin access required.' };
}

export async function setAdminSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !constantTimeEqual(password, expected)) return false;

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = `${expiresAt}.${sign(expiresAt, expected)}`;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
