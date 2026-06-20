import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

/** PATCH /api/calendar/[id] — update a personal task (e.g. mark done, reschedule). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { title, starts_at, ends_at, priority, status } = body as Record<string, unknown>;

    const [task] = await sql`
      UPDATE personal_tasks SET
        title      = COALESCE(${(title as string) ?? null}, title),
        starts_at  = COALESCE(${(starts_at as string) ?? null}, starts_at),
        ends_at    = COALESCE(${(ends_at as string) ?? null}, ends_at),
        priority   = COALESCE(${(priority as string) ?? null}, priority),
        status     = COALESCE(${(status as string) ?? null}, status),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id, title, starts_at, ends_at, priority, is_rest_block, source, status
    `;
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
    await sql`DELETE FROM personal_tasks WHERE id = ${id} AND user_id = ${user.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/calendar/[id]]', err);
    return NextResponse.json({ error: 'Could not remove that task.' }, { status: 500 });
  }
}
