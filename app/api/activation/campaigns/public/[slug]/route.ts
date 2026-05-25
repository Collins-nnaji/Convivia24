import { NextRequest, NextResponse } from 'next/server';
import { getCampaignBySlug, recordScan, listCampaignPhotos } from '@/lib/activation';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const campaign = await getCampaignBySlug(slug);
    if (!campaign || campaign.status !== 'active') {
      return NextResponse.json({ error: 'Activation not found' }, { status: 404 });
    }
    await recordScan(campaign.id, 'hub_view');
    const photos = campaign.photowall_enabled
      ? await listCampaignPhotos(campaign.id, true)
      : [];
    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        brand_name: campaign.brand_name,
        slug: campaign.slug,
        primary_color: campaign.primary_color,
        logo_url: campaign.logo_url,
        headline: campaign.headline,
        subheadline: campaign.subheadline,
        venue_name: campaign.venue_name,
        city: campaign.city,
        event_date: campaign.event_date,
        start_time: campaign.start_time,
        end_time: campaign.end_time,
        guestlist_enabled: campaign.guestlist_enabled,
        voucher_enabled: campaign.voucher_enabled,
        voucher_label: campaign.voucher_label,
        photowall_enabled: campaign.photowall_enabled,
        age_gate: campaign.age_gate,
        lineup_text: campaign.lineup_text,
        menu_text: campaign.menu_text,
      },
      photos,
    });
  } catch (e) {
    console.error('[activation/public slug]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
