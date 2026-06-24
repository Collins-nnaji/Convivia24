import { NextRequest, NextResponse } from 'next/server';
import * as repo from '@/lib/support/repo';

/**
 * POST /api/support/sessions/[token] — public; the supporter accepts or
 * declines a booking request via the link shown on /support. No sign-in
 * required — the token is the credential. body: { status: 'confirmed' | 'declined', call_link? }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const { status, call_link } = await req.json();
    if (status !== 'confirmed' && status !== 'declined') {
      return NextResponse.json({ error: 'Invalid response.' }, { status: 400 });
    }
    if (status === 'confirmed' && !call_link?.trim()) {
      return NextResponse.json({ error: 'Paste a call link before confirming.' }, { status: 400 });
    }
    const session = await repo.respondToSession(token, status, call_link);
    if (!session) return NextResponse.json({ error: 'Booking request not found.' }, { status: 404 });
    return NextResponse.json({ session });
  } catch (err) {
    console.error('[POST /api/support/sessions/[token]]', err);
    return NextResponse.json({ error: 'Could not save your response.' }, { status: 500 });
  }
}
