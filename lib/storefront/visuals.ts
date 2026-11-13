import type { DrinkProduct } from '@/lib/drinks/catalog';

/**
 * Bottles to illustrate a banner or tile that has no image of its own: whatever its link points at
 * (a ?type=, ?brand= or ?q= search), else the fallback list. Only photographed bottles qualify.
 */
export function bottlesForHref<T extends DrinkProduct>(href: string | null | undefined, products: T[], fallback: T[], n = 3): T[] {
  const url = (() => {
    try {
      return new URL(href || '/', 'https://x.invalid');
    } catch {
      return null;
    }
  })();
  const photographed = products.filter((p) => p.image && !p.partyPack && !p.sample);
  let pool: T[] = [];
  if (url) {
    const types = (url.searchParams.get('type') || '').split(',').filter(Boolean);
    const brands = (url.searchParams.get('brand') || '').split(',').filter(Boolean);
    const q = (url.searchParams.get('q') || '').toLowerCase().trim();
    if (types.length) pool = photographed.filter((p) => types.includes(p.category));
    if (brands.length) pool = (pool.length ? pool : photographed).filter((p) => p.brand && brands.includes(p.brand));
    if (!types.length && !brands.length && q) {
      pool = photographed.filter((p) => `${p.name} ${p.brand ?? ''} ${p.description}`.toLowerCase().includes(q));
    }
  }
  const ranked = [...pool].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return (ranked.length >= n ? ranked : [...ranked, ...fallback.filter((f) => !ranked.includes(f))]).slice(0, n);
}
