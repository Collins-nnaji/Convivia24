import { redirect } from 'next/navigation';

export default async function RitualSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/shop/${slug}`);
}
