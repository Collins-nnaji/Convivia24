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
import { getRitualBySlug, type AbvTrack } from '@/lib/rituals/catalog';

export type CartLine = {
  slug: string;
  name: string;
  priceNgn: number;
  qty: number;
  preferTrack: AbvTrack;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalNgn: number;
  addKit: (slug: string, preferTrack?: AbvTrack, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  setPreferTrack: (slug: string, preferTrack: AbvTrack) => void;
  remove: (slug: string) => void;
  clear: () => void;
  refreshPrices: () => void;
};

const STORAGE_KEY = 'convivia_ritual_cart';
const CartContext = createContext<CartContextValue | null>(null);

function normalizeLines(raw: CartLine[]): CartLine[] {
  return raw
    .map((line) => {
      const kit = getRitualBySlug(line.slug);
      if (!kit) return null;
      const preferTrack =
        line.preferTrack === 'spirit' || line.preferTrack === 'zero' || line.preferTrack === 'mixed'
          ? line.preferTrack
          : kit.track;
      return {
        slug: kit.slug,
        name: kit.name,
        priceNgn: kit.priceNgn,
        qty: Math.max(1, Math.min(12, Number(line.qty) || 1)),
        preferTrack,
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

  const addKit = useCallback((slug: string, preferTrack: AbvTrack = 'mixed', qty = 1) => {
    const kit = getRitualBySlug(slug);
    if (!kit) return;
    const addQty = Math.max(1, Math.min(12, qty));
    const track = preferTrack === 'mixed' && kit.track !== 'mixed' ? kit.track : preferTrack;
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug
            ? {
                ...l,
                qty: Math.min(12, l.qty + addQty),
                preferTrack: track,
                priceNgn: kit.priceNgn,
                name: kit.name,
              }
            : l
        );
      }
      return [
        ...prev,
        {
          slug: kit.slug,
          name: kit.name,
          priceNgn: kit.priceNgn,
          qty: addQty,
          preferTrack: track,
        },
      ];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.slug !== slug);
      return prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(12, qty) } : l));
    });
  }, []);

  const setPreferTrack = useCallback((slug: string, preferTrack: AbvTrack) => {
    setLines((prev) => prev.map((l) => (l.slug === slug ? { ...l, preferTrack } : l)));
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
      addKit,
      setQty,
      setPreferTrack,
      remove,
      clear,
      refreshPrices,
    };
  }, [lines, addKit, setQty, setPreferTrack, remove, clear, refreshPrices]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
