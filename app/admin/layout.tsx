import { requireAdmin, getAppUser } from '@/lib/auth/session';
import Link from 'next/link';
import { LayoutDashboard, Users, GitBranch, MessageSquare, ClipboardList, LogOut, Eye } from 'lucide-react';

const navItems = [
  { href: '/admin',          label: 'Overview',  icon: LayoutDashboard },
  { href: '/admin/clients',  label: 'Clients',   icon: Users },
  { href: '/admin/pipeline', label: 'Pipeline',  icon: GitBranch },
  { href: '/admin/messages', label: 'Messages',  icon: MessageSquare },
  { href: '/admin/leads',    label: 'Leads',     icon: ClipboardList },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await requireAdmin();
  const appUser = await getAppUser({ id: authUser.id, email: authUser.email!, name: authUser.name, image: authUser.image });

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar – red border so you know you're in Admin */}
      <aside className="w-56 shrink-0 bg-zinc-900 border-r-2 border-red-700 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-800 bg-red-950/20">
          <Link href="/">
            <img src="/convivia24.png" alt="Convivia24" className="h-6 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="bg-red-700 text-white text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded">Admin</span>
            <span className="text-[9px] text-red-400">Dashboard</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-sm"
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {appUser.image ? (
              <img src={appUser.image ?? ''} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-black">
                {(appUser.name || appUser.email || 'A')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{appUser.name || 'Admin'}</p>
              <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.1em]">Admin</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <Eye size={13} />
            Client view
          </Link>
          <Link
            href="/api/auth/sign-out"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
