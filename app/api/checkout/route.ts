import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { generateOrderReference, generateTicketCode } from '@/lib/tickets/codes';
import { getCurrentUser } from '@/lib/auth/session';

interface CheckoutItem { ticket_type_id: string; quantity: number; attendee_names?: string[] }

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to get tickets.' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, buyer, items } = body as {
      slug?: string;
      buyer?: { name?: string; email?: string; phone?: string };
      items?: CheckoutItem[];
    };

    // Email comes from the authenticated account; name is the booking name.
    const buyerName = (buyer?.name?.trim() || user.name || user.email);
    const buyerEmail = user.email;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Select at least one ticket.' }, { status: 400 });
    }

    // Resolve the event
    const eventRows = await sql`SELECT * FROM events WHERE slug = ${slug ?? ''} AND status = 'published' LIMIT 1`;
    const event = eventRows[0];
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    // Load the requested ticket types and validate availability
    const wanted = items.filter((i) => i.quantity > 0);
    if (wanted.length === 0) return NextResponse.json({ error: 'Select at least one ticket.' }, { status: 400 });

    const lineItems: { type: Record<string, unknown>; quantity: number; names: string[] }[] = [];
    let subtotal = 0;

    for (const item of wanted) {
      const rows = await sql`SELECT * FROM ticket_types WHERE id = ${item.ticket_type_id} AND event_id = ${event.id} AND is_active = true LIMIT 1`;
      const type = rows[0];
      if (!type) return NextResponse.json({ error: 'A selected ticket is no longer available.' }, { status: 400 });

      const remaining = Number(type.quantity) - Number(type.sold);
      if (item.quantity > remaining) {
        return NextResponse.json({ error: `Only ${remaining} "${type.name}" ticket(s) left.` }, { status: 409 });
      }
      if (item.quantity > Number(type.max_per_order)) {
        return NextResponse.json({ error: `Max ${type.max_per_order} "${type.name}" tickets per order.` }, { status: 400 });
      }

      subtotal += Number(type.price) * item.quantity;
      lineItems.push({ type, quantity: item.quantity, names: item.attendee_names ?? [] });
    }

    const reference = generateOrderReference();
    const currency = String(event.currency || 'NGN');

    const orderRows = await sql`
      INSERT INTO orders (reference, event_id, user_id, buyer_name, buyer_email, buyer_phone, subtotal, fees, total, currency, status)
      VALUES (${reference}, ${event.id}, ${user.id}, ${buyerName}, ${buyerEmail.toLowerCase()}, ${buyer?.phone?.trim() || null},
              ${subtotal}, ${0}, ${subtotal}, ${currency}, 'paid')
      RETURNING id, reference
    `;
    const order = orderRows[0];

    let totalTickets = 0;
    for (const li of lineItems) {
      for (let i = 0; i < li.quantity; i++) {
        const code = generateTicketCode();
        const attendee = li.names[i]?.trim() || buyerName;
        await sql`
          INSERT INTO tickets (code, order_id, event_id, ticket_type_id, ticket_type_name, attendee_name, price, currency, status)
          VALUES (${code}, ${order.id}, ${event.id}, ${li.type.id}, ${li.type.name}, ${attendee}, ${li.type.price}, ${currency}, 'valid')
        `;
        totalTickets++;
      }
      await sql`UPDATE ticket_types SET sold = sold + ${li.quantity}, updated_at = NOW() WHERE id = ${li.type.id}`;
    }

    return NextResponse.json({ reference: order.reference, tickets: totalTickets }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/checkout]', err);
    return NextResponse.json({ error: 'Could not complete your order. Please try again.' }, { status: 500 });
  }
}
