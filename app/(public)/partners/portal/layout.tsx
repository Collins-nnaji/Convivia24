import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Wholesale portal',
  description:
    'Convivia24 wholesale portal — the partner price list, ordering, menu margin desk and perks for approved outlets.',
  alternates: { canonical: absoluteUrl('/partners/portal') },
  robots: { index: false },
  openGraph: {
    title: 'Wholesale portal | Convivia24',
    description: 'Wholesale desk and margin tools for approved partner outlets.',
    url: absoluteUrl('/partners/portal'),
  },
};

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
