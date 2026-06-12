import { createHmac, randomBytes } from 'crypto';

const SECRET =
  process.env.NEON_AUTH_COOKIE_SECRET ||
  process.env.ADMIN_SECRET ||
  'convivia24-ticketing-dev-secret';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars

function randomChars(len: number): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Short, human-readable, scannable ticket code, e.g. CV24-7KQM-2PXL */
export function generateTicketCode(): string {
  return `CV24-${randomChars(4)}-${randomChars(4)}`;
}

/** Order reference, e.g. ORD-9F3K2P */
export function generateOrderReference(): string {
  return `ORD-${randomChars(6)}`;
}

/** HMAC signature for a ticket code, used inside the scannable payload. */
export function signTicket(code: string): string {
  return createHmac('sha256', SECRET).update(code).digest('hex').slice(0, 16);
}

/** The string encoded into the QR code: tamper-evident, offline-verifiable. */
export function ticketPayload(code: string): string {
  return `CV24|${code}|${signTicket(code)}`;
}

/** Verify a scanned payload (or a raw code) and return the ticket code if valid. */
export function verifyTicketPayload(raw: string): { code: string; valid: boolean } {
  const trimmed = raw.trim();
  if (trimmed.startsWith('CV24|')) {
    const [, code, sig] = trimmed.split('|');
    return { code, valid: !!code && !!sig && signTicket(code) === sig };
  }
  // Allow scanning / typing the bare code too (e.g. from the printed barcode).
  return { code: trimmed.toUpperCase(), valid: /^CV24-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed.toUpperCase()) };
}
