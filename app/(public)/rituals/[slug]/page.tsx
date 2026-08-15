import { notFound } from 'next/navigation';
import KitDetail from '@/components/rituals/KitDetail';
import { getRitualBySlug, RITUAL_KITS } from '@/lib/rituals/catalog';

export function generateStaticParams() {
  return RITUAL_KITS.map((k) => ({ slug: k.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const kit = getRitualBySlug(slug);
    if (!kit) return { title: 'Ritual | Convivia24' };
    return {
      title: `${kit.name} | Convivia24`,
      description: kit.tagline,
    };
  });
}

export default async function RitualKitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kit = getRitualBySlug(slug);
  if (!kit) notFound();
  return <KitDetail kit={kit} />;
}
