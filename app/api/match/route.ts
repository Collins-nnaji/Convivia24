import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { isPremiumUser } from '@/lib/premium';

/**
 * AI Match — the differentiator.
 *
 * Free tier: 1 match per rolling week (refilled when match_credits_reset_at passes).
 * Convivia Black tier: unlimited matches.
 *
 *   POST /api/match
 *     { city, area?, vibe?, energy?, group_size, action: 'matched' | 'joined' | 'skipped' | 'delayed', hangout_id?, matched_user_ids? }
 *
 *   GET  /api/match — returns the user's current credits + match history (last 10)
 */

async function refillIfDue(userId: unknown, user: any) {
  if (!user.match_credits_reset_at) return user;
  const resetAt = new Date(user.match_credits_reset_at as string).getTime();
  if (resetAt > Date.now()) return user;
  const refreshed = await sql`
    UPDATE users
    SET match_credits_remaining = 1,
        match_credits_reset_at  = NOW() + INTERVAL '7 days'
    WHERE id = ${userId as string}
    RETURNING *
  `;
  return refreshed[0] || user;
}

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let user = await getOrCreateUser(authUser);
    user = await refillIfDue(user.id, user);

    const history = await sql`
      SELECT id, city, area, vibe, energy, action, hangout_id, created_at
      FROM match_requests
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      premium: isPremiumUser(user),
      tier: user.tier,
      credits_remaining: isPremiumUser(user) ? null : Number(user.match_credits_remaining),
      credits_reset_at: user.match_credits_reset_at,
      history,
    });
  } catch (err) {
    console.error('Error fetching match status:', err);
    return NextResponse.json({ error: 'Failed to load match status.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Sign in to match.' }, { status: 401 });
    let user = await getOrCreateUser(authUser);
    user = await refillIfDue(user.id, user);

    const body = await req.json();
    const { city, area, vibe, energy, group_size, action, hangout_id, matched_user_ids } = body;

    if (!city || !action) return NextResponse.json({ error: 'city and action are required.' }, { status: 400 });
    const validActions = ['matched', 'joined', 'skipped', 'delayed'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `action must be one of ${validActions.join(', ')}` }, { status: 400 });
    }

    // Only "matched" (the initial generation) and "joined" consume a credit; skip/delay are free.
    const consumesCredit = action === 'matched' || action === 'joined';
    const premium = isPremiumUser(user);

    if (consumesCredit && !premium && Number(user.match_credits_remaining) <= 0) {
      return NextResponse.json({
        error: "You've used your free match this week.",
        upgrade: true,
        credits_reset_at: user.match_credits_reset_at,
      }, { status: 402 });
    }

    // Insert the match record
    const ids: string[] = Array.isArray(matched_user_ids) ? matched_user_ids.filter(Boolean) : [];
    const inserted = await sql`
      INSERT INTO match_requests (user_id, city, area, vibe, energy, group_size, action, hangout_id, matched_user_ids)
      VALUES (
        ${user.id},
        ${city},
        ${area || null},
        ${vibe || null},
        ${energy || null},
        ${group_size || 6},
        ${action},
        ${hangout_id || null},
        ${ids.length > 0 ? ids : '{}'}::uuid[]
      )
      RETURNING *
    `;

    // Decrement credits if needed
    let updatedUser = user;
    if (consumesCredit && !premium) {
      const updated = await sql`
        UPDATE users SET match_credits_remaining = GREATEST(match_credits_remaining - 1, 0)
        WHERE id = ${user.id}
        RETURNING *
      `;
      updatedUser = updated[0] || user;
    }

    return NextResponse.json({
      ok: true,
      match: inserted[0],
      premium,
      credits_remaining: premium ? null : Number(updatedUser.match_credits_remaining),
      credits_reset_at: updatedUser.match_credits_reset_at,
    });
  } catch (err) {
    console.error('Error logging match:', err);
    return NextResponse.json({ error: 'Failed to log match.' }, { status: 500 });
  }
}
