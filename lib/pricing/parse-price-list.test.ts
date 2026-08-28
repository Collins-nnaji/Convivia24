import { describe, expect, it } from 'vitest';
import {
  MIN_CONFIDENCE,
  isSuspicious,
  parsePriceList,
  proposeUpdates,
  similarity,
  summarise,
  type MatchTarget,
} from './parse-price-list';

const TARGETS: MatchTarget[] = [
  { slug: 'jameson-original', name: 'Jameson Original', brand: 'Jameson', currentPriceNgn: 42000 },
  { slug: 'hennessy-vs', name: 'Hennessy VS', brand: 'Hennessy', currentPriceNgn: 78000 },
  { slug: 'moet-imperial', name: 'Moët Impérial', brand: 'Moët & Chandon', currentPriceNgn: 185000 },
  { slug: 'chivas-12', name: 'Chivas Regal 12', brand: 'Chivas', currentPriceNgn: 48000 },
  { slug: 'absolut-vodka', name: 'Absolut Vodka', brand: 'Absolut', currentPriceNgn: 28000 },
];

describe('parsePriceList', () => {
  it('reads the common shapes off a supplier list', () => {
    const lines = parsePriceList(`
      Jameson Original - 45,000
      Hennessy VS      N82,000
      Moet Imperial .......... ₦195,000
      1. Chivas Regal 12   50000
      • Absolut Vodka  NGN 29,500
    `);
    expect(lines.map((l) => l.priceNgn)).toEqual([45000, 82000, 195000, 50000, 29500]);
    expect(lines[0].rawName).toBe('Jameson Original');
    expect(lines[3].rawName).toBe('Chivas Regal 12');
  });

  it('takes the price from the end, not the first number in the name', () => {
    const [line] = parsePriceList('Chivas Regal 12 Year Old   48,000');
    expect(line.priceNgn).toBe(48000);
    expect(line.rawName).toContain('12 Year Old');
  });

  it('strips a leading case quantity without eating it as the price', () => {
    const [line] = parsePriceList('2 x Jameson Original 42,000');
    expect(line.rawName).toBe('Jameson Original');
    expect(line.priceNgn).toBe(42000);
  });

  it('skips headers, blanks and junk rows', () => {
    const lines = parsePriceList(`
      PRICE LIST
      Product            Price
      S/N
      
      Jameson Original 42,000
      Page 2
    `);
    expect(lines).toHaveLength(1);
    expect(lines[0].rawName).toBe('Jameson Original');
  });

  it('ignores sub-₦100 figures that are really page or row numbers', () => {
    expect(parsePriceList('Jameson Original 12')).toHaveLength(0);
  });

  it('drops kobo decimals but keeps whole-naira grouping', () => {
    expect(parsePriceList('Jameson Original 42,000.00')[0].priceNgn).toBe(42000);
    expect(parsePriceList('Jameson Original 42.000')[0].priceNgn).toBe(42000);
  });

  it('returns nothing for empty or priceless input', () => {
    expect(parsePriceList('')).toEqual([]);
    expect(parsePriceList('Jameson Original')).toEqual([]);
  });

  it('reports the source line number', () => {
    const lines = parsePriceList('header\n\nJameson Original 42,000');
    expect(lines[0].line).toBe(3);
  });
});

describe('similarity', () => {
  it('ignores accents, case and punctuation', () => {
    expect(similarity('Moet Imperial', 'Moët Impérial')).toBe(1);
    expect(similarity('MOET & CHANDON', 'Moet and Chandon')).toBe(1);
  });

  it('is not fooled into matching a different bottle', () => {
    expect(similarity('Hennessy VS', 'Hennessy XO')).toBeLessThan(MIN_CONFIDENCE);
  });
});

describe('proposeUpdates', () => {
  it('matches, and reports the change against the current price', () => {
    const [p] = proposeUpdates(parsePriceList('Jameson Original 45,000'), TARGETS);
    expect(p.slug).toBe('jameson-original');
    expect(p.currentPriceNgn).toBe(42000);
    expect(p.priceNgn).toBe(45000);
    expect(p.changePct).toBe(7.1);
    expect(p.status).toBe('new-price');
  });

  it('matches through accents and extra words on the supplier list', () => {
    const [p] = proposeUpdates(parsePriceList('Moet & Chandon Imperial Brut 75cl  195,000'), TARGETS);
    expect(p.slug).toBe('moet-imperial');
  });

  it('marks an identical price unchanged', () => {
    const [p] = proposeUpdates(parsePriceList('Hennessy VS 78,000'), TARGETS);
    expect(p.status).toBe('unchanged');
    expect(p.changePct).toBe(0);
  });

  it('sees through punctuated abbreviations and bottle sizes', () => {
    const proposals = proposeUpdates(
      parsePriceList('Hennessy V.S 70cl  82,000\nAbsolut Vodka 1L  29,500'),
      TARGETS
    );
    expect(proposals[0].slug).toBe('hennessy-vs');
    expect(proposals[0].confidence).toBe(1);
    expect(proposals[1].slug).toBe('absolut-vodka');
    expect(proposals[1].confidence).toBe(1);
  });

  it('still tells V.S apart from X.O once punctuation is normalised', () => {
    const withXo = [...TARGETS, { slug: 'hennessy-xo', name: 'Hennessy XO', brand: 'Hennessy', currentPriceNgn: 280000 }];
    const proposals = proposeUpdates(parsePriceList('Hennessy X.O  295,000'), withXo);
    expect(proposals[0].slug).toBe('hennessy-xo');
  });

  it('refuses to guess when nothing is close', () => {
    const [p] = proposeUpdates(parsePriceList('Star Radler Lager 3,500'), TARGETS);
    expect(p.status).toBe('unmatched');
    expect(p.slug).toBeNull();
    expect(p.confidence).toBeLessThan(MIN_CONFIDENCE);
  });

  it('never assigns one SKU a price meant for another', () => {
    const proposals = proposeUpdates(
      parsePriceList('Hennessy VS 82,000\nHennessy XO 300,000'),
      TARGETS
    );
    const vs = proposals.find((p) => p.slug === 'hennessy-vs');
    expect(vs?.priceNgn).toBe(82000);
    // We stock no XO in this fixture, so it must not be pinned onto VS.
    expect(proposals.filter((p) => p.slug === 'hennessy-vs')).toHaveLength(1);
  });
});

describe('isSuspicious', () => {
  it('flags an implausible swing', () => {
    const [p] = proposeUpdates(parsePriceList('Jameson Original 420,000'), TARGETS);
    expect(isSuspicious(p)).toBe(true);
  });

  it('leaves an ordinary increase alone', () => {
    const [p] = proposeUpdates(parsePriceList('Jameson Original 46,000'), TARGETS);
    expect(isSuspicious(p)).toBe(false);
  });
});

describe('summarise', () => {
  it('counts each outcome once', () => {
    const proposals = proposeUpdates(
      parsePriceList(
        'Jameson Original 45,000\nHennessy VS 78,000\nStar Radler 3,500\nAbsolut Vodka 280,000'
      ),
      TARGETS
    );
    const s = summarise(proposals);
    expect(s.parsed).toBe(4);
    expect(s.matched).toBe(3);
    expect(s.unmatched).toBe(1);
    expect(s.changed).toBe(2);
    expect(s.unchanged).toBe(1);
    expect(s.suspicious).toBe(1);
    expect(s.matched + s.unmatched).toBe(s.parsed);
  });
});
