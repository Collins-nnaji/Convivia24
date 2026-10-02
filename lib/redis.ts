// Upstash Redis client (lazy) + small fixed-window rate limiter.
// Degrades gracefully: when Upstash isn't configured, all checks pass and
// every call is a no-op so the app keeps working in dev / preview.

import { Redis } from '@upstash/redis';

let _redis: Redis | null | undefined;

export function redis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) { _redis = null; return null; }
  try {
    _redis = new Redis({ url, token });
  } catch {
    _redis = null;
  }
  return _redis;
}

export function redisConfigured(): boolean {
  return redis() !== null;
}

export interface RateLimit { ok: boolean; remaining: number; resetAt: number }

// A bounded per-instance fallback for non-sensitive endpoints when Redis is unavailable.
const localLimits = new Map<string, { count: number; resetAt: number }>();
function localRateLimit(key: string, limit: number, windowSeconds: number): RateLimit {
  const now = Date.now();
  for (const [storedKey, entry] of localLimits) {
    if (entry.resetAt <= now) localLimits.delete(storedKey);
  }
  let entry = localLimits.get(key);
  if (!entry) {
    if (localLimits.size >= 10000) return { ok: false, remaining: 0, resetAt: now + windowSeconds * 1000 };
    entry = { count: 0, resetAt: now + windowSeconds * 1000 };
    localLimits.set(key, entry);
  }
  entry.count++;
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}

/**
 * Allow `limit` requests per `windowSeconds` for `key`. Returns ok=true when
 * Upstash isn't configured (so requests aren't accidentally blocked in dev).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number, options?: { fallback?: 'local' }): Promise<RateLimit> {
  const unavailable = () => options?.fallback === 'local'
    ? localRateLimit(key, limit, windowSeconds)
    : { ok: process.env.NODE_ENV !== 'production', remaining: 0, resetAt: Date.now() + windowSeconds * 1000 };
  const r = redis();
  if (!r && options?.fallback === 'local') return unavailable();
  if (!r) return { ok: process.env.NODE_ENV !== 'production', remaining: process.env.NODE_ENV === 'production' ? 0 : limit, resetAt: Date.now() + windowSeconds * 1000 };
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const k = `rl:${key}:${window}`;
  try {
    const count = await r.incr(k);
    if (count === 1) await r.expire(k, windowSeconds);
    const ok = count <= limit;
    // Daily route counters for the admin analytics desk — never await so RL stays fast.
    void import('@/lib/analytics/api-usage')
      .then(({ recordApiUsage }) => recordApiUsage(key, !ok))
      .catch(() => {});
    return {
      ok,
      remaining: Math.max(0, limit - count),
      resetAt: (window + 1) * windowSeconds * 1000,
    };
  } catch {
    return unavailable();
  }
}

/** Pull a client IP for rate-limit keys; falls back to a static bucket. */
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip')
      ?? 'global';
}

/** Tiny key-value cache with TTL. Safe to use unconditionally. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = redis(); if (!r) return null;
  try { return (await r.get<T>(key)) ?? null; } catch { return null; }
}
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const r = redis(); if (!r) return;
  try { await r.set(key, value, { ex: ttlSeconds }); } catch { /* ignore */ }
}
