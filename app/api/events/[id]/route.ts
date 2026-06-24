import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminRequest } from '@/lib/auth/session';

function authorized(req: NextRequest): Promise<boolean> {
  return isAdminRequest(req);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM events WHERE id::text = ${id} OR slug = ${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const ticketTypes = await sql`SELECT * FROM ticket_types WHERE event_id = ${rows[0].id} ORDER BY sort_order, price`;
    return NextResponse.json({ event: rows[0], ticket_types: ticketTypes });
  } catch (err) {
    console.error('[GET /api/events/[id]]', err);
    return NextResponse.json({ error: 'Failed to load event.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const d = await req.json();
    const rows = await sql`
      UPDATE events SET
        title           = COALESCE(${d.title ?? null}, title),
        tagline         = COALESCE(${d.tagline ?? null}, tagline),
        description     = COALESCE(${d.description ?? null}, description),
        category        = COALESCE(${d.category ?? null}, category),
        organizer_name  = COALESCE(${d.organizer_name ?? null}, organizer_name),
        venue           = COALESCE(${d.venue ?? null}, venue),
        address         = COALESCE(${d.address ?? null}, address),
        city            = COALESCE(${d.city ?? null}, city),
        country         = COALESCE(${d.country ?? null}, country),
        starts_at       = COALESCE(${d.starts_at ?? null}, starts_at),
        ends_at         = COALESCE(${d.ends_at ?? null}, ends_at),
        cover_image     = COALESCE(${d.cover_image ?? null}, cover_image),
        currency        = COALESCE(${d.currency ?? null}, currency),
        capacity        = COALESCE(${d.capacity ?? null}, capacity),
        age_restriction = COALESCE(${d.age_restriction ?? null}, age_restriction),
        lineup          = COALESCE(${(d.lineup ?? null) as string[] | null}::text[], lineup),
        tags            = COALESCE(${(d.tags ?? null) as string[] | null}::text[], tags),
        is_featured     = COALESCE(${d.is_featured ?? null}, is_featured),
        status          = COALESCE(${d.status ?? null}, status),
        guestlist_mode  = COALESCE(${d.guestlist_mode ?? null}, guestlist_mode),
        theme_mode      = COALESCE(${d.theme_mode ?? null}, theme_mode),
        theme_accent    = COALESCE(${d.theme_accent ?? null}, theme_accent),
        lounge_enabled  = COALESCE(${d.lounge_enabled ?? null}, lounge_enabled),
        memory_wall_enabled = COALESCE(${d.memory_wall_enabled ?? null}, memory_wall_enabled),
        updated_at      = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/events/[id]]', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await sql`DELETE FROM events WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/events/[id]]', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
