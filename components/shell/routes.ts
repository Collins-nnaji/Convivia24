/**
 * What chrome each route gets.
 *
 * On a phone the site behaves like an app: a bottom tab bar for the places you
 * live in, and focused flows (creating, joining, ordering) that take over the
 * whole screen and hand you a back arrow instead. Desktop keeps the marketing
 * header throughout.
 */

export type MobileHeader = 'none' | 'solid' | 'overlay';

export interface Chrome {
  /** Bottom tab bar — only on the routes you return to. */
  tabBar: boolean;
  /** Marketing footer — off inside the app screens. */
  footer: boolean;
  mobileHeader: MobileHeader;
  title: string;
  /** Where the mobile back arrow goes; absent means this is a root tab. */
  back?: string;
}

const ROOT: Chrome = { tabBar: true, footer: true, mobileHeader: 'solid', title: 'Convivia24' };

export function chromeFor(pathname: string): Chrome {
  if (pathname === '/') {
    return { ...ROOT, mobileHeader: 'overlay', title: 'Convivia24' };
  }
  if (pathname === '/moments') {
    return { ...ROOT, footer: false, title: 'Moments' };
  }
  if (pathname === '/discover') {
    return { ...ROOT, footer: false, title: 'Discover' };
  }
  if (pathname.startsWith('/discover/')) {
    // No tab bar: this screen ends in a fixed "take a seat" bar, and two stacked
    // bars means the tab bar sits on top of the only button that matters.
    return { tabBar: false, footer: false, mobileHeader: 'overlay', title: 'Open table', back: '/discover' };
  }
  if (pathname === '/places') {
    return { ...ROOT, footer: false, title: 'Places' };
  }
  if (pathname.startsWith('/places/')) {
    return { tabBar: true, footer: false, mobileHeader: 'overlay', title: 'Menu', back: '/places' };
  }
  if (pathname === '/meetups') {
    return { ...ROOT, footer: false, title: 'Meetups' };
  }
  if (pathname === '/meetups/new') {
    return { tabBar: false, footer: false, mobileHeader: 'solid', title: 'New meetup', back: '/meetups' };
  }
  if (pathname === '/meetups/join') {
    return { tabBar: false, footer: false, mobileHeader: 'solid', title: 'Join', back: '/meetups' };
  }
  if (pathname.startsWith('/meetups/')) {
    // The meetup screen draws its own header, order bar and split sheet.
    return { tabBar: false, footer: false, mobileHeader: 'none', title: 'Meetup' };
  }
  return { tabBar: false, footer: true, mobileHeader: 'solid', title: 'Convivia24', back: '/' };
}
