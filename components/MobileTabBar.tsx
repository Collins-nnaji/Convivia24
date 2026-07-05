'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BedDouble, Flower2, UtensilsCrossed, Sparkles } from 'lucide-react';

const TABS = [
  { href: '/stays',    label: 'Stays',    icon: BedDouble,       exact: false },
  { href: '/wellness', label: 'Wellness', icon: Flower2,         exact: false },
  { href: '/dining',   label: 'Dining',   icon: UtensilsCrossed, exact: false },
  { href: '/events',   label: 'Events',   icon: Sparkles,        exact: false },
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
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-gold-dark' : 'text-obsidian/45'} />
              <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${active ? 'text-gold-dark' : 'text-obsidian/40'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
