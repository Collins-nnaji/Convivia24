/**
 * Send Resend template tests to ADMIN_NOTIFY_EMAIL.
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
  const { sendEmail, adminNotifyEmail, resendConfigured } = await import('./resend');
  const { adminSuccessfulOrderEmail } = await import('./templates');
  const { sendInventoryDigest } = await import('./inventory-digest');

  if (!resendConfigured()) {
    console.error('Resend is not configured (RESEND_API_KEY / RESEND_FROM).');
    process.exit(1);
  }

  const admins = adminNotifyEmail();
  if (!admins) {
    console.error('ADMIN_NOTIFY_EMAIL is empty.');
    process.exit(1);
  }

  console.log('Sending to:', Array.isArray(admins) ? admins.join(', ') : admins);
  console.log('From:', process.env.RESEND_FROM);

  // 1) Successful drinks order (admin ops template)
  const orderMail = adminSuccessfulOrderEmail({
    fullName: 'Test Customer',
    email: 'customer@example.com',
    phone: '+2348012345678',
    orderId: 'test-order-convivia24-001',
    status: 'paid',
    totalNgn: 185000,
    lines: [
      { name: 'Hennessy VS 70cl', qty: 2, unitPriceNgn: 65000 },
      { name: 'Jameson Original 70cl', qty: 1, unitPriceNgn: 35000 },
      { name: 'Party Pack · House Warm', qty: 1, unitPriceNgn: 20000 },
    ],
  });

  const orderResult = await sendEmail({
    to: admins,
    subject: `[TEST] ${orderMail.subject}`,
    html: orderMail.html,
    text: `[TEST] ${orderMail.text}`,
  });
  console.log('Order success email:', orderResult.sent ? `OK (${orderResult.id})` : `FAIL — ${orderResult.error}`);

  // 2) Inventory digest (future daily mail)
  const invResult = await sendInventoryDigest({ isTest: true });
  console.log(
    'Inventory digest:',
    invResult.sent
      ? `OK · ${invResult.skuCount} SKUs · ${invResult.lowCount} low · ${invResult.recipientCount} recipients`
      : `FAIL — ${invResult.error}`
  );

  if (!orderResult.sent || !invResult.sent) process.exit(1);
  console.log('Done. Check the admin inboxes.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
