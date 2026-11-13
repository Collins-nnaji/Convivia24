import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TrendReport from '@/components/trends/TrendReport';
import { VOLUMES, getVolume, volumeLabel } from '@/lib/trends/volumes';
import { absoluteUrl } from '@/lib/seo';

export function generateStaticParams() {
  return VOLUMES.map((v) => ({ volume: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ volume: string }> }): Promise<Metadata> {
  const volume = getVolume((await params).volume);
  if (!volume) return { title: 'Trend report not found' };
  const title = `${volumeLabel(volume)}: ${volume.title} — Beverage Trend Report`;
  return {
    title,
    description: volume.dek,
    alternates: { canonical: absoluteUrl(`/trends/${volume.slug}`) },
    openGraph: { title: `${title} | Convivia24`, description: volume.dek, url: absoluteUrl(`/trends/${volume.slug}`) },
  };
}

export default async function TrendVolumePage({ params }: { params: Promise<{ volume: string }> }) {
  const volume = getVolume((await params).volume);
  if (!volume) notFound();
  return <TrendReport volume={volume} />;
}
