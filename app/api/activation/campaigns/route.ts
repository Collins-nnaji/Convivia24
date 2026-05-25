import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import { createCampaign, listCampaignsForOwner } from '@/lib/activation';

export async function GET() {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const campaigns = await listCampaignsForOwner(String(user.id));
    return NextResponse.json({ campaigns });
  } catch (e) {
    console.error('[activation/campaigns GET]', e);
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const body = await req.json();
    if (!body.name || !body.brand_name) {
      return NextResponse.json({ error: 'name and brand_name required' }, { status: 400 });
    }
    const campaign = await createCampaign(String(user.id), body);
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (e) {
    console.error('[activation/campaigns POST]', e);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
