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

/**
 * Allow `limit` requests per `windowSeconds` for `key`. Returns ok=true when
 * Upstash isn't configured (so requests aren't accidentally blocked in dev).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimit> {
  const r = redis();
  if (!r) return { ok: true, remaining: limit, resetAt: 0 };
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const k = `rl:${key}:${window}`;
  try {
    const count = await r.incr(k);
    if (count === 1) await r.expire(k, windowSeconds);
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: (window + 1) * windowSeconds * 1000,
    };
  } catch {
    return { ok: true, remaining: limit, resetAt: 0 };
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
