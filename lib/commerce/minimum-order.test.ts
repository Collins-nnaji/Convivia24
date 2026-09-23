import { describe, expect, it } from 'vitest';
import { SAMPLE_PAYMENT_SLUG } from '@/lib/drinks/catalog';
import {
  catalogMinOrderQty,
  clampOrderQty,
  lineShort,
  meetsMinimum,
  minimumOrderError,
} from './minimum-order';

describe('catalogMinOrderQty', () => {
  it('defaults ordinary bottles to 1', () => {
    expect(catalogMinOrderQty('jameson-original')).toBe(1);
    expect(catalogMinOrderQty('hennessy-vs')).toBe(1);
  });

  it('requires three of each Convivia house cocktail', () => {
    expect(catalogMinOrderQty('mojito-fusion')).toBe(3);
    expect(catalogMinOrderQty('ruv-punch')).toBe(3);
    expect(catalogMinOrderQty('passion-spiritz')).toBe(3);
    expect(catalogMinOrderQty(SAMPLE_PAYMENT_SLUG)).toBe(3);
  });
});

describe('clampOrderQty', () => {
  it('lifts a cocktail below the floor up to three', () => {
    expect(clampOrderQty('mojito-fusion', 1)).toBe(3);
    expect(clampOrderQty('mojito-fusion', 2)).toBe(3);
    expect(clampOrderQty('mojito-fusion', 5)).toBe(5);
  });

  it('leaves a single expensive bottle alone', () => {
    expect(clampOrderQty('hennessy-xo', 1)).toBe(1);
  });
});

describe('minimumOrderError', () => {
  it('allows one expensive bottle', () => {
    expect(minimumOrderError([{ slug: 'hennessy-vs', qty: 1 }])).toBeNull();
    expect(meetsMinimum([{ slug: 'hennessy-vs', qty: 1 }])).toBe(true);
  });

  it('blocks a single cocktail under its line minimum', () => {
    const err = minimumOrderError([{ slug: 'mojito-fusion', qty: 1, name: 'Mojito Fusion' }]);
    expect(err).toMatch(/minimum order is 3/i);
    expect(err).toMatch(/Mojito Fusion/);
    expect(lineShort('mojito-fusion', 1)).toBe(2);
  });

  it('accepts three cocktails', () => {
    expect(minimumOrderError([{ slug: 'mojito-fusion', qty: 3 }])).toBeNull();
  });

  it('treats an empty cart as empty', () => {
    expect(minimumOrderError([])).toBe('Your cart is empty.');
  });
});
