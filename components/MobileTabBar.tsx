'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarHeart, Compass, MessageCircle, TrendingUp } from 'lucide-react';

const TABS = [
  { href: '/discover',  label: 'Discover',  icon: Compass,       exact: false },
  { href: '/my24',      label: 'My 24',     icon: CalendarHeart, exact: false },
  { href: '/companion', label: 'Companion', icon: MessageCircle, exact: false },
  { href: '/insights',  label: 'Insights',  icon: TrendingUp,    exact: false },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-paper/95 backdrop-blur-md border-t border-obsidian/10 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-gold-dark' : 'text-obsidian/45'} />
              <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${active ? 'text-gold-dark' : 'text-obsidian/40'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
