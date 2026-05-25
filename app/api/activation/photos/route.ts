import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/lib/auth/server';
import { getOrCreateUser } from '@/lib/db/users';
import {
  addCampaignPhoto,
  listCampaignPhotos,
  approvePhoto,
  getCampaignById,
} from '@/lib/activation';

export async function GET(req: NextRequest) {
  try {
    const campaignId = new URL(req.url).searchParams.get('campaignId');
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });
    const photos = await listCampaignPhotos(campaignId, false);
    return NextResponse.json({ photos });
  } catch (e) {
    console.error('[activation/photos GET]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaign_id, url, caption, guest_id, pass_token, approve } = body;
    if (!campaign_id || !url) {
      return NextResponse.json({ error: 'campaign_id and url required' }, { status: 400 });
    }

    let uploadedBy: string | undefined;
    const { user: authUser } = await neonAuth();
    if (authUser) {
      const user = await getOrCreateUser(authUser);
      uploadedBy = String(user.id);
      const owned = await getCampaignById(campaign_id, uploadedBy);
      if (!owned && !pass_token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    let guestId = guest_id;
    if (pass_token) {
      const { getGuestByToken } = await import('@/lib/activation');
      const g = await getGuestByToken(pass_token);
      if (g) guestId = g.id;
    }

    const photo = await addCampaignPhoto(campaign_id, url, {
      guestId,
      caption,
      uploadedBy,
      approved: Boolean(approve),
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (e) {
    console.error('[activation/photos POST]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user: authUser } = await neonAuth();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await getOrCreateUser(authUser);
    const { photo_id, campaign_id } = await req.json();
    const owned = await getCampaignById(campaign_id, String(user.id));
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const photo = await approvePhoto(photo_id, campaign_id);
    return NextResponse.json({ photo });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
