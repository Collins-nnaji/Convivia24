/**
 * The Discover hub's sections. One list drives the rail and deep links.
 */
export type DiscoverSectionKey = 'taste' | 'mix' | 'trivia' | 'rewards';

export type DiscoverSection = {
  key: DiscoverSectionKey;
  href: string;
  label: string;
  /** One neutral sentence — no brand names, no live data. */
  description: string;
};

export const DISCOVER_HOME = '/discover';

export const DISCOVER_SECTIONS: DiscoverSection[] = [
  {
    key: 'taste',
    href: '/discover/taste',
    label: 'Your taste',
    description: 'Build your profile and see which houses fit you.',
  },
  {
    key: 'mix',
    href: '/discover/mix',
    label: 'Cocktail maker',
    description: 'Tell it what you have — get a measured recipe for tonight.',
  },
  {
    key: 'trivia',
    href: '/discover/trivia',
    label: 'Trivia',
    description: "Play the week's round, learn the house, earn points and enter the bottle draw.",
  },
  {
    key: 'rewards',
    href: '/discover/rewards',
    label: 'Rewards',
    description: 'Spend your points on bottles and Convivia merch.',
  },
];

export function discoverSection(key: DiscoverSectionKey): DiscoverSection {
  return DISCOVER_SECTIONS.find((s) => s.key === key)!;
}

/** Which section a pathname sits in, or null on the landing page. */
export function activeDiscoverSection(pathname: string): DiscoverSectionKey | null {
  const hit = DISCOVER_SECTIONS.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
  return hit?.key ?? null;
}
