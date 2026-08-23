import { formatNgn } from '@/lib/drinks/catalog';
import type { OrderStatus } from '@/lib/commerce/status';
import { ORDER_STATUS_LABELS } from '@/lib/commerce/status';
import { supportEmail } from '@/lib/email/resend';

export type EmailLine = { name: string; qty: number; unitPriceNgn: number };

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');
}

/** PNG logos — email clients often block or ignore SVG. */
function logoMarkUrl(): string {
  return `${appUrl()}/Logo2.png`;
}

function logoWordmarkUrl(): string {
  return `${appUrl()}/convivia24.png`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(title: string, body: string): string {
  const mark = logoMarkUrl();
  const wordmark = logoWordmarkUrl();
  const support = supportEmail();
  const site = appUrl();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · Convivia24</title>
</head>
<body style="margin:0;padding:0;background:#fafaf8;font-family:Helvetica,Arial,sans-serif;color:#0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fafaf8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #ece8e4;">
          <!-- Brand header with real Convivia24 logo (PNG — works in Gmail/Outlook) -->
          <tr>
            <td style="padding:20px 28px;background:#ffffff;border-bottom:3px solid #8B2A22;">
              <a href="${site}" style="text-decoration:none;display:inline-block;">
                <img
                  src="${wordmark}"
                  alt="Convivia24"
                  width="200"
                  height="37"
                  style="display:block;width:200px;height:auto;max-width:75%;border:0;outline:none;"
                />
              </a>
              <p style="margin:8px 0 0;font-size:11px;letter-spacing:.1em;color:#6b6560;">
                Drink supplies for events · nationwide · 18+
              </p>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding:24px 28px 0;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.25;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:16px 28px 28px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #ece8e4;background:#fafaf8;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td valign="middle" style="width:40px;">
                    <img
                      src="${mark}"
                      alt="Convivia24"
                      width="36"
                      height="36"
                      style="display:block;width:36px;height:36px;border:0;object-fit:contain;"
                    />
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <p style="margin:0;font-size:12px;color:#6b6560;line-height:1.5;">
                      Drinks for parties, clubs &amp; lounges · nationwide · 18+
                    </p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b6560;">
                      Questions?
                      <a href="mailto:${escapeHtml(support)}" style="color:#8B2A22;text-decoration:none;">${escapeHtml(support)}</a>
                      ·
                      <a href="${site}" style="color:#8B2A22;text-decoration:none;">convivia24.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#9a948e;">
          You received this because of activity on Convivia24.
        </p>
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
          <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:14px;color:#0a0a0a;">${escapeHtml(l.name)} × ${l.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:14px;text-align:right;color:#0a0a0a;">${formatNgn(l.unitPriceNgn * l.qty)}</td>
        </tr>`
    )
    .join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 0;">${rows}</table>`;
}

export function orderReceivedEmail(opts: {
  fullName: string;
  orderId: string;
  lines: EmailLine[];
  subtotalNgn: number;
}): { subject: string; html: string; text: string } {
  const first = opts.fullName.split(' ')[0] || 'there';
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  return {
    subject: `We have your drop · ${shortId}`,
    text: `Hi ${first}, we have your Convivia24 order ${shortId}. Total ${formatNgn(opts.subtotalNgn)}. Questions? ${supportEmail()}`,
    html: wrap(
      'Order received',
      `<p style="margin:0 0 16px;line-height:1.55;font-size:15px;color:#3a3532;">Hi ${escapeHtml(first)}, we have your Convivia24 order.</p>
       ${linesTable(opts.lines)}
       <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:#0a0a0a;">Total ${formatNgn(opts.subtotalNgn)}</p>
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
}): { subject: string; html: string; text: string } {
  const label = ORDER_STATUS_LABELS[opts.status] || opts.status;
  const first = opts.fullName.split(' ')[0] || 'there';
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  const copy: Partial<Record<OrderStatus, string>> = {
    paid: 'Payment confirmed. We are getting your drop ready.',
    processing: 'The team is preparing your order.',
    packed: 'Your drinks are packed and ready for a rider.',
    out_for_delivery: 'A rider is on the way with your order.',
    delivered: 'Your drop has been delivered. Enjoy the night.',
    fulfilled: 'Your drop has been delivered. Enjoy the night.',
    cancelled: 'This order was cancelled. If you paid, we will follow up on a refund.',
    refunded: 'A refund has been recorded for this order.',
    awaiting_payment: 'We are waiting on payment to release this drop.',
  };
  const message = copy[opts.status] || `Your order is now ${label.toLowerCase()}.`;
  return {
    subject: `${label} · ${shortId}`,
    text: `Hi ${first}, ${message} Order ${shortId}. Total ${formatNgn(opts.subtotalNgn)}.`,
    html: wrap(
      label,
      `<p style="margin:0 0 16px;line-height:1.55;font-size:15px;color:#3a3532;">Hi ${escapeHtml(first)}, ${escapeHtml(message)}</p>
       ${opts.note ? `<p style="margin:0 0 16px;line-height:1.55;font-size:14px;color:#3a3532;">${escapeHtml(opts.note)}</p>` : ''}
       ${linesTable(opts.lines)}
       <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:#0a0a0a;">Total ${formatNgn(opts.subtotalNgn)}</p>
       <p style="margin:12px 0 0;font-size:13px;color:#6b6560;">Order ${escapeHtml(opts.orderId)}</p>`
    ),
  };
}

export function waitlistEmail(email: string): { subject: string; html: string; text: string } {
  return {
    subject: 'You are on the Convivia24 list',
    text: `Thanks for joining Convivia24 (${email}). We will write when a table or drop is ready. Questions? ${supportEmail()}`,
    html: wrap(
      'You are on the list',
      `<p style="margin:0;line-height:1.55;font-size:15px;color:#3a3532;">Thanks for joining, ${escapeHtml(email)}. We will write when a table or drop is ready.</p>`
    ),
  };
}

/** Ops alert — new successful / paid drinks order. */
export function adminSuccessfulOrderEmail(opts: {
  fullName: string;
  email: string;
  phone?: string | null;
  orderId: string;
  lines: EmailLine[];
  totalNgn: number;
  status?: string;
}): { subject: string; html: string; text: string } {
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  const status = opts.status || 'paid';
  const lineText = opts.lines.map((l) => `${l.name} × ${l.qty}`).join(', ');
  return {
    subject: `[Order] ${shortId} · ${formatNgn(opts.totalNgn)} · ${opts.fullName}`,
    text: `New successful Convivia24 order ${shortId}. Customer: ${opts.fullName} <${opts.email}>${opts.phone ? ` · ${opts.phone}` : ''}. Status: ${status}. Items: ${lineText}. Total: ${formatNgn(opts.totalNgn)}.`,
    html: wrap(
      'Successful drinks order',
      `<p style="margin:0 0 12px;line-height:1.55;font-size:15px;color:#3a3532;">
         A drinks order just cleared. Prep and dispatch when ready.
       </p>
       <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 16px;font-size:14px;color:#3a3532;">
         <tr><td style="padding:4px 0;color:#6b6560;">Order</td><td style="padding:4px 0;text-align:right;font-family:monospace;">${escapeHtml(shortId)}</td></tr>
         <tr><td style="padding:4px 0;color:#6b6560;">Customer</td><td style="padding:4px 0;text-align:right;">${escapeHtml(opts.fullName)}</td></tr>
         <tr><td style="padding:4px 0;color:#6b6560;">Email</td><td style="padding:4px 0;text-align:right;"><a href="mailto:${escapeHtml(opts.email)}" style="color:#8B2A22;text-decoration:none;">${escapeHtml(opts.email)}</a></td></tr>
         ${opts.phone ? `<tr><td style="padding:4px 0;color:#6b6560;">Phone</td><td style="padding:4px 0;text-align:right;">${escapeHtml(opts.phone)}</td></tr>` : ''}
         <tr><td style="padding:4px 0;color:#6b6560;">Status</td><td style="padding:4px 0;text-align:right;text-transform:capitalize;">${escapeHtml(status)}</td></tr>
       </table>
       ${linesTable(opts.lines)}
       <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:#0a0a0a;">Total ${formatNgn(opts.totalNgn)}</p>
       <p style="margin:16px 0 0;">
         <a href="${appUrl()}/admin" style="display:inline-block;padding:12px 18px;background:#8B2A22;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Open admin desk</a>
       </p>`
    ),
  };
}

export type InventoryDigestLine = {
  name: string;
  slug: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  active: boolean;
};

/** Daily (or on-demand) inventory snapshot for ops. */
export function inventoryDigestEmail(opts: {
  generatedAt?: Date;
  lines: InventoryDigestLine[];
  isTest?: boolean;
}): { subject: string; html: string; text: string } {
  const when = opts.generatedAt || new Date();
  const dateLabel = when.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const low = opts.lines.filter((l) => l.active && l.available <= l.lowStockThreshold);
  const inactive = opts.lines.filter((l) => !l.active);
  const tracked = opts.lines.filter((l) => l.active);

  const rows = tracked
    .slice(0, 40)
    .map((l) => {
      const warn = l.available <= l.lowStockThreshold;
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:13px;color:#0a0a0a;">${escapeHtml(l.name)}${warn ? ' <span style="color:#8B2A22;font-size:11px;">· low</span>' : ''}</td>
        <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:13px;text-align:right;color:${warn ? '#8B2A22' : '#0a0a0a'};font-weight:${warn ? '700' : '400'};">${l.available}</td>
        <td style="padding:8px 0;border-bottom:1px solid #ece8e4;font-size:12px;text-align:right;color:#6b6560;">${l.onHand} / ${l.reserved} res</td>
      </tr>`;
    })
    .join('');

  const prefix = opts.isTest ? '[TEST] ' : '';
  return {
    subject: `${prefix}Inventory update · ${dateLabel} · ${low.length} low`,
    text: `${prefix}Convivia24 inventory ${dateLabel}. Active SKUs: ${tracked.length}. Low stock: ${low.length}. Unlisted: ${inactive.length}. Low: ${low.map((l) => `${l.name} (${l.available})`).join(', ') || 'none'}.`,
    html: wrap(
      opts.isTest ? 'Inventory update (test)' : 'Daily inventory update',
      `<p style="margin:0 0 16px;line-height:1.55;font-size:15px;color:#3a3532;">
         Stock snapshot for ${escapeHtml(dateLabel)}.
         ${opts.isTest ? ' This is a one-off test — daily digests can use the same template later.' : ''}
       </p>
       <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;font-size:14px;">
         <tr>
           <td style="padding:12px;background:#fafaf8;border:1px solid #ece8e4;text-align:center;">
             <p style="margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b6560;">Active SKUs</p>
             <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#0a0a0a;">${tracked.length}</p>
           </td>
           <td style="width:8px;"></td>
           <td style="padding:12px;background:#fafaf8;border:1px solid #ece8e4;text-align:center;">
             <p style="margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b6560;">Low stock</p>
             <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#8B2A22;">${low.length}</p>
           </td>
           <td style="width:8px;"></td>
           <td style="padding:12px;background:#fafaf8;border:1px solid #ece8e4;text-align:center;">
             <p style="margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b6560;">Unlisted</p>
             <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#0a0a0a;">${inactive.length}</p>
           </td>
         </tr>
       </table>
       ${
         low.length
           ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8B2A22;">Needs restock</p>
              <p style="margin:0 0 16px;font-size:14px;color:#3a3532;line-height:1.5;">${low.map((l) => `${escapeHtml(l.name)} (${l.available})`).join(' · ')}</p>`
           : `<p style="margin:0 0 16px;font-size:14px;color:#3a3532;">No SKUs under their low-stock threshold.</p>`
       }
       <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6b6560;">Available · on hand / reserved</p>
       <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows || '<tr><td style="padding:8px 0;color:#6b6560;font-size:14px;">No active inventory rows yet.</td></tr>'}</table>
       <p style="margin:20px 0 0;">
         <a href="${appUrl()}/admin" style="display:inline-block;padding:12px 18px;background:#8B2A22;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Manage stock</a>
       </p>`
    ),
  };
}

export function genericNoticeEmail(opts: {
  title: string;
  subject?: string;
  greeting?: string;
  bodyHtml: string;
}): { subject: string; html: string } {
  return {
    subject: opts.subject || `${opts.title} · Convivia24`,
    html: wrap(
      opts.title,
      `${opts.greeting ? `<p style="margin:0 0 16px;line-height:1.55;font-size:15px;color:#3a3532;">${opts.greeting}</p>` : ''}
       ${opts.bodyHtml}`
    ),
  };
}

