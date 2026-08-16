import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';

const ADMIN_COOKIE = 'c24_admin';

function adminEmails(): string[] {
  return (process.env.CONVIVIA_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (user?.email && adminEmails().includes(user.email.toLowerCase())) return true;

  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === password;
}

export async function requireAdmin(): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (await isAdmin()) return { ok: true };
  return { ok: false, status: 401, error: 'Admin access required.' };
}

export async function setAdminSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return false;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}
