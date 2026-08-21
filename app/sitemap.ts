import type { MetadataRoute } from 'next';
import { DRINKS } from '@/lib/drinks/catalog';
import { absoluteUrl } from '@/lib/seo';

const PUBLIC_PATHS = [
  '/',
  '/shop',
  '/events',
  '/trivia',
  '/partners',
  '/card',
  '/convivium',
  '/privacy',
  '/terms',
  '/venues',
  '/circles',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' || path === '/shop' || path === '/events' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/shop' || path === '/events' ? 0.9 : 0.6,
  }));

  const products: MetadataRoute.Sitemap = DRINKS.map((d) => ({
    url: absoluteUrl(`/shop/${d.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...pages, ...products];
}
