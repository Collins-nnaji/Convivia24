import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ sql: vi.fn() }));
vi.mock('@/lib/db', () => ({ default: mocks.sql }));
vi.mock('@/lib/analytics/api-usage', () => ({ apiUsageDaysForPeriod: () => 30, readApiUsage: async () => ({ configured: false, totalHits: 0, totalBlocked: 0, routes: [], days: [] }) }));
vi.mock('@/lib/ai/azure', () => ({ aiConfigured: () => false }));
vi.mock('@/lib/azure/blob', () => ({ blobConfigured: () => false }));
vi.mock('@/lib/payments/flutterwave', () => ({ flutterwaveSecret: () => null }));
vi.mock('@/lib/redis', () => ({ redisConfigured: () => false }));
import { buildAnalyticsReport } from './report';
beforeEach(() => { mocks.sql.mockReset(); mocks.sql.mockResolvedValue([]); });
describe('analytics report data integrity', () => {
  it('propagates query failures instead of reporting zero sales', async () => {
    mocks.sql.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(buildAnalyticsReport('30d')).rejects.toThrow('Database unavailable');
  });
  it('uses actual net revenue and collected orders for average value', async () => {
    mocks.sql.mockResolvedValueOnce([{ orders: 2, revenue: 30000, refunded: 5000 }]);
    const report = await buildAnalyticsReport('30d');
    expect(report.commerce).toMatchObject({ orders: 2, revenueNgn: 30000, aovNgn: 15000, refundedNgn: 5000 });
  });
  it('represents a successfully queried empty database with zero counts', async () => {
    expect((await buildAnalyticsReport('7d')).commerce).toMatchObject({ orders: 0, revenueNgn: 0, aovNgn: 0 });
  });
});
