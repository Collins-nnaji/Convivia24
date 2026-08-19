/**
 * Signed, server-verifiable age verification. The cookie carries an HMAC of
 * its own expiry, keyed off a real app secret when one is configured — so a
 * request can no longer just set `convivia_age_verified=1` in devtools and
 * skip straight past middleware. Enforcement lives in middleware.ts, which
 * calls verifyAgeToken() before letting a request reach a gated page.
 */
export const AGE_GATE_COOKIE = 'convivia_age_verified';
export const AGE_GATE_MAX_AGE_DAYS = 30;

function secret(): string {
  const s = process.env.NEON_AUTH_COOKIE_SECRET;
  // Falls back to a fixed, non-secret string only when no app secret is
  // configured yet (e.g. a fresh local checkout) — real deployments should
  // set NEON_AUTH_COOKIE_SECRET, which this reuses rather than requiring a
  // second dedicated secret env var.
  return s && s.length >= 32 ? s : 'convivia24-age-gate-unconfigured-fallback-secret';
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacHex(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bufToHex(sig);
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signAgeToken(): Promise<{ value: string; maxAgeSeconds: number }> {
  const maxAgeSeconds = AGE_GATE_MAX_AGE_DAYS * 24 * 60 * 60;
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const sig = await hmacHex(String(expiresAt));
  return { value: `${expiresAt}.${sig}`, maxAgeSeconds };
}

export async function verifyAgeToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expiresAtRaw, sig] = token.split('.');
  if (!expiresAtRaw || !sig) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = await hmacHex(expiresAtRaw);
  return timingSafeStringEqual(sig, expected);
}
