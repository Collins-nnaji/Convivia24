import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';
import { resendConfigured } from '@/lib/email/resend';
import { DrawError, eligibleEntries, getDraw, listDraws, notifyRunnersUp, notifyWinner, runDraw } from '@/lib/trivia/raffle';

/** GET ?round=&week= — draw history plus who is currently eligible for that round/week. */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const url = new URL(req.url);
    const round = url.searchParams.get('round') || '';
    const week = url.searchParams.get('week') || null;
    const [draws, eligible] = await Promise.all([listDraws(), round ? eligibleEntries(round, week) : Promise.resolve([])]);
    return NextResponse.json({ draws, eligible, mailConfigured: resendConfigured() });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia/draws GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load draws.');
    return NextResponse.json({ error }, { status });
  }
}

/**
 * POST { roundSlug, weekStart?, notifyWinner?, notifyOthers?, message? } — run the draw.
 * POST { action: 'notify', id, who: 'winner' | 'others', message? } — (re)send the emails.
 */
export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.slice(0, 500) : null;

    if (body.action === 'notify') {
      const draw = await getDraw(String(body.id || ''));
      if (!draw) return NextResponse.json({ error: 'Draw not found.' }, { status: 404 });
      if (body.who === 'others') {
        const pool = await eligibleEntries(draw.roundSlug, draw.weekStart);
        // The winner is no longer `entered`, so the pool here is exactly the runners-up.
        const count = await notifyRunnersUp(draw, pool);
        return NextResponse.json({ ok: true, count, draw: await getDraw(draw.id) });
      }
      const result = await notifyWinner(draw, { message });
      if (!result.sent) return NextResponse.json({ error: result.error || 'Could not email the winner.' }, { status: 502 });
      return NextResponse.json({ ok: true, draw: await getDraw(draw.id) });
    }

    const { draw, pool } = await runDraw({
      roundSlug: String(body.roundSlug || ''),
      weekStart: typeof body.weekStart === 'string' && body.weekStart ? body.weekStart : null,
      drawnBy: 'desk',
    });
    let winnerMail: { sent: boolean; error?: string } | null = null;
    let othersCount = 0;
    if (body.notifyWinner !== false) winnerMail = await notifyWinner(draw, { message });
    if (body.notifyOthers === true) othersCount = await notifyRunnersUp(draw, pool);
    return NextResponse.json({ ok: true, draw: await getDraw(draw.id), winnerMail, othersCount }, { status: 201 });
  } catch (err) {
    if (err instanceof DrawError) return NextResponse.json({ error: err.message }, { status: 409 });
    captureApiError(err, { route: 'admin/trivia/draws POST' });
    const { status, error } = apiErrorResponse(err, 'Could not run the draw.');
    return NextResponse.json({ error }, { status });
  }
}
