import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { insertRestBuffers, type CalendarItem } from '@/lib/calendar/buffers';

/**
 * GET /api/calendar?date=YYYY-MM-DD
 * Returns the signed-in user's day: manual personal_tasks + ticketed events
 * they're attending that day, merged into one timeline with AI rest buffers
 * auto-inserted between back-to-back items.
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
    const tasks = await sql`
      SELECT id, title, starts_at, ends_at, priority, is_rest_block, source, status
      FROM personal_tasks
      WHERE user_id = ${user.id} AND starts_at >= ${dayStart.toISOString()} AND starts_at <= ${dayEnd.toISOString()}
    `;

    const tickets = await sql`
      SELECT e.id, e.title, e.starts_at, e.ends_at, e.venue, e.city
      FROM orders o
      JOIN events e ON e.id = o.event_id
      WHERE (o.user_id = ${user.id} OR LOWER(o.buyer_email) = ${user.email.toLowerCase()})
        AND o.status = 'paid'
        AND e.starts_at >= ${dayStart.toISOString()} AND e.starts_at <= ${dayEnd.toISOString()}
    `;

    const items: CalendarItem[] = [
      ...tasks.map((t) => ({
        id: String(t.id),
        title: String(t.title),
        starts_at: new Date(t.starts_at as string).toISOString(),
        ends_at: new Date(t.ends_at as string).toISOString(),
        priority: t.priority as CalendarItem['priority'],
        is_rest_block: !!t.is_rest_block,
        source: t.source as CalendarItem['source'],
        status: t.status as CalendarItem['status'],
      })),
      ...tickets.map((e) => ({
        id: String(e.id),
        title: String(e.title),
        starts_at: new Date(e.starts_at as string).toISOString(),
        ends_at: new Date((e.ends_at as string) ?? e.starts_at as string).toISOString(),
        priority: 'normal' as const,
        is_rest_block: false,
        source: 'ticket' as const,
        status: 'active' as const,
      })),
    ];

    return NextResponse.json({ items: insertRestBuffers(items) });
  } catch (err) {
    console.error('[GET /api/calendar]', err);
    return NextResponse.json({ error: 'Could not load your day.' }, { status: 500 });
  }
}

/** POST /api/calendar — create a manual task. body: { title, starts_at, ends_at, priority? } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const { title, starts_at, ends_at, priority } = await req.json();
    if (!title?.trim() || !starts_at || !ends_at) {
      return NextResponse.json({ error: 'Title, start and end time are required.' }, { status: 400 });
    }

    const [task] = await sql`
      INSERT INTO personal_tasks (user_id, title, starts_at, ends_at, priority, source)
      VALUES (${user.id}, ${title.trim()}, ${starts_at}, ${ends_at}, ${priority || 'normal'}, 'manual')
      RETURNING id, title, starts_at, ends_at, priority, is_rest_block, source, status
    `;
    return NextResponse.json({ task });
  } catch (err) {
    console.error('[POST /api/calendar]', err);
    return NextResponse.json({ error: 'Could not add that to your day.' }, { status: 500 });
  }
}
