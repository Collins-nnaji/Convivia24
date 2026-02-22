import { auth } from './server';
import type { AppUser } from './access';
import sql from '@/lib/db';
import { redirect } from 'next/navigation';

/** Only these emails get admin role on login. Single source of truth for "who can be admin". */
export const ADMIN_EMAILS = ['collinsnnaji1@gmail.com', 'speak2tojo@gmail.com', 'standexdigital@gmail.com'] as const;

const ADMIN_EMAILS_LOWER = ADMIN_EMAILS.map((e) => e.toLowerCase());

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS_LOWER.includes(email.toLowerCase().trim());
}

export async function getSession() {
  return auth.getSession();
}

export async function requireAuth() {
  const session = await auth.getSession();
  if (!session?.user) redirect('/auth/sign-in');
  return session.user;
}

/** Use app_users.role (synced from ADMIN_EMAILS on login) so DB is source of truth for access */
export async function requireAdmin() {
  const user = await requireAuth();
  const appUser = await getAppUser({ id: user.id, email: user.email!, name: user.name, image: user.image });
  if (appUser.role !== 'admin') redirect('/dashboard?admin=denied');
  return user;
}

/** Upsert Neon Auth user into app_users; role is kept in sync with ADMIN_EMAILS on every login. Email stored lowercase. */
export async function syncUser(authUser: { id: string; email: string; name?: string | null; image?: string | null }): Promise<AppUser> {
  const emailNorm = (authUser.email ?? '').toLowerCase().trim();
  const role = isAdmin(authUser.email) ? 'admin' : 'client';
  const rows = await sql`
    INSERT INTO app_users (id, email, name, image, role)
    VALUES (${authUser.id}, ${emailNorm}, ${authUser.name ?? null}, ${authUser.image ?? null}, ${role})
    ON CONFLICT (email) DO UPDATE
      SET name  = EXCLUDED.name,
          image = EXCLUDED.image,
          id    = EXCLUDED.id,
          role  = EXCLUDED.role
    RETURNING *
  `;
  return rows[0] as AppUser;
}

/** Get app_user row, syncing from auth if needed. Ensures ADMIN_EMAILS users always have role=admin (self-heal). */
export async function getAppUser(authUser: { id: string; email: string; name?: string | null; image?: string | null }): Promise<AppUser> {
  const emailNorm = (authUser.email ?? '').toLowerCase().trim();
  if (!emailNorm) return syncUser(authUser);
  // Case-insensitive lookup so session email (e.g. "User@Email.com") matches DB ("user@email.com")
  const rows = await sql`
    SELECT * FROM app_users WHERE LOWER(TRIM(email)) = ${emailNorm}
  `;
  if (rows.length === 0) return syncUser(authUser);
  const row = rows[0] as AppUser;
  if (isAdmin(authUser.email) && row.role !== 'admin') {
    await sql`UPDATE app_users SET role = 'admin' WHERE id = ${row.id}`;
    const updated = await sql`SELECT * FROM app_users WHERE id = ${row.id}`;
    return updated[0] as AppUser;
  }
  return row;
}
