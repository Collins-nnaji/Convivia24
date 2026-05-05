import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

/**
 * GET /api/hangouts/[id] — public hangout detail (for invite links & preview).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT h.*, u.name as host_name, u.avatar_url as host_avatar,
             u.tier as host_tier, u.verified as host_verified,
             v.name as venue_name, v.type as venue_type, v.city as venue_city
      FROM hangouts h
      JOIN users u ON h.host_id = u.id
      LEFT JOIN venues v ON h.venue_id = v.id
      WHERE h.id = ${id} AND h.status IN ('pending', 'confirmed')
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Hangout not found or no longer available.' }, { status: 404 });
    }

    const h = rows[0] as Record<string, unknown>;
    const d =
      h.event_time instanceof Date ? h.event_time : new Date(h.event_time as string);

    const hangout = {
      ...h,
      event_time: d.toISOString(),
      formatted_date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      formatted_time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      created_at: h.created_at instanceof Date ? (h.created_at as Date).toISOString() : h.created_at,
    };

    return NextResponse.json({ hangout });
  } catch (err) {
    console.error('Error fetching hangout:', err);
    return NextResponse.json({ error: 'Failed to load hangout.' }, { status: 500 });
  }
}
