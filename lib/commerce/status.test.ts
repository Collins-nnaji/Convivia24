import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from './status';

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
