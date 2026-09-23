import { describe, expect, it } from 'vitest';
import { apiRouteBucket, apiUsageDaysForPeriod, lagosDayKey } from '@/lib/analytics/api-usage';

describe('apiRouteBucket', () => {
  it('strips client IP suffixes', () => {
    expect(apiRouteBucket('orders:create:1.2.3.4')).toBe('orders:create');
    expect(apiRouteBucket('cocktail-ai:10.0.0.1')).toBe('cocktail-ai');
    expect(apiRouteBucket('admin:global')).toBe('admin');
  });

  it('keeps bare route names', () => {
    expect(apiRouteBucket('waitlist')).toBe('waitlist');
  });
});

describe('apiUsageDaysForPeriod', () => {
  it('maps period keys to day windows', () => {
    expect(apiUsageDaysForPeriod('7d')).toBe(7);
    expect(apiUsageDaysForPeriod('30d')).toBe(30);
    expect(apiUsageDaysForPeriod('90d')).toBe(90);
  });
});

describe('lagosDayKey', () => {
  it('returns YYYY-MM-DD', () => {
    expect(lagosDayKey(new Date('2026-03-15T12:00:00+01:00'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
