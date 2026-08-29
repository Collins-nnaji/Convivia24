import type { Metadata } from 'next';
import BrandPortal from '@/components/brands/BrandPortal';

export const metadata: Metadata = {
  title: 'Brand portal',
  description: 'Manage your brand page and campaigns on Convivia24.',
  robots: { index: false },
};

export default function BrandPortalPage() {
  return <BrandPortal />;
}
