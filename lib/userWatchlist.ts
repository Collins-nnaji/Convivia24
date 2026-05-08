import sql from '@/lib/db';

/** Dedupe city names (case-insensitive), normalized spacing. */
export function mergeUniqueCityNames(...groups: (string[] | undefined | null)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of groups) {
    if (!g?.length) continue;
    for (const raw of g) {
      const k = String(raw).trim().replace(/\s+/g, ' ');
      if (!k) continue;
      const lk = k.toLowerCase();
      if (seen.has(lk)) continue;
      seen.add(lk);
      out.push(k);
    }
  }
  return out;
}

function sameCitySet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].map((x) => x.toLowerCase()).sort().join('\0');
  const sb = [...b].map((x) => x.toLowerCase()).sort().join('\0');
  return sa === sb;
}

/**
 * Ensures `watchlist_cities` includes every distinct `hangouts.city` the user has hosted.
 * Fixes users who created tables before client-side city persistence existed.
 */
export async function syncUserWatchlistFromHostedHangouts(userId: string): Promise<string[] | null> {
  try {
    const self = await sql`
      SELECT watchlist_cities FROM users WHERE id = ${userId} LIMIT 1
    `;
    const wlRaw = self[0]?.watchlist_cities;
    const wl = Array.isArray(wlRaw) ? (wlRaw as string[]) : [];

    const hosted = await sql`
      SELECT DISTINCT TRIM(city) AS c FROM hangouts
      WHERE host_id = ${userId} AND city IS NOT NULL AND TRIM(city) <> ''
    `;
    const fromHangouts = hosted
      .map((r: { c?: string }) => String(r.c ?? '').replace(/\s+/g, ' '))
      .filter(Boolean);

    const merged = mergeUniqueCityNames(wl, fromHangouts);
    if (sameCitySet(merged, wl)) {
      return merged;
    }

    await sql`
      UPDATE users SET watchlist_cities = ${merged}::text[] WHERE id = ${userId}
    `;
    return merged;
  } catch {
    return null;
  }
}
