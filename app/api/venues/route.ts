import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { listVenues } from '@/lib/venues/repo';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const areaId = searchParams.get('area') || undefined;
    const status = searchParams.get('status') || 'active';

    const venues = await listVenues({ userId: user?.id ?? null, status, areaId });
    return NextResponse.json({ venues });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Unable to load venues.');
    return NextResponse.json({ error, venues: [] }, { status });
  }
}
