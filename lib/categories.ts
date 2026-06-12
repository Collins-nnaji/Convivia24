// Pure, client-safe event taxonomy. No server/DB imports — safe to import anywhere.

export const CATEGORIES = [
  'party', 'concert', 'festival', 'nightlife', 'conference',
  'comedy', 'sports', 'food', 'arts', 'community', 'workshop', 'other',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  party: 'Parties', concert: 'Concerts', festival: 'Festivals', nightlife: 'Nightlife',
  conference: 'Conferences', comedy: 'Comedy', sports: 'Sports', food: 'Food & Drink',
  arts: 'Arts & Culture', community: 'Community', workshop: 'Workshops', other: 'Other',
};
