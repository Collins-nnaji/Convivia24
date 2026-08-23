import { NextRequest, NextResponse } from 'next/server';
import { getProductInfo } from '@/lib/drinks/product-info';
import { apiErrorResponse } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(`product-info:${clientIp(req)}`, 120, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const slug = req.nextUrl.searchParams.get('slug')?.trim();
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    const info = await getProductInfo(slug);
    if (!info) return NextResponse.json({ error: 'No guide for this product yet' }, { status: 404 });

    return NextResponse.json(info);
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not load product info.');
    return NextResponse.json({ error }, { status });
  }
}
