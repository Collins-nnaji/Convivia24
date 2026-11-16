// Upstash Redis client (lazy) + small fixed-window rate limiter.
// Degrades gracefully: when Upstash isn't configured, all checks pass and
// every call is a no-op so the app keeps working in dev / preview.

import { Redis } from '@upstash/redis';

let _redis: Redis | null | undefined;

/**
 * Circuit breaker. The Upstash client's default retry policy waits ~4.3s before a network
 * failure surfaces, and a cache is only worth having if it is faster than the database it
 * fronts. After one failure Redis is skipped entirely for a short cool-down.
 */
const REDIS_TIMEOUT_MS = 800;
const COOL_DOWN_MS = 30_000;
let downUntil = 0;

export function markRedisDown(): void {
  downUntil = Date.now() + COOL_DOWN_MS;
}

function client(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) { _redis = null; return null; }
  try {
    _redis = new Redis({ url, token, retry: { retries: 1, backoff: () => 50 } });
  } catch {
    _redis = null;
  }
  return _redis;
}

/** The client, or null when unconfigured or inside the cool-down after a failure. */
export function redis(): Redis | null {
  if (Date.now() < downUntil) return null;
  return client();
}

export function redisConfigured(): boolean {
  return client() !== null;
}

/** Run one Redis call with a hard time cap; any failure trips the breaker and rejects. */
async function guarded<T>(op: (r: Redis) => Promise<T>, timeoutMs = REDIS_TIMEOUT_MS): Promise<T> {
  const r = redis();
  if (!r) throw new Error('redis unavailable');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      op(r),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('redis timeout')), timeoutMs);
      }),
    ]);
  } catch (err) {
    markRedisDown();
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
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
 * Allow `limit` requests per `windowSeconds` for `key`.
 *
 * - Redis deliberately not configured: production enforces the same limit per server instance in
 *   memory (an operator choice to run without it must not lock every shopper out); dev allows all.
 * - Redis configured but failing: sensitive callers fail closed in production; callers passing
 *   `fallback: 'local'` (public reads, the age gate) use the in-memory limit instead.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  options?: { fallback?: 'local'; timeoutMs?: number },
): Promise<RateLimit> {
  const prod = process.env.NODE_ENV === 'production';
  if (!redisConfigured()) {
    return options?.fallback === 'local' || prod
      ? localRateLimit(key, limit, windowSeconds)
      : { ok: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }
  const unavailable = (): RateLimit =>
    options?.fallback === 'local'
      ? localRateLimit(key, limit, windowSeconds)
      : { ok: !prod, remaining: 0, resetAt: Date.now() + windowSeconds * 1000 };
  const r = redis();
  if (!r) return unavailable();
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const k = `rl:${key}:${window}`;
  try {
    // Latency-sensitive callers cap the Redis round trips and fall back rather than make a person wait.
    const count = await guarded(async (c) => {
      const n = await c.incr(k);
      if (n === 1) await c.expire(k, windowSeconds);
      return n;
    }, Math.min(options?.timeoutMs ?? REDIS_TIMEOUT_MS, REDIS_TIMEOUT_MS));
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
  try { return (await guarded((r) => r.get<T>(key))) ?? null; } catch { return null; }
}
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try { await guarded((r) => r.set(key, value, { ex: ttlSeconds })); } catch { /* ignore */ }
}
