import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="relative z-0 bg-[#0a0a0a]">
        {children}
      </div>
      <Footer />
    </>
  );
}
