import type { Metadata } from 'next';
import BrandPortal from '@/components/brands/BrandPortal';
import { BRANDS } from '@/lib/brands/catalog';

export const metadata: Metadata = {
  title: 'Brand portal',
  description: 'Claim your brand on Convivia24 and manage its page, campaigns and events.',
  robots: { index: false },
};

export default function BrandPortalPage() {
  const directory = BRANDS.map((b) => ({ slug: b.slug, name: b.name, origin: b.info.origin }));
  return <BrandPortal directory={directory} />;
}
