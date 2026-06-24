import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events';
import { listApplications, submitApplication, getUserApplication } from '@/lib/guestlist';
import { isAdminRequest, getCurrentUser } from '@/lib/auth/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const user = await getCurrentUser();
    const isAdmin = await isAdminRequest(req);

    if (isAdmin) {
      const status = req.nextUrl.searchParams.get('status') ?? undefined;
      const applications = await listApplications(event.id, status);
      return NextResponse.json({ applications, guestlist_mode: event.guestlist_mode ?? 'open' });
    }

    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const mine = await getUserApplication(event.id, user.id);
    return NextResponse.json({ application: mine, guestlist_mode: event.guestlist_mode ?? 'open' });
  } catch (err) {
    console.error('[GET guestlist]', err);
    return NextResponse.json({ error: 'Failed to load guestlist.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in to apply.' }, { status: 401 });

    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if ((event as { guestlist_mode?: string }).guestlist_mode !== 'approval') {
      return NextResponse.json({ error: 'This event does not require approval.' }, { status: 400 });
    }

    const body = await req.json();
    const app = await submitApplication({
      eventId: event.id,
      userId: user.id,
      name: body.name?.trim() || user.name || user.email,
      email: user.email,
      linkedin: body.linkedin,
      instagram: body.instagram,
      text: body.application_text,
    });
    return NextResponse.json(app, { status: 201 });
  } catch (err) {
    console.error('[POST guestlist]', err);
    return NextResponse.json({ error: 'Application failed.' }, { status: 500 });
  }
}
