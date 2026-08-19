import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { getCrew, isMember, crewMembers, crewCartItems } from '@/lib/crews/repo';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  try {
    const crew = await getCrew(id);
    if (!crew) return NextResponse.json({ error: 'Crew not found.' }, { status: 404 });

    const member = user ? await isMember(id, user.id) : false;
    if (!member) {
      // Invite-link preview — enough to decide whether to join, nothing more.
      const members = await crewMembers(id);
      return NextResponse.json({ crew, joined: false, memberCount: members.length });
    }

    const [members, items] = await Promise.all([crewMembers(id), crewCartItems(id)]);
    return NextResponse.json({ crew, joined: true, members, items });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load crew.');
    return NextResponse.json({ error }, { status });
  }
}
