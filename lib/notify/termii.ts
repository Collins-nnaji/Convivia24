/**
 * Termii SMS/WhatsApp sender — parked for now.
 * Order notifications use Resend email only until this is wired back.
 *
 * When ready: set TERMII_API_KEY (+ optional TERMII_SENDER_ID / TERMII_CHANNEL)
 * and call sendSms from lib/commerce/notify.ts again.
 *
 * TERMII_API_URL — optional; defaults to https://api.ng.termii.com/api
 * TERMII_API_KEY
 * TERMII_SENDER_ID — registered Termii sender ID (e.g. "Convivia24");
 *   falls back to "N-Alert" if unset
 * TERMII_CHANNEL — "generic" (SMS, default) or "whatsapp"
 */

import sql from '@/lib/db';

function configured(): { url: string; key: string; senderId: string; channel: string } | null {
  const key = process.env.TERMII_API_KEY?.trim();
  if (!key) return null;
  const url = (process.env.TERMII_API_URL?.trim() || 'https://api.ng.termii.com/api').replace(/\/$/, '');
  const senderId = process.env.TERMII_SENDER_ID?.trim() || 'N-Alert';
  const channel = process.env.TERMII_CHANNEL?.trim() || 'generic';
  return { url, key, senderId, channel };
}

export function termiiConfigured(): boolean {
  return configured() !== null;
}

/**
 * Nigerian numbers arrive in whatever shape a customer typed at checkout
 * (080…, +234…, 234…). Termii wants the international form with no leading
 * '+'. Best-effort — anything that doesn't look Nigerian is passed through.
 */
export function normalizeNgPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0') && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return digits;
}

export async function sendSms(
  to: string,
  message: string,
  orderId?: string
): Promise<{ sent: boolean; error?: string }> {
  const cfg = configured();
  if (!cfg) return { sent: false, error: 'Termii is not configured yet.' };

  const phone = normalizeNgPhone(to);
  try {
    const res = await fetch(`${cfg.url}/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: cfg.key,
        to: phone,
        from: cfg.senderId,
        sms: message,
        type: 'plain',
        channel: cfg.channel,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
    if (!res.ok) {
      const error = body?.message || `Termii ${res.status}`;
      await logSms(phone, cfg.channel, 'failed', error, orderId);
      return { sent: false, error };
    }
    await logSms(phone, cfg.channel, 'sent', undefined, orderId);
    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Network error sending SMS.';
    console.error('Termii send error', err);
    await logSms(phone, cfg.channel, 'failed', error, orderId);
    return { sent: false, error };
  }
}

async function logSms(to: string, channel: string, status: 'sent' | 'failed', error?: string, orderId?: string) {
  try {
    await sql`
      INSERT INTO sms_log (order_id, to_phone, channel, status, error)
      VALUES (${orderId || null}, ${to}, ${channel}, ${status}, ${error || null})
    `;
  } catch {
    /* the log is best-effort — never fail a send over it */
  }
}
