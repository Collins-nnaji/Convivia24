import { NextRequest, NextResponse } from 'next/server';

// Transparent same-origin reverse proxy to the Neon Auth (Better Auth) server.
// Lets the browser talk to /api/auth/* so session cookies are first-party.
// Configure Neon Auth's trusted origin / redirect URLs to this app's domain.

const BASE = process.env.NEON_AUTH_BASE_URL?.replace(/\/$/, '') || '';

// Hop-by-hop / host headers we must not forward upstream.
const STRIP_REQUEST = new Set(['host', 'connection', 'content-length', 'accept-encoding']);

async function proxy(req: NextRequest, path: string[]) {
  if (!BASE) {
    return NextResponse.json({ error: 'Authentication is not configured.' }, { status: 503 });
  }

  const url = new URL(req.url);
  const target = `${BASE}/${path.join('/')}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) headers.set(key, value);
  });

  const method = req.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, { method, headers, body, redirect: 'manual' });
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable.' }, { status: 502 });
  }

  // Build the response, passing through status, body and (domain-stripped) cookies.
  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'set-cookie' || k === 'content-encoding' || k === 'transfer-encoding' || k === 'connection') return;
    resHeaders.set(key, value);
  });

  // Re-issue cookies first-party (drop the upstream Domain attribute).
  const setCookies = typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : [];
  for (const cookie of setCookies) {
    resHeaders.append('set-cookie', cookie.replace(/;\s*Domain=[^;]+/i, ''));
  }

  const payload = await upstream.arrayBuffer();
  return new NextResponse(payload, { status: upstream.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };
const run = async (req: NextRequest, { params }: Ctx) => proxy(req, (await params).path ?? []);

export const GET = run;
export const POST = run;
export const PUT = run;
export const PATCH = run;
export const DELETE = run;
export const OPTIONS = run;
