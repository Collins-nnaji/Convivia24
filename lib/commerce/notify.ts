import sql from '@/lib/db';
import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import { orderReceivedEmail, orderStatusEmail, type EmailLine } from '@/lib/email/templates';
import type { OrderStatus } from '@/lib/commerce/status';

async function loadOrderForEmail(orderId: string) {
  const [order] = await sql`
    SELECT id, email, full_name, status, subtotal_ngn, total_ngn
    FROM ritual_orders WHERE id = ${orderId} LIMIT 1
  `;
  if (!order) return null;
  const items = await sql`
    SELECT kit_name AS name, qty, unit_price_ngn AS "unitPriceNgn"
    FROM ritual_order_items WHERE order_id = ${orderId} ORDER BY created_at
  `;
  return { order, lines: items as unknown as EmailLine[] };
}

/** Best-effort — never throws, so a mail hiccup can't fail an order or a webhook. */
export async function notifyOrderReceived(orderId: string): Promise<void> {
  try {
    const data = await loadOrderForEmail(orderId);
    if (!data) return;
    const { order, lines } = data;
    const { subject, html } = orderReceivedEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      lines,
      subtotalNgn: Number(order.total_ngn ?? order.subtotal_ngn),
    });
    await sendEmail({
      to: order.email as string,
      subject,
      html,
      bcc: adminNotifyEmail() ?? undefined,
    });
  } catch (err) {
    console.error('notifyOrderReceived failed', err);
  }
}

export async function notifyOrderStatus(orderId: string, status: OrderStatus, note?: string | null): Promise<void> {
  try {
    const data = await loadOrderForEmail(orderId);
    if (!data) return;
    const { order, lines } = data;
    const { subject, html } = orderStatusEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      status,
      lines,
      subtotalNgn: Number(order.total_ngn ?? order.subtotal_ngn),
      note,
    });
    await sendEmail({ to: order.email as string, subject, html });
  } catch (err) {
    console.error('notifyOrderStatus failed', err);
  }
}
