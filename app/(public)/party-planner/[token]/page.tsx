import type { Metadata } from 'next';
import SharedNightPlan from '@/components/plan/SharedNightPlan';

export const metadata: Metadata = {
  title: 'Night plan invitation',
  description: 'A private Convivia24 night plan invitation.',
  robots: { index: false, follow: false },
};

export default async function SharedPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedNightPlan token={token} />;
}
