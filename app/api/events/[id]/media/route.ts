import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events';
import { getCurrentUser, isAdminRequest } from '@/lib/auth/session';
import { canAccessLounge } from '@/lib/tickets/access';
import { memoryWallUnlocked } from '@/lib/memory';
import { blobConfigured, uploadBlob, validateMediaFile, type MediaPurpose } from '@/lib/azure/blob';
import { rateLimit } from '@/lib/redis';

const PURPOSES: MediaPurpose[] = [
  'memory-wall',
  'lounge-avatar',
  'broadcast-attachment',
];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!blobConfigured()) {
    return NextResponse.json({ error: 'Azure Storage is not configured.' }, { status: 503 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const rl = await rateLimit(`media:${user.id}`, 30, 60);
    if (!rl.ok) return NextResponse.json({ error: 'Too many uploads. Please wait a moment.' }, { status: 429 });

    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const purpose = (formData.get('purpose') as string | null) || 'memory-wall';

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!PURPOSES.includes(purpose as MediaPurpose)) {
      return NextResponse.json({ error: 'Invalid upload purpose.' }, { status: 400 });
    }

    const validationError = validateMediaFile(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const isAdmin = await isAdminRequest(req);

    if (purpose === 'broadcast-attachment') {
      if (!isAdmin) return NextResponse.json({ error: 'Organizer access required.' }, { status: 403 });
    } else {
      const hasTicket = await canAccessLounge(user.id, event.id);
      if (!hasTicket && !isAdmin) {
        return NextResponse.json({ error: 'Ticket required to upload media for this event.' }, { status: 403 });
      }
      if (purpose === 'memory-wall' && !memoryWallUnlocked(event) && !isAdmin) {
        return NextResponse.json({ error: 'Memory wall unlocks after the event.' }, { status: 403 });
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBlob(buffer, file.type, {
      filename: file.name,
      context: `${purpose}:${event.slug}`,
      purpose: purpose as MediaPurpose,
      eventId: event.id,
      userId: user.id,
    });

    return NextResponse.json({
      url: result.url,
      blob_name: result.blobName,
      media_type: result.mediaType,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/events/[id]/media]', err);
    const msg = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
