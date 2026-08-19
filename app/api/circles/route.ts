import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { listCircles } from '@/lib/circles/repo';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const circles = await listCircles(user?.id ?? null);
    return NextResponse.json({ circles, signedIn: Boolean(user) });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load circles.');
    return NextResponse.json({ error, circles: [] }, { status });
  }
}
