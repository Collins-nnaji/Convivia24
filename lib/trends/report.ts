/**
 * Beverage Trend Report — figures for /trends.
 *
 * Every number here is a rounded, indicative figure taken from the most recent public industry
 * reporting at the time of writing (see SOURCES). They are editorial context, not live data:
 * update the edition and the figures together when a new source year lands.
 */

export const REPORT_EDITION = 'November 2026';

export type BarDatum = { label: string; value: number; note?: string };

export type HeadlineStat = { value: string; unit?: string; label: string; context: string; source: string };

export const HEADLINES: HeadlineStat[] = [
  {
    value: '5.5',
    unit: 'L',
    label: 'Pure alcohol per adult, per year',
    context: 'Global average for people aged 15+. It has drifted down slowly since 2010.',
    source: 'WHO',
  },
  {
    value: '≈214',
    unit: 'm hl',
    label: 'Wine drunk worldwide in 2024',
    context: 'The lowest global wine consumption estimate since 1961.',
    source: 'OIV',
  },
  {
    value: '≈1.9',
    unit: 'bn hl',
    label: 'Beer brewed worldwide each year',
    context: 'Flat for a decade. Growth now comes from Africa, India and Latin America.',
    source: 'BarthHaas / Kirin',
  },
  {
    value: '≈3×',
    label: "Jinro's lead over the next spirit brand",
    context: 'A Korean soju outsells every global whisky, vodka and rum brand by volume.',
    source: 'Drinks International',
  },
];

/** WHO regions, litres of pure alcohol per person aged 15+ (2019 estimates, published 2024). */
export const REGIONAL_CONSUMPTION: BarDatum[] = [
  { label: 'Europe', value: 9.2 },
  { label: 'Americas', value: 7.5 },
  { label: 'Global average', value: 5.5, note: 'reference' },
  { label: 'Western Pacific', value: 4.9 },
  { label: 'Africa', value: 4.5 },
  { label: 'South-East Asia', value: 3.8 },
  { label: 'Eastern Mediterranean', value: 0.2 },
];

/** Largest beer markets by total volume, billions of litres per year (rounded). */
export const BEER_MARKETS: BarDatum[] = [
  { label: 'China', value: 36 },
  { label: 'United States', value: 24 },
  { label: 'Brazil', value: 15 },
  { label: 'Mexico', value: 10 },
  { label: 'Russia', value: 8.5 },
  { label: 'Germany', value: 8 },
  { label: 'Japan', value: 5 },
  { label: 'Vietnam', value: 4.5 },
];

/** Beer per head, litres per person per year (rounded). Czechia has led for three decades. */
export const BEER_PER_CAPITA: BarDatum[] = [
  { label: 'Czechia', value: 140 },
  { label: 'Austria', value: 107 },
  { label: 'Poland', value: 97 },
  { label: 'Romania', value: 97 },
  { label: 'Germany', value: 88 },
];

/** Best-selling spirit brands by volume, millions of 9-litre cases a year (rounded). */
export const SPIRIT_BRANDS: BarDatum[] = [
  { label: 'Jinro (soju, Korea)', value: 95 },
  { label: "McDowell's (whisky, India)", value: 31 },
  { label: 'Royal Stag (whisky, India)', value: 26 },
  { label: 'Smirnoff (vodka)', value: 25 },
  { label: 'Johnnie Walker (Scotch)', value: 22 },
  { label: 'Bacardi (rum)', value: 18 },
  { label: 'Hennessy (cognac)', value: 7 },
];

export type Momentum = 'up' | 'flat' | 'down';

export type CategorySignal = { category: string; momentum: Momentum; headline: string; detail: string };

export const CATEGORY_SIGNALS: CategorySignal[] = [
  {
    category: 'Ready-to-drink (RTD)',
    momentum: 'up',
    headline: 'Convenience keeps winning',
    detail:
      'Canned cocktails, spirit-based seltzers and Japanese-style chu-hi are the fastest-growing format in most developed markets, taking share from beer at outdoor and at-home occasions.',
  },
  {
    category: 'No & low alcohol',
    momentum: 'up',
    headline: 'Moderation goes mainstream',
    detail:
      'Alcohol-free beer leads the category, with forecasts of mid-single-digit volume growth a year. Most buyers still drink alcohol too: they swap rather than quit.',
  },
  {
    category: 'Tequila & agave',
    momentum: 'up',
    headline: 'Still growing, but more slowly',
    detail:
      'Agave spirits have closed in on vodka as the biggest US spirit by revenue. Growth has cooled from its 2021–22 peak as the price of agave and of the bottles came down.',
  },
  {
    category: 'Beer',
    momentum: 'flat',
    headline: 'Flat globally, growing in emerging markets',
    detail:
      'Volumes in mature markets fall slowly each year. Africa, India, Vietnam and Brazil carry the growth, mostly in mainstream and value lagers.',
  },
  {
    category: 'Scotch & whisky',
    momentum: 'flat',
    headline: 'India up, the West softer',
    detail:
      'India is now the largest Scotch market by bottles. Elsewhere, expensive aged expressions are selling more slowly after the post-pandemic boom.',
  },
  {
    category: 'Champagne',
    momentum: 'down',
    headline: 'A correction after record years',
    detail:
      'Shipments fell to about 271 million bottles in 2024 (down roughly 9%) as households cut back on celebration spending. Prestige cuvées have held up better than entry-level wines.',
  },
  {
    category: 'Cognac',
    momentum: 'down',
    headline: 'Two biggest markets under pressure',
    detail:
      'Depletions slid in the US as distributors ran stock down, and Chinese duties on EU brandy hit the other half of the market. Producers are pushing into Africa and India.',
  },
  {
    category: 'Wine',
    momentum: 'down',
    headline: 'Structural decline',
    detail:
      'Younger adults are drinking less wine in its old strongholds, France, Italy and China. Lighter, lower-alcohol and sparkling styles are the exceptions.',
  },
];

export type MarketInsight = { title: string; body: string };

/** Nigeria / West Africa lens — the market Convivia24 serves. */
export const NIGERIA_INSIGHTS: MarketInsight[] = [
  {
    title: 'Price shock, then trading down',
    body:
      'Naira devaluation and high inflation since 2023 have pushed shelf prices up repeatedly. Everyday drinkers have moved to value lagers, smaller packs and local spirits. Brewers have answered with cheaper sub-brands rather than bigger bottles.',
  },
  {
    title: 'Premium stays loud at night',
    body:
      'In Lagos, Abuja and Port Harcourt, cognac, champagne and aged whisky still signal status in clubs and lounges. Bottle service and sparkler moments are part of the night itself, so spending at the top end holds up better than mid-range spending.',
  },
  {
    title: 'A stout and malt nation',
    body:
      'Nigeria is one of the world’s most important markets for stout, and among the biggest for non-alcoholic malt drinks. Energy drinks are a major category of their own, and they double as mixers at parties.',
  },
  {
    title: 'Global owners are stepping back',
    body:
      'Several multinationals have sold or restructured their Nigerian operations since 2023. Local groups are taking over brewing and distribution, which changes who controls the brands, how they are priced and how they are promoted.',
  },
  {
    title: 'Regulation is formalising the market',
    body:
      'Regulators are moving to phase out sachet and very small PET spirits. Volume will shift towards glass and larger formats, and into channels where age checks are possible.',
  },
  {
    title: 'The longest growth runway',
    body:
      'With a median age under 20, Nigeria will add more legal-age drinkers this decade than almost anywhere else. Brands that win young adults now, across alcohol, no/low and mixers, will be hard to dislodge.',
  },
];

export type Takeaway = { audience: string; points: string[] };

export const TAKEAWAYS: Takeaway[] = [
  {
    audience: 'For hosts & planners',
    points: [
      'Budget for a premium "moment" bottle, then buy volume in mainstream lager and RTDs.',
      'Stock no/low and malt options on purpose. Drivers, non-drinkers and people pacing themselves will look for them.',
      'Mixers and energy drinks go faster than expected, so order more than the ratio says.',
    ],
  },
  {
    audience: 'For venues',
    points: [
      'Bottle service is where premium spend lives. Keep the hero SKUs in stock before adding range.',
      'Canned cocktails cut bar wait times at peak hours and keep quality consistent.',
      'Price ladders matter more than ever. Make sure every category has a good value option.',
    ],
  },
  {
    audience: 'For brands',
    points: [
      'Growth is in emerging markets and new occasions, not in winning share of mature beer.',
      'Smaller formats and fair price points win trial in inflationary markets.',
      'Responsible, age-verified channels are becoming the main route, not a niche.',
    ],
  },
];

export type Source = { name: string; covers: string };

export const SOURCES: Source[] = [
  { name: 'World Health Organization — Global status report on alcohol and health (2024)', covers: 'Per-capita and regional consumption (2019 estimates)' },
  { name: 'OIV — State of the World Vine and Wine Sector (2025)', covers: 'Global wine consumption, 2024' },
  { name: 'Kirin Holdings — Global Beer Consumption by Country; BarthHaas Report', covers: 'Beer volumes and per-capita figures' },
  { name: 'Drinks International — The Millionaires’ Club', covers: 'Spirit brand volumes (9-litre cases)' },
  { name: 'Comité Champagne (CIVC)', covers: 'Champagne shipments, 2024' },
  { name: 'IWSR Drinks Market Analysis; DISCUS', covers: 'Category direction, RTD, no/low, agave' },
  { name: 'Company results and Nigerian trade press', covers: 'Nigeria pricing, ownership changes and regulation' },
];
