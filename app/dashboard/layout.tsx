import { requireAuth, getAppUser } from '@/lib/auth/session';
import { canAccessAdmin } from '@/lib/auth/access';
import Link from 'next/link';
import { LogOut, ShieldCheck } from 'lucide-react';
import { DashboardNav } from './DashboardNav';

const navItems = [
  { href: '/dashboard',           label: 'Overview',      icon: 'LayoutDashboard' },
  { href: '/dashboard/pipeline',  label: 'Pipeline',      icon: 'GitBranch' },
  { href: '/dashboard/listings',  label: 'Items to sell', icon: 'Package' },
  { href: '/dashboard/messages',  label: 'Messages',      icon: 'MessageSquare' },
  { href: '/dashboard/documents', label: 'Documents',     icon: 'FileText' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authUser = await requireAuth();
  const appUser = await getAppUser({
    id: authUser.id,
    email: authUser.email!,
    name: authUser.name,
    image: authUser.image,
  });

  return (
    <div className="min-h-screen bg-zinc-100 flex">
      {/* Sidebar – white with subtle border */}
      <aside className="w-56 shrink-0 bg-white border-r border-zinc-200 flex flex-col shadow-sm">
        <div className="px-5 py-5 border-b border-zinc-200">
          <Link href="/">
            <img src="/convivia24.png" alt="Convivia24" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Pipeline Suite</p>
            <span className="bg-zinc-200 text-zinc-600 text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded">Client</span>
          </div>
        </div>

        <DashboardNav items={navItems} />

        <div className="px-3 py-4 border-t border-zinc-200">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {appUser.image ? (
              <img src={appUser.image} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black">
                {(appUser.name || appUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{appUser.name || 'Client'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{appUser.email}</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Role: {appUser.role}</p>
            </div>
          </div>
          {canAccessAdmin(appUser) ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
            >
              <ShieldCheck size={13} />
              Open Admin panel →
            </Link>
          ) : (
            <p className="text-[9px] text-zinc-500 px-3 py-1">Admin: only for allowed emails</p>
          )}
          <Link
            href="/api/auth/sign-out"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
