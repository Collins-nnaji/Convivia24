import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BrandProfile from '@/components/brands/BrandProfile';
import { BRANDS, getBrand } from '@/lib/brands/catalog';
import { listCampaigns } from '@/lib/brands/campaigns';
import { absoluteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return { title: 'Brand not found' };

  const description = `${brand.name} on Convivia24 — ${brand.info.style} Every bottle we stock, the house history, and the rounds you can play. Adults 18+.`;
  return {
    title: brand.name,
    description,
    alternates: { canonical: absoluteUrl(`/brands/${brand.slug}`) },
    openGraph: {
      title: `${brand.name} | Convivia24`,
      description,
      url: absoluteUrl(`/brands/${brand.slug}`),
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  // Campaigns are optional — a missing table must not take the page down.
  const campaigns = await listCampaigns({ brandSlug: brand.slug, publishedOnly: true }).catch(() => []);

  return <BrandProfile brand={brand} campaigns={campaigns} />;
}
