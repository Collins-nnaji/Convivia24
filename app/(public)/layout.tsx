import Navigation from '@/components/Navigation';
import MobileTabBar from '@/components/MobileTabBar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="relative z-0">{children}</main>
      <MobileTabBar />
    </>
  );
}
