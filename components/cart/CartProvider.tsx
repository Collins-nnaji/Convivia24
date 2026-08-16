'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getDrinkBySlug } from '@/lib/drinks/catalog';

export type CartLine = {
  slug: string;
  name: string;
  priceNgn: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalNgn: number;
  addProduct: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  refreshPrices: () => void;
};

const STORAGE_KEY = 'convivia_drinks_cart';
const CartContext = createContext<CartContextValue | null>(null);

function normalizeLines(raw: CartLine[]): CartLine[] {
  return raw
    .map((line) => {
      const product = getDrinkBySlug(line.slug);
      if (!product) return null;
      return {
        slug: product.slug,
        name: product.name,
        priceNgn: product.priceNgn,
        qty: Math.max(1, Math.min(24, Number(line.qty) || 1)),
      } satisfies CartLine;
    })
    .filter(Boolean) as CartLine[];
}

function loadCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? normalizeLines(parsed) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addProduct = useCallback((slug: string, qty = 1) => {
    const product = getDrinkBySlug(slug);
    if (!product) return;
    const addQty = Math.max(1, Math.min(24, qty));
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug
            ? {
                ...l,
                qty: Math.min(24, l.qty + addQty),
                priceNgn: product.priceNgn,
                name: product.name,
              }
            : l
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          priceNgn: product.priceNgn,
          qty: addQty,
        },
      ];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.slug !== slug);
      return prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(24, qty) } : l));
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const refreshPrices = useCallback(() => {
    setLines((prev) => normalizeLines(prev));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotalNgn = lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
    return {
      lines,
      count,
      subtotalNgn,
      addProduct,
      setQty,
      remove,
      clear,
      refreshPrices,
    };
  }, [lines, addProduct, setQty, remove, clear, refreshPrices]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
