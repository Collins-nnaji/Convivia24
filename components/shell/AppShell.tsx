'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MobileTabBar from '@/components/MobileTabBar';
import MobileHeader from '@/components/shell/MobileHeader';
import OnboardingSheet from '@/components/shell/OnboardingSheet';
import Toaster from '@/components/ui/Toast';
import { chromeFor } from '@/components/shell/routes';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chrome = chromeFor(pathname);
  const reduce = useReducedMotion();

  return (
    <>
      {/* Desktop keeps the marketing header; the phone gets an app bar. */}
      <Navigation />
      {chrome.mobileHeader !== 'none' && <MobileHeader chrome={chrome} />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative z-0"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {chrome.footer && <Footer />}

      {/* Clears the fixed tab bar so nothing hides behind it. */}
      {chrome.tabBar && <div className="md:hidden h-[calc(3.75rem+env(safe-area-inset-bottom))]" aria-hidden />}
      {chrome.tabBar && <MobileTabBar />}

      <OnboardingSheet />
      <Toaster />
    </>
  );
}
