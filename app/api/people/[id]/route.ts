import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

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
