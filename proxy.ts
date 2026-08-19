import { NextRequest, NextResponse } from 'next/server';
import { AGE_GATE_COOKIE, verifyAgeToken } from '@/lib/age-gate';

/**
 * Enforces the 18+ gate server-side — a request without a valid signed
 * cookie never reaches a gated page's markup or data, unlike the old
 * client-side overlay that rendered the page underneath it regardless.
 * Also stamps baseline security headers on every response.
 */
export async function proxy(req: NextRequest) {
  const token = req.cookies.get(AGE_GATE_COOKIE)?.value;
  const verified = await verifyAgeToken(token);

  let res: NextResponse;
  if (!verified) {
    const url = req.nextUrl.clone();
    url.pathname = '/age-check';
    url.search = '';
    url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    res = NextResponse.redirect(url);
  } else {
    res = NextResponse.next();
  }

  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-Frame-Options', 'DENY');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|admin|age-check|terms|privacy|.*\\..*).*)'],
};
