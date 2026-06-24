import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';
import PageTransition from '@/components/motion/PageTransition';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="relative z-0 pb-[4.5rem] md:pb-0 min-h-screen">
        <PageTransition>{children}</PageTransition>
        <Footer />
      </div>
      <MobileTabBar />
    </>
  );
}
