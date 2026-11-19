import { NextResponse } from 'next/server';
import { priceListAccess, wholesalePriceMap } from '@/lib/partners/price-list';
import { apiErrorResponse } from '@/lib/db';
import { captureApiError } from '@/lib/sentry';

/** The wholesale price list — approved outlets and admins only. Never cached publicly. */
export async function GET() {
  try {
    const access = await priceListAccess();
    if (access.ok === false) return NextResponse.json({ error: access.error }, { status: access.status });
    return NextResponse.json(
      { prices: wholesalePriceMap(), viewer: access.viewer },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (err) {
    captureApiError(err, { route: 'partners/price-list GET' });
    const { status, error } = apiErrorResponse(err, 'Could not load the price list.');
    return NextResponse.json({ error }, { status });
  }
}
