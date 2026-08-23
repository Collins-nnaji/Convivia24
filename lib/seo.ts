/** Shared SEO copy — keep in sync with what the live product actually is. */

import { eventsEnabled } from '@/lib/features';

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');

export const SITE_NAME = 'Convivia24';

export const SITE_TAGLINE = eventsEnabled
  ? 'Drinks, nights out & venue drops — nationwide delivery'
  : 'Drink supplies for events — nationwide delivery';

export const SITE_DESCRIPTION = eventsEnabled
  ? 'Convivia24 is nightlife commerce across Nigeria: order spirits and party packs to the club, lounge, or house party; discover events and venues; follow circles; earn Guest Card perks; and partner venues buy wholesale. Nationwide delivery. Adults 18+ only.'
  : 'Convivia24 supplies drinks for your event — plan the party, build your basket, and get spirits, Champagne, and party packs delivered nationwide across Nigeria. Guest Card perks, brand trivia, and partner wholesale. Adults 18+ only.';

export const SITE_KEYWORDS = eventsEnabled
  ? [
      'Convivia24',
      'Nigeria drinks delivery',
      'nationwide alcohol delivery',
      'order drinks to club Nigeria',
      'party pack Nigeria',
      'nightlife events Nigeria',
      'venue drinks wholesale',
      'lounge bottle service',
      'Guest Card Convivia',
      'partner wholesale drinks Nigeria',
      'brand trivia Nigeria',
      'alcohol delivery Nigeria 18+',
    ]
  : [
      'Convivia24',
      'Nigeria drinks delivery',
      'drink supplies for events',
      'party planner drinks Nigeria',
      'nationwide alcohol delivery',
      'order drinks for party Nigeria',
      'party pack Nigeria',
      'event drink delivery Nigeria',
      'lounge bottle service',
      'Guest Card Convivia',
      'partner wholesale drinks Nigeria',
      'brand trivia Nigeria',
      'alcohol delivery Nigeria 18+',
    ];

export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageTitle(page?: string): string {
  if (!page) return `${SITE_NAME} | ${SITE_TAGLINE}`;
  return `${page} | ${SITE_NAME}`;
}
