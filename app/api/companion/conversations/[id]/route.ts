import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { deleteConversation } from '@/lib/companion/conversations';

/** DELETE /api/companion/conversations/[id] — remove a chat thread and its messages. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { id } = await params;
  try {
    const ok = await deleteConversation(user.id, id);
    if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/companion/conversations/[id]]', err);
    return NextResponse.json({ error: 'Could not delete that chat.' }, { status: 500 });
  }
}
