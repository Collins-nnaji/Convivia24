import type { MetadataRoute } from 'next';

/**
 * Installable to a home screen. `standalone` drops the browser chrome so the
 * bottom tab bar becomes the only navigation, which is how the app is designed
 * to be used.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Convivia24 — Gather. Order. Split.',
    short_name: 'Convivia24',
    description:
      'Plan a meal out with friends and see the split before you go. Real menus, real prices, and everyone’s share worked out as the order grows.',
    start_url: '/meetups',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    categories: ['food', 'lifestyle', 'social'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'New meetup', short_name: 'New', url: '/meetups/new' },
      { name: 'Browse places', short_name: 'Places', url: '/places' },
    ],
  };
}
