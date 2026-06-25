import sql from '@/lib/db';
import { generateTicketCode } from '@/lib/tickets/codes';
import { platformFeePercent, orderExpiryMinutes } from '@/lib/payments/config';
import type { CheckoutLineItem, CheckoutTotals } from '@/lib/payments/types';
import { isEverythingFree } from '@/lib/money';

export interface ValidatedLineItem {
  type: Record<string, unknown>;
  quantity: number;
  names: string[];
}

export interface CheckoutBuyer {
  name: string;
  email: string;
  phone?: string | null;
}

export function calculateTotals(
  lineItems: ValidatedLineItem[],
  currency: string,
): CheckoutTotals {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + Number(li.type.price) * li.quantity,
    0,
  );
  const feeRate = platformFeePercent() / 100;
  const platformFee = Math.round(subtotal * feeRate * 100) / 100;
  const fees = platformFee;
  const total = isEverythingFree() ? 0 : subtotal + fees;
  return { subtotal, fees, platformFee, total, currency };
}

export async function validateCheckoutItems(
  eventId: string,
  items: { ticket_type_id: string; quantity: number; attendee_names?: string[] }[],
): Promise<ValidatedLineItem[]> {
  const wanted = items.filter((i) => i.quantity > 0);
  if (wanted.length === 0) throw new CheckoutError('Select at least one ticket.', 400);

  const lineItems: ValidatedLineItem[] = [];
  const now = new Date();

  for (const item of wanted) {
    const rows = await sql`
      SELECT * FROM ticket_types
      WHERE id = ${item.ticket_type_id} AND event_id = ${eventId} AND is_active = true
      LIMIT 1
    `;
    const type = rows[0];
    if (!type) throw new CheckoutError('A selected ticket is no longer available.', 400);

    if (type.sales_start && new Date(String(type.sales_start)) > now) {
      throw new CheckoutError(`"${type.name}" tickets are not on sale yet.`, 400);
    }
    if (type.sales_end && new Date(String(type.sales_end)) < now) {
      throw new CheckoutError(`"${type.name}" ticket sales have ended.`, 400);
    }

    const remaining = Number(type.quantity) - Number(type.sold);
    if (item.quantity > remaining) {
      throw new CheckoutError(`Only ${remaining} "${type.name}" ticket(s) left.`, 409);
    }
    if (item.quantity > Number(type.max_per_order)) {
      throw new CheckoutError(`Max ${type.max_per_order} "${type.name}" tickets per order.`, 400);
    }

    lineItems.push({
      type,
      quantity: item.quantity,
      names: item.attendee_names ?? [],
    });
  }

  return lineItems;
}

export function toCheckoutLineItems(lineItems: ValidatedLineItem[], currency: string): CheckoutLineItem[] {
  return lineItems.map((li) => ({
    ticketTypeId: String(li.type.id),
    ticketTypeName: String(li.type.name),
    unitPrice: Number(li.type.price),
    quantity: li.quantity,
    lineTotal: Number(li.type.price) * li.quantity,
    currency,
    attendeeNames: li.names,
  }));
}

export async function createPendingOrder(opts: {
  reference: string;
  eventId: string;
  userId: string;
  buyer: CheckoutBuyer;
  totals: CheckoutTotals;
  lineItems: CheckoutLineItem[];
  idempotencyKey?: string | null;
}) {
  const { reference, eventId, userId, buyer, totals, lineItems, idempotencyKey } = opts;
  const expiresAt = new Date(Date.now() + orderExpiryMinutes() * 60_000).toISOString();
  const organizerNet = totals.total - totals.platformFee;

  const orderRows = await sql`
    INSERT INTO orders (
      reference, event_id, user_id, buyer_name, buyer_email, buyer_phone,
      subtotal, fees, platform_fee, organizer_net, total, currency,
      status, expires_at, idempotency_key
    )
    VALUES (
      ${reference}, ${eventId}, ${userId}, ${buyer.name}, ${buyer.email.toLowerCase()}, ${buyer.phone || null},
      ${totals.subtotal}, ${totals.fees}, ${totals.platformFee}, ${organizerNet}, ${totals.total}, ${totals.currency},
      'pending', ${expiresAt}, ${idempotencyKey || null}
    )
    RETURNING id, reference, status, expires_at
  `;
  const order = orderRows[0];

  for (const li of lineItems) {
    await sql`
      INSERT INTO order_line_items (order_id, ticket_type_id, ticket_type_name, unit_price, quantity, line_total, currency)
      VALUES (${order.id}, ${li.ticketTypeId}, ${li.ticketTypeName}, ${li.unitPrice}, ${li.quantity}, ${li.lineTotal}, ${li.currency})
    `;
  }

  return order;
}

export async function fulfillOrder(
  orderId: string,
  opts?: { paymentProvider?: string; paymentReference?: string; paymentIntentId?: string },
): Promise<number> {
  const orderRows = await sql`SELECT * FROM orders WHERE id = ${orderId} LIMIT 1`;
  const order = orderRows[0];
  if (!order) throw new CheckoutError('Order not found.', 404);
  if (order.status === 'paid') {
    const existing = await sql`SELECT COUNT(*)::int AS c FROM tickets WHERE order_id = ${orderId}`;
    return Number(existing[0]?.c ?? 0);
  }
  if (order.status !== 'pending') {
    throw new CheckoutError('This order can no longer be fulfilled.', 409);
  }

  const lineRows = await sql`
    SELECT oli.*, tt.sold, tt.quantity AS type_quantity
    FROM order_line_items oli
    LEFT JOIN ticket_types tt ON tt.id = oli.ticket_type_id
    WHERE oli.order_id = ${orderId}
  `;
  if (!lineRows.length) throw new CheckoutError('Order has no line items.', 500);

  const buyerName = String(order.buyer_name);
  const currency = String(order.currency);
  let totalTickets = 0;

  for (const li of lineRows) {
    if (li.ticket_type_id) {
      const remaining = Number(li.type_quantity) - Number(li.sold);
      if (Number(li.quantity) > remaining) {
        throw new CheckoutError(`Only ${remaining} "${li.ticket_type_name}" ticket(s) left.`, 409);
      }
    }

    for (let i = 0; i < Number(li.quantity); i++) {
      const code = generateTicketCode();
      await sql`
        INSERT INTO tickets (code, order_id, event_id, ticket_type_id, ticket_type_name, attendee_name, price, currency, status)
        VALUES (
          ${code}, ${orderId}, ${order.event_id}, ${li.ticket_type_id}, ${li.ticket_type_name},
          ${buyerName}, ${li.unit_price}, ${currency}, 'valid'
        )
      `;
      totalTickets++;
    }

    if (li.ticket_type_id) {
      await sql`
        UPDATE ticket_types SET sold = sold + ${li.quantity}, updated_at = NOW()
        WHERE id = ${li.ticket_type_id}
      `;
    }
  }

  await sql`
    UPDATE orders SET
      status = 'paid',
      paid_at = NOW(),
      payment_provider = ${opts?.paymentProvider || 'manual'},
      payment_reference = ${opts?.paymentReference || null},
      payment_intent_id = ${opts?.paymentIntentId || null},
      updated_at = NOW()
    WHERE id = ${orderId}
  `;

  return totalTickets;
}

export async function markOrderFailed(orderId: string, reason?: string) {
  await sql`
    UPDATE orders SET status = 'failed', updated_at = NOW()
    WHERE id = ${orderId} AND status = 'pending'
  `;
  if (reason) {
    await sql`
      INSERT INTO payment_events (order_id, provider, event_type, payload, processed, error_message)
      VALUES (${orderId}, 'system', 'checkout_failed', ${JSON.stringify({ reason })}, true, ${reason})
    `;
  }
}

export class CheckoutError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
