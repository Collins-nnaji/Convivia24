import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import MobileTabBar from '@/components/MobileTabBar';
import { CartProvider } from '@/components/cart/CartProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AgeGate />
      <Navigation />
      <div className="relative z-0 pb-16 md:pb-0">{children}</div>
      <Footer />
      <MobileTabBar />
    </CartProvider>
  );
}
