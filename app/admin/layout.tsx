import { requireAdmin, getAppUser } from '@/lib/auth/session';
import Link from 'next/link';
import { LogOut, Eye } from 'lucide-react';
import { AdminNav } from './AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await requireAdmin();
  const appUser = await getAppUser({ id: authUser.id, email: authUser.email!, name: authUser.name, image: authUser.image });

  return (
    <div className="min-h-screen bg-zinc-200 flex">
      {/* Sidebar – light with red accent */}
      <aside className="w-56 shrink-0 bg-white border-r-2 border-red-600 flex flex-col shadow-sm">
        <div className="px-5 py-5 border-b border-zinc-200 bg-red-50/80">
          <Link href="/">
            <img src="/convivia24.png" alt="Convivia24" className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded">Admin</span>
            <span className="text-[9px] text-red-700">Dashboard</span>
          </div>
        </div>

        <AdminNav />

        <div className="px-3 py-4 border-t border-zinc-200">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {appUser.image ? (
              <img src={appUser.image ?? ''} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black">
                {(appUser.name || appUser.email || 'A')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{appUser.name || 'Admin'}</p>
              <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.1em]">Admin</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <Eye size={13} />
            Client view
          </Link>
          <Link
            href="/api/auth/sign-out"
            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
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
