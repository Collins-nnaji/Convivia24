import { NextRequest, NextResponse } from 'next/server';
import { getGuestByToken, recordScan } from '@/lib/activation';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const guest = await getGuestByToken(token);
    if (!guest) return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
    await recordScan(String(guest.campaign_id), 'pass_open', String(guest.id));
    return NextResponse.json({ guest });
  } catch (e) {
    console.error('[activation/pass GET]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
