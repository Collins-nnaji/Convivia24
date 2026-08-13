'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Users, Plus } from 'lucide-react';

const TABS = [
  { href: '/',            label: 'Home',    icon: Home,   exact: true },
  { href: '/places',      label: 'Places',  icon: MapPin, exact: false },
  { href: '/meetups',     label: 'Meetups', icon: Users,  exact: false },
  { href: '/meetups/new', label: 'New',     icon: Plus,   exact: true },
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
