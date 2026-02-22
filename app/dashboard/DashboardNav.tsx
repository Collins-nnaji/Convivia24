'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GitBranch, MessageSquare, FileText, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  GitBranch,
  MessageSquare,
  FileText,
  Package,
};

type NavItem = { href: string; label: string; icon: string };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {items.map(({ href, label, icon }) => {
        const Icon = ICON_MAP[icon];
        const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold rounded-sm transition-colors ${
              isActive
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {Icon && <Icon size={15} className="shrink-0" />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
