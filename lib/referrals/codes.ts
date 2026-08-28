/** Referral code shape and money maths. Pure — no DB, safe on the client. */

/** Unambiguous alphabet: no O/0, I/1, S/5 — codes get read aloud and written on napkins. */
const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789';

export const CODE_MIN = 4;
export const CODE_MAX = 16;
export const DEFAULT_COMMISSION_PCT = 2.5;
export const MAX_COMMISSION_PCT = 25;

export function isValidCode(code: string): boolean {
  return new RegExp(`^[A-Z0-9]{${CODE_MIN},${CODE_MAX}}$`).test(code);
}

/** Uppercase and strip anything that is not A–Z or 0–9. Returns '' when nothing usable is left. */
export function normaliseCode(raw: string): string {
  const cleaned = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_MAX);
  return cleaned.length >= CODE_MIN ? cleaned : '';
}

/** A code seeded from the partner's name, so it is recognisable rather than random noise. */
export function suggestCode(name: string, randomPart = 3): string {
  const stem = String(name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  let suffix = '';
  for (let i = 0; i < randomPart; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  const code = `${stem}${suffix}`;
  return code.length >= CODE_MIN ? code.slice(0, CODE_MAX) : `REF${suffix}`;
}

export function clampCommissionPct(pct: number): number {
  const n = Number(pct);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MAX_COMMISSION_PCT, Math.round(n * 10) / 10);
}

/**
 * Commission on an order. Always computed from money actually collected — the caller passes the
 * paid total less any refund, never the pre-discount subtotal.
 */
export function commissionNgn(collectedNgn: number, commissionPct: number): number {
  const total = Number(collectedNgn);
  const pct = clampCommissionPct(commissionPct);
  if (!Number.isFinite(total) || total <= 0 || pct <= 0) return 0;
  return Math.round((total * pct) / 100);
}

/** The share link a partner gives out. */
export function referralUrl(origin: string, code: string): string {
  const base = String(origin || '').replace(/\/$/, '');
  return `${base}/?ref=${encodeURIComponent(code)}`;
}
