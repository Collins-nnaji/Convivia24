import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {/* Bottom padding keeps content clear of the mobile tab bar */}
      <div className="relative z-0 pb-16 md:pb-0">
        {children}
        <Footer />
      </div>
      <MobileTabBar />
    </>
  );
}
