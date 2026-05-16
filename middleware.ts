import { NextRequest, NextResponse } from 'next/server';
import { forwardSetCookies } from '@/lib/auth/middleware-cookies';

/**
 * Neon Auth OAuth callback: finalize session cookies after Google redirect.
 * Uses the app's /api/auth/get-session proxy so cookies match the app domain.
 */
const NEON_AUTH_SESSION_VERIFIER_PARAM = 'neon_auth_session_verifier';
/** Neon upstream spelling (typo preserved). */
const NEON_AUTH_SESSION_CHALLENGE_COOKIE = '__Secure-neon-auth.session_challange';
const NEON_AUTH_COOKIE_PREFIX = '__Secure-neon-auth';
const NEON_AUTH_HEADER_MIDDLEWARE = 'X-Neon-Auth-Next-Middleware';

const PROXY_HEADER_NAMES = ['user-agent', 'authorization', 'referer', 'content-type'] as const;

const AUTH_SKIP_PREFIXES = [
  '/api/auth',
  '/auth/callback',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/magic-link',
  '/auth/email-otp',
  '/auth/forgot-password',
];

function hasNeonAuthCookies(request: NextRequest): boolean {
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith(NEON_AUTH_COOKIE_PREFIX)) return true;
  }
  return false;
}

function getOrigin(request: NextRequest): string {
  return (
    request.headers.get('origin') ||
    request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
    request.nextUrl.origin
  );
}

function prepareAuthProxyHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  for (const h of PROXY_HEADER_NAMES) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set('Origin', getOrigin(request));
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('Cookie', cookie);
  headers.set(NEON_AUTH_HEADER_MIDDLEWARE, 'true');
  return headers;
}

async function proxyGetSession(
  request: NextRequest,
  search?: string,
): Promise<Response | null> {
  const sessionUrl = new URL('/api/auth/get-session', request.nextUrl.origin);
  if (search !== undefined) sessionUrl.search = search;
  else sessionUrl.search = request.nextUrl.search;

  try {
    return await fetch(sessionUrl.toString(), {
      method: 'GET',
      headers: prepareAuthProxyHeaders(request),
    });
  } catch (e) {
    console.error('[auth middleware] get-session proxy failed', e);
    return null;
  }
}

/** Complete OAuth: exchange verifier for session cookies, then strip verifier from URL. */
async function exchangeOAuthSessionIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  if (!request.nextUrl.searchParams.has(NEON_AUTH_SESSION_VERIFIER_PARAM)) return null;
  if (!request.cookies.get(NEON_AUTH_SESSION_CHALLENGE_COOKIE)) return null;

  const upstreamResponse = await proxyGetSession(request);
  if (!upstreamResponse?.ok) return null;

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.searchParams.delete(NEON_AUTH_SESSION_VERIFIER_PARAM);
  const res = NextResponse.redirect(redirectUrl);
  forwardSetCookies(upstreamResponse, res);
  return res;
}

/**
 * Refresh session cookies on HTML navigations when auth cookies exist.
 * Helps SSR (neonAuth) and the client see the same signed-in state without gating public pages.
 */
async function refreshSessionCookiesIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  if (!hasNeonAuthCookies(request)) return null;
  if (AUTH_SKIP_PREFIXES.some((p) => request.nextUrl.pathname.startsWith(p))) return null;

  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/html')) return null;

  const upstreamResponse = await proxyGetSession(request, '');
  if (!upstreamResponse?.ok) return null;

  const res = NextResponse.next();
  forwardSetCookies(upstreamResponse, res);
  return res;
}

export default async function middleware(request: NextRequest) {
  const oauthRedirect = await exchangeOAuthSessionIfNeeded(request);
  if (oauthRedirect) return oauthRedirect;

  const refreshed = await refreshSessionCookiesIfNeeded(request);
  if (refreshed) return refreshed;

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
