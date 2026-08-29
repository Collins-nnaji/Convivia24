import { describe, expect, it } from 'vitest';
import { buildTrackingSteps, isTerminal, TRACKING_PIPELINE, type OrderEvent } from './timeline';

const placedAt = '2026-05-20T09:30:00.000Z';

describe('buildTrackingSteps', () => {
  it('marks every step up to the current status as done', () => {
    const steps = buildTrackingSteps('packed', [], placedAt);
    expect(steps.map((s) => s.done)).toEqual([true, true, true, false, false]);
    expect(steps.find((s) => s.current)?.status).toBe('packed');
  });

  it('treats the legacy fulfilled status as delivered', () => {
    const steps = buildTrackingSteps('fulfilled', [], placedAt);
    expect(steps.every((s) => s.done)).toBe(true);
    expect(steps[steps.length - 1].current).toBe(true);
  });

  it('shows a timestamp only for transitions we actually recorded', () => {
    const events: OrderEvent[] = [
      { status: 'paid', note: null, at: placedAt },
      { status: 'processing', note: null, at: '2026-05-20T11:15:00.000Z' },
    ];
    const steps = buildTrackingSteps('packed', events, placedAt);
    const byStatus = new Map(steps.map((s) => [s.status, s.at]));

    expect(byStatus.get('paid')).toBe(placedAt);
    expect(byStatus.get('processing')).toBe('2026-05-20T11:15:00.000Z');
    // Packed is reached but was never stamped — no invented time.
    expect(byStatus.get('packed')).toBeNull();
    expect(byStatus.get('delivered')).toBeNull();
  });

  it('falls back to the placed time for the paid step on older orders', () => {
    const steps = buildTrackingSteps('paid', [], placedAt);
    expect(steps[0].at).toBe(placedAt);
  });

  it('marks nothing done for an order that has not been paid for', () => {
    const steps = buildTrackingSteps('awaiting_payment', [], placedAt);
    expect(steps.every((s) => !s.done)).toBe(true);
    expect(steps[0].at).toBeNull();
  });

  it('always returns the full pipeline in order', () => {
    const steps = buildTrackingSteps('processing', [], placedAt);
    expect(steps.map((s) => s.status)).toEqual(TRACKING_PIPELINE);
  });
});

describe('isTerminal', () => {
  it('is true only for orders that have stopped moving', () => {
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('refunded')).toBe(true);
    expect(isTerminal('delivered')).toBe(false);
    expect(isTerminal('out_for_delivery')).toBe(false);
  });
});
