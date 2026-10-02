import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ admin: vi.fn(), sql: vi.fn(), user: vi.fn() }));
vi.mock('@/lib/admin', () => ({ requireAdmin: mocks.admin }));
vi.mock('@/lib/auth/session', () => ({ getCurrentUser: mocks.user }));
vi.mock('@/lib/db', () => ({ default: mocks.sql, apiErrorResponse: () => ({ status: 500, error: 'Database error' }) }));
import { GET as readiness } from '@/app/api/admin/readiness/route';
import { POST as delivery } from '@/app/api/admin/delivery/route';
import { GET as publicDelivery } from '@/app/api/delivery/route';
const id = '11111111-1111-4111-8111-111111111111';
const request = (body: unknown) => new NextRequest('https://example.com/api/admin/delivery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.admin.mockResolvedValue({ ok: true, actor: 'owner', role: 'owner' });
  mocks.user.mockResolvedValue({ id: 'owner' });
  mocks.sql.mockResolvedValue([]);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());
describe('admin readiness', () => {
  it('preserves configuration and successful checks when a schema query fails', async () => {
    mocks.sql.mockImplementation(async (parts: TemplateStringsArray) => {
      const query = parts.join('');
      if (query.includes('delivery_zones')) throw { code: '42P01' };
      if (query.includes('COUNT')) return [{ n: 1 }];
      return [];
    });
    const response = await readiness();
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.ready).toBe(false);
    expect(result.checks).toContainEqual(expect.objectContaining({ name: 'DATABASE_URL' }));
    expect(result.checks).toContainEqual(expect.objectContaining({ name: 'Supplier setup', ok: true }));
    expect(result.checks).toContainEqual(expect.objectContaining({ name: 'Delivery coverage', ok: false, detail: expect.stringContaining('db:migrate') }));
  });
  it('accepts one supplier and one enabled city without demanding nationwide coverage', async () => {
    mocks.sql.mockImplementation(async (parts: TemplateStringsArray) => {
      const query = parts.join('');
      if (query.includes('delivery_zones')) return [{ city: 'Lagos' }];
      if (query.includes('suppliers WHERE') || query.includes('delivery_providers')) return [{ n: 1 }];
      if (query.includes('COUNT')) return [{ n: 0 }];
      return [];
    });
    const result = await (await readiness()).json();
    expect(result.checks).toContainEqual(expect.objectContaining({ name: 'Delivery coverage', ok: true }));
    expect(result.checks.some((c: { name: string }) => c.name === 'Abuja delivery')).toBe(false);
  });
  it('does not run database checks for unauthorized users', async () => {
    mocks.admin.mockResolvedValue({ ok: false, status: 403, error: 'Access denied' });
    expect((await readiness()).status).toBe(403);
    expect(mocks.sql).not.toHaveBeenCalled();
  });
});
describe('delivery configuration', () => {
  it('reports duplicate courier names instead of silently overwriting the existing courier', async () => {
    mocks.sql.mockRejectedValueOnce({ code: '23505' });
    const response = await delivery(request({ kind: 'provider', name: 'Existing courier', contact: '08012345678', active: true }));
    expect(response.status).toBe(409);
    expect((await response.json()).error).toContain('already exists');
    expect(mocks.sql.mock.calls[0][0].join('')).not.toContain('DO UPDATE');
  });
  it('updates an existing zone by ID when its name or fee changes', async () => {
    mocks.sql.mockResolvedValueOnce([{ id }]).mockResolvedValueOnce([]);
    expect((await delivery(request({ kind: 'zone', id, city: 'Lagos', name: 'Renamed area', feeNgn: 2500, estimate: 'Same day', active: true }))).status).toBe(200);
    expect(mocks.sql.mock.calls[0][0].join('')).toContain('UPDATE delivery_zones');
    expect(mocks.sql.mock.calls[0]).toContain(id);
  });
  it('reports a missing provider instead of claiming it was saved', async () => {
    expect((await delivery(request({ kind: 'provider', id, name: 'Courier', active: true }))).status).toBe(404);
    expect(mocks.sql).toHaveBeenCalledTimes(1);
  });
  it('rejects fractional delivery fees', async () => {
    expect((await delivery(request({ kind: 'zone', city: 'Lagos', name: 'Zone', feeNgn: 2.5, estimate: 'Same day', active: true }))).status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });
  it('lists only cities represented by enabled zones to customers', async () => {
    mocks.sql.mockResolvedValue([{ id, city: 'Lagos' }, { id: 'other', city: 'Lagos' }]);
    expect(await (await publicDelivery()).json()).toMatchObject({ cities: ['Lagos'] });
    expect(mocks.sql.mock.calls[0][0].join('')).toContain('WHERE active');
  });
});
