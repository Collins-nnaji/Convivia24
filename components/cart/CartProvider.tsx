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
import type { DrinkProduct } from '@/lib/drinks/catalog';
import { findSellable } from '@/lib/catalog/sellable';
import { useUser } from '@/components/auth/AuthProvider';
import CartToast from '@/components/cart/CartToast';

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
  toast: { name: string } | null;
  addProduct: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  refreshPrices: () => void;
  dismissToast: () => void;
};

const STORAGE_KEY = 'convivia_drinks_cart';
const CartContext = createContext<CartContextValue | null>(null);

function normalizeLines(raw: CartLine[], catalog: Map<string, DrinkProduct> = new Map()): CartLine[] {
  return raw
    .map((line) => {
      // Resolves shop bottles and event packages alike — packages are not in DRINKS.
      const product = catalog.get(line.slug) || findSellable(line.slug);
      if (!product) {
        // Preserve persisted live-only products until the server catalog loads.
        if (typeof line.slug !== 'string' || !line.slug || !Number.isFinite(line.qty)) return null;
        return { slug: line.slug, name: line.name || line.slug, priceNgn: Number.isFinite(line.priceNgn) ? line.priceNgn : 0, qty: Math.max(1, Math.min(24, Math.floor(line.qty))) };
      }
      const min = Math.max(1, Math.min(24, Math.floor(product.minOrderQty ?? 1)));
      return {
        slug: product.slug,
        name: product.name,
        priceNgn: product.priceNgn,
        qty: Math.max(min, Math.min(24, Math.floor(Number(line.qty)) || min)),
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
  const [toast, setToast] = useState<{ name: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, loading: authLoading } = useUser();
  const syncedForUser = useRef<string | null>(null);
  const [cartUser, setCartUser] = useState<string | null>(null);
  const catalog = useRef(new Map<string, DrinkProduct>());

  useEffect(() => {
    fetch('/api/shop/catalog').then((res) => res.ok ? res.json() : null).then((data) => {
      if (!Array.isArray(data?.products)) return;
      catalog.current = new Map(data.products.map((product: DrinkProduct) => [product.slug, product]));
      setLines((previous) => normalizeLines(previous, catalog.current));
    }).catch(() => {});
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

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
      setCartUser(null);
      return;
    }
    if (syncedForUser.current === user.id) return;
    syncedForUser.current = user.id;

    let cancelled = false;
    fetch('/api/cart')
      .then((res) => { if (!res.ok) throw new Error('Cart unavailable'); return res.json(); })
      .then((data) => {
        if (cancelled) return;
        const previousOwner = localStorage.getItem('convivia_cart_owner');
        const serverItems = Array.isArray(data?.items) ? (data.items as CartLine[]) : [];
        if (serverItems.length > 0) {
          setLines((previous) => {
            const merged = new Map((previousOwner ? [] : previous).map((line) => [line.slug, line]));
            for (const line of serverItems) {
              const local = merged.get(line.slug);
              merged.set(line.slug, { ...line, qty: Math.min(24, line.qty + (local?.qty || 0)) });
            }
            return normalizeLines([...merged.values()], catalog.current);
          });
        } else if (previousOwner && previousOwner !== user.id) setLines([]);
        localStorage.setItem('convivia_cart_owner', user.id);
        setCartUser(user.id);
      })
      .catch(() => { syncedForUser.current = null; });
    return () => { cancelled = true; };
    // Only re-run when sign-in state changes — not on every cart edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, authLoading, user]);

  useEffect(() => {
    if (!hydrated || authLoading || !user || cartUser !== user.id) return;
    fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: lines }),
    }).catch(() => {});
  }, [lines, hydrated, authLoading, user, cartUser]);

  const addProduct = useCallback((slug: string, qty = 1) => {
    const product = catalog.current.get(slug) || findSellable(slug);
    if (!product) return;
    const min = Math.max(1, Math.min(24, Math.floor(product.minOrderQty ?? 1)));
    const addQty = Math.max(min, Math.min(24, qty));
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      if (existing) {
        return prev.map((l) =>
          l.slug === slug
            ? {
                ...l,
                qty: Math.min(24, l.qty + Math.max(1, Math.min(24, qty))),
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
    setToast({ name: product.name });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    const product = catalog.current.get(slug) || findSellable(slug);
    const min = Math.max(1, Math.min(24, Math.floor(product?.minOrderQty ?? 1)));
    setLines((prev) => {
      if (qty < min) return prev.filter((l) => l.slug !== slug);
      return prev.map((l) => (l.slug === slug ? { ...l, qty: Math.min(24, qty) } : l));
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const refreshPrices = useCallback(() => {
    setLines((prev) => normalizeLines(prev, catalog.current));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotalNgn = lines.reduce((n, l) => n + l.priceNgn * l.qty, 0);
    return {
      lines,
      count,
      subtotalNgn,
      toast,
      addProduct,
      setQty,
      remove,
      clear,
      refreshPrices,
      dismissToast,
    };
  }, [lines, toast, addProduct, setQty, remove, clear, refreshPrices, dismissToast]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartToast />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
