import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { rateLimit } from '@/lib/rate-limit';

/**
 * GET  /api/discover  — public discovery feed
 *   ?city=Lagos&type=concert&from=2026-05-25&limit=20&offset=0
 *
 * POST /api/discover  — post "I'm attending X"
 *   { title, event_type, venue?, event_date, event_time?, city, vibe_tags?, description?, max_group_size?, cover_emoji?, ticket_url? }
 */

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'discover:get', 60, 60);
  if (limited) return limited;

  const { user: authUser } = await neonAuth();

  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || 'Lagos';
  const type = searchParams.get('type') || null;
  const from = searchParams.get('from') || new Date().toISOString().slice(0, 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const currentUserId = authUser ? (await getOrCreateUser(authUser).catch(() => null))?.id : null;

  const rows = await sql`
    SELECT
      l.id, l.user_id, l.title, l.event_type, l.venue, l.event_date, l.event_time,
      l.city, l.vibe_tags, l.description, l.max_group_size, l.is_open,
      l.cover_emoji, l.ticket_url, l.slug, l.created_at,
      u.name AS host_name, u.avatar_url AS host_avatar, u.verified AS host_verified,
      u.interest_tags AS host_interests, u.social_vibe AS host_vibe,
      (
        SELECT COUNT(*) FROM event_group_requests egr
        WHERE egr.listing_id = l.id AND egr.status = 'accepted'
      ) AS accepted_count,
      (
        SELECT COUNT(*) FROM event_group_requests egr
        WHERE egr.listing_id = l.id AND egr.status = 'pending'
      ) AS pending_count,
      ${currentUserId
        ? sql`(SELECT status FROM event_group_requests WHERE listing_id = l.id AND requester_id = ${currentUserId} LIMIT 1)`
        : sql`NULL`
      } AS my_request_status,
      ${currentUserId ? sql`(l.user_id = ${currentUserId})` : sql`false`} AS is_mine
    FROM public_event_listings l
    JOIN users u ON u.id = l.user_id
    WHERE l.is_open = true
      AND l.event_date >= ${from}::date
      ${city !== 'all' ? sql`AND l.city = ${city}` : sql``}
      ${type ? sql`AND l.event_type = ${type}` : sql``}
    ORDER BY l.event_date ASC, l.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return NextResponse.json({ listings: rows, city, type, from });
}

export async function POST(req: NextRequest) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in to post.' }, { status: 401 });

  const user = await getOrCreateUser(authUser);

  const body = await req.json().catch(() => ({}));
  const {
    title, event_type, venue, event_date, event_time, city,
    vibe_tags, description, max_group_size, cover_emoji, ticket_url,
  } = body;

  if (!title?.trim()) return NextResponse.json({ error: 'title is required.' }, { status: 400 });
  if (!event_date) return NextResponse.json({ error: 'event_date is required.' }, { status: 400 });
  if (!city?.trim()) return NextResponse.json({ error: 'city is required.' }, { status: 400 });

  const validTypes = ['concert','sports','festival','networking','conference','nightlife','university','fitness','travel','dining','arts','other'];
  const safeType = validTypes.includes(event_type) ? event_type : 'other';

  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${Date.now().toString(36)}`;
  const tags: string[] = Array.isArray(vibe_tags) ? vibe_tags.slice(0, 6) : [];
  const emoji = cover_emoji || '🎉';
  const groupSize = Math.min(Math.max(parseInt(max_group_size) || 6, 2), 24);

  const [listing] = await sql`
    INSERT INTO public_event_listings
      (user_id, title, event_type, venue, event_date, event_time, city,
       vibe_tags, description, max_group_size, cover_emoji, ticket_url, slug)
    VALUES (
      ${user.id}, ${title.trim()}, ${safeType},
      ${venue || null}, ${event_date}, ${event_time || null},
      ${city.trim()}, ${tags}, ${description || null},
      ${groupSize}, ${emoji}, ${ticket_url || null}, ${slug}
    )
    RETURNING *
  `;

  return NextResponse.json({ listing }, { status: 201 });
}
