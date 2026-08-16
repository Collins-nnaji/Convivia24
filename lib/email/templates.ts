import { formatNgn } from '@/lib/drinks/catalog';
import type { OrderStatus } from '@/lib/commerce/status';
import { ORDER_STATUS_LABELS } from '@/lib/commerce/status';

export type EmailLine = { name: string; qty: number; unitPriceNgn: number };

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafaf8;font-family:Georgia,serif;color:#0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #ece8e4;">
          <tr>
            <td style="padding:22px 28px;background:linear-gradient(118deg,#0a0a0a 0%,#2a0e0c 38%,#5c1814 68%,#8B2A22 100%);color:#fff;">
              <p style="margin:0;font-size:11px;letter-spacing:.28em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;">Convivia24</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${body}
              <p style="margin:28px 0 0;font-size:12px;color:#6b6560;font-family:Helvetica,Arial,sans-serif;">
                Lagos drinks · parties, clubs &amp; lounges · 18+
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function linesTable(lines: EmailLine[]): string {
  const rows = lines
    .map(
      (l) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:14px;">${escapeHtml(l.name)} × ${l.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:14px;text-align:right;">${formatNgn(l.unitPriceNgn * l.qty)}</td>
        </tr>`
    )
    .join('');
  return `<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function orderReceivedEmail(opts: {
  fullName: string;
  orderId: string;
  lines: EmailLine[];
  subtotalNgn: number;
}): { subject: string; html: string } {
  return {
    subject: `We have your drop · ${opts.orderId.slice(0, 8).toUpperCase()}`,
    html: wrap(
      'Order received',
      `<p style="margin:0 0 16px;line-height:1.55;">Hi ${escapeHtml(opts.fullName.split(' ')[0] || 'there')}, we have your Convivia24 order.</p>
       ${linesTable(opts.lines)}
       <p style="margin:16px 0 0;font-size:18px;font-weight:700;">Total ${formatNgn(opts.subtotalNgn)}</p>
       <p style="margin:12px 0 0;font-size:13px;color:#6b6560;">Order ${escapeHtml(opts.orderId)}</p>`
    ),
  };
}

export function orderStatusEmail(opts: {
  fullName: string;
  orderId: string;
  status: OrderStatus;
  lines: EmailLine[];
  subtotalNgn: number;
  note?: string | null;
}): { subject: string; html: string } {
  const label = ORDER_STATUS_LABELS[opts.status] || opts.status;
  const copy: Partial<Record<OrderStatus, string>> = {
    paid: 'Payment confirmed. We are getting your drop ready.',
    processing: 'The team is preparing your order.',
    packed: 'Your drinks are packed and ready for a rider.',
    out_for_delivery: 'A rider is on the way across Lagos.',
    delivered: 'Your drop has been delivered. Enjoy the night.',
    fulfilled: 'Your drop has been delivered. Enjoy the night.',
    cancelled: 'This order was cancelled. If you paid, we will follow up on a refund.',
    refunded: 'A refund has been recorded for this order.',
    awaiting_payment: 'We are waiting on payment to release this drop.',
  };
  return {
    subject: `${label} · ${opts.orderId.slice(0, 8).toUpperCase()}`,
    html: wrap(
      label,
      `<p style="margin:0 0 16px;line-height:1.55;">Hi ${escapeHtml(opts.fullName.split(' ')[0] || 'there')}, ${copy[opts.status] || `Your order is now ${label.toLowerCase()}.`}</p>
       ${opts.note ? `<p style="margin:0 0 16px;line-height:1.55;">${escapeHtml(opts.note)}</p>` : ''}
       ${linesTable(opts.lines)}
       <p style="margin:16px 0 0;font-size:18px;font-weight:700;">Total ${formatNgn(opts.subtotalNgn)}</p>
       <p style="margin:12px 0 0;font-size:13px;color:#6b6560;">Order ${escapeHtml(opts.orderId)}</p>`
    ),
  };
}

export function waitlistEmail(email: string): { subject: string; html: string } {
  return {
    subject: 'You are on the Convivia24 list',
    html: wrap(
      'You are on the list',
      `<p style="margin:0;line-height:1.55;">Thanks for joining, ${escapeHtml(email)}. We will write when a table or drop is ready.</p>`
    ),
  };
}
