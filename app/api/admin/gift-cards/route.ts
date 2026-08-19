import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { issueGiftCard, listGiftCards } from '@/lib/commerce/gift-cards';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const cards = await listGiftCards();
    return NextResponse.json({ cards });
  } catch (err) {
    captureApiError(err, { route: 'admin/gift-cards GET' });
    const { status, error } = apiErrorResponse(err, 'Unable to load gift cards.');
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const rl = await rateLimit(`admin:${clientIp(req)}`, 40, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const valueNgn = Number(body.valueNgn);
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : null;
    if (!Number.isFinite(valueNgn) || valueNgn <= 0) {
      return NextResponse.json({ error: 'Enter a valid value in naira.' }, { status: 400 });
    }
    const card = await issueGiftCard('admin', valueNgn, note);
    return NextResponse.json({ card }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'admin/gift-cards POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to issue gift card.');
    return NextResponse.json({ error }, { status });
  }
}
