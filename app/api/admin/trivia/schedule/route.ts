import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { deleteWeek, listWeeks, scheduleWeek, validateWeek, weekStartOf } from '@/lib/trivia/schedule';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

const rounds = () => TRIVIA_ROUNDS.map((r) => ({ slug: r.slug, brand: r.brand, prizeLabel: r.prizeLabel }));

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const weeks = await listWeeks();
    return NextResponse.json({ weeks, rounds: rounds(), thisWeek: weekStartOf() });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia/schedule GET' });
    const { error } = apiErrorResponse(err, 'Could not load the schedule.');
    return NextResponse.json({ weeks: [], rounds: rounds(), thisWeek: weekStartOf(), error });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json().catch(() => ({}));
    const roundSlug = String(body.roundSlug || '');
    const weekStart = String(body.weekStart || '');
    const invalid = validateWeek(roundSlug, weekStart);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
    const week = await scheduleWeek({ roundSlug, weekStart, published: body.published !== false });
    return NextResponse.json({ week });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia/schedule POST' });
    const { status, error } = apiErrorResponse(err, 'Could not schedule the week.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'Week id is required.' }, { status: 400 });
    const removed = await deleteWeek(id);
    if (!removed) return NextResponse.json({ error: 'Week not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia/schedule DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not remove the week.');
    return NextResponse.json({ error }, { status });
  }
}
