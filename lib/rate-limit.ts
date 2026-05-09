import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

const limiters: Record<string, Ratelimit> = {};

function getLimiter(key: string, requests: number, windowSeconds: number): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  const cacheKey = `${key}:${requests}:${windowSeconds}`;
  if (!limiters[cacheKey]) {
    limiters[cacheKey] = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
      prefix: `rl:${key}`,
    });
  }
  return limiters[cacheKey];
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon'
  );
}

/** Apply rate limit. Returns a 429 NextResponse if exceeded, or null if allowed. */
export async function rateLimit(
  req: NextRequest,
  key: string,
  requests = 10,
  windowSeconds = 60,
): Promise<NextResponse | null> {
  const limiter = getLimiter(key, requests, windowSeconds);
  if (!limiter) return null; // No Redis configured — allow all

  const ip = getIp(req);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }
  return null;
}
