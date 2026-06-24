import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events';
import { listMemoryPosts, addMemoryPost, reactToPost, memoryWallUnlocked } from '@/lib/memory';
import { canAccessLounge } from '@/lib/tickets/access';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const unlocked = memoryWallUnlocked(event);
    const posts = unlocked ? await listMemoryPosts(event.id) : [];
    return NextResponse.json({
      posts,
      unlocked,
      azure_configured: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
      event: { title: event.title, slug: event.slug, ends_at: event.ends_at, starts_at: event.starts_at },
    });
  } catch (err) {
    console.error('[GET memory]', err);
    return NextResponse.json({ error: 'Failed to load memory wall.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const { id } = await params;
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!(await canAccessLounge(user.id, event.id))) {
      return NextResponse.json({ error: 'Attendees only.' }, { status: 403 });
    }
    if (!memoryWallUnlocked(event)) {
      return NextResponse.json({ error: 'Memory wall unlocks after the event.' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.media_url) return NextResponse.json({ error: 'media_url required. Upload via POST /api/events/[slug]/media first.' }, { status: 400 });

    const post = await addMemoryPost({
      eventId: event.id,
      userId: user.id,
      authorName: user.name || user.email,
      mediaUrl: body.media_url,
      mediaType: body.media_type,
      blobName: body.blob_name,
      caption: body.caption,
    });
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error('[POST memory]', err);
    return NextResponse.json({ error: 'Failed to add memory.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { emoji, post_id } = await req.json();
    if (!post_id || !emoji) return NextResponse.json({ error: 'post_id and emoji required.' }, { status: 400 });
    const post = await reactToPost(post_id, emoji);
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    console.error('[PATCH memory react]', err);
    return NextResponse.json({ error: 'Reaction failed.' }, { status: 500 });
  }
}
