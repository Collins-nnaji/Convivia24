import sql from '@/lib/db';
import { sendEmail } from '@/lib/email/resend';
import { genericNoticeEmail } from '@/lib/email/templates';
import { getPackageBySlug } from '@/lib/packages/catalog';
import { DRINKS } from '@/lib/drinks/catalog';
import { sendSms, termiiConfigured, normalizeNgPhone } from '@/lib/notify/termii';

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Tell the routed supplier a paid order is theirs to fill. Fires once, when payment lands —
 * never at checkout, because an unpaid order must not have a supplier pulling bottles.
 * Best-effort: no email on file, or a mail hiccup, never fails the payment webhook.
 */
export async function notifySupplierOfPaidOrder(orderId: string): Promise<void> {
  try {
    const [row] = await sql`
      SELECT
        o.id, o.full_name, o.area, o.city, o.address_line1, o.address_line2, o.notes, o.routed_out_of_city,
        s.id AS supplier_id, s.name AS supplier_name, s.email AS supplier_email, s.slug AS supplier_slug,
        s.phone AS supplier_phone, s.portal_enabled
      FROM ritual_orders o
      JOIN suppliers s ON s.id = COALESCE(o.supplier_id, o.routed_supplier_id)
      WHERE o.id = ${orderId}
      LIMIT 1
    `;
    if (!row) return;

    const raw = await sql`
      SELECT kit_slug AS slug, kit_name AS name, qty FROM ritual_order_items WHERE order_id = ${orderId} ORDER BY created_at
    `;
    const items = raw.flatMap((i) => {
      const pkg = getPackageBySlug(String(i.slug));
      if (!pkg) return [{ name: String(i.name), qty: Number(i.qty) }];
      return pkg.components.map((c) => ({ name: `${DRINKS.find((d) => d.slug === c.slug)?.name || c.slug} (${i.name})`, qty: c.qty * Number(i.qty) }));
    });
    const portal = `${appUrl()}/supplier/${row.supplier_slug}#orders`;
    const lines = items
      .map((i) => `<li style="margin:0 0 6px;">${escapeHtml(String(i.name))} × <strong>${Number(i.qty)}</strong></li>`)
      .join('');
    const where = [row.address_line1, row.address_line2, row.area, row.city].filter(Boolean).map(String).map(escapeHtml).join(', ');

    const { subject, html } = genericNoticeEmail({
      title: `New order to fill · ${String(row.id).slice(0, 8).toUpperCase()}`,
      subject: `Convivia24 order ${String(row.id).slice(0, 8).toUpperCase()} — please pack`,
      greeting: `Hi ${escapeHtml(String(row.supplier_name))}, a paid order has been routed to you.`,
      bodyHtml: `
        <ul style="margin:0 0 16px;padding-left:18px;line-height:1.5;font-size:15px;color:#3a3532;">${lines}</ul>
        <p style="margin:0 0 6px;font-size:14px;color:#3a3532;"><strong>Deliver to:</strong> ${escapeHtml(String(row.full_name))}, ${where}</p>
        ${row.notes ? `<p style="margin:0 0 6px;font-size:14px;color:#3a3532;"><strong>Customer note:</strong> ${escapeHtml(String(row.notes))}</p>` : ''}
        ${row.routed_out_of_city ? `<p style="margin:0 0 6px;font-size:13px;color:#b45309;">This delivery is outside your city — please allow extra time.</p>` : ''}
        ${
          row.portal_enabled
            ? `<p style="margin:16px 0 0;font-size:14px;"><a href="${portal}" style="color:#c2410c;font-weight:700;">Open your portal</a> to mark it packed, add the rider, and mark it delivered.</p>`
            : ''
        }
      `,
    });
    if (row.supplier_email) {
      const result = await sendEmail({ to: String(row.supplier_email), subject, html });
      if (!result.sent) console.error('Supplier order notification failed:', result.error);
    }

    // Suppliers live on their phones — a text lands even when the email waits until morning.
    if (row.supplier_phone && termiiConfigured()) {
      const short = String(row.id).slice(0, 8).toUpperCase();
      const bottles = items.map((i) => `${i.qty}x ${i.name}`).join(', ').slice(0, 120);
      const text = `Convivia24 order ${short}: ${bottles}. Deliver to ${String(row.area || row.city || 'Lagos')}. ${row.portal_enabled ? `Open ${appUrl()}/supplier/${row.supplier_slug}` : 'Check your email.'}`;
      await sendSms(normalizeNgPhone(String(row.supplier_phone)), text).catch((err) => console.error('Supplier SMS failed', err));
    }
  } catch (err) {
    console.error('notifySupplierOfPaidOrder failed', err);
  }
}
