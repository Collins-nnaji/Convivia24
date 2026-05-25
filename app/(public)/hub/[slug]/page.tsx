import { LiveEventHub } from '@/components/guest/LiveEventHub';

export default function HubPage({ params, searchParams }: { params: { slug: string }; searchParams: { pass?: string } }) {
  return <LiveEventHub photowallSlug={params.slug} passToken={searchParams.pass} />;
}
