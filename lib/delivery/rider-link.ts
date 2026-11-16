import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Rider links: a signed, expiring URL that lets whoever is delivering one order see the drop-off
 * details and mark that order delivered — nothing else, no account needed.
 * Token = base64url(orderId.expiresAtSeconds).base64url(hmac)
 */

export const RIDER_LINK_HOURS = 48;

function secret(): string {
  const s = process.env.RIDER_LINK_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || '';
  if (s.length < 32) throw new Error('Rider links need RIDER_LINK_SECRET (or NEON_AUTH_COOKIE_SECRET) of 32+ characters.');
  return s;
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');
const sign = (payload: string) => createHmac('sha256', secret()).update(`rider-link:${payload}`).digest();

export function createRiderToken(orderId: string, now = Date.now(), hours = RIDER_LINK_HOURS): string {
  const payload = `${orderId}.${Math.floor(now / 1000) + hours * 3600}`;
  return `${b64(payload)}.${b64(sign(payload))}`;
}

/** The order id if the token is genuine and unexpired, otherwise null. */
export function verifyRiderToken(token: string, now = Date.now()): string | null {
  const [p, sig] = String(token || '').split('.');
  if (!p || !sig) return null;
  let payload: string;
  try {
    payload = Buffer.from(p, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = sign(payload);
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const [orderId, exp] = payload.split('.');
  if (!/^[0-9a-f-]{36}$/i.test(orderId || '') || !Number(exp) || Number(exp) * 1000 < now) return null;
  return orderId;
}
