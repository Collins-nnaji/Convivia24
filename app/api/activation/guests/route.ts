import { NextRequest, NextResponse } from 'next/server';
import { registerGuest, getCampaignBySlug } from '@/lib/activation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, campaign_id, name, phone, email, segment, consent } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: 'name and phone required' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: 'Consent required' }, { status: 400 });
    }

    let campaignId = campaign_id;
    if (!campaignId && slug) {
      const c = await getCampaignBySlug(slug);
      if (!c) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      campaignId = c.id;
    }
    if (!campaignId) {
      return NextResponse.json({ error: 'slug or campaign_id required' }, { status: 400 });
    }

    const guest = await registerGuest(campaignId, {
      name,
      phone,
      email,
      segment,
      consent: true,
    });
    return NextResponse.json({ guest: { id: guest.id, pass_token: guest.pass_token, name: guest.name } }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Registration failed';
    console.error('[activation/guests POST]', e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
