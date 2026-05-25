import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// Public-facing campaign lookup — used by guest pass page
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const [campaign] = await sql`
    SELECT id, brand_name, headline, subheadline, venue_name, city, event_date,
           start_time, end_time, primary_color, secondary_color, bg_color, text_color,
           logo_url, bg_image_url, voucher_enabled, voucher_label,
           photowall_enabled, photowall_slug, status, max_capacity, slug
    FROM brand_campaigns
    WHERE slug = ${params.slug}
  `;

  if (!campaign) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json({ campaign });
}
