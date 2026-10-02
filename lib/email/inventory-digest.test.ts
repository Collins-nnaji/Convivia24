import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listInventory: vi.fn(),
  sendEmail: vi.fn().mockResolvedValue({ sent: true, id: 'test-mail' }),
  template: vi.fn().mockReturnValue({ subject: 'Inventory', html: '<p>Stock</p>', text: 'Stock' }),
}));
vi.mock('@/lib/inventory', () => ({ listInventory: mocks.listInventory }));
vi.mock('@/lib/email/resend', () => ({ sendEmail: mocks.sendEmail, adminNotifyEmail: () => ['a@example.com', 'b@example.com'] }));
vi.mock('@/lib/email/templates', () => ({ inventoryDigestEmail: mocks.template }));
vi.mock('node:fs/promises', () => ({ readFile: async () => Buffer.from('logo') }));
import { sendInventoryDigest } from './inventory-digest';
import { EVENT_PACKAGES } from '@/lib/packages/catalog';

describe('inventory digest physical stock', () => {
  it('counts bottles and excludes packs and untracked rows from totals and restock alerts', async () => {
    const row = { name: 'Bottle', slug: 'bottle', track_stock: true, category: 'spirits', active: true, on_hand: 5, reserved: 2, available: 3, low_stock_threshold: 6 };
    mocks.listInventory.mockResolvedValue([
      row,
      { ...row, slug: 'untracked', track_stock: false },
      { ...row, slug: 'custom-pack', category: 'party-packs' },
      // Known packs stay excluded even when a legacy row has the wrong tracking flag/category.
      { ...row, slug: EVENT_PACKAGES[0].slug },
    ]);
    expect(await sendInventoryDigest({ isTest: true })).toMatchObject({ sent: true, skuCount: 1, lowCount: 1, recipientCount: 2 });
    expect(mocks.template.mock.calls[0][0].lines).toEqual([
      { name: 'Bottle', slug: 'bottle', onHand: 5, reserved: 2, available: 3, lowStockThreshold: 6, active: true },
    ]);
    expect(mocks.sendEmail.mock.calls[0][0].to).toEqual(['a@example.com', 'b@example.com']);
  });
});
