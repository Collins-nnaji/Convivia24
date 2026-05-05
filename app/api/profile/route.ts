import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

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

    // Get circles count
    const circlesResult = await sql`
      SELECT COUNT(*) as count FROM circle_members WHERE user_id = ${user.id}
    `;

    const checkinsResult = await sql`
      SELECT COUNT(*) as count FROM checkins WHERE user_id = ${user.id}
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

    const premiumActive = mergedUser.tier === 'black'
      || mergedUser.subscription_status === 'black'
      || mergedUser.subscription_status === 'black_trial'
      || (mergedUser.premium_until && new Date(mergedUser.premium_until as string).getTime() > Date.now());

    return NextResponse.json({
      user: {
        ...mergedUser,
        created_at: mergedUser.created_at instanceof Date ? mergedUser.created_at.toISOString() : mergedUser.created_at,
        premium_active: premiumActive,
        connections_count: Number(connectionsResult[0]?.count || 0),
        circles_count: Number(circlesResult[0]?.count || 0),
        checkins_count: Number(checkinsResult[0]?.count || 0),
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
    const body = await req.json();
    const { name, bio, avatar_url, location, open_to_meet } = body;

    // If avatar is changing, reset verification so user must re-verify with new photo
    const newAvatarUrl = avatar_url || null;
    const avatarChanged = newAvatarUrl !== null && newAvatarUrl !== user.avatar_url;

    const updated = await sql`
      UPDATE users SET
        name = COALESCE(${name?.trim() || null}, name),
        bio = COALESCE(${bio?.trim() || null}, bio),
        avatar_url = COALESCE(${newAvatarUrl}, avatar_url),
        location = COALESCE(${location?.trim() || null}, location),
        open_to_meet = CASE WHEN ${open_to_meet}::boolean IS NOT NULL
                       THEN ${open_to_meet}::boolean
                       ELSE open_to_meet END,
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
