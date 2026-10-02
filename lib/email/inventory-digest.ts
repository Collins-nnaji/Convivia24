import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import { inventoryDigestEmail, type InventoryDigestLine } from '@/lib/email/templates';
import { listInventory } from '@/lib/inventory';
import { getPackageBySlug } from '@/lib/packages/catalog';

/** Build + send the inventory digest to ADMIN_NOTIFY_EMAIL. Used by cron later and by the test script now. */
export async function sendInventoryDigest(opts?: { isTest?: boolean }): Promise<{
  sent: boolean;
  error?: string;
  id?: string;
  recipientCount: number;
  skuCount: number;
  lowCount: number;
}> {
  const admins = adminNotifyEmail();
  if (!admins) {
    return { sent: false, error: 'ADMIN_NOTIFY_EMAIL is not set.', recipientCount: 0, skuCount: 0, lowCount: 0 };
  }

  const rows = await listInventory(false);
  // Packs consume component bottles; their placeholder stock must never trigger restock alerts.
  const lines: InventoryDigestLine[] = rows
    .filter(r => r.track_stock && r.category !== 'party-packs' && !getPackageBySlug(r.slug))
    .map((r) => ({
    name: r.name,
    slug: r.slug,
    onHand: r.on_hand,
    reserved: r.reserved,
    available: r.available,
    lowStockThreshold: r.low_stock_threshold,
    active: r.active,
  }));

  const { subject, html, text } = inventoryDigestEmail({
    lines,
    isTest: opts?.isTest,
    generatedAt: new Date(),
  });

  // Embed the logos so the inventory email does not depend on remote image loading.
  const attachments = await Promise.all([
    { filename: 'convivia24.png', content_id: 'convivia-wordmark' },
    { filename: 'Logo2.png', content_id: 'convivia-mark' },
  ].map(async asset => ({
    ...asset, content_type: 'image/png',
    content: (await readFile(join(process.cwd(), 'public', asset.filename))).toString('base64'),
  })));
  const embeddedHtml = html
    .replace(/src="[^"]*\/convivia24\.png"/, 'src="cid:convivia-wordmark"')
    .replace(/src="[^"]*\/Logo2\.png"/, 'src="cid:convivia-mark"');
  const result = await sendEmail({ to: admins, subject, html: embeddedHtml, text, attachments });
  const lowCount = lines.filter((l) => l.active && l.available <= l.lowStockThreshold).length;
  return {
    sent: result.sent,
    id: result.id,
    error: result.error,
    recipientCount: Array.isArray(admins) ? admins.length : 1,
    skuCount: lines.length,
    lowCount,
  };
}
