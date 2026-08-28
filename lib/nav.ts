import { eventsEnabled } from '@/lib/features';

export type NavLink = {
  label: string;
  href: string;
  icon?: 'gift';
  accent?: boolean;
};

/** Primary consumer nav — shop holds bottles, packages, and planner. */
export function primaryNavLinks(): NavLink[] {
  const links: NavLink[] = [{ label: 'Shop', href: '/shop' }];
  if (eventsEnabled) {
    links.push({ label: 'Events', href: '/events' });
  }
  links.push({ label: 'Trivia', href: '/trivia', icon: 'gift', accent: true });
  return links;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/shop' || href.startsWith('/shop?')) {
    return pathname === '/shop' || pathname.startsWith('/shop/');
  }
  if (href === '/packages' || href.startsWith('/packages')) {
    return pathname === '/shop';
  }
  if (href === '/plan' || href.startsWith('/plan')) {
    return pathname === '/shop';
  }
  if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
  if (href === '/trivia') return pathname === '/trivia' || pathname.startsWith('/trivia/');
  if (href === '/contact') return pathname === '/contact';
  if (href === '/partners') return pathname.startsWith('/partners/');
  if (href === '/refer') return pathname === '/refer' || pathname.startsWith('/refer/');
  if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where to send users when events are hidden. */
export function eventsFallbackHref(): string {
  return eventsEnabled ? '/events' : '/shop?section=plan';
}
