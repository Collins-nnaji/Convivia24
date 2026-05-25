'use client';

/** Full page navigation so session cookies apply (client router.push often misses this). */
export function navigateAfterAuth(path: string) {
  if (typeof window === 'undefined') return;
  const target = path.startsWith('http') ? path : `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  window.location.assign(target);
}

export function resolveAuthNextPath(
  params: URLSearchParams | string | null | undefined,
  fallback = '/',
): string {
  let next: string | null = null;
  if (params instanceof URLSearchParams) {
    next = params.get('next');
  } else if (typeof params === 'string' && params.length > 0) {
    const qs = params.startsWith('?') ? params : `?${params}`;
    next = new URLSearchParams(qs).get('next');
  }
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
}
