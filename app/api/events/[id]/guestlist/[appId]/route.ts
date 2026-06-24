import { NextRequest, NextResponse } from 'next/server';
import { reviewApplication } from '@/lib/guestlist';
import { isAdminRequest, getCurrentUser } from '@/lib/auth/session';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; appId: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { appId } = await params;
    const { status } = await req.json();
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    const user = await getCurrentUser();
    const app = await reviewApplication(appId, status, user?.email ?? 'admin');
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(app);
  } catch (err) {
    console.error('[PATCH guestlist app]', err);
    return NextResponse.json({ error: 'Review failed.' }, { status: 500 });
  }
}
