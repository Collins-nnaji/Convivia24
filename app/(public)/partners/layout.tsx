import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Partner with Convivia24: wholesale cases and Party Packs for Lagos clubs and lounges, list your nights on the events board, and run menu margins. Adults 18+.',
  alternates: { canonical: absoluteUrl('/partners') },
  openGraph: {
    title: 'Partners | Convivia24',
    description: 'Wholesale drinks, event listings, and margin tools for Lagos venues.',
    url: absoluteUrl('/partners'),
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
