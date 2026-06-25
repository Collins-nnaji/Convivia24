import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';
import PageTransition from '@/components/motion/PageTransition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="relative z-0 min-h-[100dvh] overflow-x-clip pb-tab-bar md:pb-0">
        <PageTransition>{children}</PageTransition>
        <Footer />
      </div>
      <MobileTabBar />
    </>
  );
}
