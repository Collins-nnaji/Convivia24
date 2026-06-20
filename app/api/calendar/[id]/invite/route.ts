import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import * as repo from '@/lib/calendar/repo';

/** POST /api/calendar/[id]/invite — add a person to a calendar item. body: { name, email? } */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const { name, email } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'A name is required.' }, { status: 400 });

    const invitee = await repo.addInvitee(user.id, id, name.trim(), email?.trim() || null);
    if (!invitee) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ invitee });
  } catch (err) {
    console.error('[POST /api/calendar/[id]/invite]', err);
    return NextResponse.json({ error: 'Could not add that person.' }, { status: 500 });
  }
}

/** DELETE /api/calendar/[id]/invite?inviteeId=... — remove a person from a calendar item. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  const inviteeId = req.nextUrl.searchParams.get('inviteeId');
  if (!inviteeId) return NextResponse.json({ error: 'inviteeId is required.' }, { status: 400 });

  try {
    await repo.removeInvitee(user.id, id, inviteeId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/calendar/[id]/invite]', err);
    return NextResponse.json({ error: 'Could not remove that person.' }, { status: 500 });
  }
}
