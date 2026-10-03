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
  it('allows configured owner emails without email verification', async () => {
    mocks.user.mockResolvedValue({ id: 'owner', email: 'owner@example.com', emailVerified: false });
    expect(await requireAdmin('owner')).toMatchObject({ ok: true, actor: 'owner', actorLabel: 'owner@example.com', role: 'owner' });
  });
  it.each(['bobbynathus@yahoo.com', 'collinsenofe@gmail.com'])('allows owner %s when configured in env', async email => {
    vi.stubEnv('CONVIVIA_ADMIN_EMAILS', email);
    mocks.user.mockResolvedValue({ id: 'owner', email, emailVerified: true });
    expect(await requireAdmin('owner')).toMatchObject({ ok: true, role: 'owner' });
  });
  it('does not grant admin access through staff directory records', async () => {
    mocks.user.mockResolvedValue({ id: 'staff', email: 'staff@example.com', emailVerified: true });
    mocks.sql.mockResolvedValue([{ role: 'operations' }]);
    expect(await requireAdmin('orders')).toMatchObject({ ok: false, status: 401 });
    expect(await requireAdmin('owner')).toMatchObject({ ok: false, status: 401 });
    expect(mocks.sql).not.toHaveBeenCalled();
  });
  it('rejects invalid database roles', async () => {
    mocks.user.mockResolvedValue({ id: 'staff', email: 'staff@example.com', emailVerified: true });
    mocks.sql.mockResolvedValue([{ role: 'invalid' }]);
    expect(await adminIdentity()).toBeNull();
  });
  it('does not use built-in notification recipients to grant admin access', async () => {
    mocks.user.mockResolvedValue({ id: 'owner', email: 'collinsenofe@gmail.com', emailVerified: true });
    expect(await adminIdentity()).toBeNull();
  });
  it('fails closed if the environment allowlist is empty', async () => {
    vi.stubEnv('CONVIVIA_ADMIN_EMAILS', '');
    mocks.user.mockResolvedValue({ id: 'owner', email: 'owner@example.com' });
    expect(await adminIdentity()).toBeNull();
  });
  it('normalises configured email addresses', async () => {
    vi.stubEnv('CONVIVIA_ADMIN_EMAILS', ' OWNER@EXAMPLE.COM ; second@example.com ');
    mocks.user.mockResolvedValue({ id: 'owner', email: 'Owner@Example.com' });
    expect(await requireAdmin('read')).toMatchObject({ ok: true, role: 'owner' });
  });
});
