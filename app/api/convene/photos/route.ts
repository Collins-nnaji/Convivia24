import { NextRequest, NextResponse } from 'next/server';
import { getPhotosForEvent, addPhoto } from '@/lib/convene';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const eventId = url.searchParams.get('event_id') || url.searchParams.get('eventId');
  if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const photos = await getPhotosForEvent(eventId);
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { event_id, url, uploader_name, caption } = body as {
    event_id?: string;
    url?: string;
    uploader_name?: string;
    caption?: string;
  };

  if (!event_id || !url) {
    return NextResponse.json({ error: 'event_id and url required' }, { status: 400 });
  }

  const photo = await addPhoto(event_id, url, uploader_name, caption);
  return NextResponse.json({ photo }, { status: 201 });
}
