import { neonAuth, type AuthSessionUser } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { syncUserWatchlistFromHostedHangouts } from '@/lib/userWatchlist';
import { getOutletApplicationForUser, serializeOutletApplication } from '@/lib/outlet-application';
import { isConviviaAdminAsync } from '@/lib/admin';

/** DB profile + outlet/admin flags for the signed-in Neon user (or null). */
export async function buildAppUserFromAuth(
  authUser?: AuthSessionUser | null,
): Promise<Record<string, unknown> | null> {
  const user = authUser ?? (await neonAuth()).user;
  if (!user) return null;

  const row = await getOrCreateUser(user);
  const syncedWatchlist = await syncUserWatchlistFromHostedHangouts(String(row.id));
  const oaRow = await getOutletApplicationForUser(String(row.id));
  const isPlatformAdmin = await isConviviaAdminAsync(user.email);

  return {
    ...row,
    watchlist_cities: syncedWatchlist ?? row.watchlist_cities ?? [],
    created_at:
      row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    outlet_application: serializeOutletApplication(oaRow),
    is_platform_admin: isPlatformAdmin,
  };
}
