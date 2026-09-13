import { describe, expect, it } from 'vitest';
import { describeAudit, type SupplierAuditEntry } from './audit';

function entry(partial: Partial<SupplierAuditEntry>): SupplierAuditEntry {
  return {
    id: '1',
    supplierId: 's',
    supplierName: 'Ikeja Wholesale',
    actor: 'supplier',
    actorLabel: null,
    action: 'stock.set',
    skuSlug: null,
    orderId: null,
    detail: {},
    createdAt: '2026-09-13T10:00:00Z',
    ...partial,
  };
}

describe('describeAudit', () => {
  it('reads a stock change as before → after with the bottle name', () => {
    const text = describeAudit(entry({ skuSlug: 'hennessy-vs', detail: { skuName: 'Hennessy VS', from: 12, to: 4 } }));
    expect(text).toBe('set Hennessy VS stock 12 → 4');
  });

  it('formats a quote in naira and shows the previous quote', () => {
    const text = describeAudit(entry({ action: 'cost.set', skuSlug: 'x', detail: { skuName: 'Jameson', from: 30000, to: 28500 } }));
    expect(text).toContain('₦28,500');
    expect(text).toContain('was ₦30,000');
  });

  it('shortens order ids to the 8-char code the desk shows', () => {
    const text = describeAudit(entry({ action: 'order.status', orderId: 'abcdef12-3456-7890-abcd-ef1234567890', detail: { from: 'paid', to: 'packed' } }));
    expect(text).toBe('moved order ABCDEF12 paid → packed');
  });
});
