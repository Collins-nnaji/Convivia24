import { randomBytes } from 'crypto';
import sql from '@/lib/db';

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

export async function issueGiftCard(issuedBy: string, valueNgn: number, note?: string | null): Promise<GiftCard> {
  const code = generateCode();
  const rows = await sql`
    INSERT INTO gift_cards (code, value_ngn, issued_by, note)
    VALUES (${code}, ${Math.max(1, Math.floor(valueNgn))}, ${issuedBy}, ${note || null})
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function listGiftCards(limit = 100): Promise<GiftCard[]> {
  const rows = await sql`SELECT * FROM gift_cards ORDER BY created_at DESC LIMIT ${limit}`;
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
    WHERE code = ${normalized} AND status = 'active'
    RETURNING id, value_ngn
  `;
  if (rows.length === 0) {
    const [existing] = await sql`SELECT status FROM gift_cards WHERE code = ${normalized} LIMIT 1`;
    if (!existing) return { error: 'Gift card code not found.' };
    return { error: existing.status === 'redeemed' ? 'This gift card has already been used.' : 'This gift card is no longer valid.' };
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
