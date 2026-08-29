import { NextResponse } from 'next/server';
import { liveRoundSlug } from '@/lib/trivia/schedule';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { getTasteProfile, resolveTasteOwner } from '@/lib/trivia/profiles';
import { challengeMeters, listCompletions, NO_METERS } from '@/lib/trivia/progress';
import { getMember, resolveMemberOwner, standingFor } from '@/lib/loyalty/members';
import { getCurrentUser } from '@/lib/auth/session';
import { captureApiError } from '@/lib/sentry';

/**
 * Everything the /trivia hub needs in one round trip — which brand is live,
 * the drinker's points, their taste profile, and which challenges they have
 * already been paid for. Each piece degrades on its own so a missing database
 * still renders a playable page.
 */
export async function GET() {
  const fallbackSlug = TRIVIA_ROUNDS[0].slug;

  const [week, ownerId] = await Promise.all([
    liveRoundSlug().catch((err) => {
      captureApiError(err, { route: 'trivia/hub week' });
      return { roundSlug: fallbackSlug, weekStart: null };
    }),
    resolveTasteOwner().catch(() => null),
  ]);

  if (!ownerId) {
    return NextResponse.json({
      signedIn: false,
      roundSlug: week.roundSlug,
      weekStart: week.weekStart,
      standing: null,
      profile: null,
      completions: [],
      meters: NO_METERS,
    });
  }

  const memberOwner = await resolveMemberOwner().catch(() => null);
  const user = await getCurrentUser().catch(() => null);
  const [profile, completions, member, meters] = await Promise.all([
    getTasteProfile(ownerId).catch(() => null),
    listCompletions(ownerId).catch(() => []),
    memberOwner ? getMember(memberOwner).catch(() => null) : Promise.resolve(null),
    challengeMeters(ownerId, user?.email ?? null).catch(() => NO_METERS),
  ]);

  return NextResponse.json({
    signedIn: true,
    roundSlug: week.roundSlug,
    weekStart: week.weekStart,
    standing: standingFor(member),
    profile,
    completions,
    meters,
  });
}
