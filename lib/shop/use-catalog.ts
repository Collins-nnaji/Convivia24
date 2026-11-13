'use client';

import { useEffect, useState } from 'react';
import { DRINKS, type DrinkProduct } from '@/lib/drinks/catalog';

export type CatalogProduct = DrinkProduct & {
  tasteNote?: string | null;
  onHand?: number;
  available?: number;
  lowStock?: boolean;
  rating?: number;
  ratingCount?: number;
};

/**
 * One catalog request per page load, shared by the header search, the shop and the cart.
 * Starts from the bundled seed list so nothing renders empty while the live catalog loads.
 */
let pending: Promise<CatalogProduct[] | null> | null = null;
let loaded: CatalogProduct[] | null = null;

export function loadCatalog(): Promise<CatalogProduct[] | null> {
  if (loaded) return Promise.resolve(loaded);
  if (!pending) {
    pending = fetch('/api/shop/catalog')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.products) && data.products.length) loaded = data.products;
        return loaded;
      })
      .catch(() => null)
      .finally(() => {
        // A failed load may be retried by the next consumer.
        if (!loaded) pending = null;
      });
  }
  return pending;
}

export function useCatalog(initial?: CatalogProduct[]): { products: CatalogProduct[]; live: boolean } {
  const [products, setProducts] = useState<CatalogProduct[]>(loaded ?? initial ?? DRINKS);
  const [live, setLive] = useState(Boolean(loaded || initial));
  useEffect(() => {
    let cancelled = false;
    loadCatalog().then((list) => {
      if (!cancelled && list) {
        setProducts(list);
        setLive(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return { products, live };
}

/** Best-selling slugs from real orders, shared the same way. */
let sellersPending: Promise<string[]> | null = null;
export function loadBestSellers(): Promise<string[]> {
  if (!sellersPending) {
    sellersPending = fetch('/api/storefront')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (Array.isArray(d?.bestSellers) ? (d.bestSellers as string[]) : []))
      .catch(() => []);
  }
  return sellersPending;
}
