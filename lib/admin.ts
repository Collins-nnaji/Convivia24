import { hasAdminPermission, STAFF_ROLES, type AdminPermission, type StaffRole } from '@/lib/admin-permissions';
import sql from '@/lib/db';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';
import { adminEmails } from '@/lib/admin-emails';

const ADMIN_COOKIE = 'c24_admin';

/**
 * Who is at the desk, and with which role.
 *
 * - Emails in CONVIVIA_ADMIN_EMAILS are owners (full access; also the profit-share partners).
 * - Anyone else gets in only through an active staff record (Team & system › Staff & access),
 *   with that record's limited role, and only once their account email is verified. A staff
 *   record can never grant owner — that stays with the deployment's email list.
 */
export async function adminIdentity(): Promise<{ actor: string; actorLabel: string; role: StaffRole } | null> {
  const user = await getCurrentUser();
  const email = user?.email?.trim().toLowerCase();
  if (!user || !email) return null;
  const owners = adminEmails();
  if (owners.includes(email)) return { actor: user.id, actorLabel: user.email!, role: 'owner' };
  // An empty owner list means the deployment is misconfigured: keep the desk closed entirely.
  if (owners.length === 0 || user.emailVerified !== true) return null;
  try {
    const [row] = await sql`SELECT role FROM admin_staff WHERE email = ${email} AND active = true LIMIT 1`;
    const role = row?.role as StaffRole | undefined;
    if (!role || role === 'owner' || !STAFF_ROLES.includes(role)) return null;
    return { actor: user.id, actorLabel: user.email!, role };
  } catch {
    return null;
  }
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
