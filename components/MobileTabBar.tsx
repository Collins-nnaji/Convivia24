'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Compass, Images, CalendarHeart, Plus } from 'lucide-react';
import { useMeetups } from '@/lib/meetup/store';

const TABS = [
  { href: '/moments',     label: 'Moments',  icon: Images,        exact: false },
  { href: '/discover',    label: 'Discover', icon: Compass,       exact: false },
  { href: '/meetups',     label: 'Plans',    icon: CalendarHeart, exact: false, badge: true },
  { href: '/meetups/new', label: 'New',      icon: Plus,          exact: true },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const count = useMeetups().length;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-paper/92 backdrop-blur-xl border-t border-obsidian/10 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4 h-[3.75rem]">
        {TABS.map(({ href, label, icon: Icon, exact, badge }) => {
          // "/meetups" must not light up while you are on "/meetups/new".
          const active = exact
            ? pathname === href
            : pathname === href || (pathname.startsWith(`${href}/`) && pathname !== '/meetups/new');

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform duration-150"
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute top-0 h-0.5 w-8 bg-gold"
                  transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                />
              )}

              <span className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={active ? 'text-obsidian' : 'text-obsidian/40'}
                />
                {badge && count > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 grid place-items-center rounded-full bg-gold text-obsidian text-[8px] font-black tabular-nums">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </span>

              <span
                className={`text-[9px] font-black uppercase tracking-[0.12em] ${
                  active ? 'text-obsidian' : 'text-obsidian/40'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
