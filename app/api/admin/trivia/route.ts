import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { listEntries, setEntryStatus } from '@/lib/trivia/entries';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

const STATUSES = ['entered', 'won', 'claimed', 'void'];

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rounds = TRIVIA_ROUNDS.map((r) => ({ slug: r.slug, brand: r.brand, prizeLabel: r.prizeLabel }));
  try {
    const roundSlug = new URL(req.url).searchParams.get('round') || undefined;
    const entries = await listEntries(roundSlug);
    return NextResponse.json({ entries, rounds });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia GET' });
    const { error } = apiErrorResponse(err, 'Could not load entries.');
    return NextResponse.json({ entries: [], rounds, error });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    const status = String(body.status || '');
    if (!id) return NextResponse.json({ error: 'Entry id is required.' }, { status: 400 });
    if (!STATUSES.includes(status)) return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
    const entry = await setEntryStatus(id, status);
    if (!entry) return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
    return NextResponse.json({ entry });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia PATCH' });
    const { status, error } = apiErrorResponse(err, 'Could not update the entry.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Entry ID required.' }, { status: 400 });
    const { default: sql } = await import('@/lib/db');
    await sql`DELETE FROM trivia_entries WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not delete entry.');
    return NextResponse.json({ error }, { status });
  }
}
