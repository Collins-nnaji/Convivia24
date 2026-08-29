'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Things the visitor has saved — bottles on the shop, nights on the events
 * page. Kept in the browser rather than an account table: a saved list is a
 * private, low-stakes convenience and this way it works signed out. Every read
 * and write is guarded, because private windows throw on localStorage.
 */
export type SavedList = 'bottles' | 'events';

const KEYS: Record<SavedList, string> = {
  bottles: 'convivia_wishlist',
  events: 'convivia_saved_events',
};

const EVENT = 'convivia:saved';

function read(list: SavedList): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEYS[list]) || '[]');
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function write(list: SavedList, ids: string[]) {
  try {
    localStorage.setItem(KEYS[list], JSON.stringify(ids.slice(0, 200)));
  } catch {
    /* private mode — the toggle still works for this page view */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useSaved(id: string, list: SavedList = 'bottles') {
  const [saved, setSaved] = useState(false);
  // Read after mount so the server and first client render agree.
  const sync = useCallback(() => setSaved(read(list).includes(id)), [id, list]);

  useEffect(() => {
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  const toggle = useCallback(() => {
    const current = read(list);
    write(list, current.includes(id) ? current.filter((s) => s !== id) : [id, ...current]);
  }, [id, list]);

  return { saved, toggle };
}

/** Bottles on the product page. */
export function useWishlist(slug: string) {
  return useSaved(slug, 'bottles');
}
