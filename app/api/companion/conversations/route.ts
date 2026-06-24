import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { listConversations, createConversation } from '@/lib/companion/conversations';

/** GET /api/companion/conversations — list the user's chat threads (newest first). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const conversations = await listConversations(user.id);
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('[GET /api/companion/conversations]', err);
    return NextResponse.json({ error: 'Could not load your chats.' }, { status: 500 });
  }
}

/** POST /api/companion/conversations — start a new chat. body: { title? } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 80) : undefined;
    const conversation = await createConversation(user.id, title);
    return NextResponse.json({ conversation });
  } catch (err) {
    console.error('[POST /api/companion/conversations]', err);
    return NextResponse.json({ error: 'Could not start a new chat.' }, { status: 500 });
  }
}
