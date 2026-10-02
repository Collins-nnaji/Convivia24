import sql from '@/lib/db';
import { hasAdminPermission, STAFF_ROLES, type AdminPermission, type StaffRole } from '@/lib/admin-permissions';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';
import { adminEmails } from '@/lib/admin-emails';

const ADMIN_COOKIE = 'c24_admin';

export async function adminIdentity(): Promise<{ actor: string; actorLabel: string; role: StaffRole } | null> {
  const user = await getCurrentUser();
  if (user?.email && user.emailVerified) {
    if (adminEmails().includes(user.email.trim().toLowerCase())) return { actor: user.id, actorLabel: user.email, role: 'owner' };
    const [staff] = await sql`SELECT role FROM admin_staff WHERE email = ${user.email.trim().toLowerCase()} AND active`;
    if (staff && STAFF_ROLES.includes(staff.role as StaffRole)) return { actor: user.id, actorLabel: user.email, role: staff.role as StaffRole };
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
