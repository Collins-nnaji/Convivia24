import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { isPremiumUser } from '@/lib/premium';
import { syncUserWatchlistFromHostedHangouts } from '@/lib/userWatchlist';
import { getOutletApplicationForUser, serializeOutletApplication } from '@/lib/outlet-application';
import { isConviviaAdmin } from '@/lib/admin';
import { ProfilePatchSchema, zodFirstError } from '@/lib/schemas';

// GET /api/profile — Get current user's profile
export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);

    // Get connections count
    const connectionsResult = await sql`
      SELECT COUNT(*) as count FROM connections WHERE user_id_1 = ${user.id}
    `;

    // Refill match credits if a week has elapsed since reset
    let mergedUser: any = user;
    if (user.match_credits_reset_at) {
      const resetAt = new Date(user.match_credits_reset_at as string).getTime();
      if (resetAt < Date.now()) {
        const refreshed = await sql`
          UPDATE users
          SET match_credits_remaining = 1,
              match_credits_reset_at  = NOW() + INTERVAL '7 days'
          WHERE id = ${user.id}
          RETURNING *
        `;
        mergedUser = refreshed[0] || user;
      }
    }

    const syncedWl = await syncUserWatchlistFromHostedHangouts(mergedUser.id);
    const userOut = syncedWl !== null ? { ...mergedUser, watchlist_cities: syncedWl } : mergedUser;

    const premiumActive = isPremiumUser(userOut);

    const oaRow = await getOutletApplicationForUser(String(userOut.id));

    return NextResponse.json({
      user: {
        ...userOut,
        created_at: userOut.created_at instanceof Date ? userOut.created_at.toISOString() : userOut.created_at,
        premium_active: premiumActive,
        connections_count: Number(connectionsResult[0]?.count || 0),
        outlet_application: serializeOutletApplication(oaRow),
        is_platform_admin: isConviviaAdmin(authUser.email),
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }
}

// PATCH /api/profile — Update profile
export async function PATCH(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(authUser);
    const raw = await req.json();
    const parsed = ProfilePatchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: zodFirstError(parsed.error) }, { status: 400 });
    }
    const { name, bio, avatar_url, location, open_to_meet, watchlist_cities, certifications } = parsed.data;

    // Omitted fields must not overwrite: COALESCE(null, col) keeps col. Never cast undefined
    // to ::boolean (breaks JSON bodies that only send { avatar_url } after upload).
    const nameSql = name !== undefined ? (name?.trim() || null) : null;
    const bioSql = bio !== undefined ? (bio?.trim() || null) : null;
    const avatarSql = avatar_url !== undefined ? (avatar_url?.trim() || null) : null;
    const locationSql = location !== undefined ? (location?.trim() || null) : null;

    const avatarChanged =
      avatar_url !== undefined &&
      (avatar_url?.trim() || null) !== (user.avatar_url ?? null);

    let watchlistSql: string[] | null = null;
    if (watchlist_cities !== undefined) {
      const raw = Array.isArray(watchlist_cities) ? watchlist_cities : [];
      const seen = new Set<string>();
      watchlistSql = [];
      for (const s of raw.map((x: unknown) => String(x).trim()).filter(Boolean)) {
        const k = s.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        watchlistSql.push(s.replace(/\s+/g, ' '));
      }
    }

    const certsSql: string[] | null =
      Array.isArray(certifications)
        ? certifications.map((c: unknown) => String(c).trim()).filter(Boolean)
        : null;

    const updated =
      watchlistSql !== null
        ? await sql`
            UPDATE users SET
              name             = COALESCE(${nameSql}, name),
              bio              = COALESCE(${bioSql}, bio),
              avatar_url       = COALESCE(${avatarSql}, avatar_url),
              location         = COALESCE(${locationSql}, location),
              watchlist_cities = ${watchlistSql}::text[],
              certifications   = CASE WHEN ${certsSql !== null} THEN ${certsSql ?? []}::text[] ELSE certifications END,
              open_to_meet     = CASE
                WHEN ${open_to_meet !== undefined} THEN ${Boolean(open_to_meet)}
                ELSE open_to_meet
              END,
              verified = CASE WHEN ${avatarChanged} THEN false ELSE verified END
            WHERE id = ${user.id}
            RETURNING *
          `
        : await sql`
            UPDATE users SET
              name           = COALESCE(${nameSql}, name),
              bio            = COALESCE(${bioSql}, bio),
              avatar_url     = COALESCE(${avatarSql}, avatar_url),
              location       = COALESCE(${locationSql}, location),
              certifications = CASE WHEN ${certsSql !== null} THEN ${certsSql ?? []}::text[] ELSE certifications END,
              open_to_meet   = CASE
                WHEN ${open_to_meet !== undefined} THEN ${Boolean(open_to_meet)}
                ELSE open_to_meet
              END,
              verified = CASE WHEN ${avatarChanged} THEN false ELSE verified END
            WHERE id = ${user.id}
            RETURNING *
          `;

    return NextResponse.json({ ok: true, user: updated[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
