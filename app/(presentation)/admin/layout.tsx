'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Receipt, ScanLine, ImagePlus, Plus, LogOut, Menu, ShieldAlert } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import { signInWithGoogle } from '@/lib/auth/client';

// Kept for backwards-compat with admin pages that read `secret`. Authorization
// is now enforced by the Neon Auth session + admin role; same-origin fetches
// send the session cookie automatically, so this stays empty.
type AdminCtx = { secret: string };
const Ctx = createContext<AdminCtx>({ secret: '' });
export const useAdmin = () => useContext(Ctx);

const NAV = [
  { href: '/admin',         label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/events',  label: 'Events',       icon: Calendar },
  { href: '/admin/orders',  label: 'Orders',       icon: Receipt },
  { href: '/admin/scan',    label: 'Door Scanner', icon: ScanLine },
  { href: '/create',        label: 'New Event',    icon: Plus },
  { href: '/admin/media',   label: 'Media',        icon: ImagePlus },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {open && <div className="fixed inset-0 bg-obsidian/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-white border-r border-[#c9a84c]/20 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-5 py-6 border-b border-[#c9a84c]/15">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a07c28]/60 mb-1">Organizer</p>
          <p className="text-lg font-light italic text-obsidian tracking-tight">Convivia24</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && href !== '/create' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${active ? 'text-[#a07c28] bg-[#c9a84c]/10' : 'text-obsidian/50 hover:text-obsidian'}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-[#c9a84c]/15">
          <Link href="/" className="flex items-center gap-2 text-obsidian/40 hover:text-obsidian/70 text-xs transition-colors">
            <LogOut size={13} /> Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center"><p className="text-obsidian/30 text-sm uppercase tracking-[0.3em]">Checking access…</p></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-obsidian/12 shadow-sm p-10 text-center">
          <div className="h-px bg-gold mb-8" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a07c28]/70 mb-1">Convivia24</p>
          <h1 className="text-2xl font-light italic text-obsidian mb-3">Organizer access</h1>
          <p className="text-obsidian/50 text-sm mb-7">Sign in with your organizer account to manage events.</p>
          <button onClick={() => signInWithGoogle('/admin')} className="w-full inline-flex items-center justify-center gap-3 border border-obsidian/20 hover:border-gold text-obsidian text-sm font-semibold py-3 transition-colors">
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-obsidian/12 shadow-sm p-10 text-center">
          <ShieldAlert size={32} className="text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-light italic text-obsidian mb-2">Not authorized</h1>
          <p className="text-obsidian/50 text-sm mb-6">Your account ({user.email}) isn&apos;t an organizer. Ask an admin to add your email to the allow-list.</p>
          <Link href="/" className="text-[#a07c28] text-[11px] font-black uppercase tracking-[0.2em]">Back to site →</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Gate>
      <Ctx.Provider value={{ secret: '' }}>
        <div className="min-h-screen bg-paper text-obsidian">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:pl-56">
            <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-[#c9a84c]/15 px-5 sm:px-8 py-4 flex items-center gap-4">
              <button className="lg:hidden text-obsidian/50 hover:text-obsidian" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <p className="text-xs text-obsidian/40 uppercase tracking-widest">Organizer Console</p>
            </header>
            <main className="p-5 sm:p-8">{children}</main>
          </div>
        </div>
      </Ctx.Provider>
    </Gate>
  );
}
