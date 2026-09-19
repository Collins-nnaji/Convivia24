'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatNgn } from '@/lib/drinks/catalog';
import AdminShell, { type AdminTab } from '@/components/admin/AdminShell';
import DialogProvider from '@/components/admin/ui/DialogProvider';
import OverviewDesk from '@/components/admin/OverviewDesk';
import DrinksDesk from '@/components/admin/DrinksDesk';
import OrdersDesk from '@/components/admin/OrdersDesk';
import SourcingDesk from '@/components/admin/SourcingDesk';
import SuppliersDesk from '@/components/admin/SuppliersDesk';
import ReferralsDesk from '@/components/admin/ReferralsDesk';
import GiftCardsDesk from '@/components/admin/GiftCardsDesk';
import TriviaDesk from '@/components/admin/TriviaDesk';
import ContentDesk from '@/components/admin/ContentDesk';
import { useAdminOrders } from '@/components/admin/useAdminOrders';
import { EMPTY_SUMMARY, type AdminSummary } from '@/components/admin/types';
import { CalendarDays, Gift, LayoutDashboard, PackageSearch, Share2, ShoppingBag, Trophy, Truck, Wine } from 'lucide-react';

const TAB_KEYS = ['overview', 'drinks', 'orders', 'sourcing', 'suppliers', 'referrals', 'giftcards', 'trivia', 'content'] as const;
type TabKey = (typeof TAB_KEYS)[number];

function isTab(v: string): v is TabKey {
  return (TAB_KEYS as readonly string[]).includes(v);
}

/** The tab lives in the URL hash so a reload (or a shared link) lands on the same view. */
function tabFromHash(): TabKey {
  if (typeof window === 'undefined') return 'overview';
  const h = window.location.hash.replace(/^#/, '');
  return isTab(h) ? h : 'overview';
}

export default function AdminPage() {
  return (
    <DialogProvider>
      <AdminDesk />
    </DialogProvider>
  );
}

function AdminDesk() {
  /** null = still checking the cookie; false = show the sign-in form. */
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<TabKey>('overview');
  const [summary, setSummary] = useState<AdminSummary>(EMPTY_SUMMARY);
  const ordersStore = useAdminOrders();

  /** Counts for the sidebar + overview. The one call that runs on mount; every write re-runs it. */
  const loadSummary = useCallback(async () => {
    const res = await fetch('/api/admin/summary');
    if (res.status === 401) {
      setAuthed(false);
      return false;
    }
    if (res.ok) setSummary(await res.json());
    setAuthed(true);
    return true;
  }, []);

  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    loadSummary().catch(() => setAuthed(false));
    return () => window.removeEventListener('hashchange', onHash);
  }, [loadSummary]);

  // Orders are shared by two tabs; fetch them the first time either is opened.
  const needsOrders = tab === 'orders' || tab === 'sourcing';
  const { loaded: ordersLoaded, loading: ordersLoading, reload: reloadOrders } = ordersStore;
  useEffect(() => {
    if (authed && needsOrders && !ordersLoaded && !ordersLoading) reloadOrders();
  }, [authed, needsOrders, ordersLoaded, ordersLoading, reloadOrders]);

  function go(key: string) {
    if (!isTab(key)) return;
    setTab(key);
    window.history.replaceState(null, '', `#${key}`);
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginMsg('');
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', password }),
    });
    setLoggingIn(false);
    if (!res.ok) {
      setLoginMsg(res.status === 429 ? 'Too many attempts — try again in a few minutes.' : 'Invalid password');
      return;
    }
    setPassword('');
    await loadSummary();
  }

  if (authed === null) {
    return (
      <section className="min-h-[70vh] bg-paper px-5 py-16">
        <p className="text-center text-sm text-obsidian/40">Opening the desk…</p>
      </section>
    );
  }

  if (!authed) {
    return (
      <section className="min-h-[70vh] bg-paper px-5 py-16">
        <div className="mx-auto max-w-md bg-white p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-ember">Convivia24</p>
          <h1 className="mb-4 text-2xl font-bold">Desk</h1>
          <p className="mb-6 text-sm text-obsidian/50">
            Sign in with <code className="text-xs">ADMIN_PASSWORD</code>, or use a Neon Auth account listed in{' '}
            <code className="text-xs">CONVIVIA_ADMIN_EMAILS</code>.
          </p>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoComplete="current-password"
              className="w-full border-0 border-b border-obsidian/15 py-2 text-sm focus:border-ember focus:ring-0"
            />
            <button
              type="submit"
              disabled={loggingIn || !password}
              className="btn-brand w-full py-3 text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {loggingIn ? '…' : 'Enter'}
            </button>
          </form>
          {loginMsg && <p className="mt-4 text-sm text-ember">{loginMsg}</p>}
          <p className="mt-6 text-xs text-obsidian/40">
            Or{' '}
            <Link href="/signin?next=/admin" className="text-ember">
              sign in with Neon Auth
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  // Counts are "needs attention", never "rows in the table" — a pill should mean there is work.
  const pill = (n: number) => (n > 0 ? n : undefined);
  const tabs: AdminTab[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { key: 'orders', label: 'Orders', count: pill(summary.ordersToFulfil), icon: <ShoppingBag size={17} /> },
    { key: 'sourcing', label: 'Order sourcing', count: pill(summary.ordersUnsourced), icon: <PackageSearch size={17} /> },
    { key: 'drinks', label: 'Drinks', count: pill(summary.lowStock), icon: <Wine size={17} /> },
    { key: 'suppliers', label: 'Supplier', count: pill(summary.bottleRequestsPending), icon: <Truck size={17} /> },
    {
      key: 'referrals',
      label: 'Referrals',
      count: pill(summary.brandEnquiriesNew + summary.partnersPending),
      icon: <Share2 size={17} />,
    },
    { key: 'giftcards', label: 'Gift cards', icon: <Gift size={17} /> },
    { key: 'trivia', label: 'Trivia', count: pill(summary.prizesUnclaimed), icon: <Trophy size={17} /> },
    { key: 'content', label: 'Events & venues', count: pill(summary.contentPending), icon: <CalendarDays size={17} /> },
  ];

  const subtitle =
    summary.todayOrders > 0
      ? `${summary.todayOrders} order${summary.todayOrders === 1 ? '' : 's'} today · ${formatNgn(summary.todayRevenueNgn)}`
      : 'No orders yet today';

  return (
    <AdminShell title="Desk" subtitle={subtitle} tabs={tabs} active={tab} onSelect={go}>
      {tab === 'overview' && <OverviewDesk summary={summary} onGo={go} />}
      {tab === 'drinks' && <DrinksDesk onChanged={loadSummary} />}
      {tab === 'orders' && <OrdersDesk store={ordersStore} onChanged={loadSummary} />}
      {tab === 'sourcing' && (
        <SourcingDesk
          orders={ordersStore.orders}
          onOrdersChanged={() => {
            reloadOrders();
            loadSummary();
          }}
        />
      )}
      {tab === 'suppliers' && <SuppliersDesk onCatalogChanged={loadSummary} />}
      {tab === 'referrals' && <ReferralsDesk onChanged={loadSummary} />}
      {tab === 'giftcards' && <GiftCardsDesk onChanged={loadSummary} />}
      {tab === 'trivia' && <TriviaDesk onChanged={loadSummary} />}
      {tab === 'content' && <ContentDesk onChanged={loadSummary} />}
    </AdminShell>
  );
}
