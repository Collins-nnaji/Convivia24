import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Guest Card',
  description:
    'Activate your Convivia24 Guest Card for shop discounts, partner venue perks, check-in points, and gift cards. Adults 18+.',
  alternates: { canonical: absoluteUrl('/guest-card') },
  openGraph: {
    title: 'Guest Card | Convivia24',
    description: 'Loyalty for Lagos nights — discounts, door perks, and points.',
    url: absoluteUrl('/guest-card'),
  },
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
