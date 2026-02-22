import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <div className="relative z-0">
        {children}
      </div>
      <Footer />
    </>
  );
}
