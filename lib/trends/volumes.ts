/**
 * Convivia24 Insights — the beverage trend report, published in numbered volumes.
 *
 * Each volume is self-contained: its figures and its section copy live here, and one shared
 * component renders any of them. To publish Volume 2, add an entry to VOLUMES (newest first)
 * with its own data — nothing in the pages needs to change.
 */
import {
  BEER_MARKETS,
  BEER_PER_CAPITA,
  CATEGORY_SIGNALS,
  HEADLINES,
  NIGERIA_INSIGHTS,
  REGIONAL_CONSUMPTION,
  SOURCES,
  SPIRIT_BRANDS,
  TAKEAWAYS,
  type BarDatum,
  type CategorySignal,
  type HeadlineStat,
  type MarketInsight,
  type Source,
  type Takeaway,
} from './report';

/** A bolded lead-in followed by plain text — the "What the data says" bullets. */
export type Point = { lead: string; body: string };

export type ChartSpec = {
  title: string;
  subtitle: string;
  unit: string;
  data: BarDatum[];
  highlight?: string[];
  source: string;
};

export type TrendVolume = {
  number: number;
  slug: string;
  edition: string;
  /** ISO date the volume went live. */
  publishedAt: string;
  title: string;
  dek: string;
  /** Short cover line for the archive card. */
  cover: string;
  headlines: HeadlineStat[];
  global: { title: string; intro: string; chart: ChartSpec; pointsTitle: string; points: Point[] };
  beer: { title: string; intro: string; charts: ChartSpec[]; footnote: string };
  brands: { title: string; intro: string; chart: ChartSpec; pointsTitle: string; points: Point[] };
  momentum: { title: string; intro: string; signals: CategorySignal[] };
  nigeria: { title: string; intro: string; insights: MarketInsight[] };
  takeaways: Takeaway[];
  sources: Source[];
};

const VOLUME_1: TrendVolume = {
  number: 1,
  slug: 'volume-1',
  edition: 'November 2026',
  publishedAt: '2026-11-01',
  title: 'How the world drinks now',
  dek: 'Where consumption is concentrated, which brands move the most volume, which categories are gaining or losing, and what that means for nights out in Nigeria.',
  cover: 'Consumption by region, the biggest beer markets, the best-selling spirits and a Nigeria lens.',
  headlines: HEADLINES,
  global: {
    title: 'Europe drinks almost twice the world average',
    intro:
      'Consumption tracks culture, religion and income more than population. Europe and the Americas sit well above the global line. Africa averages below it, but its drinkers consume more per person than the regional figure suggests, because a large share of adults do not drink at all.',
    chart: {
      title: 'Alcohol consumption by world region',
      subtitle: 'Litres of pure alcohol per person aged 15+, per year',
      unit: 'Litres per adult',
      data: REGIONAL_CONSUMPTION,
      source: 'WHO, 2019 estimates (published 2024)',
    },
    pointsTitle: 'What the data says',
    points: [
      {
        lead: 'The world is drinking slightly less.',
        body: 'Per-capita intake has eased since 2010, led by Europe, while parts of Asia and Africa rise with incomes.',
      },
      {
        lead: 'A 46× gap between regions.',
        body: 'Europe consumes 9.2 L per adult. The Eastern Mediterranean consumes 0.2 L. Regional averages hide very different drinking cultures.',
      },
      {
        lead: 'Share of drinkers matters.',
        body: 'In many African markets fewer than half of adults drink, so those who do consume well above the regional average.',
      },
    ],
  },
  beer: {
    title: 'Volume lives in China; passion lives in Czechia',
    intro:
      'Beer is still the world’s most-consumed alcoholic drink by volume. Total volume follows population, but per-head figures show where beer is part of everyday culture.',
    charts: [
      {
        title: 'Largest beer markets',
        subtitle: 'Total consumption, billions of litres per year',
        unit: 'Billion litres',
        data: BEER_MARKETS,
        highlight: ['China', 'United States'],
        source: 'Kirin Holdings / BarthHaas, rounded',
      },
      {
        title: 'Most beer per person',
        subtitle: 'Litres per person per year',
        unit: 'Litres per person',
        data: BEER_PER_CAPITA,
        highlight: ['Czechia'],
        source: 'Kirin Holdings, rounded',
      },
    ],
    footnote:
      'The average Czech drinks more than five times as much beer as the average person in China, yet China’s total is over 20 times Czechia’s. In Africa, South Africa and Nigeria are the two largest beer markets. Both are price-sensitive and moving fast towards value lagers and returnable glass.',
  },
  brands: {
    title: 'The world’s best-selling spirits aren’t the ones you’d guess',
    intro:
      'Ranked by volume, the leaders are local favourites with enormous home markets: Korean soju and Indian whisky. The best-known global names come after them.',
    chart: {
      title: 'Best-selling spirit brands by volume',
      subtitle: 'Millions of 9-litre cases per year',
      unit: 'Million cases',
      data: SPIRIT_BRANDS,
      highlight: ['Jinro (soju, Korea)', 'Smirnoff (vodka)', 'Johnnie Walker (Scotch)', 'Hennessy (cognac)'],
      source: 'Drinks International Millionaires’ Club, rounded',
    },
    pointsTitle: 'Volume vs value',
    points: [
      { lead: 'Smirnoff', body: 'is the top international spirit by volume, sold in more than 130 countries.' },
      {
        lead: 'Johnnie Walker',
        body: 'is the world’s biggest Scotch, and its Black and Double Black labels are bottle-service staples in West Africa.',
      },
      {
        lead: 'Hennessy',
        body: 'sells a fraction of Jinro’s cases but far more value per bottle. Nigeria is one of its most visible African markets.',
      },
    ],
  },
  momentum: {
    title: 'Convenience and moderation rise; celebration categories cool',
    intro: 'Where each category is heading over the next few years, based on recent volume trends and industry forecasts.',
    signals: CATEGORY_SIGNALS,
  },
  nigeria: {
    title: 'Squeezed at the bar, still spending on the night',
    intro:
      'Africa’s most populous country is two markets at once: everyday drinkers under heavy price pressure, and a nightlife scene where premium bottles still drive the occasion.',
    insights: NIGERIA_INSIGHTS,
  },
  takeaways: TAKEAWAYS,
  sources: SOURCES,
};

/** Newest first. */
export const VOLUMES: TrendVolume[] = [VOLUME_1];

export const LATEST_VOLUME = VOLUMES[0];

export function getVolume(slug: string): TrendVolume | undefined {
  return VOLUMES.find((v) => v.slug === slug);
}

/** Older and newer neighbours for the report footer. */
export function neighbours(volume: TrendVolume): { older?: TrendVolume; newer?: TrendVolume } {
  const i = VOLUMES.findIndex((v) => v.slug === volume.slug);
  return { newer: i > 0 ? VOLUMES[i - 1] : undefined, older: i >= 0 ? VOLUMES[i + 1] : undefined };
}

export const volumeLabel = (v: Pick<TrendVolume, 'number'>) => `Volume ${v.number}`;
