import { redirect } from 'next/navigation';

export default async function PackageDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/shop?section=packages&pkg=${encodeURIComponent(slug)}`);
}
