import BusinessSwitcher from '@/components/business/BusinessSwitcher';

export default function BrandPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BusinessSwitcher active="brands" />
      {children}
    </>
  );
}
