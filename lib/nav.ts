import { eventsEnabled } from '@/lib/features';

export type NavLink = {
  label: string;
  href: string;
  /** Named icon the nav renders beside the label. Only set where a link needs to stand apart. */
  icon?: 'gift';
  /** Renders in the brand accent rather than plain nav text — a promo link, not a core section. */
  accent?: boolean;
};

/** Primary consumer nav — events hidden for MVP unless flag is on. */
export function primaryNavLinks(): NavLink[] {
  const links: NavLink[] = [
    { label: 'Shop', href: '/shop' },
    { label: 'Packages', href: '/packages' },
  ];
  if (eventsEnabled) {
    links.push({ label: 'Events', href: '/events' });
  } else {
    links.push({ label: 'Plan', href: '/plan' });
  }
  // Trivia is a promo surface, not a shopping step — it gets an icon and the accent treatment so it
  // reads as separate from Shop / Packages / Plan.
  links.push({ label: 'Trivia', href: '/trivia', icon: 'gift', accent: true });
  return links;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/shop') return pathname === '/shop' || pathname.startsWith('/shop/');
  if (href === '/packages') return pathname === '/packages' || pathname.startsWith('/packages/');
  if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
  if (href === '/plan') return pathname === '/plan' || pathname.startsWith('/plan/');
  if (href === '/trivia') return pathname === '/trivia' || pathname.startsWith('/trivia/');
  if (href === '/partners') return pathname === '/partners' || pathname.startsWith('/partners/');
  if (href === '/refer') return pathname === '/refer' || pathname.startsWith('/refer/');
  if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where to send users when events are hidden. */
export function eventsFallbackHref(): string {
  return eventsEnabled ? '/events' : '/plan';
}
