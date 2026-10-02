import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({ middleware: vi.fn(), handler: vi.fn(), age: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ authConfigured: true, auth: { middleware: mocks.middleware } }));
vi.mock('@/lib/age-gate', () => ({ AGE_GATE_COOKIE: 'age', verifyAgeToken: mocks.age }));
import { proxy, config } from '@/proxy';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.middleware.mockReturnValue(mocks.handler);
  mocks.handler.mockResolvedValue(NextResponse.next());
  mocks.age.mockResolvedValue(false);
});

describe('admin Neon login routing', () => {
  it('includes admin pages in the proxy matcher', () => {
    expect(config.matcher).toContain('/admin/:path*');
  });
  it('runs Neon session handling for admin without sending staff to the age gate', async () => {
    const request = new NextRequest('https://convivia24.com/admin');
    await proxy(request);
    expect(mocks.middleware).toHaveBeenCalledWith({ loginUrl: '/signin?next=%2Fadmin' });
    expect(mocks.handler).toHaveBeenCalledWith(request);
    expect(mocks.age).not.toHaveBeenCalled();
  });
  it('exchanges Google callback verifiers on the destination page', async () => {
    const request = new NextRequest('https://convivia24.com/admin?neon_auth_session_verifier=callback');
    const response = NextResponse.redirect('https://convivia24.com/admin');
    response.cookies.set('session', 'new-session');
    mocks.handler.mockResolvedValue(response);
    expect(await proxy(request)).toBe(response);
    expect(mocks.age).not.toHaveBeenCalled();
  });
  it.each(['/signin?next=/admin', '/forgot-password', '/reset-password?token=test', '/verify-email?next=/admin'])('lets staff reach %s without an age cookie', async path => {
    const response = await proxy(new NextRequest('https://convivia24.com' + path));
    expect(response.status).toBe(200);
    expect(mocks.age).not.toHaveBeenCalled();
  });
  it('still gates shop pages', async () => {
    const response = await proxy(new NextRequest('https://convivia24.com/shop'));
    expect(response.headers.get('location')).toBe('https://convivia24.com/age-check?next=%2Fshop');
  });
});
