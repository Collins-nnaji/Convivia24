import type { Metadata } from 'next';
import TastePage from '@/components/discover/TastePage';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Taste & mix',
  description: 'Your taste profile and an AI bartender tuned to it — see which houses fit you, then mix something tonight.',
  alternates: { canonical: absoluteUrl('/discover/taste') },
};

export default function Page() {
  return <TastePage />;
}
