import { NextResponse } from 'next/server';
import { activeDeliveryCities, cachedBestSellers, storefrontContent } from '@/lib/storefront/repo';

/**
 * Public storefront data for client surfaces (header announcement bar and its delivery panel,
 * shop "Best selling" sort). Everything here degrades to defaults, so it never errors.
 */
export async function GET() {
  const [content, bestSellers, delivery] = await Promise.all([
    storefrontContent(),
    cachedBestSellers(),
    activeDeliveryCities(),
  ]);
  return NextResponse.json(
    { announcement: content.announcement, bestSellers, delivery },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
  );
}
