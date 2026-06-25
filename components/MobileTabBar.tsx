'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, Sparkles, Ticket, PlusCircle } from 'lucide-react';

const TABS = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/events', label: 'Discover', icon: Compass, exact: false },
  { href: '/concierge', label: 'Concierge', icon: Sparkles, exact: false, accent: true },
  { href: '/tickets', label: 'Tickets', icon: Ticket, exact: false },
  { href: '/create', label: 'Host', icon: PlusCircle, exact: false },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-ink/8 bg-surface-elevated/95 backdrop-blur-xl pb-safe"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 min-h-[4.25rem]">
        {TABS.map(({ href, label, icon: Icon, exact, accent }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 min-h-[4.25rem] active:scale-95 transition-transform touch-manipulation"
            >
              {accent ? (
                <motion.span
                  layoutId="tab-fab"
                  className={`flex h-11 w-11 -mt-5 items-center justify-center rounded-2xl shadow-glow transition-colors ${
                    active ? 'bg-copper text-white' : 'bg-copper-bright text-white'
                  }`}
                >
                  <Icon size={20} strokeWidth={2.25} />
                </motion.span>
              ) : (
                <Icon
                  size={22}
                  strokeWidth={active ? 2.35 : 1.75}
                  className={active ? 'text-copper' : 'text-ink-muted/55'}
                />
              )}
              <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wide leading-none text-center ${active ? 'text-copper-deep' : 'text-ink-muted/55'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
