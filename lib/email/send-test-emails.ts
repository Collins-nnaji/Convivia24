/**
 * Send branded order/delivery tests to all recipients together, or use --inventory.
 * Run: npx tsx lib/email/send-test-emails.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';

for (const file of ['.env.local', '.env']) {
  try {
    const content = readFileSync(join(process.cwd(), file), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* missing file */
  }
}

async function main() {
  const { sendEmail, resendConfigured } = await import('./resend');
  const { adminNotificationEmails: adminEmails, normaliseEmails } = await import('../admin-emails');
  const { adminSuccessfulOrderEmail, orderStatusEmail } = await import('./templates');
  if (process.argv.includes('--inventory')) {
    const { sendInventoryDigest } = await import('./inventory-digest');
    const result = await sendInventoryDigest({ isTest: true });
    console.log(JSON.stringify(result));
    if (!result.sent) process.exitCode = 1;
    return;
  }

  if (!resendConfigured()) throw new Error('Resend is not configured (RESEND_API_KEY / RESEND_FROM).');

  const admins = adminEmails();
  const notify = normaliseEmails(process.env.ADMIN_NOTIFY_EMAIL);
  const recipients = normaliseEmails(...admins, ...notify);
  if (!recipients.length) throw new Error('No test recipients configured.');

  const runId = new Date().toISOString();
  const orderId = 'TEST-' + runId.replace(/[^0-9]/g, '');
  const lines = [
    { name: 'Hennessy VS 70cl', qty: 2, unitPriceNgn: 65000 },
    { name: 'Jameson Original 70cl', qty: 1, unitPriceNgn: 35000 },
    { name: 'Party Pack · House Warm', qty: 1, unitPriceNgn: 20000 },
  ];
  const notice = 'TEST ONLY — Sample order for email verification. No payment, order or delivery has been created. No action is required.';
  const mails = [
    { kind: 'order', ...adminSuccessfulOrderEmail({
      fullName: 'Test Customer', email: 'customer@example.com',
      orderId, status: 'paid (test)', totalNgn: 185000, lines,
    }) },
    { kind: 'delivery', ...orderStatusEmail({
      fullName: 'Test Customer', orderId, status: 'out_for_delivery',
      subtotalNgn: 185000, lines, note: notice,
      courierName: 'Convivia24 Demo Courier',
      etaAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    }) },
  ];

  let failures = 0;
  for (const mail of mails) {
    const result = await sendEmail({
      to: recipients, subject: `[TEST ONLY] ${mail.subject}`,
      html: mail.html.replace(
        '<!-- Title -->',
        `<tr><td style="padding:16px 28px;background:#fff4db;color:#704900;font-size:13px;line-height:1.5;font-weight:bold;">${notice}</td></tr><!-- Title -->`
      ),
      text: `${notice}\n\n${mail.text}`,
      idempotencyKey: `email-test:${runId}:${mail.kind}`,
    });
    console.log(JSON.stringify({ to: recipients, template: mail.kind, ...result }));
    if (!result.sent) failures++;
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  if (failures) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
