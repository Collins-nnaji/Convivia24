import { NextRequest, NextResponse } from 'next/server';

/**
 * Must match @neondatabase/auth (Neon Auth / Better Auth OAuth callback).
 * Without this, Google can redirect back with ?neon_auth_session_verifier=… while
 * session cookies are only finalized after a server-side get-session exchange.
 */
const NEON_AUTH_SESSION_VERIFIER_PARAM = 'neon_auth_session_verifier';
/** Neon uses this spelling (typo preserved in upstream). */
const NEON_AUTH_SESSION_CHALLENGE_COOKIE = '__Secure-neon-auth.session_challange';
const NEON_AUTH_COOKIE_PREFIX = '__Secure-neon-auth';
const NEON_AUTH_HEADER_MIDDLEWARE = 'X-Neon-Auth-Next-Middleware';

const PROXY_HEADER_NAMES = ['user-agent', 'authorization', 'referer', 'content-type'] as const;

function extractNeonAuthCookies(cookieHeader: string | null): string {
  if (!cookieHeader) return '';
  const parsed = cookieHeader.split(/;\s*/).reduce<Map<string, string>>((acc, part) => {
    const i = part.indexOf('=');
    if (i === -1) return acc;
    const name = part.slice(0, i).trim();
    acc.set(name, part);
    return acc;
  }, new Map());
  const out: string[] = [];
  for (const [name, pair] of parsed) {
    if (name.startsWith(NEON_AUTH_COOKIE_PREFIX)) out.push(pair);
  }
  return out.join('; ');
}

function getOrigin(request: NextRequest): string {
  return (
    request.headers.get('origin') ||
    request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
    request.nextUrl.origin
  );
}

/**
 * Same idea as neonAuthMiddleware’s exchangeOAuthToken: complete OAuth by
 * proxying get-session to Neon with the verifier query + cookies, then attach
 * Set-Cookie and strip the verifier from the URL. Does not gate routes.
 */
async function exchangeOAuthSessionIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) return null;

  const url = request.nextUrl;
  if (!url.searchParams.has(NEON_AUTH_SESSION_VERIFIER_PARAM)) return null;
  if (!request.cookies.get(NEON_AUTH_SESSION_CHALLENGE_COOKIE)) return null;

  const upstream = new URL(`${baseUrl.replace(/\/+$/, '')}/get-session`);
  upstream.search = url.search;

  const headers = new Headers();
  for (const h of PROXY_HEADER_NAMES) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set('Origin', getOrigin(request));
  headers.set('Cookie', extractNeonAuthCookies(request.headers.get('cookie')));
  headers.set(NEON_AUTH_HEADER_MIDDLEWARE, 'true');

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstream.toString(), { method: 'GET', headers });
  } catch (e) {
    console.error('[auth middleware] get-session proxy failed', e);
    return null;
  }

  if (!upstreamResponse.ok) return null;

  const redirectUrl = url.clone();
  redirectUrl.searchParams.delete(NEON_AUTH_SESSION_VERIFIER_PARAM);
  const res = NextResponse.redirect(redirectUrl);

  const rawHeaders = upstreamResponse.headers;
  const getSetCookie = (rawHeaders as Headers & { getSetCookie?: () => string[] }).getSetCookie?.bind(rawHeaders);
  if (getSetCookie) {
    for (const c of getSetCookie()) {
      res.headers.append('Set-Cookie', c);
    }
  } else {
    const single = rawHeaders.get('set-cookie');
    if (single) res.headers.append('Set-Cookie', single);
  }

  return res;
}

export default async function middleware(request: NextRequest) {
  const oauthRedirect = await exchangeOAuthSessionIfNeeded(request);
  if (oauthRedirect) return oauthRedirect;
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
