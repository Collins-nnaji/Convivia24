import sql from '@/lib/db';
import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import {
  orderReceivedEmail,
  orderStatusEmail,
  adminSuccessfulOrderEmail,
  type EmailLine,
} from '@/lib/email/templates';
import type { OrderStatus } from '@/lib/commerce/status';
import { notifySupplierOfPaidOrder } from '@/lib/suppliers/notify';

async function loadOrderForNotify(orderId: string) {
  const [order] = await sql`
    SELECT id, email, phone, full_name, status, subtotal_ngn, total_ngn,
           courier_name, rider_phone, eta_at
    FROM ritual_orders WHERE id = ${orderId} LIMIT 1
  `;
  if (!order) return null;
  const items = await sql`
    SELECT kit_name AS name, qty, unit_price_ngn AS "unitPriceNgn"
    FROM ritual_order_items WHERE order_id = ${orderId} ORDER BY created_at
  `;
  return { order, lines: items as unknown as EmailLine[] };
}

async function notifyAdminsOfSuccessfulOrder(opts: {
  fullName: string;
  email: string;
  phone?: string | null;
  orderId: string;
  lines: EmailLine[];
  totalNgn: number;
  status: string;
  idempotencyKey?: string;
}): Promise<void> {
  const admins = adminNotifyEmail();
  if (!admins) return;
  const { subject, html, text } = adminSuccessfulOrderEmail(opts);
  const result = await sendEmail({ to: admins, subject, html, text, idempotencyKey: opts.idempotencyKey });
  if (!result.sent) throw new Error(result.error || 'Admin notification failed');
}

/**
 * Customer order confirmation — only call after payment is confirmed (paid).
 * Best-effort — never throws, so a mail hiccup can't fail a webhook.
 */
export async function notifyOrderReceived(orderId: string, jobId = orderId + ':paid'): Promise<void> {
  try {
    const data = await loadOrderForNotify(orderId);
    if (!data) return;
    const { order, lines } = data;

    const totalNgn = Number(order.total_ngn ?? order.subtotal_ngn);
    const { subject, html, text } = orderReceivedEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      lines,
      subtotalNgn: totalNgn,
    });
    const sent = await sendEmail({
      idempotencyKey: jobId + ':customer',
      to: order.email as string,
      subject,
      html,
      text,
    });
    if (!sent.sent) throw new Error(sent.error || 'Customer notification failed');
    await notifyAdminsOfSuccessfulOrder({
      fullName: order.full_name as string,
      email: order.email as string,
      phone: (order.phone as string) || null,
      orderId: order.id as string,
      lines,
      totalNgn,
      status: 'paid',
      idempotencyKey: jobId + ':admin',
    });
  } catch (err) {
    throw err;
  }
}

export async function deliverOrderStatus(orderId: string, status: OrderStatus, note?: string | null, jobId = orderId + ':' + status): Promise<void> {
  try {
    const data = await loadOrderForNotify(orderId);
    if (!data) return;
    const { order, lines } = data;
    const totalNgn = Number(order.total_ngn ?? order.subtotal_ngn);

    // Paid → confirmation mail (not a separate "awaiting payment" style notice).
    if (status === 'paid') {
      await notifyOrderReceived(orderId, jobId);
      await notifySupplierOfPaidOrder(orderId, jobId);
      return;
    }

    const { subject, html, text } = orderStatusEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      status,
      lines,
      subtotalNgn: totalNgn,
      note,
      courierName: (order.courier_name as string) || null,
      riderPhone: (order.rider_phone as string) || null,
      etaAt: order.eta_at ? new Date(order.eta_at as string).toISOString() : null,
    });
    const result = await sendEmail({ to: order.email as string, subject, html, text, idempotencyKey: jobId + ':customer' });
    if (!result.sent) throw new Error(result.error || 'Notification failed');
  } catch (err) {
    throw err;
  }
}

/** Status changes queue their notices in the same DB transaction through a trigger. */
export async function notifyOrderStatus(_orderId: string, _status: OrderStatus, _note?: string | null): Promise<void> {}
