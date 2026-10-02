import { NextRequest, NextResponse } from 'next/server';
import { AGE_GATE_COOKIE, signAgeToken } from '@/lib/age-gate';
import { rateLimit, clientIp } from '@/lib/redis';

/** Sets the signed, httpOnly age-verification cookie middleware checks on every gated request. */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`age-gate:${clientIp(req)}`, 20, 60, { fallback: 'local' });
  if (!rl.ok) return NextResponse.json(
    { error: 'Too many attempts. Please wait a minute and try again.' },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))) } }
  );

  const { value, maxAgeSeconds } = await signAgeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AGE_GATE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
  return res;
}
