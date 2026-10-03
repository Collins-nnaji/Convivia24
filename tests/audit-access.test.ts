import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ admin: vi.fn(), audit: vi.fn(), sessions: vi.fn(), user: vi.fn(), presence: vi.fn(), record: vi.fn(), limit: vi.fn() }));
vi.mock('@/lib/admin', () => ({ requireAdmin: mocks.admin }));
vi.mock('@/lib/audit/read', () => ({ AUDIT_CATEGORIES: ['api', 'auth'], readAudit: mocks.audit, readSignedInUsers: mocks.sessions }));
vi.mock('@/lib/auth/session', () => ({ getCurrentUser: mocks.user }));
vi.mock('@/lib/audit/record', async importOriginal => ({ ...await importOriginal<object>(), recordPresence: mocks.presence, recordAudit: mocks.record }));
vi.mock('@/lib/redis', () => ({ rateLimit: mocks.limit }));
import { GET } from '@/app/api/admin/audit/route';
import { POST } from '@/app/api/activity/route';
beforeEach(() => {
  vi.clearAllMocks(); mocks.admin.mockResolvedValue({ ok: true, role: 'owner' });
  mocks.audit.mockResolvedValue({ entries: [], nextCursor: null }); mocks.sessions.mockResolvedValue({ source: 'neon', users: [], total: 0 });
  mocks.user.mockResolvedValue({ id: 'signed-in-user', email: 'real@example.com', name: null }); mocks.limit.mockResolvedValue({ ok: true });
});
describe('owner-only audit', () => {
  it.each([401, 403])('does not read audit data when access fails with %s', async status => {
    mocks.admin.mockResolvedValue({ ok: false, status, error: 'Denied' });
    expect((await GET(new NextRequest('https://convivia24.com/api/admin/audit'))).status).toBe(status);
    expect(mocks.audit).not.toHaveBeenCalled(); expect(mocks.sessions).not.toHaveBeenCalled();
  });
  it('requires owner access and disables caching', async () => {
    const response = await GET(new NextRequest('https://convivia24.com/api/admin/audit'));
    expect(mocks.admin).toHaveBeenCalledWith('owner');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it.each(['category=bad', 'from=bad', 'usersOffset=-1', 'outcome=bad', 'from=2026-10-05&to=2026-10-04'])('rejects invalid filters %s', async query => {
    expect((await GET(new NextRequest('https://convivia24.com/api/admin/audit?' + query))).status).toBe(400);
    expect(mocks.audit).not.toHaveBeenCalled();
  });
});
describe('browser activity observations', () => {
  const request = (body: unknown, origin = 'https://convivia24.com') => new NextRequest('https://convivia24.com/api/activity', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  it('uses the server identity and strips query secrets and invite tokens', async () => {
    expect((await POST(request({ action: 'page.view', path: '/party-planner/private-invite?token=private', userId: 'spoof' }))).status).toBe(204);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ id: 'signed-in-user' }), subject: '/party-planner/[record]' }));
  });
  it('updates presence without creating heartbeat audit spam', async () => {
    await POST(request({ action: 'heartbeat', path: '/shop' }));
    expect(mocks.presence).toHaveBeenCalled(); expect(mocks.record).not.toHaveBeenCalled();
  });
  it('rejects unauthenticated or cross-origin observations', async () => {
    expect((await POST(request({ action: 'page.view', path: '/shop' }, 'https://evil.example'))).status).toBe(403);
    mocks.user.mockResolvedValue(null);
    expect((await POST(request({ action: 'page.view', path: '/shop' }))).status).toBe(401);
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
