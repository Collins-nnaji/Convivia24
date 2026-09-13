'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Activity, ClipboardList, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import AdminShell, { type AdminTab } from '@/components/admin/AdminShell';
import DialogProvider from '@/components/admin/ui/DialogProvider';
import SupplierOverview from './SupplierOverview';
import SupplierStockDesk from './SupplierStockDesk';
import SupplierOrdersDesk from './SupplierOrdersDesk';
import SupplierActivity from './SupplierActivity';
import SupplierProfile from './SupplierProfile';
import { OPEN_STATUSES, readError, type PortalData } from './types';

const TAB_KEYS = ['overview', 'orders', 'stock', 'activity', 'profile'] as const;
type TabKey = (typeof TAB_KEYS)[number];
const isTab = (v: string): v is TabKey => (TAB_KEYS as readonly string[]).includes(v);

function tabFromHash(): TabKey {
  if (typeof window === 'undefined') return 'overview';
  const h = window.location.hash.replace(/^#/, '');
  return isTab(h) ? h : 'overview';
}

export default function SupplierPortal({ slug }: { slug: string }) {
  return (
    <DialogProvider>
      <Portal slug={slug} />
    </DialogProvider>
  );
}

function Portal({ slug }: { slug: string }) {
  const base = `/api/supplier/${encodeURIComponent(slug)}`;
  const [data, setData] = useState<PortalData | null>(null);
  /** null = checking; a string = show the sign-in with this message. */
  const [gateMsg, setGateMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabKey>('overview');

  const load = useCallback(async () => {
    const res = await fetch(base, { cache: 'no-store' });
    if (!res.ok) {
      setData(null);
      setGateMsg(await readError(res, 'Sign in to open your portal.'));
      return false;
    }
    setData(await res.json());
    setGateMsg(null);
    return true;
  }, [base]);

  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    load()
      .catch(() => setGateMsg('Could not reach the portal.'))
      .finally(() => setChecking(false));
    return () => window.removeEventListener('hashchange', onHash);
  }, [load]);

  function go(next: string) {
    if (!isTab(next)) return;
    setTab(next);
    window.history.replaceState(null, '', `#${next}`);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`${base}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    setBusy(false);
    if (!res.ok) {
      setGateMsg(await readError(res, 'Could not sign in.'));
      return;
    }
    setKey('');
    setChecking(true);
    await load().finally(() => setChecking(false));
  }

  async function signOut() {
    await fetch(`${base}/session`, { method: 'DELETE' });
    setData(null);
    setGateMsg('Signed out.');
  }

  if (checking) {
    return (
      <section className="min-h-[70vh] bg-paper px-5 py-16">
        <p className="text-center text-sm text-obsidian/40">Opening your portal…</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="min-h-[70vh] bg-paper px-5 py-16">
        <div className="mx-auto max-w-md bg-white p-8 shadow-[0_12px_40px_-18px_rgba(10,10,10,0.28)]">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-ember">Convivia24 · Supplier</p>
          <h1 className="mb-1 text-2xl font-bold">Your stock portal</h1>
          <p className="mb-6 font-mono text-xs text-obsidian/40">/supplier/{slug}</p>
          <a
            href={`/signin?next=${encodeURIComponent(`/supplier/${slug}`)}`}
            className="btn-brand mb-5 block w-full rounded-xl py-3 text-center text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Sign in with your Convivia24 account
          </a>
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/35">Or use an access key</p>
          <form onSubmit={signIn} className="space-y-4">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="CV24-XXXX-XXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
              className="w-full border-0 border-b border-obsidian/15 py-2 font-mono text-sm tracking-wider focus:border-ember focus:ring-0"
            />
            <button
              type="submit"
              disabled={busy || !key.trim()}
              className="w-full rounded-xl border border-obsidian/15 bg-white py-3 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian hover:border-ember hover:text-ember disabled:opacity-50"
            >
              {busy ? '…' : 'Open with key'}
            </button>
          </form>
          {gateMsg && <p className="mt-4 text-sm text-ember">{gateMsg}</p>}
          <p className="mt-6 text-xs text-obsidian/40">
            Every change you make here is recorded on the Convivia24 desk. Lost your key or not on the sign-in list? Ask the desk.
          </p>
        </div>
      </section>
    );
  }

  const openOrders = data.orders.filter((o) => OPEN_STATUSES.has(o.status)).length;
  const lowStock = data.shelf.filter((r) => r.onHand != null && r.available <= 2).length;
  const pill = (n: number) => (n > 0 ? n : undefined);
  const tabs: AdminTab[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { key: 'orders', label: 'Orders to fill', count: pill(openOrders), icon: <ClipboardList size={17} /> },
    { key: 'stock', label: 'My stock', count: pill(lowStock), icon: <Package size={17} /> },
    { key: 'activity', label: 'Activity', icon: <Activity size={17} /> },
    { key: 'profile', label: 'Contact details', icon: <UserRound size={17} /> },
  ];

  return (
    <AdminShell
      title={data.supplier.name}
      subtitle={`${data.supplier.city}${data.supplier.contactName ? ` · ${data.supplier.contactName}` : ''}`}
      tabs={tabs}
      active={tab}
      onSelect={go}
      actions={
        data.via === 'key' ? (
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-obsidian/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/60 hover:bg-obsidian/[0.04]"
          >
            <LogOut size={13} /> Sign out
          </button>
        ) : null
      }
    >
      {tab === 'overview' && <SupplierOverview data={data} onGo={go} />}
      {tab === 'orders' && <SupplierOrdersDesk base={base} orders={data.orders} statuses={data.statuses} onChanged={load} />}
      {tab === 'stock' && <SupplierStockDesk base={base} shelf={data.shelf} onChanged={load} />}
      {tab === 'activity' && <SupplierActivity entries={data.activity} />}
      {tab === 'profile' && <SupplierProfile base={base} supplier={data.supplier} onChanged={load} />}
    </AdminShell>
  );
}
