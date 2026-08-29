import { NextRequest, NextResponse } from 'next/server';
import {
  CampaignClosedError,
  completeTask,
  getCampaign,
  joinCampaign,
  leaderboard,
  participantCount,
  participationFor,
  NOT_JOINED,
} from '@/lib/brands/campaigns';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

type Params = { params: Promise<{ slug: string }> };

/** The campaign, its leaderboard, and where the caller stands in it. */
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  try {
    const campaign = await getCampaign(slug);
    if (!campaign || !campaign.published) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    const user = await getCurrentUser().catch(() => null);
    const ownerId = user ? `user:${user.id}` : null;

    const [board, participants, me] = await Promise.all([
      leaderboard(campaign.id).catch(() => []),
      participantCount(campaign.id).catch(() => 0),
      ownerId ? participationFor(campaign.id, ownerId).catch(() => NOT_JOINED) : Promise.resolve(NOT_JOINED),
    ]);

    return NextResponse.json({
      signedIn: Boolean(ownerId),
      campaign,
      leaderboard: board,
      participants,
      me,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Campaigns are unavailable right now.' }, { status: 503 });
    }
    captureApiError(err, { route: 'campaigns GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load that campaign.');
    return NextResponse.json({ error }, { status });
  }
}

/** Join the campaign, or tick off one of its tasks. */
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  try {
    const rl = await rateLimit(`campaign:${clientIp(req)}`, 30, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to join this campaign.' }, { status: 401 });
    const ownerId = `user:${user.id}`;

    const campaign = await getCampaign(slug);
    if (!campaign || !campaign.published) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'join');

    if (action === 'join') {
      const displayName = user.name || user.email.split('@')[0] || 'Guest';
      const me = await joinCampaign(campaign, ownerId, displayName);
      return NextResponse.json({ me, leaderboard: await leaderboard(campaign.id) }, { status: 201 });
    }

    if (action === 'complete') {
      const me = await completeTask(campaign, ownerId, String(body.taskId || ''));
      return NextResponse.json({ me, leaderboard: await leaderboard(campaign.id) });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    if (err instanceof CampaignClosedError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Campaigns are paused right now.' }, { status: 503 });
    }
    captureApiError(err, { route: 'campaigns POST' });
    const { status, error } = apiErrorResponse(err, 'Could not update the campaign.');
    return NextResponse.json({ error }, { status });
  }
}
