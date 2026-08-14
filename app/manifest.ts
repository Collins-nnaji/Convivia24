import type { MetadataRoute } from 'next';

/**
 * Installable to a home screen. `standalone` drops the browser chrome so the
 * bottom tab bar becomes the only navigation, which is how the app is designed
 * to be used.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Convivia24 — Gather. Share. Remember.',
    short_name: 'Convivia24',
    description:
      'An app for eating and drinking with people. Find an open table, keep the night, and let the bill work itself out.',
    start_url: '/moments',
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
      { name: 'Post a moment', short_name: 'Moment', url: '/moments' },
      { name: 'Find a table', short_name: 'Discover', url: '/discover' },
      { name: 'New gathering', short_name: 'New', url: '/meetups/new' },
    ],
  };
}
