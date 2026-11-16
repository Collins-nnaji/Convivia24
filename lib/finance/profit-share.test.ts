import { describe, expect, it } from 'vitest';
import { currentPeriod, monthRange, partnerName, shiftPeriod, splitProfit } from './profit-share';

const four = ['a', 'b', 'c', 'd'].map((k) => ({ key: `${k}@x.com`, name: k }));

describe('splitProfit', () => {
  it('keeps 40% in the business and shares the rest equally', () => {
    const r = splitProfit(1_000_000, four);
    expect(r.retainedNgn).toBe(400_000);
    expect(r.distributableNgn).toBe(600_000);
    expect(r.partnerPct).toBe(15);
    expect(r.shares.every((s) => s.amountNgn === 150_000)).toBe(true);
  });

  it('never shares more than the pool — odd naira stay with the business', () => {
    const r = splitProfit(1_001, [...four.slice(0, 3)]);
    const total = r.shares.reduce((n, s) => n + s.amountNgn, 0);
    expect(total + r.retainedNgn).toBe(1_001);
    expect(r.retainedNgn).toBeGreaterThanOrEqual(Math.ceil(1_001 * 0.4));
  });

  it('shares nothing on a loss', () => {
    const r = splitProfit(-50_000, four);
    expect(r.distributableNgn).toBe(0);
    expect(r.retainedNgn).toBe(0);
    expect(r.shares.every((s) => s.amountNgn === 0)).toBe(true);
  });

  it('keeps everything when there are no partners', () => {
    const r = splitProfit(500_000, []);
    expect(r.retainedNgn).toBe(500_000);
    expect(r.shares).toEqual([]);
  });
});

describe('periods', () => {
  it('maps a month to Lagos midnight boundaries', () => {
    const r = monthRange('2026-11');
    expect(r.from).toBe('2026-10-31T23:00:00.000Z');
    expect(r.to).toBe('2026-11-30T23:00:00.000Z');
    expect(r.label).toBe('November 2026');
  });

  it('rejects malformed periods', () => {
    expect(() => monthRange('2026-13')).toThrow();
    expect(() => monthRange('nov')).toThrow();
  });

  it('rolls months across years', () => {
    expect(shiftPeriod('2026-01', -1)).toBe('2025-12');
    expect(currentPeriod(new Date('2026-11-30T23:30:00Z'))).toBe('2026-12');
  });

  it('names partners from their email', () => {
    expect(partnerName('ada.obi@example.com')).toBe('Ada Obi');
  });
});
