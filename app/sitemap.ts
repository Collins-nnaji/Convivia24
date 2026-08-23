import type { MetadataRoute } from 'next';
import { DRINKS } from '@/lib/drinks/catalog';
import { eventsEnabled } from '@/lib/features';
import { absoluteUrl } from '@/lib/seo';

const MVP_PATHS = ['/', '/shop', '/plan', '/trivia', '/partners', '/card', '/convivium', '/privacy', '/terms'];

const FULL_PATHS = [...MVP_PATHS, '/events', '/venues', '/circles'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = eventsEnabled ? FULL_PATHS : MVP_PATHS;

  const pages: MetadataRoute.Sitemap = paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency:
      path === '/' || path === '/shop' || path === '/plan' || path === '/events' ? 'daily' : 'weekly',
    priority:
      path === '/'
        ? 1
        : path === '/shop' || path === '/plan' || path === '/events'
          ? 0.9
          : 0.6,
  }));

  const products: MetadataRoute.Sitemap = DRINKS.map((d) => ({
    url: absoluteUrl(`/shop/${d.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...pages, ...products];
}
