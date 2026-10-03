import { hasAdminPermission, type AdminPermission, type StaffRole } from '@/lib/admin-permissions';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';
import { adminEmails } from '@/lib/admin-emails';

const ADMIN_COOKIE = 'c24_admin';

export async function adminIdentity(): Promise<{ actor: string; actorLabel: string; role: StaffRole } | null> {
  const user = await getCurrentUser();
  if (user?.email && adminEmails().includes(user.email.trim().toLowerCase())) {
    return { actor: user.id, actorLabel: user.email, role: 'owner' };
  }
  return null;
}

export async function isAdmin(): Promise<boolean> { return Boolean(await adminIdentity()); }

export async function requireAdmin(permission: AdminPermission = 'owner'): Promise<{ ok: true; actor: string; actorLabel: string; role: StaffRole } | { ok: false; status: number; error: string }> {
  const identity = await adminIdentity();
  if (!identity) return { ok: false, status: 401, error: 'Admin access required.' };
  if (!hasAdminPermission(identity.role, permission)) return { ok: false, status: 403, error: 'Your staff role cannot perform this action.' };
  return { ok: true, ...identity };
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
