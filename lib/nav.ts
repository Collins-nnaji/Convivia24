import { eventsEnabled } from '@/lib/features';

export type NavLink = { label: string; href: string };

/** Primary consumer nav — events hidden for MVP unless flag is on. */
export function primaryNavLinks(): NavLink[] {
  const links: NavLink[] = [{ label: 'Shop', href: '/shop' }];
  if (eventsEnabled) {
    links.push({ label: 'Events', href: '/events' });
  } else {
    links.push({ label: 'Plan', href: '/plan' });
  }
  links.push({ label: 'Trivia', href: '/trivia' });
  return links;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/shop') return pathname === '/shop' || pathname.startsWith('/shop/');
  if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
  if (href === '/plan') return pathname === '/plan' || pathname.startsWith('/plan/');
  if (href === '/trivia') return pathname === '/trivia' || pathname.startsWith('/trivia/');
  if (href === '/partners') return pathname === '/partners' || pathname.startsWith('/partners/');
  if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where to send users when events are hidden. */
export function eventsFallbackHref(): string {
  return eventsEnabled ? '/events' : '/plan';
}
