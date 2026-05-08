'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Canonical cities if API is unavailable (matches DB seed). */
export const DEFAULT_CITIES = ['Lagos', 'Abuja', 'Port Harcourt'] as const;

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

/** Persist only user-added metros (not returned from /api/cities). */
function extrasPersisted(full: string[], defaultNames: readonly string[]) {
  const d = new Set(defaultNames.map((x) => normalize(x).toLowerCase()));
  return full.filter((c) => !d.has(normalize(c).toLowerCase()));
}

export type UseCityListOptions = {
  serverWatchlist?: string[] | null;
  persistWatchlist?: boolean;
};

export function useCityList(opts?: UseCityListOptions) {
  const fromServer = opts?.serverWatchlist ?? [];
  const serverKey = JSON.stringify(fromServer);
  const defaultNamesRef = useRef<string[]>([...DEFAULT_CITIES]);

  const [cities, setCities] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return mergeList(DEFAULT_CITIES, [...fromServer]);
    }
    return mergeList(DEFAULT_CITIES, [...readExtras(), ...fromServer]);
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const server = JSON.parse(serverKey) as string[];

    (async () => {
      let baseNames: string[] = [...DEFAULT_CITIES];
      try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        if (Array.isArray(data.cities) && data.cities.length > 0) {
          baseNames = data.cities.map((c: { name: string }) => String(c.name).trim()).filter(Boolean);
        }
      } catch {
        /* keep DEFAULT_CITIES */
      }

      if (cancelled) return;
      defaultNamesRef.current = baseNames;
      const merged = mergeList(baseNames, [...readExtras(), ...(Array.isArray(server) ? server : [])]);
      setCities(merged);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(extrasPersisted(merged, baseNames)));
      } catch {
        /* ignore quota */
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [serverKey]);

  const persistWatchlist = opts?.persistWatchlist ?? false;

  const pushWatchlistToServer = useCallback(
    (extras: string[]) => {
      if (!persistWatchlist) return;
      queueMicrotask(() => {
        fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ watchlist_cities: extras }),
        }).catch(() => {});
      });
    },
    [persistWatchlist],
  );

  const addCity = useCallback(
    (name: string) => {
      const n = normalize(name);
      if (!n) return;
      setCities((prev) => {
        if (prev.some((c) => c.toLowerCase() === n.toLowerCase())) return prev;
        const next = [...prev, n];
        const extras = extrasPersisted(next, defaultNamesRef.current);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
        } catch {
          /* ignore quota */
        }
        pushWatchlistToServer(extras);
        return next;
      });
    },
    [pushWatchlistToServer],
  );

  return { cities, addCity, ready };
}
