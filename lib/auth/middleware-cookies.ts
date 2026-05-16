import { NextResponse } from 'next/server';

/** Forward Set-Cookie headers from an upstream auth response onto a Next.js response. */
export function forwardSetCookies(upstream: Response, target: NextResponse) {
  const rawHeaders = upstream.headers;
  const getSetCookie = (rawHeaders as Headers & { getSetCookie?: () => string[] }).getSetCookie?.bind(
    rawHeaders,
  );
  if (getSetCookie) {
    for (const c of getSetCookie()) {
      target.headers.append('Set-Cookie', c);
    }
    return;
  }
  const single = rawHeaders.get('set-cookie');
  if (single) target.headers.append('Set-Cookie', single);
}
