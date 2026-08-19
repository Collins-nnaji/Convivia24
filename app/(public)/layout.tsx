import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';
import { CartProvider } from '@/components/cart/CartProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <Navigation />
        <main className="relative z-0 flex-1">{children}</main>
        <Footer />
      </div>
      <MobileTabBar />
    </CartProvider>
  );
}
