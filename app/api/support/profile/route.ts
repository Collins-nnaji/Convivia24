import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import * as repo from '@/lib/support/repo';
import { isValidSupportTag } from '@/lib/support/tags';

/** GET /api/support/profile — the signed-in user's own supporter profile, if any. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const profile = await repo.getSupporterProfile(user.id);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[GET /api/support/profile]', err);
    return NextResponse.json({ error: 'Could not load your supporter profile.' }, { status: 500 });
  }
}

/** POST /api/support/profile — opt in (or update) as a supporter. body: { bio?, tags, is_active } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  try {
    const { bio, tags, is_active } = await req.json();
    const cleanTags = Array.isArray(tags) ? tags.filter(isValidSupportTag).slice(0, 5) : [];
    if (!cleanTags.length) return NextResponse.json({ error: 'Pick at least one topic.' }, { status: 400 });
    if (typeof bio === 'string' && bio.length > 300) {
      return NextResponse.json({ error: 'Keep your bio under 300 characters.' }, { status: 400 });
    }

    const displayName = user.name?.trim() || user.email.split('@')[0];
    const profile = await repo.upsertSupporterProfile(user.id, {
      display_name: displayName,
      bio: bio ?? null,
      tags: cleanTags,
      is_active: is_active !== false,
    });
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[POST /api/support/profile]', err);
    return NextResponse.json({ error: 'Could not save your supporter profile.' }, { status: 500 });
  }
}
