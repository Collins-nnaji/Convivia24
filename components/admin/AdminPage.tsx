'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatNgn } from '@/lib/drinks/catalog';
import AdminShell, { type AdminGroup, type AdminTab } from '@/components/admin/AdminShell';
import DialogProvider, { useDialogs } from '@/components/admin/ui/DialogProvider';
import { useOrderAlerts } from '@/components/admin/useOrderAlerts';
import DashboardDesk from '@/components/admin/DashboardDesk';
import DrinksDesk from '@/components/admin/DrinksDesk';
import OrdersDesk from '@/components/admin/OrdersDesk';
import FulfilDesk from '@/components/admin/FulfilDesk';
import CustomersDesk from '@/components/admin/CustomersDesk';
import CommandSearch, { type SearchHit } from '@/components/admin/CommandSearch';
import SuppliersDesk from '@/components/admin/SuppliersDesk';
import ReferralsDesk from '@/components/admin/ReferralsDesk';
import GiftCardsDesk from '@/components/admin/GiftCardsDesk';
import TriviaDesk from '@/components/admin/TriviaDesk';
import ContentDesk from '@/components/admin/ContentDesk';
import MerchandisingDesk from '@/components/admin/MerchandisingDesk';
import ReadinessDesk from '@/components/admin/ReadinessDesk';
import RefundsDesk from '@/components/admin/RefundsDesk';
import SupportDesk from '@/components/admin/SupportDesk';
import AuditDesk from '@/components/admin/AuditDesk';
import StaffDesk from '@/components/admin/StaffDesk';
import { hasAdminPermission, STAFF_ROLES, type StaffRole, type AdminPermission } from '@/lib/admin-permissions';
import OperationsDesk from '@/components/admin/OperationsDesk';
import DeliveryDesk from '@/components/admin/DeliveryDesk';
import AccountingDesk from '@/components/admin/AccountingDesk';
import FinanceDesk from '@/components/admin/FinanceDesk';
import { useAdminOrders } from '@/components/admin/useAdminOrders';
import { EMPTY_SUMMARY, type AdminSummary } from '@/components/admin/types';
import { Bell, BellOff, Landmark, LayoutDashboard, Megaphone, Settings2, ShoppingBag, Users, Wine } from 'lucide-react';

const TAB_KEYS = ['overview', 'accounting', 'profitshare', 'expenses', 'payouts', 'analytics', 'drinks', 'fulfil', 'orders', 'customers', 'suppliers', 'referrals', 'giftcards', 'trivia', 'content', 'storefront', 'delivery', 'operations', 'staff', 'support', 'refunds', 'readiness', 'audit'] as const;
type TabKey = (typeof TAB_KEYS)[number];
const TAB_PERMISSIONS: Record<TabKey, AdminPermission> = {
  overview: 'read', analytics: 'read', accounting: 'finance', profitshare: 'finance', expenses: 'finance', payouts: 'finance', orders: 'orders', fulfil: 'orders', customers: 'orders',
  drinks: 'inventory', suppliers: 'inventory', referrals: 'finance', giftcards: 'finance',
  trivia: 'content', content: 'content', storefront: 'content', delivery: 'operations', operations: 'read',
  audit: 'owner', staff: 'owner', support: 'operations', refunds: 'finance', readiness: 'owner',
};

function isTab(v: string): v is TabKey {
  return (TAB_KEYS as readonly string[]).includes(v);
}

/** The tab lives in the URL hash so a reload (or a shared link) lands on the same view. */
function tabFromHash(fallback: TabKey): TabKey {
  if (typeof window === 'undefined') return fallback;
  const h = window.location.hash.replace(/^#/, '');
  // Supplier costs now live inside each order on the Fulfil queue; analytics is on the dashboard.
  if (h === 'sourcing') return 'fulfil';
  if (h === 'analytics') return 'overview';
  return isTab(h) ? h : fallback;
}

export default function AdminPage({ initialTab = 'overview' }: { initialTab?: TabKey }) {
  return (
    <DialogProvider>
      <AdminDesk initialTab={initialTab} />
    </DialogProvider>
  );
}

function AdminDesk({ initialTab }: { initialTab: TabKey }) {
  /** null = still checking the cookie; false = show the sign-in form. */
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [staffRole, setStaffRole] = useState<StaffRole>('owner');
  const [summary, setSummary] = useState<AdminSummary>(EMPTY_SUMMARY);
  const ordersStore = useAdminOrders();
  // The fulfilment queue keeps its own list (open orders only) so ledger filters never hide work.
  const fulfilStore = useAdminOrders();
  const { notify } = useDialogs();
  const [customerQuery, setCustomerQuery] = useState('');

  /** Counts for the sidebar + overview. The one call that runs on mount; every write re-runs it. */
  const loadSummary = useCallback(async () => {
    setSummaryError('');
    try {
      const res = await fetch('/api/admin/summary', { cache: 'no-store' });
      if (res.status === 401) { setAuthed(false); return false; }
      const data = await res.json();
      if (!res.ok || !STAFF_ROLES.includes(data.staffRole)) throw new Error(data.error || 'Could not verify desk access. Refresh and retry.');
      setSummary(data); setStaffRole(data.staffRole); setAuthed(true); return true;
    } catch (err) { setSummaryError(err instanceof Error ? err.message : 'Could not load desk access.'); return false; }
  }, []);

  useEffect(() => {
    setTab(tabFromHash(initialTab));
    const onHash = () => setTab(tabFromHash(initialTab));
    window.addEventListener('hashchange', onHash);
    loadSummary().catch(() => setAuthed(false));
    return () => window.removeEventListener('hashchange', onHash);
  }, [loadSummary, initialTab]);

  // Orders are shared by two tabs; fetch them the first time either is opened.
  const needsOrders = tab === 'orders';
  const { loaded: ordersLoaded, loading: ordersLoading, reload: reloadOrders } = ordersStore;
  useEffect(() => {
    if (authed && needsOrders && !ordersLoaded && !ordersLoading) reloadOrders();
  }, [authed, needsOrders, ordersLoaded, ordersLoading, reloadOrders]);
  // Fulfil and All orders are two views of the same orders: changes made in one are mirrored into
  // the other immediately, and opening a tab re-reads it from the server (new orders, supplier
  // portal updates) so neither ever shows a stale status.
  const { loaded: fulfilLoaded, reload: reloadFulfil } = fulfilStore;
  useEffect(() => {
    if (!authed) return;
    if (tab === 'orders' && ordersLoaded) void reloadOrders();
    if (tab === 'fulfil' && fulfilLoaded) void reloadFulfil();
    // Only on switching tabs — not on every load-state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authed]);

  // New paid orders: counts refresh every 30s; a rise chimes, notifies and reloads Fulfil.
  const alerts = useOrderAlerts({
    active: authed === true,
    toFulfil: summary.ordersToFulfil,
    refresh: loadSummary,
    notify,
    onNewOrders: useCallback(() => {
      if (fulfilLoaded) void reloadFulfil();
    }, [fulfilLoaded, reloadFulfil]),
  });

  function go(raw: string) {
    // Retired pages land on where their content lives now.
    const key = raw === 'analytics' ? 'overview' : raw === 'sourcing' ? 'fulfil' : raw;
    if (!isTab(key)) return;
    setTab(key);
    window.history.replaceState(null, '', `#${key}`);
  }

  if (authed === null) {
    return (
      <section className="min-h-[70vh] bg-paper px-5 py-16">
        {summaryError ? <div className="mx-auto max-w-lg space-y-4 rounded-xl bg-white p-4"><p role="alert" className="text-sm text-ember">{summaryError}</p><button className="btn-brand px-4 py-2" onClick={() => void loadSummary()}>Retry opening desk</button></div> : <p className="text-center text-sm text-obsidian/55">Opening the desk…</p>}
      </section>
    );
  }

  if (!authed) {
    return (
      <section className="min-h-[70vh] bg-paper px-5 py-16">
        <div className="mx-auto max-w-md bg-white p-5 rounded-lg">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-ember">Convivia24</p>
          <h1 className="mb-4 text-2xl font-bold tracking-tight">Desk</h1>
          <p className="mb-3 text-sm text-obsidian/65">
            Sign in with your verified staff account to access the admin desk.
          </p>
          <p className="mt-6 text-xs text-obsidian/55">
            Or{' '}
            <Link href="/signin?next=/admin" className="text-ember">
              sign in with your account
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  // Counts are "needs attention", never "rows in the table" — a pill should mean there is work.
  const pill = (n: number) => (n > 0 ? n : undefined);
  // Every page of the desk, by key. Labels are what staff see in the sidebar and sub-page bar.
  const page: Record<TabKey, Omit<AdminTab, 'key' | 'icon'>> = {
    overview: { label: 'Dashboard' },
    analytics: { label: 'Analytics' },
    orders: { label: 'All orders', hint: 'Full history with date and status filters, exports, refunds and edits.' },
    fulfil: { label: 'Fulfil', count: pill(summary.ordersToFulfil), hint: 'Open orders, oldest first. Expand (+) an order to confirm payment, record the supplier cost, dispatch and mark delivered.' },
    delivery: { label: 'Delivery areas', hint: 'Areas you deliver to, their fees and courier contacts.' },
    drinks: { label: 'Drinks & stock', count: pill(summary.lowStock), hint: 'Your catalogue: stock, retail price, cost and margin per bottle.' },
    suppliers: { label: 'Suppliers', count: pill(summary.bottleRequestsPending), hint: 'Who you buy from: contacts, portal access, wholesale price lists and requests.' },
    accounting: { label: 'Accounts (P&L)', hint: 'Profit and loss, balance sheet and trends for any period.' },
    profitshare: { label: 'Profit share', hint: `Net profit split equally between partners — 40% always stays in the business.` },
    expenses: { label: 'Expenses', hint: 'Record rent, salaries, marketing and other costs — they reduce profit before the split.' },
    payouts: { label: 'Payouts', hint: 'Everything owed or paid out: partner shares, supplier settlements, other payments.' },
    refunds: { label: 'Refunds & payments', hint: 'Refunds to verify, payment exceptions and stuck payment holds.' },
    giftcards: { label: 'Gift cards', hint: 'Issue, track and void gift cards.' },
    customers: { label: 'Customers', hint: 'Everyone who has ordered — spend, order history, points and open requests.' },
    support: { label: 'Customer support', hint: 'Customer requests and account deletion requests.' },
    referrals: { label: 'Referrals & brands', count: pill(summary.brandEnquiriesNew + summary.partnersPending), hint: 'Referral partners, commissions to pay and brand enquiries.' },
    operations: { label: 'Venues & rewards', hint: 'Partner venue approvals, wholesale orders and loyalty rewards to hand over.' },
    storefront: { label: 'Shop picks', hint: 'Choose the featured bottles, best sellers, staff picks, new-in and offers the shop and home page show.' },
    content: { label: 'Events & venues', count: pill(summary.contentPending), hint: 'Create and publish events — published upcoming events appear on Discover › What’s on within a minute.' },
    trivia: { label: 'Trivia', count: pill(summary.prizesUnclaimed), hint: 'Questions, schedules, draws and prizes to hand over.' },
    staff: { label: 'Staff & access', hint: 'Who can use the desk and what each role can do.' },
    audit: { label: 'Platform audit', hint: 'Search every request and change made on the platform.' },
    readiness: { label: 'Launch readiness', hint: 'Automated launch checks and operational rehearsals.' },
  };


  /** Departments, in the order a working day touches them. Each page appears exactly once. */
  const layout: { key: string; label: string; icon: AdminGroup['icon']; pages: TabKey[] }[] = [
    { key: 'home', label: 'Dashboard', icon: <LayoutDashboard size={17} />, pages: ['overview'] },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={17} />, pages: ['fulfil', 'orders', 'delivery'] },
    { key: 'catalogue', label: 'Products & stock', icon: <Wine size={17} />, pages: ['drinks', 'suppliers'] },
    { key: 'finance', label: 'Finance', icon: <Landmark size={17} />, pages: ['accounting', 'profitshare', 'expenses', 'payouts', 'refunds', 'giftcards'] },
    { key: 'customers', label: 'Customers & partners', icon: <Users size={17} />, pages: ['customers', 'support', 'referrals', 'operations'] },
    { key: 'marketing', label: 'Storefront & content', icon: <Megaphone size={17} />, pages: ['storefront', 'content', 'trivia'] },
    { key: 'system', label: 'Team & system', icon: <Settings2 size={17} />, pages: ['staff', 'audit', 'readiness'] },
  ];

  // Only pages this role can open; a department with none left disappears.
  const groups: AdminGroup[] = layout.map((g) => ({
    key: g.key,
    label: g.label,
    icon: g.icon,
    tabs: g.pages
      .filter((k) => hasAdminPermission(staffRole, TAB_PERMISSIONS[k]))
      .map((k) => ({ key: k, icon: g.icon, ...page[k] })),
  }));


  const subtitle =
    summary.todayOrders > 0
      ? `${summary.todayOrders} order${summary.todayOrders === 1 ? '' : 's'} today · ${formatNgn(summary.todayRevenueNgn)}`
      : 'No orders yet today';

  return (
    <AdminShell
      title="Desk"
      subtitle={subtitle}
      groups={groups}
      active={tab}
      onSelect={go}
      sidebarTop={
        <CommandSearch
          onPick={(hit: SearchHit) => {
            if (hit.type === 'order') {
              go('orders');
              void ordersStore.reload({ q: hit.id });
            } else if (hit.type === 'customer') {
              setCustomerQuery(hit.id);
              go('customers');
            } else if (hit.type === 'bottle') go('drinks');
            else go('suppliers');
          }}
        />
      }
      sidebarFooter={
        <div className="space-y-1.5 text-xs">
          <button
            type="button"
            onClick={alerts.toggle}
            aria-pressed={alerts.enabled}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-semibold ${alerts.enabled ? 'bg-emerald-50 text-emerald-800' : 'text-obsidian/60 hover:bg-obsidian/[0.05]'}`}
          >
            {alerts.enabled ? <Bell size={14} /> : <BellOff size={14} />}
            {alerts.enabled ? 'New-order alerts on' : 'New-order alerts off'}
          </button>
          {alerts.enabled && alerts.permission === 'default' && (
            <button type="button" onClick={() => void alerts.askPermission()} className="w-full px-2 text-left text-[11px] font-semibold text-ember hover:underline">
              Also notify me when this tab is hidden
            </button>
          )}
        </div>
      }
    >
      {hasAdminPermission(staffRole, TAB_PERMISSIONS[tab]) ? <>
      {tab === 'overview' && <DashboardDesk summary={summary} onGo={go} />}
      {tab === 'readiness' && <ReadinessDesk />}
      {tab === 'refunds' && <RefundsDesk />}
      {tab === 'support' && <SupportDesk />}
      {tab === 'staff' && <StaffDesk />}
      {tab === 'audit' && <AuditDesk />}
      {tab === 'operations' && <OperationsDesk role={staffRole} />}
      {tab === 'delivery' && <DeliveryDesk />}
      {tab === 'accounting' && <AccountingDesk />}
      {tab === 'profitshare' && <FinanceDesk view="share" />}
      {tab === 'expenses' && <FinanceDesk view="expenses" />}
      {tab === 'payouts' && <FinanceDesk view="payouts" />}
      {tab === 'drinks' && <DrinksDesk onChanged={loadSummary} />}
      {tab === 'orders' && <OrdersDesk store={ordersStore} mirror={fulfilStore} onChanged={loadSummary} />}
      {tab === 'customers' && (
        <CustomersDesk
          initialQuery={customerQuery}
          onOpenOrder={(id) => {
            go('orders');
            void ordersStore.reload({ q: id });
          }}
        />
      )}
      {tab === 'fulfil' && <FulfilDesk store={fulfilStore} mirror={ordersStore} onChanged={loadSummary} />}

      {tab === 'suppliers' && <SuppliersDesk onCatalogChanged={loadSummary} />}
      {tab === 'referrals' && <ReferralsDesk onChanged={loadSummary} />}
      {tab === 'giftcards' && <GiftCardsDesk onChanged={loadSummary} />}
      {tab === 'trivia' && <TriviaDesk onChanged={loadSummary} />}
      {tab === 'content' && <ContentDesk onChanged={loadSummary} />}
      {tab === 'storefront' && <MerchandisingDesk />}
      </> : <div className="space-y-3 rounded-xl bg-white p-4"><p role="alert">Your staff role does not have access to this section.</p><button className="btn-brand px-4 py-2" onClick={() => go('overview')}>Open overview</button></div>}
    </AdminShell>
  );
}
