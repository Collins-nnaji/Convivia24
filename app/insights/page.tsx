import type { Metadata } from 'next';
import { InsightsIndex } from '@/components/insights/InsightsIndex';
import { getAllPosts, getFeaturedPost } from '@/lib/insights/posts';

export const metadata: Metadata = {
  title: 'Insights · The Signal | Convivia24',
  description:
    'Field intelligence from FMCG activations — ROI, guest passes, UGC, and ops truths from Lagos, Abuja, and Port Harcourt.',
  openGraph: {
    title: 'Convivia24 Insights · The Signal',
    description: 'Essays and data cuts from the activation floor.',
  },
};

export default function InsightsPage() {
  const posts = getAllPosts();
  const featured = getFeaturedPost();

  if (!featured) {
    return null;
  }

  return <InsightsIndex posts={posts} featured={featured} />;
}
