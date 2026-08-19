import sql from '@/lib/db';
import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import { orderReceivedEmail, orderStatusEmail, type EmailLine } from '@/lib/email/templates';
import { sendSms } from '@/lib/notify/termii';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/commerce/status';
import { formatNgn } from '@/lib/drinks/catalog';

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

/** Best-effort — never throws, so a mail/SMS hiccup can't fail an order or a webhook. */
export async function notifyOrderReceived(orderId: string): Promise<void> {
  try {
    const data = await loadOrderForNotify(orderId);
    if (!data) return;
    const { order, lines } = data;
    const totalNgn = Number(order.total_ngn ?? order.subtotal_ngn);
    const { subject, html } = orderReceivedEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      lines,
      subtotalNgn: totalNgn,
    });
    await sendEmail({
      to: order.email as string,
      subject,
      html,
      bcc: adminNotifyEmail() ?? undefined,
    });
    if (order.phone) {
      await sendSms(
        order.phone as string,
        `Convivia24: we have your order (${formatNgn(totalNgn)}). We'll text you when it's on the way.`,
        orderId
      );
    }
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
    const { subject, html } = orderStatusEmail({
      fullName: order.full_name as string,
      orderId: order.id as string,
      status,
      lines,
      subtotalNgn: totalNgn,
      note,
    });
    await sendEmail({ to: order.email as string, subject, html });
    if (order.phone) {
      const label = ORDER_STATUS_LABELS[status] || status;
      const text = note ? `Convivia24: ${label}. ${note}` : `Convivia24: your order is now "${label}".`;
      await sendSms(order.phone as string, text, orderId);
    }
  } catch (err) {
    console.error('notifyOrderStatus failed', err);
  }
}
