import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * GET /api/discover/[id]  — single listing + attendees + join requests
 * PATCH /api/discover/[id] — close/reopen or update listing (host only)
 * DELETE /api/discover/[id] — delete listing (host only)
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { user: authUser } = await neonAuth();
  const currentUserId = authUser ? (await getOrCreateUser(authUser).catch(() => null))?.id : null;

  const [listing] = await sql`
    SELECT
      l.*,
      u.name AS host_name, u.avatar_url AS host_avatar, u.verified AS host_verified,
      u.bio AS host_bio, u.interest_tags AS host_interests, u.social_vibe AS host_vibe,
      u.rating AS host_rating
    FROM public_event_listings l
    JOIN users u ON u.id = l.user_id
    WHERE l.id = ${params.id}
  `;

  if (!listing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const accepted = await sql`
    SELECT egr.id, egr.status, egr.created_at,
           u.id AS user_id, u.name, u.avatar_url, u.verified, u.interest_tags, u.social_vibe
    FROM event_group_requests egr
    JOIN users u ON u.id = egr.requester_id
    WHERE egr.listing_id = ${params.id} AND egr.status = 'accepted'
    ORDER BY egr.created_at ASC
    LIMIT 24
  `;

  const pending = currentUserId && listing.user_id === currentUserId
    ? await sql`
        SELECT egr.id, egr.status, egr.message, egr.created_at,
               u.id AS user_id, u.name, u.avatar_url, u.verified, u.interest_tags
        FROM event_group_requests egr
        JOIN users u ON u.id = egr.requester_id
        WHERE egr.listing_id = ${params.id} AND egr.status = 'pending'
        ORDER BY egr.created_at ASC
      `
    : [];

  const myRequest = currentUserId
    ? (await sql`
        SELECT id, status, message, created_at FROM event_group_requests
        WHERE listing_id = ${params.id} AND requester_id = ${currentUserId}
        LIMIT 1
      `)[0] || null
    : null;

  return NextResponse.json({ listing, accepted, pending, my_request: myRequest });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [listing] = await sql`SELECT user_id FROM public_event_listings WHERE id = ${params.id}`;
  if (!listing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (listing.user_id !== user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { is_open, description, max_group_size, vibe_tags } = body;

  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (typeof is_open === 'boolean') updates.is_open = is_open;
  if (description !== undefined) updates.description = description;
  if (max_group_size) updates.max_group_size = Math.min(Math.max(parseInt(max_group_size), 2), 24);
  if (Array.isArray(vibe_tags)) updates.vibe_tags = vibe_tags.slice(0, 6);

  const [updated] = await sql`
    UPDATE public_event_listings
    SET is_open = COALESCE(${updates.is_open as boolean | null}, is_open),
        description = COALESCE(${updates.description as string | null}, description),
        max_group_size = COALESCE(${updates.max_group_size as number | null}, max_group_size),
        updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING *
  `;

  return NextResponse.json({ listing: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [listing] = await sql`SELECT user_id FROM public_event_listings WHERE id = ${params.id}`;
  if (!listing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (listing.user_id !== user.id) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  await sql`DELETE FROM public_event_listings WHERE id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
