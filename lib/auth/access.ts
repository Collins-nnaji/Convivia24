/**
 * Access control for the platform. Scales by using app_users.role as source of truth.
 *
 * - Admin: only users with role 'admin' (set from ADMIN_EMAILS on login via syncUser).
 * - Client: everyone else; access scoped by client_users (which client they belong to).
 *
 * To add more admins: add email to ADMIN_EMAILS in lib/auth/session.ts and have that
 * user log in once (syncUser sets role). Later you can add "promote to admin" by
 * updating app_users.role in the DB.
 */

export type AppUser = { id: string; email: string; name?: string | null; image?: string | null; role: string };

export function canAccessAdmin(appUser: AppUser | null | undefined): boolean {
  return appUser?.role === 'admin';
}

export function canAccessDashboard(appUser: AppUser | null | undefined): boolean {
  return !!appUser;
}
