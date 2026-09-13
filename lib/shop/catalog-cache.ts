// The one place the shop catalog cache key lives. Every admin write that changes what the shop
// shows (stock, price, listing, supplier holdings) must call `invalidateCatalog()` — the admin
// and the shop drifted onto different key versions once and edits went invisible for 30s.

import { redis } from '@/lib/redis';

export const CATALOG_CACHE_KEY = 'shop:catalog:v3';

export async function invalidateCatalog(): Promise<void> {
  const r = redis();
  if (!r) return;
  try {
    await r.del(CATALOG_CACHE_KEY);
  } catch {
    /* cache miss on the next read is the worst case */
  }
}
