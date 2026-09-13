/**
 * The Discover hub's sections. One list drives the landing list and the shell's back button.
 */
export type DiscoverSectionKey = 'trivia' | 'taste' | 'rewards';

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
    label: 'Taste & mix',
    description: 'Your taste profile, the houses that fit it, and a bartender that mixes to it.',
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
    description: 'Spend your points on bottles, shop credit, partner perks and merch.',
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
