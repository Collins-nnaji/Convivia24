import type { Metadata } from 'next';
import TriviaHub from '@/components/trivia/TriviaHub';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Discover your next drink',
  description:
    'Personalised drink recommendations, brand challenges and rewards. Play the week\u2019s sponsored round, earn points, and enter the bottle draw. Adults 18+.',
  alternates: { canonical: absoluteUrl('/discover') },
  openGraph: {
    title: 'Discover your next drink | Convivia24',
    description: 'Brand challenges, taste-matched recommendations, and rewards for Lagos nights.',
    url: absoluteUrl('/discover'),
  },
};

export default function TriviaPage() {
  return <TriviaHub />;
}
