import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

/** GET /api/people — list the people this user has added (partner, friends, family). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const people = await sql`
      SELECT id, name, relationship, email, notes FROM people WHERE user_id = ${user.id} ORDER BY created_at ASC
    `;
    return NextResponse.json({ people });
  } catch (err) {
    console.error('[GET /api/people]', err);
    return NextResponse.json({ error: 'Could not load your people.' }, { status: 500 });
  }
}

/** POST /api/people — add a person. body: { name, relationship?, email?, notes? } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const { name, relationship, email, notes } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'A name is required.' }, { status: 400 });

    const [person] = await sql`
      INSERT INTO people (user_id, name, relationship, email, notes)
      VALUES (${user.id}, ${name.trim()}, ${relationship?.trim() || null}, ${email?.trim() || null}, ${notes?.trim() || null})
      RETURNING id, name, relationship, email, notes
    `;
    return NextResponse.json({ person });
  } catch (err) {
    console.error('[POST /api/people]', err);
    return NextResponse.json({ error: 'Could not add that person.' }, { status: 500 });
  }
}
