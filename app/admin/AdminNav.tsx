'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GitBranch, MessageSquare, ClipboardList, Package } from 'lucide-react';

const NAV_ITEMS: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { href: '/admin',          label: 'Overview',  icon: LayoutDashboard },
  { href: '/admin/clients',  label: 'Clients',   icon: Users },
  { href: '/admin/listings', label: 'Listings',  icon: Package },
  { href: '/admin/pipeline', label: 'Pipeline',  icon: GitBranch },
  { href: '/admin/messages', label: 'Messages',  icon: MessageSquare },
  { href: '/admin/leads',    label: 'Leads',     icon: ClipboardList },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/admin' && pathname?.startsWith(href + '/'));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold rounded-sm transition-colors ${
              isActive
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
