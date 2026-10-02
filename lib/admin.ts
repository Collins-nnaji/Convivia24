import sql from '@/lib/db';
import { hasAdminPermission, type AdminPermission, type StaffRole } from '@/lib/admin-permissions';
import { cookies } from 'next/headers';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { getCurrentUser } from '@/lib/auth/session';

const ADMIN_COOKIE = 'c24_admin';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function adminEmails(): string[] {
  return (process.env.CONVIVIA_ADMIN_EMAILS || '')
    .split(/[;,\s]+/)
    .map((e) => e.trim().toLowerCase().replace(/\\@/g, '@'))
    .filter((email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
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

export async function adminIdentity(): Promise<{ actor: string; role: StaffRole } | null> {
  const user = await getCurrentUser();
  if (user?.email) {
    if (adminEmails().includes(user.email.toLowerCase())) return { actor: user.id, role: 'owner' };
    const [staff] = await sql`SELECT role FROM admin_staff WHERE email = ${user.email.trim().toLowerCase()} AND active`;
    if (staff) return { actor: user.id, role: staff.role as StaffRole };
  }
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SHARED_ADMIN !== 'true') return null;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return token && verifySessionToken(token, password) ? { actor: 'shared-admin', role: 'owner' } : null;
}

export async function isAdmin(): Promise<boolean> { return Boolean(await adminIdentity()); }

export async function requireAdmin(permission: AdminPermission = 'owner'): Promise<{ ok: true; actor: string; role: StaffRole } | { ok: false; status: number; error: string }> {
  const identity = await adminIdentity();
  if (!identity) return { ok: false, status: 401, error: 'Admin access required.' };
  if (!hasAdminPermission(identity.role, permission)) return { ok: false, status: 403, error: 'Your staff role cannot perform this action.' };
  return { ok: true, ...identity };
}

export async function setAdminSession(password: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SHARED_ADMIN !== 'true') return false;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !constantTimeEqual(password, expected)) return false;

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = `${expiresAt}.${sign(expiresAt, expected)}`;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
