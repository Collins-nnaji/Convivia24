'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getDrinkBySlug, SAMPLE_PAYMENT_SLUG } from '@/lib/drinks/catalog';
import { useUser } from '@/components/auth/AuthProvider';

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

function withSampleDrink(lines: CartLine[]): CartLine[] {
  const product = getDrinkBySlug(SAMPLE_PAYMENT_SLUG);
  if (!product) return lines;
  if (lines.some((l) => l.slug === SAMPLE_PAYMENT_SLUG)) return lines;
  return [
    {
      slug: product.slug,
      name: product.name,
      priceNgn: product.priceNgn,
      qty: 1,
    },
    ...lines,
  ];
}

function loadCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return withSampleDrink([]);
    const parsed = JSON.parse(raw) as CartLine[];
    const loaded = Array.isArray(parsed) ? normalizeLines(parsed) : [];
    return withSampleDrink(loaded);
  } catch {
    return withSampleDrink([]);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user, loading: authLoading } = useUser();
  const syncedForUser = useRef<string | null>(null);

  useEffect(() => {
    setLines(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  // Signed-in users get a server-backed cart so it survives a device switch —
  // on sign-in, adopt the server's cart if it has one, otherwise push the
  // local (guest) cart up so it isn't lost.
  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (!user) {
      syncedForUser.current = null;
      return;
    }
    if (syncedForUser.current === user.id) return;
    syncedForUser.current = user.id;

    fetch('/api/cart')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const serverItems = Array.isArray(data?.items) ? (data.items as CartLine[]) : [];
        if (serverItems.length > 0) {
          setLines(withSampleDrink(normalizeLines(serverItems)));
        } else if (lines.length > 0) {
          fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: lines }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
    // Only re-run when sign-in state changes — not on every cart edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, authLoading, user]);

  useEffect(() => {
    if (!hydrated || authLoading || !user || syncedForUser.current !== user.id) return;
    fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: lines }),
    }).catch(() => {});
  }, [lines, hydrated, authLoading, user]);

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
