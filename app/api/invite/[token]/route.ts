import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/calendar/repo';

/**
 * POST /api/invite/[token] — public; an invitee accepts or declines via the
 * link the host copied them. No sign-in required — the token is the credential.
 * body: { status: 'accepted' | 'declined' }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const { status } = await req.json();
    if (status !== 'accepted' && status !== 'declined') {
      return NextResponse.json({ error: 'Invalid response.' }, { status: 400 });
    }
    const info = await repo.respondToInvite(token, status);
    if (!info) return NextResponse.json({ error: 'Invite not found.' }, { status: 404 });
    return NextResponse.json(info);
  } catch (err) {
    console.error('[POST /api/invite/[token]]', err);
    return NextResponse.json({ error: 'Could not save your response.' }, { status: 500 });
  }
}
