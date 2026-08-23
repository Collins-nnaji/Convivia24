import sql from '@/lib/db';
import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import {
  orderReceivedEmail,
  orderStatusEmail,
  adminSuccessfulOrderEmail,
  type EmailLine,
} from '@/lib/email/templates';
import type { OrderStatus } from '@/lib/commerce/status';

async function loadOrderForNotify(orderId: string) {
  const [order] = await sql`
    SELECT id, email, phone, full_name, status, subtotal_ngn, total_ngn
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
}): Promise<void> {
  const admins = adminNotifyEmail();
  if (!admins) return;
  const { subject, html, text } = adminSuccessfulOrderEmail(opts);
  await sendEmail({ to: admins, subject, html, text });
}

/**
 * Customer order confirmation — only call after payment is confirmed (paid).
 * Best-effort — never throws, so a mail hiccup can't fail a webhook.
 */
export async function notifyOrderReceived(orderId: string): Promise<void> {
  try {
    const data = await loadOrderForNotify(orderId);
    if (!data) return;
    const { order, lines } = data;
    if (String(order.status) !== 'paid') return;

    const totalNgn = Number(order.total_ngn ?? order.subtotal_ngn);
    const { subject, html, text } = orderReceivedEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      lines,
      subtotalNgn: totalNgn,
    });
    await sendEmail({
      to: order.email as string,
      subject,
      html,
      text,
    });
    await notifyAdminsOfSuccessfulOrder({
      fullName: order.full_name as string,
      email: order.email as string,
      phone: (order.phone as string) || null,
      orderId: order.id as string,
      lines,
      totalNgn,
      status: 'paid',
    });
  } catch (err) {
    console.error('notifyOrderReceived failed', err);
  }
}

export async function notifyOrderStatus(orderId: string, status: OrderStatus, note?: string | null): Promise<void> {
  try {
    const data = await loadOrderForNotify(orderId);
    if (!data) return;
    const { order, lines } = data;
    const totalNgn = Number(order.total_ngn ?? order.subtotal_ngn);

    // Paid → confirmation mail (not a separate "awaiting payment" style notice).
    if (status === 'paid') {
      await notifyOrderReceived(orderId);
      return;
    }

    const { subject, html, text } = orderStatusEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      status,
      lines,
      subtotalNgn: totalNgn,
      note,
    });
    await sendEmail({ to: order.email as string, subject, html, text });
  } catch (err) {
    console.error('notifyOrderStatus failed', err);
  }
}
