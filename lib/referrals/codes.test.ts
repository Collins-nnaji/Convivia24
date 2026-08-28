import { describe, expect, it } from 'vitest';
import {
  CODE_MAX,
  DEFAULT_COMMISSION_PCT,
  clampCommissionPct,
  commissionNgn,
  isValidCode,
  normaliseCode,
  referralUrl,
  suggestCode,
} from './codes';

describe('normaliseCode', () => {
  it('uppercases and strips punctuation', () => {
    expect(normaliseCode(' lagos-weddings ')).toBe('LAGOSWEDDINGS');
    expect(normaliseCode('bella.events')).toBe('BELLAEVENTS');
  });

  it('rejects anything too short to be a code', () => {
    expect(normaliseCode('ab')).toBe('');
    expect(normaliseCode('!!!')).toBe('');
    expect(normaliseCode('')).toBe('');
  });

  it('truncates rather than rejecting an over-long code', () => {
    expect(normaliseCode('A'.repeat(40))).toHaveLength(CODE_MAX);
  });
});

describe('isValidCode', () => {
  it('accepts a normalised code and rejects raw input', () => {
    expect(isValidCode('BELLA24')).toBe(true);
    expect(isValidCode('bella24')).toBe(false);
    expect(isValidCode('BELLA-24')).toBe(false);
    expect(isValidCode('AB')).toBe(false);
  });

  it('accepts everything normaliseCode produces', () => {
    for (const raw of ['lagos-weddings', 'Bella Events', 'dj_spinall!!']) {
      expect(isValidCode(normaliseCode(raw))).toBe(true);
    }
  });
});

describe('suggestCode', () => {
  it('is recognisable and always valid', () => {
    for (const name of ['Bella Events', 'DJ Spinall', 'X', '', '!!!']) {
      expect(isValidCode(suggestCode(name))).toBe(true);
    }
    expect(suggestCode('Bella Events')).toMatch(/^BELLAEVE/);
  });
});

describe('clampCommissionPct', () => {
  it('holds the rate inside a sane band', () => {
    expect(clampCommissionPct(DEFAULT_COMMISSION_PCT)).toBe(2.5);
    expect(clampCommissionPct(-5)).toBe(0);
    expect(clampCommissionPct(90)).toBe(25);
    expect(clampCommissionPct(Number.NaN)).toBe(0);
    expect(clampCommissionPct(3.14159)).toBe(3.1);
  });
});

describe('commissionNgn', () => {
  it('takes the stated percentage of what was collected', () => {
    expect(commissionNgn(800000, 2.5)).toBe(20000);
    expect(commissionNgn(420000, 10)).toBe(42000);
  });

  it('earns nothing on nothing', () => {
    expect(commissionNgn(0, 5)).toBe(0);
    expect(commissionNgn(500000, 0)).toBe(0);
    expect(commissionNgn(-500000, 5)).toBe(0);
    expect(commissionNgn(Number.NaN, 5)).toBe(0);
  });

  it('cannot exceed the cap even if a silly rate is passed', () => {
    expect(commissionNgn(100000, 900)).toBe(25000);
  });

  it('rounds to whole naira', () => {
    expect(Number.isInteger(commissionNgn(333333, 3.7))).toBe(true);
  });
});

describe('referralUrl', () => {
  it('builds a shareable link', () => {
    expect(referralUrl('https://convivia24.com', 'BELLA24')).toBe(
      'https://convivia24.com/?ref=BELLA24'
    );
    expect(referralUrl('https://convivia24.com/', 'BELLA24')).toBe(
      'https://convivia24.com/?ref=BELLA24'
    );
  });
});
