import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ incr: vi.fn(), expire: vi.fn() }));
vi.mock('@upstash/redis', () => ({ Redis: class { incr = mocks.incr; expire = mocks.expire; } }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); vi.clearAllMocks(); });

async function route(redisConfigured: boolean) {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('NEON_AUTH_COOKIE_SECRET', 'age-test-secret-with-at-least-32-characters');
  vi.stubEnv('UPSTASH_REDIS_REST_URL', redisConfigured ? 'https://redis.example.com' : '');
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', redisConfigured ? 'test-token' : '');
  return (await import('../app/api/age-gate/route')).POST;
}
const request = () => new NextRequest('https://convivia24.com/api/age-gate', { method: 'POST', headers: { 'x-forwarded-for': '192.0.2.50' } });

describe('age confirmation availability', () => {
  it('sets a valid signed cookie when Redis is unavailable and still limits repeated attempts', async () => {
    mocks.incr.mockRejectedValue(new Error('Redis unavailable'));
    const POST = await route(true);
    const response = await POST(request());
    expect(response.status).toBe(200);
    const cookie = response.cookies.get('convivia_age_verified');
    const { verifyAgeToken } = await import('../lib/age-gate');
    expect(await verifyAgeToken(cookie?.value)).toBe(true);
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    for (let i = 1; i < 20; i++) expect((await POST(request())).status).toBe(200);
    const limited = await POST(request());
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBeTruthy();
    expect(limited.cookies.get('convivia_age_verified')).toBeUndefined();
  });

  it('allows confirmation when Redis is not configured', async () => {
    const POST = await route(false);
    expect((await POST(request())).status).toBe(200);
  });

  it('preserves the real Redis attempt limit', async () => {
    mocks.incr.mockResolvedValue(21);
    const POST = await route(true);
    expect((await POST(request())).status).toBe(429);
  });

  it('keeps sensitive endpoints closed when Redis fails', async () => {
    mocks.incr.mockRejectedValue(new Error('Redis unavailable'));
    await route(true);
    const { rateLimit } = await import('../lib/redis');
    expect((await rateLimit('checkout:test', 20, 60)).ok).toBe(false);
  });
});
