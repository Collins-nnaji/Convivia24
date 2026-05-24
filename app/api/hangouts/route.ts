import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { outletPostingBlocked } from '@/lib/outlet-application';
import { ShiftPostSchema, zodFirstError } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/hangouts — ?city=Lagos&next_hours=24&category=&type=&free=1&page=1&limit=20
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'hangouts:get', 120, 60);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(req.url);
    const city     = searchParams.get('city');
    const area     = searchParams.get('area');
    const category = searchParams.get('category');
    const type     = searchParams.get('type');
    const freeOnly = searchParams.get('free') === '1';
    const areaEmpty = !area || !area.trim();

    const page  = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    /** When set (e.g. 24), only return shifts with event_time within the next N hours (Today/home). */
    const nextHoursRaw = searchParams.get('next_hours');
    let applyNextHoursWindow = false;
    let nextHours = 24;
    if (nextHoursRaw !== null && nextHoursRaw !== '') {
      const n = parseInt(nextHoursRaw, 10);
      if (!Number.isNaN(n) && n > 0) {
        applyNextHoursWindow = true;
        nextHours = Math.min(8760, n);
      }
    }

    const hangouts = await sql`
      SELECT h.*, u.name as host_name, u.avatar_url as host_avatar,
             u.tier as host_tier, u.verified as host_verified,
             v.name as venue_name, v.type as venue_type, v.city as venue_city,
             oa.slug as vendor_slug
      FROM hangouts h
      JOIN users u ON h.host_id = u.id
      LEFT JOIN venues v ON h.venue_id = v.id
      LEFT JOIN outlet_applications oa
        ON oa.user_id = h.host_id
       AND oa.status = 'approved'
       AND oa.slug IS NOT NULL
      WHERE h.status IN ('pending', 'confirmed')
        AND h.event_time > NOW() - INTERVAL '2 hours'
        AND (
          ${!applyNextHoursWindow}::boolean
          OR h.event_time <= NOW() + (${nextHours}::numeric * INTERVAL '1 hour')
        )
        AND (
          ${city}::text IS NULL
          OR TRIM(${city}::text) = ''
          OR h.city ILIKE ${city}
          OR h.city ILIKE ${'%' + (city ?? '') + '%'}
          OR v.city ILIKE ${city}
          OR v.city ILIKE ${'%' + (city ?? '') + '%'}
          OR h.location ILIKE ${'%' + (city ?? '') + '%'}
          OR regexp_replace(lower(trim(coalesce(h.city, ''))), '\s', '', 'g')
             = regexp_replace(lower(trim(coalesce(${city}, ''))), '\s', '', 'g')
        )
        AND (${category}::text IS NULL OR h.category = ${category})
        AND (${type}::text IS NULL OR h.type = ${type})
        AND (
          ${areaEmpty}::boolean
          OR h.area ILIKE ${'%' + (area ?? '').trim() + '%'}
          OR h.location ILIKE ${'%' + (area ?? '').trim() + '%'}
        )
        AND (
          ${!freeOnly}::boolean
          OR h.ticket_price IS NULL
          OR h.ticket_price = 0
        )
      ORDER BY h.event_time ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const hangoutIds = hangouts.map((h) => h.id as string);
    const attendees = hangoutIds.length > 0 ? await sql`
      SELECT a.hangout_id, a.user_id, u.name, u.avatar_url, u.verified
      FROM attendees a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'attending'
        AND a.hangout_id = ANY(${hangoutIds}::uuid[])
    ` : [];

    const serialized = hangouts.map((h) => {
      const d = h.event_time instanceof Date ? h.event_time : new Date(h.event_time as string);
      return {
        ...h,
        event_time: d.toISOString(),
        formatted_date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        formatted_time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        created_at: h.created_at instanceof Date ? h.created_at.toISOString() : h.created_at,
        attendees: attendees
          .filter((a) => a.hangout_id === h.id)
          .map((a) => ({ user_id: a.user_id, name: a.name, avatar_url: a.avatar_url, verified: a.verified })),
      };
    });

    return NextResponse.json(
      { hangouts: serialized, page, limit },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } },
    );
  } catch (err) {
    console.error('Error fetching hangouts:', err);
    return NextResponse.json({ error: 'Failed to load hangouts.' }, { status: 500 });
  }
}

// POST /api/hangouts — Create an activity
export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Sign in to host.' }, { status: 401 });

    const user = await getOrCreateUser(authUser);
    const block = await outletPostingBlocked(String(user.id));
    if (block.blocked) {
      return NextResponse.json(
        {
          error:
            'Your outlet registration is still pending admin approval. Complete onboarding under Profile or wait for approval.',
          code: 'OUTLET_NOT_APPROVED',
          status: block.status,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const shiftParsed = ShiftPostSchema.safeParse(body);
    if (!shiftParsed.success) {
      return NextResponse.json({ error: zodFirstError(shiftParsed.error) }, { status: 400 });
    }

    const { title, location, city, area, event_time, max_guests, ticket_price } = shiftParsed.data;
    const { vibe, category, type, cover_image, venue_id, ticket_url } = body as Record<string, string | null | undefined>;

    const cityClean =
      typeof city === 'string' && city.trim()
        ? city.trim().replace(/\s+/g, ' ')
        : null;

    const areaClean =
      typeof area === 'string' && area.trim() ? area.trim().replace(/\s+/g, ' ') : null;

    const rows = await sql`
      INSERT INTO hangouts
        (host_id, title, vibe, category, type, event_time, location, city, area,
         max_guests, cover_image, venue_id, ticket_url, ticket_price)
      VALUES (
        ${user.id},
        ${title.trim()},
        ${vibe.trim()},
        ${category || 'social'},
        ${type || 'open'},
        ${event_time},
        ${location.trim()},
        ${cityClean},
        ${areaClean},
        ${max_guests || 6},
        ${cover_image || null},
        ${venue_id || null},
        ${ticket_url?.trim() || null},
        ${ticket_price ? Number(ticket_price) : null}
      )
      RETURNING *
    `;

    await sql`
      INSERT INTO attendees (hangout_id, user_id, status)
      VALUES (${rows[0].id}, ${user.id}, 'attending')
    `;

    return NextResponse.json({ ok: true, hangout: rows[0] });
  } catch (err) {
    console.error('Error creating hangout:', err);
    return NextResponse.json({ error: 'Failed to create.' }, { status: 500 });
  }
}
