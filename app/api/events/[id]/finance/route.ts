import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events';
import { getEventFinance, getPlatformFinance } from '@/lib/finance';
import { isAdminRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    if (id === 'platform') {
      const summary = await getPlatformFinance();
      return NextResponse.json({ summary });
    }
    const event = await getEventBySlug(id);
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const finance = await getEventFinance(event.id);
    return NextResponse.json({ finance });
  } catch (err) {
    console.error('[GET finance]', err);
    return NextResponse.json({ error: 'Failed to load finance.' }, { status: 500 });
  }
}
