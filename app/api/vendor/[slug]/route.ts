import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/** GET /api/vendor/[slug] — public vendor profile, no auth required */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const rows = await sql`
      SELECT
        oa.id, oa.slug, oa.business_name, oa.business_type,
        oa.description, oa.full_address, oa.instagram_handle,
        oa.logo_url, oa.cover_url, oa.city_id, oa.status,
        c.name AS city_name
      FROM outlet_applications oa
      JOIN cities c ON c.id = oa.city_id
      WHERE oa.slug = ${slug}
        AND oa.status = 'approved'
      LIMIT 1
    `;

    if (rows.length === 0) return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });

    const vendor = rows[0];
    const media = await sql`
      SELECT id, url, media_type, caption, sort_order
      FROM vendor_media
      WHERE outlet_id = ${vendor.id}
      ORDER BY sort_order, created_at
    `;

    // Recent shifts (last 7 days + upcoming)
    const shifts = await sql`
      SELECT id, title, event_time, location, area, current_guests, max_guests, ticket_price
      FROM hangouts
      WHERE host_id = (SELECT user_id FROM outlet_applications WHERE id = ${vendor.id})
        AND event_time > NOW() - INTERVAL '1 day'
        AND status NOT IN ('dissolved')
      ORDER BY event_time
      LIMIT 8
    `;

    const stats = await sql`
      SELECT
        COUNT(DISTINCT h.id)::int AS total_shifts,
        COUNT(sa.id)::int AS total_applications,
        COUNT(sa.id) FILTER (WHERE sa.status IN ('shortlisted', 'confirmed'))::int AS trusted_matches,
        COUNT(DISTINCT h.id) FILTER (WHERE h.status = 'completed')::int AS completed_shifts
      FROM hangouts h
      LEFT JOIN shift_applications sa ON sa.shift_id = h.id
      WHERE h.host_id = (SELECT user_id FROM outlet_applications WHERE id = ${vendor.id})
        AND h.status <> 'dissolved'
    `;

    return NextResponse.json({
      vendor: { ...vendor, media: Array.from(media) },
      shifts: Array.from(shifts),
      stats: stats[0] || {
        total_shifts: 0,
        total_applications: 0,
        trusted_matches: 0,
        completed_shifts: 0,
      },
    });
  } catch (err) {
    console.error('GET /api/vendor/[slug] error:', err);
    return NextResponse.json({ error: 'Failed to load vendor.' }, { status: 500 });
  }
}
