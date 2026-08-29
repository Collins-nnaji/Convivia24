import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CampaignDetail from '@/components/brands/CampaignDetail';
import { getCampaign, listCampaigns } from '@/lib/brands/campaigns';
import { getBrand } from '@/lib/brands/catalog';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaign(slug).catch(() => null);
  if (!campaign) return { title: 'Campaign not found' };

  const description = campaign.blurb || campaign.tagline || `A brand campaign on Convivia24. Adults 18+.`;
  return {
    title: campaign.title,
    description,
    alternates: { canonical: absoluteUrl(`/campaigns/${campaign.slug}`) },
    openGraph: {
      title: `${campaign.title} | Convivia24`,
      description,
      url: absoluteUrl(`/campaigns/${campaign.slug}`),
    },
  };
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug).catch(() => null);
  if (!campaign || !campaign.published) notFound();

  const brand = getBrand(campaign.brandSlug);
  const others = (await listCampaigns({ publishedOnly: true }).catch(() => []))
    .filter((c) => c.slug !== campaign.slug && c.live)
    .slice(0, 5);

  return <CampaignDetail campaign={campaign} brand={brand ?? null} others={others} />;
}
