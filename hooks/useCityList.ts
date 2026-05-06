'use client';

import { useCallback, useEffect, useState } from 'react';

/** Starter metros — users can add any city; extras persist in localStorage. */
export const DEFAULT_CITIES = ['London', 'Lagos', 'Abuja'] as const;

const STORAGE_KEY = 'convivia24:cities_v1';

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ');
}

function readExtras(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const p = raw ? JSON.parse(raw) : [];
    return Array.isArray(p) ? p.map(String).map(normalize).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function mergeList(defaults: readonly string[], extras: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of [...defaults, ...extras]) {
    const k = normalize(c);
    if (!k) continue;
    const lk = k.toLowerCase();
    if (seen.has(lk)) continue;
    seen.add(lk);
    out.push(k);
  }
  return out;
}

export function useCityList() {
  const [cities, setCities] = useState<string[]>(() => [...DEFAULT_CITIES]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCities(mergeList(DEFAULT_CITIES, readExtras()));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addCity = useCallback((name: string) => {
    const n = normalize(name);
    if (!n) return;
    setCities((prev) => {
      if (prev.some((c) => c.toLowerCase() === n.toLowerCase())) return prev;
      const next = [...prev, n];
      const extras = next.filter(
        (c) => !DEFAULT_CITIES.some((d) => d.toLowerCase() === c.toLowerCase()),
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  }, []);

  return { cities, addCity, ready };
}
