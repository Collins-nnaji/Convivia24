import { describe, expect, it } from 'vitest';
import {
  accessNipNgn,
  flutterwaveCollectionNgn,
  processingCostNgn,
  quoteRetail,
} from './checkout-fees';

describe('published fee bands', () => {
  it('charges Flutterwave 2% plus VAT on the amount paid', () => {
    expect(flutterwaveCollectionNgn(100_000)).toBe(2_150);
    expect(flutterwaveCollectionNgn(0)).toBe(0);
  });

  it('uses Access NIP bands with VAT', () => {
    expect(accessNipNgn(5_000)).toBe(11);
    expect(accessNipNgn(5_001)).toBe(27);
    expect(accessNipNgn(80_000)).toBe(54);
    expect(accessNipNgn(0)).toBe(0);
  });
});

describe('quoteRetail', () => {
  it('leaves at least cost, Access charges and the markup after Flutterwave', () => {
    const quote = quoteRetail(100_000, { markupPct: 15, markupFlatNgn: 500 });
    expect(quote).not.toBeNull();
    expect(quote!.suggestedNgn % 100).toBe(0);
    expect(quote!.netAfterFeesNgn).toBeGreaterThanOrEqual(quote!.targetNetNgn);
    expect(quote!.markupNgn).toBe(15_500);
  });

  it('does not invent a price when there is no cost and no markup', () => {
    expect(quoteRetail(0, { markupPct: 15, markupFlatNgn: 0 })).toBeNull();
  });
});

describe('processingCostNgn', () => {
  it('adds one Access alert per order on top of the payout', () => {
    const cost = processingCostNgn({ chargedNgn: 200_000, cogsNgn: 80_000, orderCount: 3 });
    expect(cost.flutterwaveNgn).toBe(flutterwaveCollectionNgn(200_000));
    expect(cost.accessNgn).toBe(accessNipNgn(80_000) + 80 + 12);
    expect(cost.totalNgn).toBe(cost.flutterwaveNgn + cost.accessNgn);
  });

  it('does not charge Flutterwave on money that arrived by Access Bank transfer', () => {
    const mixed = processingCostNgn({ chargedNgn: 200_000, bankChargedNgn: 50_000, cogsNgn: 80_000, orderCount: 2 });
    expect(mixed.flutterwaveNgn).toBe(flutterwaveCollectionNgn(150_000));
    const transfer = processingCostNgn({ chargedNgn: 50_000, bankChargedNgn: 50_000, cogsNgn: 0, orderCount: 1 });
    expect(transfer.flutterwaveNgn).toBe(0);
  });
});
