/**
 * Resend mailer. Sends nothing until env is complete so you can add
 * RESEND_API_URL / RESEND_API_KEY / RESEND_FROM later without breaking checkout.
 *
 * RESEND_API_URL — optional; defaults to https://api.resend.com
 * RESEND_API_KEY
 * RESEND_FROM — e.g. "Convivia24 <orders@yourdomain.com>"
 * ADMIN_NOTIFY_EMAIL — optional BCC/ops copy for new paid orders
 */

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  bcc?: string | string[];
};

function configured(): { url: string; key: string; from: string } | null {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const url = (process.env.RESEND_API_URL?.trim() || 'https://api.resend.com').replace(/\/$/, '');
  if (!key || !from) return null;
  return { url, key, from };
}

export function resendConfigured(): boolean {
  return configured() !== null;
}

export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean; id?: string; error?: string }> {
  const cfg = configured();
  if (!cfg) {
    return { sent: false, error: 'Resend is not configured yet.' };
  }

  const to = Array.isArray(input.to) ? input.to : [input.to];
  const bcc = input.bcc ? (Array.isArray(input.bcc) ? input.bcc : [input.bcc]) : undefined;

  try {
    const res = await fetch(`${cfg.url}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: cfg.from,
        to,
        bcc,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; error?: { message?: string } };
    if (!res.ok) {
      const message = body?.error?.message || body?.message || `Resend ${res.status}`;
      console.error('Resend send failed', message);
      return { sent: false, error: message };
    }
    return { sent: true, id: body.id };
  } catch (err) {
    console.error('Resend send error', err);
    return { sent: false, error: 'Network error sending email.' };
  }
}

export function adminNotifyEmail(): string | null {
  const email = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  return email && email.includes('@') ? email : null;
}
