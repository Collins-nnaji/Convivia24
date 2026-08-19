import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';
import { CartProvider } from '@/components/cart/CartProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {/*
        Mobile app shell: the frame is locked to the viewport (no page-level
        scroll), so pull-to-refresh/rubber-band bounce can never reveal blank
        space past the fixed header or tab bar — only #app-scroll scrolls,
        the way a native app's content area would. Desktop reverts to plain
        document flow (md:), where this was never an issue.
      */}
      <div className="flex flex-col h-[100dvh] overflow-hidden md:h-auto md:min-h-[100dvh] md:overflow-visible">
        <Navigation />
        <div
          id="app-scroll"
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] md:overflow-visible md:min-h-fit md:flex-none"
        >
          <main className="relative z-0">{children}</main>
          <Footer />
        </div>
      </div>
      <MobileTabBar />
    </CartProvider>
  );
}
