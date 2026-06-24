import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events';
import { listPublicGuests, upsertGuestProfile, createConnection, getGuestProfile } from '@/lib/lounge';
import { canAccessLounge } from '@/lib/tickets/access';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    if (!(await canAccessLounge(user.id, event.id))) {
      return NextResponse.json({ error: 'Ticket required for lounge access.' }, { status: 403 });
    }

    const guests = await listPublicGuests(event.id);
    const profile = await getGuestProfile(event.id, user.id);
    return NextResponse.json({ guests, profile, event: { title: event.title, slug: event.slug } });
  } catch (err) {
    console.error('[GET lounge]', err);
    return NextResponse.json({ error: 'Failed to load lounge.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!(await canAccessLounge(user.id, event.id))) {
      return NextResponse.json({ error: 'Ticket required.' }, { status: 403 });
    }

    const body = await req.json();
    const profile = await upsertGuestProfile({
      eventId: event.id,
      userId: user.id,
      displayName: body.display_name || user.name || user.email,
      headline: body.headline,
      avatarUrl: body.avatar_url || user.image || undefined,
      intentBadge: body.intent_badge,
      isPublic: body.is_public ?? true,
    });
    return NextResponse.json(profile);
  } catch (err) {
    console.error('[PATCH lounge]', err);
    return NextResponse.json({ error: 'Profile update failed.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!(await canAccessLounge(user.id, event.id))) {
      return NextResponse.json({ error: 'Ticket required.' }, { status: 403 });
    }

    const { to_user_id, message } = await req.json();
    if (!to_user_id || to_user_id === user.id) {
      return NextResponse.json({ error: 'Invalid connection target.' }, { status: 400 });
    }

    const conn = await createConnection({
      eventId: event.id,
      fromUserId: user.id,
      toUserId: to_user_id,
      message,
    });
    return NextResponse.json(conn ?? { ok: true }, { status: 201 });
  } catch (err) {
    console.error('[POST connect]', err);
    return NextResponse.json({ error: 'Connection failed.' }, { status: 500 });
  }
}
