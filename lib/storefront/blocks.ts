/**
 * Storefront editorial slots — hero banners, the announcement bar, highlight tiles and
 * "Get inspired" cards. Edited in the admin desk (Storefront tab); the defaults below render
 * whenever a slot has nothing published, so the home page is never empty.
 *
 * Pure module: safe to import from client components.
 */

export const BLOCK_KINDS = ['hero', 'announcement', 'highlight', 'editorial'] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export const BLOCK_THEMES = ['ember', 'night', 'palm', 'gold', 'cream'] as const;
export type BlockTheme = (typeof BLOCK_THEMES)[number];

export const BLOCK_KIND_LABELS: Record<BlockKind, string> = {
  hero: 'Hero banners',
  announcement: 'Announcement bar',
  highlight: 'Highlights',
  editorial: 'Get inspired',
};

export const BLOCK_THEME_LABELS: Record<BlockTheme, string> = {
  ember: 'Ember (oxblood)',
  night: 'Night (black)',
  palm: 'Palm (green)',
  gold: 'Gold (amber)',
  cream: 'Cream (light)',
};

export type StorefrontBlock = {
  id: string;
  kind: BlockKind;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  href: string | null;
  imageUrl: string | null;
  theme: BlockTheme;
  position: number;
  published: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type StorefrontContent = Record<BlockKind, StorefrontBlock[]>;

export function isBlockKind(v: unknown): v is BlockKind {
  return typeof v === 'string' && (BLOCK_KINDS as readonly string[]).includes(v);
}

export function isBlockTheme(v: unknown): v is BlockTheme {
  return typeof v === 'string' && (BLOCK_THEMES as readonly string[]).includes(v);
}

/** Published and inside its schedule window at `now`. */
export function isLive(block: Pick<StorefrontBlock, 'published' | 'startsAt' | 'endsAt'>, now = new Date()): boolean {
  if (!block.published) return false;
  if (block.startsAt && new Date(block.startsAt) > now) return false;
  if (block.endsAt && new Date(block.endsAt) <= now) return false;
  return true;
}

/**
 * Only internal paths and https links are allowed as targets — a desk typo must never become a
 * `javascript:` link on the home page.
 */
export function safeHref(href: string | null | undefined): string | null {
  const v = (href || '').trim();
  if (!v) return null;
  if (v.startsWith('/') && !v.startsWith('//')) return v;
  try {
    const url = new URL(v);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function def(kind: BlockKind, i: number, b: Partial<StorefrontBlock> & { title: string }): StorefrontBlock {
  return {
    id: `default-${kind}-${i}`,
    kind,
    subtitle: null,
    ctaLabel: null,
    href: null,
    imageUrl: null,
    theme: 'ember',
    position: i,
    published: true,
    startsAt: null,
    endsAt: null,
    ...b,
  };
}

/** Built-in content, shown per slot until the desk publishes its own. */
export const DEFAULT_CONTENT: StorefrontContent = {
  announcement: [
    def('announcement', 0, {
      title: 'Delivery in supported areas across Nigeria · Secure checkout with Flutterwave',
      href: '/delivery-and-returns',
      ctaLabel: 'Details',
      theme: 'palm',
    }),
  ],
  hero: [
    def('hero', 0, {
      title: 'The good bottles, delivered',
      subtitle: 'Cognac, whisky, Champagne and tequila — original stock, delivered to your door.',
      ctaLabel: 'Shop now',
      href: '/shop',
      theme: 'night',
    }),
    def('hero', 1, {
      title: 'Planning an owambe?',
      subtitle: 'Tell us the guest count and budget. We build the drinks, mixers and delivery.',
      ctaLabel: 'Plan my party',
      href: '/party-planner',
      theme: 'ember',
    }),
    def('hero', 2, {
      title: 'Bubbles for the big moments',
      subtitle: 'Champagne and prosecco for weddings, birthdays and the table at the lounge.',
      ctaLabel: 'Shop Champagne',
      href: '/shop?type=champagne',
      theme: 'gold',
    }),
  ],
  highlight: [
    def('highlight', 0, {
      title: 'Party packs, sorted',
      subtitle: 'Ready-made bundles for every guest count',
      href: '/shop?section=packages',
      theme: 'ember',
    }),
    def('highlight', 1, {
      title: 'Single malts worth gifting',
      subtitle: 'Glenfiddich, Macallan, Glenlivet and more',
      href: '/shop?type=whisky&brand=Glenfiddich,The Macallan,The Glenlivet,Glenmorangie',
      theme: 'gold',
    }),
    def('highlight', 2, {
      title: 'Tequila season',
      subtitle: 'Casamigos, Don Julio, Clase Azul',
      href: '/shop?q=tequila',
      theme: 'palm',
    }),
    def('highlight', 3, {
      title: 'Cognac for the table',
      subtitle: 'Hennessy, Martell, Rémy Martin',
      href: '/shop?type=cognac',
      theme: 'night',
    }),
  ],
  editorial: [
    def('editorial', 0, {
      title: 'Find your taste profile',
      subtitle: 'Answer a few questions and we match you to bottles you will actually love.',
      href: '/discover/taste',
      ctaLabel: 'Take the quiz',
      theme: 'cream',
    }),
    def('editorial', 1, {
      title: 'How much drink for 100 guests?',
      subtitle: 'Our party planner does the maths — bottles, mixers and ice for any guest list.',
      href: '/party-planner',
      ctaLabel: 'Plan a party',
      theme: 'ember',
    }),
    def('editorial', 2, {
      title: 'Meet the houses',
      subtitle: 'The stories behind the cognac, whisky and Champagne houses we stock.',
      href: '/brands',
      ctaLabel: 'Explore brands',
      theme: 'night',
    }),
  ],
};

/** Group rows by kind, keep live ones, and fall back to defaults per empty slot. */
export function resolveContent(rows: StorefrontBlock[], now = new Date()): StorefrontContent {
  const out = {} as StorefrontContent;
  for (const kind of BLOCK_KINDS) {
    const live = rows
      .filter((r) => r.kind === kind && isLive(r, now))
      .sort((a, b) => a.position - b.position);
    out[kind] = live.length ? live : DEFAULT_CONTENT[kind];
  }
  return out;
}

/** Background treatment per theme — shared by the storefront and the desk preview. */
export const THEME_CLASSES: Record<BlockTheme, { bg: string; text: string; sub: string; button: string }> = {
  ember: {
    bg: 'bg-[linear-gradient(118deg,#1a0806_0%,#4a1512_45%,#8B2A22_100%)]',
    text: 'text-white',
    sub: 'text-white/75',
    button: 'bg-white text-obsidian hover:bg-cream',
  },
  night: {
    bg: 'bg-[linear-gradient(118deg,#050505_0%,#141212_55%,#2a1210_100%)]',
    text: 'text-white',
    sub: 'text-white/70',
    button: 'bg-white text-obsidian hover:bg-cream',
  },
  palm: {
    bg: 'bg-[linear-gradient(118deg,#062a20_0%,#0d4434_55%,#14593f_100%)]',
    text: 'text-white',
    sub: 'text-white/75',
    button: 'bg-white text-obsidian hover:bg-cream',
  },
  gold: {
    bg: 'bg-[linear-gradient(118deg,#3a2306_0%,#8a5a12_55%,#c9902a_100%)]',
    text: 'text-white',
    sub: 'text-white/80',
    button: 'bg-white text-obsidian hover:bg-cream',
  },
  cream: {
    bg: 'bg-[#f6f1ea]',
    text: 'text-obsidian',
    sub: 'text-obsidian/65',
    button: 'bg-obsidian text-white hover:bg-obsidian/85',
  },
};
