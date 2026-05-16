import { NextRequest, NextResponse } from 'next/server';
import { forwardSetCookies } from '@/lib/auth/middleware-cookies';
import {
  extractNeonAuthCookieHeader,
  NEON_AUTH_HEADER_MIDDLEWARE,
  NEON_AUTH_SESSION_CHALLENGE_COOKIE,
  NEON_AUTH_SESSION_VERIFIER_PARAM,
} from '@/lib/auth/neon-cookies';

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

function getOrigin(request: NextRequest): string {
  return (
    request.headers.get('origin') ||
    request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
    request.nextUrl.origin
  );
}

function prepareUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  for (const h of PROXY_HEADER_NAMES) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set('Origin', getOrigin(request));
  headers.set('Cookie', extractNeonAuthCookieHeader(request.headers.get('cookie')));
  headers.set(NEON_AUTH_HEADER_MIDDLEWARE, 'true');
  return headers;
}

async function neonGetSession(
  request: NextRequest,
  search: string,
): Promise<Response | null> {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!baseUrl) {
    console.error('[auth middleware] NEON_AUTH_BASE_URL is not set');
    return null;
  }

  const upstream = new URL(`${baseUrl.replace(/\/+$/, '')}/get-session`);
  upstream.search = search;

  try {
    return await fetch(upstream.toString(), {
      method: 'GET',
      headers: prepareUpstreamHeaders(request),
    });
  } catch (e) {
    console.error('[auth middleware] get-session failed', e);
    return null;
  }
}

/** Finalize Google OAuth: exchange verifier for session cookies. */
async function exchangeOAuthSessionIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  if (!request.nextUrl.searchParams.has(NEON_AUTH_SESSION_VERIFIER_PARAM)) return null;
  if (!request.cookies.get(NEON_AUTH_SESSION_CHALLENGE_COOKIE)) return null;

  const upstreamResponse = await neonGetSession(request, request.nextUrl.search);
  if (!upstreamResponse?.ok) {
    console.warn('[auth middleware] OAuth get-session returned', upstreamResponse?.status);
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.searchParams.delete(NEON_AUTH_SESSION_VERIFIER_PARAM);
  const res = NextResponse.redirect(redirectUrl);
  forwardSetCookies(upstreamResponse, res);
  return res;
}

/** Refresh session cookies on document navigations (helps SSR neonAuth see the session). */
async function refreshSessionCookiesIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  if (AUTH_SKIP_PREFIXES.some((p) => request.nextUrl.pathname.startsWith(p))) return null;

  const accept = request.headers.get('accept') ?? '';
  if (!accept.includes('text/html')) return null;

  const hasNeonCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('__Secure-neon-auth'));
  if (!hasNeonCookie) return null;

  const upstreamResponse = await neonGetSession(request, '');
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
