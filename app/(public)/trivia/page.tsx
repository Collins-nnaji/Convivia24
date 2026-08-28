import type { Metadata } from 'next';
import TriviaExplorer from '@/components/trivia/TriviaExplorer';
import BrandEnquiryForm from '@/components/trivia/BrandEnquiryForm';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Brand Trivia',
  description:
    'Play Convivia24 brand trivia — learn the houses behind the bottles, enter sponsored rounds, and win complimentary drops. Adults 18+.',
  alternates: { canonical: absoluteUrl('/trivia') },
  openGraph: {
    title: 'Brand Trivia | Convivia24',
    description: 'Sponsored brand rounds and bottle draws for Lagos nights.',
    url: absoluteUrl('/trivia'),
  },
};

export default function TriviaPage() {
  return (
    <>
      <TriviaExplorer />
      <BrandEnquiryForm />
    </>
  );
}
