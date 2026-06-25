'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Receipt, ScanLine, ImagePlus, Plus, Menu, ShieldAlert,
  UserCheck, Megaphone, Wallet, Home, Compass, Ticket, LogOut, ExternalLink, X, Plug, Store,
} from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import { signInWithGoogle } from '@/lib/auth/client';
import PageTransition from '@/components/motion/PageTransition';

type AdminCtx = { secret: string };
const Ctx = createContext<AdminCtx>({ secret: '' });
export const useAdmin = () => useContext(Ctx);

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Events',
    items: [
      { href: '/admin/events', label: 'All events', icon: Calendar },
      { href: '/create', label: 'Create event', icon: Plus },
      { href: '/admin/media', label: 'Media library', icon: ImagePlus },
    ],
  },
  {
    label: 'Guests & comms',
    items: [
      { href: '/admin/guestlist', label: 'Guestlist', icon: UserCheck },
      { href: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { href: '/admin/vendors', label: 'Vendors', icon: Store },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/finance', label: 'Finance', icon: Wallet },
      { href: '/admin/orders', label: 'Orders', icon: Receipt },
      { href: '/admin/scan', label: 'Door scanner', icon: ScanLine },
      { href: '/admin/integrations', label: 'Integrations', icon: Plug },
    ],
  },
];

const GUEST_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Discover', icon: Compass },
  { href: '/tickets', label: 'My tickets', icon: Ticket },
];

const MOBILE_TABS = [
  { href: '/admin', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/scan', label: 'Scan', icon: ScanLine },
  { href: '/create', label: 'Create', icon: Plus },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useUser();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-[17.5rem] flex-col border-r border-ink/8 bg-surface-elevated transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/8 px-5 py-5">
          <Link href="/admin" onClick={onClose} className="min-w-0" aria-label="Convivia24 organizer console">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-copper-deep mb-2">Organizer</p>
            <img src="/convivia24.png" alt="" className="h-7 w-auto" style={{ filter: 'brightness(0)' }} />
          </Link>
          <button type="button" onClick={onClose} className="lg:hidden p-2 text-ink-muted hover:text-ink" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted/70">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon, exact }) => {
                  const active = isActive(pathname, href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-copper/12 text-copper-deep shadow-sm'
                          : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                      }`}
                    >
                      <Icon size={17} strokeWidth={active ? 2.25 : 1.75} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink/8 p-4 space-y-4">
          <div>
            <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted/70">Guest app</p>
            <div className="grid grid-cols-1 gap-0.5">
              {GUEST_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {user && (
            <div className="rounded-2xl bg-surface p-3">
              <p className="text-xs font-semibold text-ink truncate">{user.name || 'Organizer'}</p>
              <p className="text-[11px] text-ink-muted truncate mb-3">{user.email}</p>
              <button
                type="button"
                onClick={() => signOut()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink/10 py-2 text-xs font-semibold text-ink-muted hover:text-ink hover:border-ink/20 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function AdminTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const { user } = useUser();

  const pageTitle = (() => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (isActive(pathname, item.href, 'exact' in item ? item.exact : undefined)) return item.label;
      }
    }
    if (pathname.startsWith('/admin/events/')) return 'Edit event';
    return 'Event organiser tools';
  })();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/8 bg-surface/90 backdrop-blur-xl pt-safe">
      <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-3 px-3 sm:px-6">
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden touch-target flex items-center justify-center rounded-xl text-ink-muted hover:bg-ink/5 hover:text-ink"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-copper-deep hidden sm:block">Event organiser tools</p>
          <h1 className="font-display text-lg sm:text-xl italic text-ink truncate leading-tight">{pageTitle}</h1>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {GUEST_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="btn-ghost text-xs gap-1.5"
            >
              <Icon size={14} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="btn-secondary text-xs !px-3.5 !py-2 gap-1.5 shrink-0"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">Exit to app</span>
          <span className="sm:hidden">Exit</span>
        </Link>

        {user?.image && (
          <img src={user.image} alt="" className="hidden sm:block h-9 w-9 rounded-full object-cover ring-2 ring-copper/20" />
        )}
      </div>
    </header>
  );
}

function AdminMobileBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-ink/10 bg-surface-elevated/95 backdrop-blur-xl pb-safe lg:hidden"
      aria-label="Organizer navigation"
    >
      <div className="grid grid-cols-5 min-h-16">
        {MOBILE_TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-2 min-h-16 active:scale-95 transition-transform touch-manipulation"
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.75} className={active ? 'text-copper' : 'text-ink-muted/60'} />
              <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? 'text-copper-deep' : 'text-ink-muted/60'}`}>{label}</span>
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 px-1 py-2 min-h-16 active:scale-95 transition-transform touch-manipulation text-ink-muted/60 hover:text-copper"
        >
          <ExternalLink size={20} strokeWidth={1.75} />
          <span className="text-[9px] font-bold uppercase tracking-wide">Exit</span>
        </Link>
      </div>
    </nav>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-copper/30 border-t-copper animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Loading console…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-6 sm:p-10 text-center">
          <img src="/convivia24.png" alt="" className="h-8 w-auto mx-auto mb-4" style={{ filter: 'brightness(0)' }} aria-hidden />
          <h1 className="font-display text-3xl italic text-ink mb-3">Event organiser sign-in</h1>
          <p className="text-ink-muted text-sm mb-8 leading-relaxed">Sign in to manage your events, guestlists, broadcasts, and door check-in.</p>
          <button type="button" onClick={() => signInWithGoogle('/admin')} className="btn-primary w-full">
            Continue with Google
          </button>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors">
            <Home size={14} /> Back to guest app
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-card p-6 sm:p-10 text-center">
          <ShieldAlert size={36} className="text-amber-600 mx-auto mb-4" />
          <h1 className="font-display text-2xl italic text-ink mb-2">Not authorized</h1>
          <p className="text-ink-muted text-sm mb-6 leading-relaxed">
            <span className="font-medium text-ink">{user.email}</span> isn&apos;t on the organizer allow-list yet.
          </p>
          <Link href="/" className="btn-secondary w-full">Return to guest app</Link>
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
        <div className="min-h-screen bg-surface text-ink">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:pl-[17.5rem] flex flex-col min-h-screen">
            <AdminTopBar onMenuOpen={() => setSidebarOpen(true)} />
            <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-tab-bar lg:pb-8">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          <AdminMobileBar />
        </div>
      </Ctx.Provider>
    </Gate>
  );
}
