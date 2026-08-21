import { sendEmail, adminNotifyEmail } from '@/lib/email/resend';
import { inventoryDigestEmail, type InventoryDigestLine } from '@/lib/email/templates';
import { listInventory } from '@/lib/inventory';

/** Build + send the inventory digest to ADMIN_NOTIFY_EMAIL. Used by cron later and by the test script now. */
export async function sendInventoryDigest(opts?: { isTest?: boolean }): Promise<{
  sent: boolean;
  error?: string;
  recipientCount: number;
  skuCount: number;
  lowCount: number;
}> {
  const admins = adminNotifyEmail();
  if (!admins) {
    return { sent: false, error: 'ADMIN_NOTIFY_EMAIL is not set.', recipientCount: 0, skuCount: 0, lowCount: 0 };
  }

  const rows = await listInventory(false);
  const lines: InventoryDigestLine[] = rows.map((r) => ({
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

  const result = await sendEmail({ to: admins, subject, html, text });
  const lowCount = lines.filter((l) => l.active && l.available <= l.lowStockThreshold).length;
  return {
    sent: result.sent,
    error: result.error,
    recipientCount: Array.isArray(admins) ? admins.length : 1,
    skuCount: lines.length,
    lowCount,
  };
}
