import type { Metadata } from 'next';
import TastePage from '@/components/discover/TastePage';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Your taste',
  description: 'Build your Convivia24 taste profile and see which houses fit you. Adults 18+.',
  alternates: { canonical: absoluteUrl('/discover/taste') },
};

export default function Page() {
  return <TastePage />;
}
