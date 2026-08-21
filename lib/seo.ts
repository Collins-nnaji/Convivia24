/** Shared SEO copy — keep in sync with what the live product actually is. */

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://convivia24.com').replace(/\/$/, '');

export const SITE_NAME = 'Convivia24';

export const SITE_TAGLINE = 'Lagos drinks, nights out & venue drops';

export const SITE_DESCRIPTION =
  'Convivia24 is Lagos nightlife commerce: order spirits and party packs to the club, lounge, or house party; discover events and venues; follow circles; earn Guest Card perks; and partner venues buy wholesale. Adults 18+ only.';

export const SITE_KEYWORDS = [
  'Convivia24',
  'Lagos drinks delivery',
  'Lagos nightlife',
  'order drinks to club Lagos',
  'party pack Lagos',
  'Lagos events',
  'Lagos venues',
  'lounge bottle service',
  'Guest Card Convivia',
  'partner wholesale drinks Lagos',
  'brand trivia Lagos',
  'alcohol delivery Lagos 18+',
];

export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageTitle(page?: string): string {
  if (!page) return `${SITE_NAME} | ${SITE_TAGLINE}`;
  return `${page} | ${SITE_NAME}`;
}
