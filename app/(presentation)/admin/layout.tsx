'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Receipt, ScanLine, ImagePlus, Plus, LogOut, Menu } from 'lucide-react';

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
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-[#0a0a0a] border-r border-[#c9a84c]/15 z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-5 py-6 border-b border-[#c9a84c]/10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Organizer</p>
          <p className="text-lg font-light italic text-[#f5f0e8] tracking-tight">Convivia24</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${active ? 'text-[#c9a84c] bg-[#c9a84c]/5' : 'text-[#f5f0e8]/40 hover:text-[#f5f0e8]/80'}`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-[#c9a84c]/10">
          <Link href="/" className="flex items-center gap-2 text-[#f5f0e8]/30 hover:text-[#f5f0e8]/60 text-xs transition-colors">
            <LogOut size={13} /> Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('cv24-admin-secret') || '';
    if (stored) setSecret(stored);
  }, []);

  if (!secret) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm border border-[#c9a84c]/20 p-10">
          <div className="h-px bg-[#c9a84c] mb-8" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a84c]/50 mb-1">Convivia24</p>
          <h1 className="text-2xl font-light italic text-[#f5f0e8] mb-8">Admin access</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                sessionStorage.setItem('cv24-admin-secret', input);
                setSecret(input);
              }
            }}
            className={`w-full bg-transparent border-b ${error ? 'border-red-500' : 'border-[#c9a84c]/20'} focus:border-[#c9a84c] text-[#f5f0e8] text-sm py-3 px-0 outline-none placeholder-[#f5f0e8]/20 mb-4`}
          />
          {error && <p className="text-red-400 text-xs mb-4">Incorrect password.</p>}
          <button
            onClick={() => { sessionStorage.setItem('cv24-admin-secret', input); setSecret(input); }}
            className="w-full bg-[#c9a84c] text-[#0a0a0a] text-[11px] font-black uppercase tracking-[0.2em] py-3 hover:bg-[#d4b464] transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <Ctx.Provider value={{ secret }}>
      <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0e8]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-56">
          <header className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#c9a84c]/10 px-5 sm:px-8 py-4 flex items-center gap-4">
            <button className="lg:hidden text-[#f5f0e8]/50 hover:text-[#f5f0e8]" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <p className="text-xs text-[#f5f0e8]/30 uppercase tracking-widest">Management Console</p>
          </header>
          <main className="p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </Ctx.Provider>
  );
}
