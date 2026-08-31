import type { Metadata } from 'next';
import PlanNightPlanner from '@/components/plan/PlanNightPlanner';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Party Planner',
  description:
    'Tell us your guest count and budget. Convivia24 plans the drinks, delivery, games and invitations for your party.',
  alternates: { canonical: absoluteUrl('/party-planner') },
  openGraph: {
    title: 'Party Planner | Convivia24',
    description: 'Guests, budget, delivery — we put together the whole party package.',
    url: absoluteUrl('/party-planner'),
  },
};

export default function PlanPage() {
  return <PlanNightPlanner />;
}
