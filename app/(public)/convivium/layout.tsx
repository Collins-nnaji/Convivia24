import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Convivium',
  description:
    'Convivium is Convivia24 membership for Lagos nights — Resident, Founding, and Patron tiers with card perks and partner access. Adults 18+.',
  alternates: { canonical: absoluteUrl('/convivium') },
  openGraph: {
    title: 'Convivium | Convivia24',
    description: 'Membership for Lagos nightlife — join the waitlist.',
    url: absoluteUrl('/convivium'),
  },
};

export default function ConviviumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
