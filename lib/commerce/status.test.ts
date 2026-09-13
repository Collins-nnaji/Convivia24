import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_TRANSITIONS, canTransition } from './status';

describe('ORDER_STATUS_LABELS', () => {
  it('has a human label for every status the app can set', () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it('matches the ritual_orders.status DB constraint (lib/db/schema.sql)', () => {
    // Guards against the exact bug this list once had: the DB CHECK only
    // allowed a subset of these values, so a status transition could pass
    // the app's type-check yet fail at the database.
    const dbAllowed = [
      'pending', 'awaiting_payment', 'paid', 'processing', 'packed',
      'out_for_delivery', 'delivered', 'fulfilled', 'cancelled', 'refunded',
    ];
    expect([...ORDER_STATUSES].sort()).toEqual([...dbAllowed].sort());
  });
});

describe('ORDER_TRANSITIONS', () => {
  it('never lets a closed order reopen', () => {
    for (const from of ['cancelled', 'refunded'] as const) {
      expect(ORDER_TRANSITIONS[from]).toEqual([]);
    }
    expect(ORDER_TRANSITIONS.delivered).toEqual(['refunded']);
  });

  it('never moves backwards through the delivery chain', () => {
    const chain = ['paid', 'processing', 'packed', 'out_for_delivery', 'delivered'] as const;
    chain.forEach((from, i) => {
      for (const to of chain.slice(0, i)) expect(canTransition(from, to)).toBe(false);
    });
  });

  it('only references real statuses', () => {
    for (const [from, tos] of Object.entries(ORDER_TRANSITIONS)) {
      expect(ORDER_STATUSES).toContain(from);
      for (const to of tos) expect(ORDER_STATUSES).toContain(to);
    }
  });
});
