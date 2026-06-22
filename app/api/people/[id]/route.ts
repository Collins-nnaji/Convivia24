import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

/**
 * PATCH /api/people/[id] — either record a check-in (`{ touch: true }`, sets
 * last_contacted_at to now) or edit a person's details.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();

    if (body.touch) {
      const [person] = await sql`
        UPDATE people SET last_contacted_at = NOW() WHERE id = ${id} AND user_id = ${user.id}
        RETURNING id, name, relationship, email, phone, notes, last_contacted_at
      `;
      if (!person) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
      return NextResponse.json({ person });
    }

    const { name, relationship, email, phone } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'A name is required.' }, { status: 400 });

    const [person] = await sql`
      UPDATE people SET name = ${name.trim()}, relationship = ${relationship?.trim() || null}, email = ${email?.trim() || null}, phone = ${phone?.trim() || null}
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id, name, relationship, email, phone, notes, last_contacted_at
    `;
    if (!person) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ person });
  } catch (err) {
    console.error('[PATCH /api/people/[id]]', err);
    return NextResponse.json({ error: 'Could not update that person.' }, { status: 500 });
  }
}

/** DELETE /api/people/[id] */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    await sql`DELETE FROM people WHERE id = ${id} AND user_id = ${user.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/people/[id]]', err);
    return NextResponse.json({ error: 'Could not remove that person.' }, { status: 500 });
  }
}
