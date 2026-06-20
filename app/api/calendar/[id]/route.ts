import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import * as repo from '@/lib/calendar/repo';

/** GET /api/calendar/[id] — fetch a single calendar item (event detail view). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const task = await repo.getItem(user.id, id);
    if (!task) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ task });
  } catch (err) {
    console.error('[GET /api/calendar/[id]]', err);
    return NextResponse.json({ error: 'Could not load that item.' }, { status: 500 });
  }
}

/** PATCH /api/calendar/[id] — update a personal task (e.g. mark done, reschedule, edit details). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, starts_at, ends_at, priority, kind, location, notes, status } = body as Record<string, unknown>;

    const task = await repo.updateItem(user.id, id, {
      title: title as string | undefined,
      starts_at: starts_at as string | undefined,
      ends_at: ends_at as string | undefined,
      priority: priority as string | undefined,
      kind: kind as string | undefined,
      location: location as string | null | undefined,
      notes: notes as string | null | undefined,
      status: status as string | undefined,
    });
    if (!task) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ task });
  } catch (err) {
    console.error('[PATCH /api/calendar/[id]]', err);
    return NextResponse.json({ error: 'Could not update that task.' }, { status: 500 });
  }
}

/** DELETE /api/calendar/[id] — remove a personal task. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const ok = await repo.deleteItem(user.id, id);
    if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/calendar/[id]]', err);
    return NextResponse.json({ error: 'Could not remove that task.' }, { status: 500 });
  }
}
