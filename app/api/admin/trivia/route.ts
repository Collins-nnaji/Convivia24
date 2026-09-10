import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { listEntries, setEntryStatus } from '@/lib/trivia/entries';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';
import { DRINKS } from '@/lib/drinks/catalog';
import { addCustomQuestion, deleteCustomQuestion, listCustomQuestions } from '@/lib/trivia/custom-questions';

const STATUSES = ['entered', 'won', 'claimed', 'void'];

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rounds = TRIVIA_ROUNDS.filter((r) => {
    const drink = DRINKS.find((item) => item.slug === r.prizeSlug);
    return Boolean(drink?.image || drink?.packImages?.length);
  }).map((r) => ({ slug: r.slug, brand: r.brand, prizeLabel: r.prizeLabel, prizeSlug: r.prizeSlug }));
  try {
    const roundSlug = new URL(req.url).searchParams.get('round') || undefined;
    const [entries, questions] = await Promise.all([listEntries(roundSlug), listCustomQuestions()]);
    return NextResponse.json({ entries, rounds, questions });
  } catch (err) {
    captureApiError(err, { route: 'admin/trivia GET' });
    const { error } = apiErrorResponse(err, 'Could not load entries.');
    return NextResponse.json({ entries: [], rounds, error });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const body = await req.json().catch(() => ({}));
    const question = await addCustomQuestion({
      roundSlug: String(body.roundSlug || ''),
      prompt: String(body.prompt || '').slice(0, 500),
      options: Array.isArray(body.options) ? body.options.map(String) : [],
      answerIndex: Number(body.answerIndex),
      explainer: String(body.explainer || '').slice(0, 1000),
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not add question.';
    return NextResponse.json({ error: message }, { status: 400 });
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
    const questionId = new URL(req.url).searchParams.get('questionId');
    if (questionId) {
      const removed = await deleteCustomQuestion(questionId);
      return NextResponse.json({ ok: removed });
    }
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
