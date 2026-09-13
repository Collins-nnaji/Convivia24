import SupplierPortal from '@/components/supplier/SupplierPortal';

export const metadata = { title: 'Supplier portal | Convivia24', robots: { index: false, follow: false } };

export default async function SupplierPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SupplierPortal slug={slug} />;
}
