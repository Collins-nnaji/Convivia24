import { NextRequest, NextResponse } from 'next/server';
import { AGE_GATE_COOKIE, safeNextPath, signAgeToken } from '@/lib/age-gate';
import { rateLimit, clientIp } from '@/lib/redis';

/**
 * Sets the signed, httpOnly age-verification cookie the proxy checks on every gated request.
 *
 * The /age-check page submits a plain HTML form here, so a confirmation is one round trip:
 * the response sets the cookie and 303-redirects straight to the requested page. It works
 * before any JavaScript has loaded. Fetch callers (no form body) still get JSON.
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  const isForm = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
  let next = '/';
  if (isForm) {
    const form = await req.formData().catch(() => null);
    next = safeNextPath(form?.get('next'));
  }

  // Capped so a slow Redis never holds up someone confirming their age.
  const rl = await rateLimit(`age-gate:${clientIp(req)}`, 20, 60, { fallback: 'local', timeoutMs: 400 });
  if (!rl.ok) {
    const retryAfter = String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000)));
    if (isForm) {
      const url = new URL('/age-check', req.url);
      url.searchParams.set('next', next);
      url.searchParams.set('error', 'rate');
      return NextResponse.redirect(url, { status: 303, headers: { 'Retry-After': retryAfter } });
    }
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429, headers: { 'Retry-After': retryAfter } },
    );
  }

  const { value, maxAgeSeconds } = await signAgeToken();
  const res = isForm ? NextResponse.redirect(new URL(next, req.url), 303) : NextResponse.json({ ok: true });
  res.cookies.set(AGE_GATE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
  return res;
}
