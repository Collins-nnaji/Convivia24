import { NextRequest, NextResponse } from 'next/server';
import { AGE_GATE_COOKIE, verifyAgeToken } from '@/lib/age-gate';
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from '@/lib/referrals/cookie';
import { normaliseCode } from '@/lib/referrals/codes';

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

  // Capture ?ref=CODE on any landing page, before the age gate can redirect it away. Last link
  // wins, which is the convention partners expect.
  const ref = normaliseCode(req.nextUrl.searchParams.get('ref') || '');
  if (ref && ref !== req.cookies.get(REFERRAL_COOKIE)?.value) {
    res.cookies.set(REFERRAL_COOKIE, ref, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: REFERRAL_COOKIE_MAX_AGE,
    });
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
