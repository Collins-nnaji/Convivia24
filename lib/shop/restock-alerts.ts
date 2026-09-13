import sql from '@/lib/db';
import { sendEmail } from '@/lib/email/resend';
import { genericNoticeEmail } from '@/lib/email/templates';
import { DRINKS } from '@/lib/drinks/catalog';

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');
}

export async function addRestockAlert(slug: string, email: string): Promise<void> {
  await sql`
    INSERT INTO restock_alerts (slug, email) VALUES (${slug}, ${email.trim().toLowerCase()})
    ON CONFLICT (slug, email) DO UPDATE SET notified_at = NULL, created_at = NOW()
  `;
}

/**
 * Fires when a bottle is back: everyone waiting on it gets one email and their row is marked
 * so they are not told twice. Call after any write that can raise available stock — it checks
 * the live figure itself, so calling it when nothing changed is harmless.
 */
export async function notifyRestockAlerts(slug: string): Promise<number> {
  const [inv] = await sql`SELECT name, on_hand - reserved AS available, active FROM inventory WHERE slug = ${slug} LIMIT 1`;
  if (!inv || inv.active === false || Number(inv.available ?? 0) <= 0) return 0;
  const waiting = await sql`SELECT id, email FROM restock_alerts WHERE slug = ${slug} AND notified_at IS NULL LIMIT 500`;
  if (waiting.length === 0) return 0;
  const name = String(inv.name || DRINKS.find((d) => d.slug === slug)?.name || slug);
  let sent = 0;
  for (const w of waiting) {
    const { subject, html } = genericNoticeEmail({
      title: `${name} is back in stock`,
      subject: `${name} is back — Convivia24`,
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#3a3532;">You asked us to tell you when <strong>${name}</strong> was back. It is.</p>
        <p style="margin:0;font-size:14px;"><a href="${appUrl()}/shop/${slug}" style="color:#c2410c;font-weight:700;">Order it now →</a></p>
        <p style="margin:14px 0 0;font-size:12px;color:#8a8580;">Adults 18+ only.</p>
      `,
    });
    const r = await sendEmail({ to: String(w.email), subject, html }).catch(() => ({ sent: false }));
    if (r.sent) {
      sent += 1;
      await sql`UPDATE restock_alerts SET notified_at = NOW() WHERE id = ${w.id}`.catch(() => {});
    }
  }
  return sent;
}
