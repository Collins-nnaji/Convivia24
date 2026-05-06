import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {/* App root fills the phone viewport; marketing pages keep dark strip from legacy shell */}
      <div className="relative z-0 md:bg-[#0a0a0a] max-lg:min-h-[100dvh] max-lg:bg-[radial-gradient(ellipse_120%_90%_at_50%_0%,#2e2820_0%,#141210_42%,#080706_100%)]">
        {children}
      </div>
      <Footer />
    </>
  );
}
