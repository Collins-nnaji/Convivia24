import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getGiftCard, giftCardStats, issueGiftCard, listGiftCards, sendGiftCardEmail, voidGiftCard } from '@/lib/commerce/gift-cards';
import { resendConfigured } from '@/lib/email/resend';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

export async function GET() {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const [cards, stats] = await Promise.all([listGiftCards(300), giftCardStats()]);
    return NextResponse.json({ cards, stats, mailConfigured: resendConfigured() });
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

    // Resend an existing card's email.
    if (body.action === 'send') {
      const card = await getGiftCard(String(body.id || ''));
      if (!card) return NextResponse.json({ error: 'Gift card not found.' }, { status: 404 });
      const result = await sendGiftCardEmail(card, { message: typeof body.message === 'string' ? body.message.slice(0, 500) : null });
      if (!result.sent) return NextResponse.json({ error: result.error || 'Could not send.' }, { status: 502 });
      return NextResponse.json({ ok: true, card: await getGiftCard(card.id) });
    }

    const valueNgn = Number(body.valueNgn);
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 200) : null;
    if (!Number.isFinite(valueNgn) || valueNgn <= 0) {
      return NextResponse.json({ error: 'Enter a valid value in naira.' }, { status: 400 });
    }
    const recipientEmail = typeof body.recipientEmail === 'string' ? body.recipientEmail.trim() : '';
    if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json({ error: 'That recipient email does not look right.' }, { status: 400 });
    }
    const expiresAt = typeof body.expiresAt === 'string' && body.expiresAt ? body.expiresAt : null;
    if (expiresAt && !(new Date(expiresAt).getTime() > Date.now())) {
      return NextResponse.json({ error: 'Expiry must be in the future.' }, { status: 400 });
    }
    const card = await issueGiftCard('admin', valueNgn, note, {
      recipientName: typeof body.recipientName === 'string' ? body.recipientName.slice(0, 120) : null,
      recipientEmail: recipientEmail || null,
      expiresAt,
    });
    let mail: { sent: boolean; error?: string } | null = null;
    if (body.sendEmail === true && card.recipientEmail) {
      mail = await sendGiftCardEmail(card, { message: typeof body.message === 'string' ? body.message.slice(0, 500) : null });
    }
    return NextResponse.json({ card: mail?.sent ? await getGiftCard(card.id) : card, mail }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: 'admin/gift-cards POST' });
    const { status, error } = apiErrorResponse(err, 'Unable to issue gift card.');
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate.ok === false) return NextResponse.json({ error: gate.error }, { status: gate.status });
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Gift card ID required.' }, { status: 400 });
    // Void, never delete — redeemed cards are referenced by orders and paid commissions.
    const voided = await voidGiftCard(id);
    if (!voided) {
      return NextResponse.json({ error: 'Only an active, unredeemed card can be voided.' }, { status: 409 });
    }
    return NextResponse.json({ ok: true, status: 'void' });
  } catch (err) {
    captureApiError(err, { route: 'admin/gift-cards DELETE' });
    const { status, error } = apiErrorResponse(err, 'Could not void gift card.');
    return NextResponse.json({ error }, { status });
  }
}
