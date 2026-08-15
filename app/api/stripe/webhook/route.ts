import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/** Paystack webhook — marks ritual orders paid. */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    const crypto = await import('crypto');
    const raw = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';
    const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(raw) as {
      event?: string;
      data?: { reference?: string; metadata?: { order_id?: string }; status?: string };
    };

    if (event.event === 'charge.success' && event.data?.status === 'success') {
      const orderId = event.data.metadata?.order_id;
      const reference = event.data.reference;
      if (orderId) {
        await sql`
          UPDATE ritual_orders
          SET status = 'paid', payment_ref = ${reference || null}, updated_at = NOW()
          WHERE id = ${orderId}
        `;
      } else if (reference) {
        await sql`
          UPDATE ritual_orders
          SET status = 'paid', updated_at = NOW()
          WHERE payment_ref = ${reference}
        `;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('paystack webhook', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
