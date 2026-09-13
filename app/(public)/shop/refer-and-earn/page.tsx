import type { Metadata } from 'next';
import ReferEarnTab from '@/components/trivia/ReferEarnTab';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Refer & earn',
  description: 'Share your Convivia24 link and earn a cut of every order placed through it.',
  alternates: { canonical: absoluteUrl('/shop/refer-and-earn') },
};

export default function Page() {
  return (
    <section className="min-h-[70vh] bg-paper">
      <ReferEarnTab />
    </section>
  );
}
