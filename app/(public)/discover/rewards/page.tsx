import type { Metadata } from 'next';
import RewardsPage from '@/components/discover/RewardsPage';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Rewards shop',
  description: 'Spend Convivia24 points on bottles, shop credit, partner perks and merchandise.',
  alternates: { canonical: absoluteUrl('/discover/rewards') },
};

export default function Page() {
  return <RewardsPage />;
}
