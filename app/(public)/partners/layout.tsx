import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Partner portal',
  description:
    'Convivia24 partner portal — wholesale ordering, menu margin desk, and perks for approved outlets.',
  alternates: { canonical: absoluteUrl('/partners/portal') },
  openGraph: {
    title: 'Partner portal | Convivia24',
    description: 'Wholesale desk and margin tools for approved partner outlets.',
    url: absoluteUrl('/partners/portal'),
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
