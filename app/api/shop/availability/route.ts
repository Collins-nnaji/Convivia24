import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/** GET ?slug= — live availability for one bottle, so a statically built product page can say "sold out". */
export async function GET(req: NextRequest) {
  const slug = (new URL(req.url).searchParams.get('slug') || '').trim();
  if (!slug) return NextResponse.json({ error: 'slug is required.' }, { status: 400 });
  try {
    const [r] = await sql`
      SELECT on_hand - reserved AS available, track_stock, active, low_stock_threshold FROM inventory WHERE slug = ${slug} LIMIT 1
    `;
    if (!r) return NextResponse.json({ tracked: false });
    const available = Math.max(0, Number(r.available ?? 0));
    return NextResponse.json(
      { tracked: r.track_stock !== false, active: r.active !== false, available, low: r.track_stock !== false && available <= Number(r.low_stock_threshold ?? 0) },
      { headers: { 'Cache-Control': 'public, max-age=20' } }
    );
  } catch {
    return NextResponse.json({ tracked: false });
  }
}
