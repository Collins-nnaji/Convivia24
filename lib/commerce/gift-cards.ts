import { randomBytes } from 'crypto';
import sql from '@/lib/db';
import { sendEmail } from '@/lib/email/resend';
import { genericNoticeEmail } from '@/lib/email/templates';
import { formatNgn } from '@/lib/drinks/catalog';

export type GiftCard = {
  id: string;
  code: string;
  valueNgn: number;
  status: 'active' | 'redeemed' | 'void';
  issuedBy: string;
  note: string | null;
  redeemedOrderId: string | null;
  redeemedAt: string | null;
  createdAt: string;
  recipientName: string | null;
  recipientEmail: string | null;
  expiresAt: string | null;
  /** When the code was last emailed to the recipient. */
  sentAt: string | null;
  /** Active but past its expiry — still `active` in the DB, refused at checkout. */
  expired: boolean;
};

function mapRow(r: Record<string, unknown>): GiftCard {
  return {
    id: String(r.id),
    code: String(r.code),
    valueNgn: Number(r.value_ngn),
    status: r.status as GiftCard['status'],
    issuedBy: String(r.issued_by),
    note: (r.note as string) || null,
    redeemedOrderId: (r.redeemed_order_id as string) || null,
    redeemedAt: (r.redeemed_at as string) || null,
    createdAt: String(r.created_at),
    recipientName: (r.recipient_name as string) || null,
    recipientEmail: (r.recipient_email as string) || null,
    expiresAt: r.expires_at ? String(r.expires_at) : null,
    sentAt: r.sent_at ? String(r.sent_at) : null,
    expired: r.status === 'active' && Boolean(r.expires_at) && new Date(String(r.expires_at)).getTime() < Date.now(),
  };
}

function generateCode(): string {
  // 4 groups of 4 base32-ish chars from real randomness — not guessable,
  // unlike the old Math.random()-in-the-browser codes.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I ambiguity
  const bytes = randomBytes(12);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i % 4 === 3 && i !== bytes.length - 1) out += '-';
  }
  return `CV24-${out}`;
}

export async function issueGiftCard(
  issuedBy: string,
  valueNgn: number,
  note?: string | null,
  opts: { recipientName?: string | null; recipientEmail?: string | null; expiresAt?: string | null } = {}
): Promise<GiftCard> {
  const code = generateCode();
  const rows = await sql`
    INSERT INTO gift_cards (code, value_ngn, issued_by, note, recipient_name, recipient_email, expires_at)
    VALUES (
      ${code}, ${Math.max(1, Math.floor(valueNgn))}, ${issuedBy}, ${note || null},
      ${opts.recipientName?.trim() || null}, ${opts.recipientEmail?.trim().toLowerCase() || null},
      ${opts.expiresAt ? new Date(opts.expiresAt).toISOString() : null}::timestamptz
    )
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function getGiftCard(id: string): Promise<GiftCard | null> {
  const rows = await sql`SELECT * FROM gift_cards WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapRow(rows[0]) : null;
}

export type GiftCardStats = {
  activeCount: number;
  activeNgn: number;
  redeemedCount: number;
  redeemedNgn: number;
  voidCount: number;
  expiredCount: number;
};

export async function giftCardStats(): Promise<GiftCardStats> {
  const [r] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW()))::int AS active_count,
      COALESCE(SUM(value_ngn) FILTER (WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())), 0)::bigint AS active_ngn,
      COUNT(*) FILTER (WHERE status = 'redeemed')::int AS redeemed_count,
      COALESCE(SUM(value_ngn) FILTER (WHERE status = 'redeemed'), 0)::bigint AS redeemed_ngn,
      COUNT(*) FILTER (WHERE status = 'void')::int AS void_count,
      COUNT(*) FILTER (WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= NOW())::int AS expired_count
    FROM gift_cards
  `;
  return {
    activeCount: Number(r?.active_count ?? 0),
    activeNgn: Number(r?.active_ngn ?? 0),
    redeemedCount: Number(r?.redeemed_count ?? 0),
    redeemedNgn: Number(r?.redeemed_ngn ?? 0),
    voidCount: Number(r?.void_count ?? 0),
    expiredCount: Number(r?.expired_count ?? 0),
  };
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Emails the code to the card's recipient. Returns false (with a reason) rather than throwing so
 * the desk can issue a card even when mail is down and resend later.
 */
export async function sendGiftCardEmail(card: GiftCard, opts: { message?: string | null } = {}): Promise<{ sent: boolean; error?: string }> {
  if (!card.recipientEmail) return { sent: false, error: 'This card has no recipient email.' };
  if (card.status !== 'active') return { sent: false, error: 'Only an active card can be sent.' };
  const expiry = card.expiresAt
    ? `<p style="margin:12px 0 0;font-size:13px;color:#6b6763;">Use it before ${new Date(card.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>`
    : '';
  const { subject, html } = genericNoticeEmail({
    title: `A ${formatNgn(card.valueNgn)} Convivia24 gift card`,
    subject: `Your ${formatNgn(card.valueNgn)} Convivia24 gift card`,
    greeting: `Hi ${escapeHtml(card.recipientName || 'there')},`,
    bodyHtml: `
      ${opts.message ? `<p style="margin:0 0 16px;line-height:1.55;font-size:15px;color:#3a3532;">${escapeHtml(opts.message)}</p>` : ''}
      <p style="margin:0 0 8px;font-size:15px;color:#3a3532;">Here is your gift card code. Enter it at checkout and the value comes straight off your order.</p>
      <p style="margin:16px 0;padding:14px 18px;background:#f6f1ea;border-radius:12px;font-family:ui-monospace,Menlo,monospace;font-size:22px;letter-spacing:0.08em;font-weight:700;color:#0a0a0a;text-align:center;">${card.code}</p>
      <p style="margin:0;font-size:15px;color:#3a3532;">Worth <strong>${formatNgn(card.valueNgn)}</strong> · single use.</p>
      ${expiry}
      <p style="margin:18px 0 0;font-size:14px;"><a href="${appUrl()}/shop" style="color:#c2410c;font-weight:700;">Shop drinks →</a></p>
    `,
  });
  const result = await sendEmail({ to: card.recipientEmail, subject, html });
  if (result.sent) await sql`UPDATE gift_cards SET sent_at = NOW() WHERE id = ${card.id}`.catch(() => {});
  return { sent: result.sent, error: result.error };
}

export async function listGiftCards(limit = 100): Promise<GiftCard[]> {
  const rows = await sql`SELECT * FROM gift_cards ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(mapRow);
}

/**
 * Voids an unspent card. A redeemed card is left alone — its value is already inside an order
 * and the row is the audit trail for that. Returns false when nothing was voidable.
 */
export async function voidGiftCard(id: string): Promise<boolean> {
  const rows = await sql`
    UPDATE gift_cards SET status = 'void' WHERE id = ${id} AND status = 'active' RETURNING id
  `;
  return rows.length > 0;
}

export async function listGiftCardsIssuedBy(issuedBy: string, limit = 30): Promise<GiftCard[]> {
  const rows = await sql`
    SELECT * FROM gift_cards WHERE issued_by = ${issuedBy} ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(mapRow);
}

/**
 * Atomically claims a card for one order. The guarded UPDATE is the actual
 * security boundary — a code only pays out if a matching, still-active row
 * exists server-side, so it can't be fabricated client-side.
 */
export async function redeemGiftCardForOrder(
  code: string,
  orderId: string
): Promise<{ id: string; valueNgn: number } | { error: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { error: 'Enter a gift card code.' };
  const rows = await sql`
    UPDATE gift_cards
    SET status = 'redeemed', redeemed_order_id = ${orderId}, redeemed_at = NOW()
    WHERE code = ${normalized} AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
    RETURNING id, value_ngn
  `;
  if (rows.length === 0) {
    const [existing] = await sql`SELECT status, expires_at FROM gift_cards WHERE code = ${normalized} LIMIT 1`;
    if (!existing) return { error: 'Gift card code not found.' };
    if (existing.status === 'redeemed') return { error: 'This gift card has already been used.' };
    if (existing.status === 'active' && existing.expires_at) return { error: 'This gift card has expired.' };
    return { error: 'This gift card is no longer valid.' };
  }
  return { id: rows[0].id as string, valueNgn: Number(rows[0].value_ngn) };
}

/** Releases a card back to active if its order never completed (e.g. checkout failed). */
export async function releaseGiftCard(orderId: string): Promise<void> {
  await sql`
    UPDATE gift_cards SET status = 'active', redeemed_order_id = NULL, redeemed_at = NULL
    WHERE redeemed_order_id = ${orderId} AND status = 'redeemed'
  `;
}
