/** Prefix for all Neon Auth cookies (must match @neondatabase/auth). */
export const NEON_AUTH_COOKIE_PREFIX = '__Secure-neon-auth';

export const NEON_AUTH_SESSION_VERIFIER_PARAM = 'neon_auth_session_verifier';
export const NEON_AUTH_SESSION_CHALLENGE_COOKIE = `${NEON_AUTH_COOKIE_PREFIX}.session_challange`;
export const NEON_AUTH_HEADER_MIDDLEWARE = 'X-Neon-Auth-Next-Middleware';

/** Extract Neon Auth cookies from a raw Cookie header for upstream get-session. */
export function extractNeonAuthCookieHeader(cookieHeader: string | null): string {
  if (!cookieHeader) return '';
  const out: string[] = [];
  for (const part of cookieHeader.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    const name = part.slice(0, i).trim();
    if (name.startsWith(NEON_AUTH_COOKIE_PREFIX)) out.push(part);
  }
  return out.join('; ');
}
