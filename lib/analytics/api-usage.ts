/**
 * Lightweight API hit counters keyed off rate-limit buckets.
 * Every `rateLimit()` call also records a daily hit (and optionally a block)
 * so the admin analytics desk can show route traffic without a full request log.
 */

import type { ApiDayStat, ApiRouteStat, ApiUsageReport } from '@/lib/analytics/types';
import { redis, redisConfigured } from '@/lib/redis';

export type { ApiDayStat, ApiRouteStat, ApiUsageReport };

const HIT_TTL_SECONDS = 60 * 60 * 24 * 45;
const LAGOS = 'Africa/Lagos';

/** Lagos calendar day as YYYY-MM-DD. */
export function lagosDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LAGOS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Strip the per-client suffix from a rate-limit key so we aggregate by route.
 * `orders:create:1.2.3.4` → `orders:create`, `admin:global` → `admin`.
 */
export function apiRouteBucket(rateLimitKey: string): string {
  const parts = rateLimitKey.split(':').filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'unknown';
  const last = parts[parts.length - 1]!;
  const looksLikeClient =
    last === 'global' ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(last) ||
    last.includes('.') ||
    /^[0-9a-f-]{8,}$/i.test(last);
  if (looksLikeClient) {
    const route = parts.slice(0, -1).join(':');
    return route || parts[0]!;
  }
  return parts.join(':');
}

function addLagosDays(dayKey: string, delta: number): string {
  const base = new Date(`${dayKey}T12:00:00+01:00`);
  return lagosDayKey(new Date(base.getTime() + delta * 86_400_000));
}

/** Fire-and-forget recording from `rateLimit`. Never throws to callers. */
export async function recordApiUsage(rateLimitKey: string, blocked: boolean): Promise<void> {
  const r = redis();
  if (!r) return;
  const route = apiRouteBucket(rateLimitKey);
  const day = lagosDayKey();
  try {
    const pipe = r.pipeline();
    pipe.incr(`apihits:${day}:${route}`);
    pipe.expire(`apihits:${day}:${route}`, HIT_TTL_SECONDS);
    pipe.sadd(`apihits:routes:${day}`, route);
    pipe.expire(`apihits:routes:${day}`, HIT_TTL_SECONDS);
    if (blocked) {
      pipe.incr(`apiblock:${day}:${route}`);
      pipe.expire(`apiblock:${day}:${route}`, HIT_TTL_SECONDS);
    }
    await pipe.exec();
  } catch {
    /* analytics must never break the request path */
  }
}

export async function readApiUsage(dayCount: number): Promise<ApiUsageReport> {
  if (!redisConfigured()) {
    return { configured: false, totalHits: 0, totalBlocked: 0, routes: [], days: [] };
  }
  const r = redis();
  if (!r) {
    return { configured: false, totalHits: 0, totalBlocked: 0, routes: [], days: [] };
  }

  const days = Math.max(1, Math.min(90, Math.floor(dayCount)));
  const today = lagosDayKey();
  const dayKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) dayKeys.push(addLagosDays(today, -i));

  try {
    const routeSets = await Promise.all(
      dayKeys.map(async (day) => {
        const members = await r.smembers(`apihits:routes:${day}`);
        return { day, routes: (members || []).map(String) };
      })
    );

    const routeTotals = new Map<string, { hits: number; blocked: number }>();
    const dayStats: ApiDayStat[] = [];

    for (const { day, routes } of routeSets) {
      let dayHits = 0;
      let dayBlocked = 0;
      if (routes.length === 0) {
        dayStats.push({ day, hits: 0, blocked: 0 });
        continue;
      }
      const hitKeys = routes.map((route) => `apihits:${day}:${route}`);
      const blockKeys = routes.map((route) => `apiblock:${day}:${route}`);
      const [hits, blocks] = await Promise.all([r.mget<(number | null)[]>(...hitKeys), r.mget<(number | null)[]>(...blockKeys)]);
      routes.forEach((route, i) => {
        const h = Number(hits?.[i] ?? 0) || 0;
        const b = Number(blocks?.[i] ?? 0) || 0;
        dayHits += h;
        dayBlocked += b;
        const prev = routeTotals.get(route) || { hits: 0, blocked: 0 };
        prev.hits += h;
        prev.blocked += b;
        routeTotals.set(route, prev);
      });
      dayStats.push({ day, hits: dayHits, blocked: dayBlocked });
    }

    const routeList = [...routeTotals.entries()]
      .map(([route, v]) => ({ route, hits: v.hits, blocked: v.blocked }))
      .sort((a, b) => b.hits - a.hits);

    return {
      configured: true,
      totalHits: routeList.reduce((s, r) => s + r.hits, 0),
      totalBlocked: routeList.reduce((s, r) => s + r.blocked, 0),
      routes: routeList,
      days: dayStats,
    };
  } catch {
    return { configured: true, totalHits: 0, totalBlocked: 0, routes: [], days: [] };
  }
}

/** Map a period key to how many Lagos days of API counters to load. */
export function apiUsageDaysForPeriod(period: string): number {
  if (period === '7d') return 7;
  if (period === '90d') return 90;
  if (period === 'ytd' || period === 'all') return 90;
  return 30;
}
