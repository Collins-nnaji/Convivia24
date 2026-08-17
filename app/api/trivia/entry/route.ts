import { NextRequest, NextResponse } from 'next/server';
import { getRound, isPass } from '@/lib/trivia/catalog';
import { createEntry, DuplicateEntryError } from '@/lib/trivia/entries';
import { apiErrorResponse, DatabaseUnavailableError } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`trivia-entry:${clientIp(req)}`, 10, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const round = getRound(String(body.roundSlug || ''));
    if (!round) return NextResponse.json({ error: 'Unknown round.' }, { status: 400 });

    const name = String(body.name || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().slice(0, 160);
    const phone = String(body.phone || '').trim().slice(0, 32) || null;
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });

    // Re-score server-side from the submitted answers — the client score is a hint, not proof.
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const score = round.questions.reduce(
      (n, q, i) => (Number(answers[i]) === q.answerIndex ? n + 1 : n),
      0
    );
    if (!isPass(round, score)) {
      return NextResponse.json(
        { error: `You need ${round.passScore} of ${round.questions.length} to enter. Try the round again.` },
        { status: 400 }
      );
    }

    const entry = await createEntry({
      roundSlug: round.slug,
      brand: round.brand,
      name,
      email,
      phone,
      score,
      total: round.questions.length,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateEntryError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: 'Entries are paused right now. Try again shortly.' }, { status: 503 });
    }
    captureApiError(err, { route: 'trivia/entry' });
    const { status, error } = apiErrorResponse(err, 'Could not record your entry.');
    return NextResponse.json({ error }, { status });
  }
}
