import type { Metadata } from 'next';
import { Suspense } from 'react';
import TriviaSection from '@/components/discover/TriviaSection';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Trivia',
  description: "Play this week's sponsored brand round, earn points, and enter the bottle draw. Adults 18+.",
  alternates: { canonical: absoluteUrl('/discover/trivia') },
};

export default function TriviaPage() {
  return (
    <Suspense>
      <TriviaSection />
    </Suspense>
  );
}
