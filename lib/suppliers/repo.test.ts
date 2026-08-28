import { describe, expect, it } from 'vitest';
import { suggestSuppliers, validateSupplier, type Supplier } from './repo';

function supplier(over: Partial<Supplier> = {}): Supplier {
  return {
    id: over.id || 'id-1',
    name: over.name || 'Supplier A',
    contactName: null,
    phone: null,
    email: null,
    city: 'Lagos',
    areas: over.areas ?? [],
    categories: over.categories ?? [],
    sameDay: over.sameDay ?? false,
    notes: null,
    active: over.active ?? true,
    createdAt: '2026-01-01T00:00:00Z',
    ...over,
  };
}

describe('validateSupplier', () => {
  it('accepts a minimal supplier', () => {
    expect(validateSupplier({ name: 'Ikeja Drinks' })).toBeNull();
  });

  it('requires a name', () => {
    expect(validateSupplier({ name: '' })).toMatch(/name is required/i);
    expect(validateSupplier({ name: '   ' })).toMatch(/name is required/i);
  });

  it('checks email and phone only when given', () => {
    expect(validateSupplier({ name: 'A', email: 'nope' })).toMatch(/email/i);
    expect(validateSupplier({ name: 'A', email: 'a@b.co' })).toBeNull();
    expect(validateSupplier({ name: 'A', email: '' })).toBeNull();
    expect(validateSupplier({ name: 'A', phone: 'call me' })).toMatch(/phone/i);
    expect(validateSupplier({ name: 'A', phone: '+234 803 000 0000' })).toBeNull();
  });

  it('rejects area and category lists where nothing is recognised', () => {
    expect(validateSupplier({ name: 'A', areas: ['Atlantis'] })).toMatch(/areas/i);
    expect(validateSupplier({ name: 'A', areas: ['Lekki'] })).toBeNull();
    expect(validateSupplier({ name: 'A', categories: ['soft drinks'] })).toMatch(/categories/i);
    expect(validateSupplier({ name: 'A', categories: ['whisky'] })).toBeNull();
    // A partly-valid list is fine — the unknown entries are dropped on write.
    expect(validateSupplier({ name: 'A', areas: ['Lekki', 'Atlantis'] })).toBeNull();
  });
});

describe('suggestSuppliers', () => {
  it('drops inactive suppliers', () => {
    const out = suggestSuppliers([supplier({ id: 'a', active: false })], {});
    expect(out).toHaveLength(0);
  });

  it('ranks an area match above a supplier with no stated area', () => {
    const out = suggestSuppliers(
      [
        supplier({ id: 'open', name: 'Open', areas: [] }),
        supplier({ id: 'lekki', name: 'Lekki Co', areas: ['Lekki'] }),
      ],
      { area: 'Lekki' }
    );
    expect(out[0].id).toBe('lekki');
    expect(out[0].reasons).toContain('covers Lekki');
  });

  it('scores a full category match above a partial one', () => {
    const out = suggestSuppliers(
      [
        supplier({ id: 'partial', name: 'Partial', categories: ['whisky'] }),
        supplier({ id: 'full', name: 'Full', categories: ['whisky', 'cognac'] }),
      ],
      { categories: ['whisky', 'cognac'] }
    );
    expect(out[0].id).toBe('full');
    expect(out[0].reasons).toContain('stocks every category');
  });

  it('pushes non-same-day suppliers to the bottom for an express order', () => {
    const out = suggestSuppliers(
      [
        supplier({ id: 'slow', name: 'Slow', areas: ['Lekki'], sameDay: false }),
        supplier({ id: 'fast', name: 'Fast', areas: [], sameDay: true }),
      ],
      { area: 'Lekki', sameDay: true }
    );
    expect(out[0].id).toBe('fast');
    expect(out[1].reasons).toContain('no same-day');
  });

  it('keeps every active supplier in the list, just ordered', () => {
    const all = [
      supplier({ id: 'a', name: 'A' }),
      supplier({ id: 'b', name: 'B' }),
      supplier({ id: 'c', name: 'C', active: false }),
    ];
    expect(suggestSuppliers(all, { area: 'Lekki', sameDay: true })).toHaveLength(2);
  });

  it('is stable by name when scores tie', () => {
    const out = suggestSuppliers(
      [supplier({ id: 'z', name: 'Zed' }), supplier({ id: 'a', name: 'Alpha' })],
      {}
    );
    expect(out.map((s) => s.name)).toEqual(['Alpha', 'Zed']);
  });
});
