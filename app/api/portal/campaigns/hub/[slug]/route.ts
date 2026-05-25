import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// Public-facing hub lookup — used by LiveEventHub via photowall_slug
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const [campaign] = await sql`
    SELECT id, brand_name, primary_color, bg_color, text_color, logo_url,
           headline, venue_name, voucher_enabled, voucher_label,
           lineup_text, menu_text, photowall_enabled, slug
    FROM brand_campaigns
    WHERE photowall_slug = ${params.slug}
  `;

  if (!campaign) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json({ campaign });
}
