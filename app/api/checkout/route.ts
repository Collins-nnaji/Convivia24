import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { generateOrderReference } from '@/lib/tickets/codes';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit, clientIp } from '@/lib/redis';
import { absoluteUrl } from '@/lib/url';
import { createPaymentSession, isLivePaymentsEnabled } from '@/lib/payments';
import {
  calculateTotals,
  createPendingOrder,
  fulfillOrder,
  toCheckoutLineItems,
  validateCheckoutItems,
  CheckoutError,
} from '@/lib/tickets/checkout';

interface CheckoutItem { ticket_type_id: string; quantity: number; attendee_names?: string[] }

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(`checkout:${clientIp(req)}`, 20, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many checkout attempts. Please wait a moment.' }, { status: 429 });

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to book tickets.', status: 'auth_required' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, buyer, items, idempotency_key: idempotencyKey } = body as {
      slug?: string;
      buyer?: { name?: string; email?: string; phone?: string };
      items?: CheckoutItem[];
      idempotency_key?: string;
    };

    const buyerName = (buyer?.name?.trim() || user.name || user.email);
    const buyerEmail = user.email;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Select at least one ticket.' }, { status: 400 });
    }

    // Idempotent replay
    if (idempotencyKey) {
      const existing = await sql`
        SELECT reference, status FROM orders WHERE idempotency_key = ${idempotencyKey} LIMIT 1
      `;
      if (existing[0]) {
        return NextResponse.json({
          reference: existing[0].reference,
          status: existing[0].status,
          replay: true,
        });
      }
    }

    const eventRows = await sql`SELECT * FROM events WHERE slug = ${slug ?? ''} AND status = 'published' LIMIT 1`;
    const event = eventRows[0];
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    if (event.guestlist_mode === 'approval') {
      const approved = await sql`
        SELECT 1 FROM guestlist_applications
        WHERE event_id = ${event.id} AND user_id = ${user.id} AND status = 'approved'
        LIMIT 1
      `;
      if (!approved.length) {
        return NextResponse.json({
          error: 'You need organiser approval before you can book tickets for this event.',
          code: 'APPROVAL_REQUIRED',
        }, { status: 403 });
      }
    }

    const validated = await validateCheckoutItems(String(event.id), items);
    const currency = String(event.currency || 'NGN');
    const totals = calculateTotals(validated, currency);
    const lineItems = toCheckoutLineItems(validated, currency);
    const reference = generateOrderReference();

    const order = await createPendingOrder({
      reference,
      eventId: String(event.id),
      userId: user.id,
      buyer: { name: buyerName, email: buyerEmail, phone: buyer?.phone?.trim() || null },
      totals,
      lineItems,
      idempotencyKey: idempotencyKey || null,
    });

    const payment = await createPaymentSession({
      orderReference: reference,
      orderId: String(order.id),
      totals,
      buyerEmail,
      buyerName,
      eventTitle: String(event.title),
      returnUrl: absoluteUrl(`/orders/${reference}`),
    });

    if (payment.instantFulfill) {
      const ticketCount = await fulfillOrder(String(order.id), {
        paymentProvider: payment.provider,
        paymentReference: payment.requiresPayment ? 'demo' : 'free',
      });

      return NextResponse.json({
        reference,
        status: 'paid',
        tickets: ticketCount,
        payment: {
          mode: payment.requiresPayment ? 'demo' : 'free',
          message: payment.message,
          livePaymentsAvailable: isLivePaymentsEnabled(),
        },
      }, { status: 201 });
    }

    // Live payment — tickets issued when webhook confirms payment
    await sql`
      UPDATE orders SET payment_provider = ${payment.provider}, updated_at = NOW()
      WHERE id = ${order.id}
    `;

    return NextResponse.json({
      reference,
      status: 'pending',
      payment: {
        provider: payment.provider,
        checkout_url: payment.checkoutUrl,
        client_secret: payment.clientSecret,
        message: payment.message,
      },
    }, { status: 201 });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error('[POST /api/checkout]', err);
    return NextResponse.json({ error: 'Could not complete your booking. Please try again.' }, { status: 500 });
  }
}
