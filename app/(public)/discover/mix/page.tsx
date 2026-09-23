import type { Metadata } from 'next';
import { Suspense } from 'react';
import MixPage from '@/components/discover/MixPage';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cocktail maker',
  description: 'Build a cocktail from what you have — measured recipe, scaled for your group. Adults 18+.',
  alternates: { canonical: absoluteUrl('/discover/mix') },
};

export default function Page() {
  return (
    <Suspense>
      <MixPage />
    </Suspense>
  );
}
