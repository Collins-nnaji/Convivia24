import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events';
import { listBroadcasts, createBroadcast } from '@/lib/broadcast';
import { isAdminRequest, getCurrentUser } from '@/lib/auth/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const broadcasts = await listBroadcasts(event.id);
    return NextResponse.json({ broadcasts });
  } catch (err) {
    console.error('[GET broadcasts]', err);
    return NextResponse.json({ error: 'Failed to load broadcasts.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body = await req.json();
    const user = await getCurrentUser();
    const broadcast = await createBroadcast({
      eventId: event.id,
      subject: body.subject,
      body: body.body,
      channel: body.channel,
      scheduledFor: body.scheduled_for,
      createdBy: user?.email,
    });
    return NextResponse.json(broadcast, { status: 201 });
  } catch (err) {
    console.error('[POST broadcast]', err);
    return NextResponse.json({ error: 'Broadcast failed.' }, { status: 500 });
  }
}
