import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ user: vi.fn(), sql: vi.fn(), cookies: vi.fn() }));
vi.mock('@/lib/auth/session', () => ({ getCurrentUser: mocks.user }));
vi.mock('@/lib/db', () => ({ default: mocks.sql }));
vi.mock('next/headers', () => ({ cookies: mocks.cookies }));
import { adminIdentity, requireAdmin } from './admin';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('CONVIVIA_ADMIN_EMAILS', 'owner@example.com');
  mocks.user.mockResolvedValue(null);
  mocks.sql.mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe('staff admin access', () => {
  it('rejects signed-out users even when shared admin is enabled', async () => {
    vi.stubEnv('ALLOW_SHARED_ADMIN', 'true');
    vi.stubEnv('ADMIN_PASSWORD', 'old-shared-password');
    expect(await adminIdentity()).toBeNull();
    expect(mocks.cookies).not.toHaveBeenCalled();
  });
  it('rejects ordinary and inactive accounts', async () => {
    mocks.user.mockResolvedValue({ id: 'customer', email: 'customer@example.com', emailVerified: true });
    expect(await requireAdmin('read')).toMatchObject({ ok: false, status: 401 });
  });
  it('rejects unverified owner email accounts', async () => {
    mocks.user.mockResolvedValue({ id: 'owner', email: 'owner@example.com', emailVerified: false });
    expect(await adminIdentity()).toBeNull();
  });
  it.each(['bobbynathus@yahoo.com', 'collinsenofe@gmail.com'])('allows verified owner %s', async email => {
    mocks.user.mockResolvedValue({ id: 'owner', email, emailVerified: true });
    expect(await requireAdmin('owner')).toMatchObject({ ok: true, role: 'owner' });
  });
  it('keeps active staff within their assigned permissions', async () => {
    mocks.user.mockResolvedValue({ id: 'staff', email: 'staff@example.com', emailVerified: true });
    mocks.sql.mockResolvedValue([{ role: 'operations' }]);
    expect(await requireAdmin('orders')).toMatchObject({ ok: true, role: 'operations' });
    expect(await requireAdmin('owner')).toMatchObject({ ok: false, status: 403 });
  });
  it('rejects invalid database roles', async () => {
    mocks.user.mockResolvedValue({ id: 'staff', email: 'staff@example.com', emailVerified: true });
    mocks.sql.mockResolvedValue([{ role: 'invalid' }]);
    expect(await adminIdentity()).toBeNull();
  });
});
