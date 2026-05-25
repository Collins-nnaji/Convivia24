import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';

/**
 * POST  /api/discover/[id]/join   — request to join a listing's group
 *   { message? }
 *
 * PATCH /api/discover/[id]/join   — host accepts/declines a request
 *   { request_id, status: 'accepted' | 'declined' }
 *
 * DELETE /api/discover/[id]/join  — requester withdraws their request
 */

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Sign in to join.' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [listing] = await sql`
    SELECT id, user_id, is_open, max_group_size FROM public_event_listings WHERE id = ${params.id}
  `;
  if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  if (!listing.is_open) return NextResponse.json({ error: 'This group is no longer accepting requests.' }, { status: 409 });
  if (listing.user_id === user.id) return NextResponse.json({ error: 'You cannot join your own listing.' }, { status: 409 });

  const [existing] = await sql`
    SELECT id, status FROM event_group_requests
    WHERE listing_id = ${params.id} AND requester_id = ${user.id}
  `;
  if (existing) {
    return NextResponse.json({ error: `You already have a ${existing.status} request for this event.` }, { status: 409 });
  }

  const [acceptedCount] = await sql`
    SELECT COUNT(*) AS cnt FROM event_group_requests
    WHERE listing_id = ${params.id} AND status = 'accepted'
  `;
  if (parseInt(acceptedCount.cnt as string) >= (listing.max_group_size as number) - 1) {
    return NextResponse.json({ error: 'This group is already full.' }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const message = body.message?.slice(0, 300) || null;

  const [request] = await sql`
    INSERT INTO event_group_requests (listing_id, requester_id, host_id, message)
    VALUES (${params.id}, ${user.id}, ${listing.user_id as string}, ${message})
    RETURNING *
  `;

  return NextResponse.json({ request }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  const [listing] = await sql`SELECT user_id FROM public_event_listings WHERE id = ${params.id}`;
  if (!listing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  if (listing.user_id !== user.id) return NextResponse.json({ error: 'Only the host can respond to requests.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { request_id, status } = body;
  if (!request_id || !['accepted', 'declined'].includes(status)) {
    return NextResponse.json({ error: 'request_id and status (accepted|declined) required.' }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE event_group_requests
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${request_id} AND listing_id = ${params.id}
    RETURNING *
  `;
  if (!updated) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

  return NextResponse.json({ request: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user: authUser } = await neonAuth();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await getOrCreateUser(authUser);

  await sql`
    DELETE FROM event_group_requests
    WHERE listing_id = ${params.id} AND requester_id = ${user.id}
  `;

  return NextResponse.json({ ok: true });
}
