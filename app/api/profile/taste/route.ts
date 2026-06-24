import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getTaste, saveTasteAnswer, nextTasteQuestion } from '@/lib/profile/taste';

/** GET /api/profile/taste — the signed-in user's taste answers + the next question to ask. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const data = await getTaste(user.id);
    return NextResponse.json({ data, nextQuestion: nextTasteQuestion(data) });
  } catch (err) {
    console.error('[GET /api/profile/taste]', err);
    return NextResponse.json({ error: 'Could not load your taste profile.' }, { status: 500 });
  }
}

/** POST /api/profile/taste — save one answer. body: { questionId, value } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const { questionId, value } = body ?? {};
    if (typeof questionId !== 'string' || typeof value !== 'string') {
      return NextResponse.json({ error: 'Invalid answer.' }, { status: 400 });
    }
    const data = await saveTasteAnswer(user.id, questionId, value);
    return NextResponse.json({ data, nextQuestion: nextTasteQuestion(data) });
  } catch (err) {
    console.error('[POST /api/profile/taste]', err);
    return NextResponse.json({ error: 'Could not save your answer.' }, { status: 500 });
  }
}
