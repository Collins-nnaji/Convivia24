import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const mocks = vi.hoisted(() => ({ user: vi.fn(), record: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({ getCurrentUser: mocks.user }));
vi.mock('@/lib/audit/record', () => ({ recordAudit: mocks.record }));
import { withAudit } from '@/lib/audit/route';
const user = { id: 'neon-user', email: 'owner@example.com', name: 'Owner', image: null };
beforeEach(() => { vi.clearAllMocks(); mocks.user.mockResolvedValue(user); mocks.record.mockResolvedValue(undefined); });
const request = (body: unknown) => new NextRequest('https://convivia24.com/api/admin/inventory?token=never-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('server activity recording', () => {
  it('records the authenticated actor, action, record and result while preserving the request', async () => {
    const original = { action: 'adjust', slug: 'drink-one', priceNgn: 12000, password: 'secret', email: 'spoof@example.com' };
    const handler = vi.fn(async (req: Request) => { expect(await req.json()).toEqual(original); return NextResponse.json({ ok: true }); });
    const response = await withAudit('/api/admin/inventory', handler)(request(original));
    expect(response.status).toBe(200);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ user, action: 'POST /api/admin/inventory (adjust)', subject: 'drink-one', status: 200 }));
    expect(JSON.stringify(mocks.record.mock.calls)).not.toContain('secret');
    expect(JSON.stringify(mocks.record.mock.calls)).not.toContain('spoof@example.com');
    expect(JSON.stringify(mocks.record.mock.calls)).not.toContain('never-log');
  });
  it('records rejected actions as rejected HTTP responses', async () => {
    await withAudit('/api/admin/inventory', async (_req: Request) => NextResponse.json({ error: 'Denied' }, { status: 403 }))(request({}));
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });
  it('preserves an exception and records a server error', async () => {
    const error = new Error('Business failure');
    await expect(withAudit('/api/orders', async (_req: Request): Promise<Response> => { throw error; })(request({}))).rejects.toBe(error);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
  });
  it('leaves large request bodies available to the business handler', async () => {
    const body = { action: 'adjust', description: 'x'.repeat(20000) };
    await withAudit('/api/admin/inventory', async (req: Request) => { expect(await req.json()).toEqual(body); return NextResponse.json({}); })(request(body));
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'POST /api/admin/inventory' }));
  });
  it('uses the upstream identity for a new sign-in and preserves its session cookie', async () => {
    mocks.user.mockResolvedValue(null);
    const response = NextResponse.json({ user, session: { token: 'private-session-token' } });
    response.cookies.set('session', 'private-cookie');
    const handler = withAudit('/api/auth/[...path]', async (_req: Request) => response, 'auth');
    expect(await handler(new NextRequest('https://convivia24.com/api/auth/sign-in/email', { method: 'POST' }))).toBe(response);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ user, action: 'auth.sign-in/email' }));
    expect(JSON.stringify(mocks.record.mock.calls)).not.toContain('private-');
  });
  it('deduplicates session observations by a non-secret hash', async () => {
    const handler = withAudit('/api/auth/[...path]', async (_req: Request) => NextResponse.json({ user, session: { id: 'session-123', token: 'private' } }), 'auth');
    await handler(new NextRequest('https://convivia24.com/api/auth/get-session'));
    await handler(new NextRequest('https://convivia24.com/api/auth/get-session'));
    const [first, second] = mocks.record.mock.calls.map(call => call[0]);
    expect(first.action).toBe('auth.session.observed');
    expect(first.eventKey).toMatch(/^session:[a-f0-9]{64}$/);
    expect(first.eventKey).toBe(second.eventKey);
    expect(JSON.stringify(first)).not.toContain('session-123');
  });
  it('does not log signed-out session polling as a login', async () => {
    mocks.user.mockResolvedValue(null);
    await withAudit('/api/auth/[...path]', async (_req: Request) => NextResponse.json(null), 'auth')(new NextRequest('https://convivia24.com/api/auth/get-session'));
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
