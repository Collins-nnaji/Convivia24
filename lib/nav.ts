export type NavLink = {
  label: string;
  href: string;
  icon?: 'gift';
  accent?: boolean;
  /** Sub-destinations shown under the link — the Discover hub's sections. */
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
  });
  links.push({ label: 'Brands', href: '/brands' });
  return links;
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/shop' || href.startsWith('/shop?')) {
    return pathname === '/shop' || pathname.startsWith('/shop/') || pathname === '/your-referrals';
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
  if (href === '/discover') {
    return pathname === '/discover' || pathname.startsWith('/discover/');
  }
  if (href.startsWith('/discover/')) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === '/trivia' || href.startsWith('/trivia')) {
    return pathname === '/discover' || pathname.startsWith('/discover/');
  }
  // Campaign pages belong to the brand that sponsors them.
  if (href === '/brands') return pathname === '/brands' || pathname.startsWith('/brands/') || pathname.startsWith('/campaigns/');
  if (href === '/contact') return pathname === '/contact';
  if (href === '/partners') return pathname.startsWith('/partners/');
  if (href === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where to send users when events are hidden. */
export function eventsFallbackHref(): string {
  return '/party-planner';
}
