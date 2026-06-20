import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { insertRestBuffers } from '@/lib/calendar/buffers';
import * as repo from '@/lib/calendar/repo';

/**
 * GET /api/calendar?date=YYYY-MM-DD
 * Returns the signed-in user's day: their personal_tasks merged into one
 * timeline with AI rest buffers auto-inserted between back-to-back items.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get('date');
  const day = dateParam ? new Date(dateParam) : new Date();
  if (Number.isNaN(day.getTime())) return NextResponse.json({ error: 'Invalid date.' }, { status: 400 });

  const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);

  try {
    const items = await repo.listRange(user.id, dayStart.toISOString(), dayEnd.toISOString());
    return NextResponse.json({ items: insertRestBuffers(items) });
  } catch (err) {
    console.error('[GET /api/calendar]', err);
    return NextResponse.json({ error: 'Could not load your day.' }, { status: 500 });
  }
}

/** POST /api/calendar — create a personal calendar item. body: { title, starts_at, ends_at, priority?, kind?, location?, notes?, invitees? } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, starts_at, ends_at, priority, kind, location, notes, invitees } = body as Record<string, unknown>;
    if (!(title as string)?.trim() || !starts_at || !ends_at) {
      return NextResponse.json({ error: 'Title, start and end time are required.' }, { status: 400 });
    }

    const task = await repo.createItem(user.id, {
      title: title as string,
      starts_at: starts_at as string,
      ends_at: ends_at as string,
      priority: priority as string | undefined,
      kind: kind as string | undefined,
      location: location as string | null | undefined,
      notes: notes as string | null | undefined,
      invitees: invitees as { name: string; email?: string }[] | undefined,
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error('[POST /api/calendar]', err);
    return NextResponse.json({ error: 'Could not add that to your day.' }, { status: 500 });
  }
}
