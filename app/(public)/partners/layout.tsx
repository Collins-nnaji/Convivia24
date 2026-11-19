import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Wholesale for venues',
  description:
    'Convivia24 wholesale — partner prices 22% below retail for clubs, lounges, hotels and event spaces, two weeks’ credit once signed, delivery to your venue and Premium points on every restock. Adults 18+.',
  alternates: { canonical: absoluteUrl('/partners') },
  openGraph: {
    title: 'Wholesale for venues | Convivia24',
    description: 'Partner prices, a margin calculator and restock delivery for bars, clubs and event spaces.',
    url: absoluteUrl('/partners'),
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
