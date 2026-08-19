import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { apiErrorResponse } from '@/lib/db';
import { isMember, markCrewCheckedOut } from '@/lib/crews/repo';

/** Marks a crew checked-out once its shared cart has become a real order via the normal /checkout flow. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    if (!(await isMember(id, user.id))) {
      return NextResponse.json({ error: 'Join this crew first.' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    await markCrewCheckedOut(id, orderId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, error } = apiErrorResponse(err, 'Could not close out this crew.');
    return NextResponse.json({ error }, { status });
  }
}
