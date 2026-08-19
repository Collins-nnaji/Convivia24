import { NextRequest, NextResponse } from 'next/server';
import { AGE_GATE_COOKIE, signAgeToken } from '@/lib/age-gate';
import { rateLimit, clientIp } from '@/lib/redis';

/** Sets the signed, httpOnly age-verification cookie middleware checks on every gated request. */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`age-gate:${clientIp(req)}`, 20, 60);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { value, maxAgeSeconds } = await signAgeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AGE_GATE_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
  return res;
}
