import { NextRequest, NextResponse } from 'next/server';
import { shopCatalog, listInventory } from '@/lib/inventory';
import { apiErrorResponse } from '@/lib/db';
import { cacheGet, cacheSet, rateLimit, clientIp } from '@/lib/redis';
import { captureApiError } from '@/lib/sentry';

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(`shop-catalog:${clientIp(req)}`, 60, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const cached = await cacheGet<{ products: unknown[] }>('shop:catalog:v2');
    if (cached) return NextResponse.json(cached);

    const products = await shopCatalog();
    const payload = { products };
    await cacheSet('shop:catalog:v2', payload, 30);
    return NextResponse.json(payload);
  } catch (err) {
    captureApiError(err, { route: 'shop/catalog' });
    // Fallback to static-only if DB down
    try {
      const { DRINKS } = await import('@/lib/drinks/catalog');
      return NextResponse.json({ products: DRINKS, degraded: true });
    } catch (e) {
      const { status, error } = apiErrorResponse(e);
      return NextResponse.json({ error }, { status });
    }
  }
}

void listInventory;
