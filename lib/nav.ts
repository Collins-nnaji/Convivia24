export type NavLink = {
  label: string;
  href: string;
  icon?: 'gift';
  accent?: boolean;
  /**
   * Sub-destinations shown under the link. Challenges and the rewards shop are
   * tabs on /trivia rather than pages of their own, so the nav surfaces them
   * here instead of adding two more top-level entries.
   */
  children?: { label: string; href: string }[];
};

/** Primary consumer nav — planning is now a standalone product surface. */
export function primaryNavLinks(): NavLink[] {
  const links: NavLink[] = [
    { label: 'Shop', href: '/shop' },
    { label: 'Party Planner', href: '/plan' },
  ];
  links.push({
    label: 'Discover',
    href: '/trivia',
    icon: 'gift',
    accent: true,
    children: [
      { label: 'Discover', href: '/trivia' },
      { label: 'Challenges', href: '/trivia?tab=challenges' },
      { label: 'Rewards shop', href: '/trivia?tab=rewards' },
    ],
  });
  links.push({ label: 'Brands', href: '/brands' });
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
    return pathname === '/plan' || pathname.startsWith('/plan/');
  }
  if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
  if (href === '/trivia') return pathname === '/trivia' || pathname.startsWith('/trivia/');
  // Campaign pages belong to the brand that sponsors them.
  if (href === '/brands') return pathname === '/brands' || pathname.startsWith('/brands/') || pathname.startsWith('/campaigns/');
  if (href === '/contact') return pathname === '/contact';
  if (href === '/partners') return pathname.startsWith('/partners/');
  if (href === '/refer') return pathname === '/refer' || pathname.startsWith('/refer/');
  if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where to send users when events are hidden. */
export function eventsFallbackHref(): string {
  return '/plan';
}
