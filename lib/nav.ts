export type NavLink = {
  label: string;
  href: string;
  icon?: 'gift';
  accent?: boolean;
  /**
   * Sub-destinations shown under the link. The rewards shop is a tab on
   * /discover rather than a page of its own, so the nav surfaces it here.
   */
  children?: { label: string; href: string }[];
};

/** Primary consumer nav — planning is now a standalone product surface. */
export function primaryNavLinks(): NavLink[] {
  const links: NavLink[] = [
    { label: 'Shop', href: '/shop' },
    { label: 'Party Planner', href: '/party-planner' },
  ];
  links.push({
    label: 'Discover',
    href: '/discover',
    icon: 'gift',
    accent: true,
    children: [
      { label: 'Discover', href: '/discover' },
      { label: 'Rewards shop', href: '/discover?tab=rewards-shop' },
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
  if (href === '/party-planner' || href.startsWith('/party-planner')) {
    return pathname === '/party-planner' || pathname.startsWith('/party-planner/');
  }
  if (href === '/plan' || href.startsWith('/plan')) {
    return pathname === '/party-planner' || pathname.startsWith('/party-planner/');
  }
  if (href === '/events') return pathname === '/events' || pathname.startsWith('/events/');
  if (href === '/discover' || href.startsWith('/discover')) {
    return pathname === '/discover' || pathname.startsWith('/discover/');
  }
  if (href === '/trivia' || href.startsWith('/trivia')) {
    return pathname === '/discover' || pathname.startsWith('/discover/');
  }
  // Campaign pages belong to the brand that sponsors them.
  if (href === '/brands') return pathname === '/brands' || pathname.startsWith('/brands/') || pathname.startsWith('/campaigns/');
  if (href === '/contact') return pathname === '/contact';
  if (href === '/partners') return pathname.startsWith('/partners/');
  if (href === '/refer-and-earn' || href === '/refer') {
    return pathname === '/refer-and-earn' || pathname.startsWith('/refer-and-earn/') || pathname === '/your-referrals';
  }
  if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where to send users when events are hidden. */
export function eventsFallbackHref(): string {
  return '/party-planner';
}
