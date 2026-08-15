import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import { CartProvider } from '@/components/cart/CartProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AgeGate />
      <Navigation />
      <div className="relative z-0">{children}</div>
      <Footer />
    </CartProvider>
  );
}
