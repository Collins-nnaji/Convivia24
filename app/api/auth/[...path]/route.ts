import { getAuth } from '@/lib/auth/server';
import type { NextRequest } from 'next/server';

function rewriteCookiePath(cookie: string) {
  const parts = cookie.split(';').map((part) => part.trim());
  let hasPath = false;
  const updated = parts.map((part) => {
    if (part.toLowerCase().startsWith('path=')) {
      hasPath = true;
      return 'Path=/';
    }
    return part;
  });
  if (!hasPath) updated.push('Path=/');
  return updated.join('; ');
}

// Next.js 15: context.params is Promise<{ path: string[] }> for [...path]
type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { GET: handler } = getAuth().handler();
  const params = await context.params;
  const response = await handler(request, { params } as any);
  const setCookies = (response.headers as any).getSetCookie?.() ?? [];
  if (setCookies.length === 0) return response;

  const headers = new Headers(response.headers);
  headers.delete('set-cookie');
  for (const cookie of setCookies) {
    headers.append('set-cookie', rewriteCookiePath(cookie));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { POST: handler } = getAuth().handler();
  const params = await context.params;
  const response = await handler(request, { params } as any);
  const setCookies = (response.headers as any).getSetCookie?.() ?? [];
  if (setCookies.length === 0) return response;

  const headers = new Headers(response.headers);
  headers.delete('set-cookie');
  for (const cookie of setCookies) {
    headers.append('set-cookie', rewriteCookiePath(cookie));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
