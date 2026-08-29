import { NextRequest, NextResponse } from 'next/server';
import { getRound, isPass } from '@/lib/trivia/catalog';
import { liveRoundSlug } from '@/lib/trivia/schedule';
import { getChallenge } from '@/lib/trivia/challenges';
import { claimChallenge } from '@/lib/trivia/progress';
import { resolveMemberOwner } from '@/lib/loyalty/members';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

/**
 * Claim the points behind a challenge. Only challenges the server can verify
 * are claimable here — right now that is the weekly trivia round, re-scored
 * from the submitted answers rather than trusting a client-side score.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`trivia-challenge:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const ownerId = await resolveMemberOwner();
    if (!ownerId) {
      return NextResponse.json({ error: 'Sign in to earn points.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const challenge = getChallenge(String(body.challengeId || ''));
    if (!challenge || challenge.status !== 'live' || challenge.action.kind !== 'play') {
      return NextResponse.json({ error: 'That challenge cannot be claimed here.' }, { status: 400 });
    }

    const week = await liveRoundSlug();
    const round = getRound(String(body.roundSlug || ''));
    if (!round) return NextResponse.json({ error: 'Unknown round.' }, { status: 400 });
    if (round.slug !== week.roundSlug) {
      return NextResponse.json(
        { error: 'Points are only awarded on the brand running this week.' },
        { status: 409 }
      );
    }

    const answers = Array.isArray(body.answers) ? body.answers : [];
    const score = round.questions.reduce(
      (n, q, i) => (Number(answers[i]) === q.answerIndex ? n + 1 : n),
      0
    );
    if (!isPass(round, score)) {
      return NextResponse.json(
        { error: `You need ${round.passScore} of ${round.questions.length} to earn these points.` },
        { status: 400 }
      );
    }

    const result = await claimChallenge(ownerId, challenge, {
      weekStart: week.weekStart,
      ref: round.slug,
    });
    return NextResponse.json({ ...result, challengeId: challenge.id });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Points are paused right now. Try again shortly.' }, { status: 503 });
    }
    captureApiError(err, { route: 'trivia/challenge POST' });
    const { status, error } = apiErrorResponse(err, 'Could not award your points.');
    return NextResponse.json({ error }, { status });
  }
}
