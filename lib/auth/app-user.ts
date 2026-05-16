import { neonAuth, type AuthSessionUser } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { syncUserWatchlistFromHostedHangouts } from '@/lib/userWatchlist';
import { getOutletApplicationForUser, serializeOutletApplication } from '@/lib/outlet-application';
import { isConviviaAdminAsync } from '@/lib/admin';

function serializeUserRow(row: Record<string, unknown>) {
  return {
    ...row,
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

/** Minimal profile when extended sync fails — still lets the app recognize sign-in. */
export function minimalAppUser(authUser: AuthSessionUser, row?: Record<string, unknown> | null) {
  if (row) return serializeUserRow(row);
  return {
    id: authUser.id,
    auth_id: authUser.id,
    name: authUser.name || 'Member',
    email: authUser.email || '',
    avatar_url: authUser.image || null,
  };
}

/** DB profile + flags for the signed-in Neon user (or null). Never throws. */
export async function buildAppUserFromAuth(
  authUser?: AuthSessionUser | null,
): Promise<Record<string, unknown> | null> {
  const user = authUser ?? (await neonAuth()).user;
  if (!user) return null;

  let row: Record<string, unknown>;
  try {
    row = (await getOrCreateUser(user)) as Record<string, unknown>;
  } catch (e) {
    console.error('[buildAppUserFromAuth] getOrCreateUser', e);
    return minimalAppUser(user);
  }

  let watchlist = Array.isArray(row.watchlist_cities) ? row.watchlist_cities : [];
  try {
    const synced = await syncUserWatchlistFromHostedHangouts(String(row.id));
    if (synced) watchlist = synced;
  } catch (e) {
    console.warn('[buildAppUserFromAuth] watchlist sync', e);
  }

  let outlet_application = null;
  try {
    const oaRow = await getOutletApplicationForUser(String(row.id));
    outlet_application = serializeOutletApplication(oaRow);
  } catch (e) {
    console.warn('[buildAppUserFromAuth] outlet application', e);
  }

  let is_platform_admin = false;
  try {
    is_platform_admin = await isConviviaAdminAsync(user.email);
  } catch (e) {
    console.warn('[buildAppUserFromAuth] admin check', e);
  }

  return {
    ...serializeUserRow(row),
    watchlist_cities: watchlist,
    outlet_application,
    is_platform_admin,
    /** Neon Auth subject — used by convivia24_events.user_id */
    auth_user_id: user.id,
  };
}
