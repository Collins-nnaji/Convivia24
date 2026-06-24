import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getProfile, saveProfile, type ProfileData } from '@/lib/profile/repo';

/** GET /api/profile — the signed-in user's onboarding profile + status. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const profile = await getProfile(user.id);
    return NextResponse.json(profile);
  } catch (err) {
    console.error('[GET /api/profile]', err);
    return NextResponse.json({ error: 'Could not load your profile.' }, { status: 500 });
  }
}

/** POST /api/profile — save onboarding answers. body: { answers: { [questionId]: string[] } } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const answers = (body?.answers ?? {}) as ProfileData;
    if (typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers.' }, { status: 400 });
    }
    const profile = await saveProfile(user.id, answers);
    return NextResponse.json(profile);
  } catch (err) {
    console.error('[POST /api/profile]', err);
    return NextResponse.json({ error: 'Could not save your profile.' }, { status: 500 });
  }
}
