'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calculator, Crown, Lock, Package, Tags } from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import PricingDesk from '@/components/partners/PricingDesk';
import PriceList from '@/components/partners/wholesale/PriceList';
import { useUser } from '@/components/auth/AuthProvider';
import { PREMIUM_CONVERSIONS } from '@/lib/partners/pricing';
import { formatNgn, getDrinkBySlug } from '@/lib/drinks/catalog';

type Outlet = {
  id: string;
  venueName: string;
  area: string | null;
  points: number;
  lifetimePoints: number;
  approvalStatus: string;
};

type InventoryRow = { slug: string; onHand: number };
type GiftCard = { code: string; valueNgn: number; status: string };
type Order = { id: string; status: string; totalNgn: number; pointsEarned: number; trackingReference?: string };
type Tab = 'prices' | 'stock' | 'margin' | 'card';

const TABS: { id: Tab; label: string; icon: typeof Tags }[] = [
  { id: 'prices', label: 'Price list & restock', icon: Tags },
  { id: 'stock', label: 'Inventory & orders', icon: Package },
  { id: 'margin', label: 'Margin desk', icon: Calculator },
  { id: 'card', label: 'Premium card', icon: Crown },
];

/**
 * /partners/portal — the wholesale portal. The price list lives here and only here:
 * approved outlets see it (and order from it); admins see it in preview.
 */
export default function WholesalePortalPage() {
  const { user, loading: authLoading } = useUser();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  const [priceNote, setPriceNote] = useState('');
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [tab, setTab] = useState<Tab>('prices');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const [outletData, priceRes] = await Promise.all([
      fetch('/api/partners/outlet').then((r) => r.json()).catch(() => ({})),
      fetch('/api/partners/price-list', { cache: 'no-store' }),
    ]);
    setSignedIn(Boolean(outletData.signedIn));
    const priceData = await priceRes.json().catch(() => ({}));
    if (priceRes.ok) {
      setPrices(priceData.prices || {});
      setIsAdmin(priceData.viewer === 'admin');
      setPriceNote('');
    } else {
      setPrices(null);
      setPriceNote(priceData.error || 'The price list is not available on this account.');
    }
    if (outletData.outlet) {
      const res = await fetch('/api/partners/wholesale');
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOutlet(data.outlet);
        setInventory(data.inventory || []);
        setGiftCards(data.giftCards || []);
        setOrders(data.orders || []);
      }
    }
    const want = new URLSearchParams(window.location.search).get('tab');
    if (want && TABS.some((t) => t.id === want)) setTab(want as Tab);
    else if (want === 'pricing') setTab('margin');
    setReady(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  async function setOnHand(slug: string, onHand: number) {
    const res = await fetch('/api/partners/wholesale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-on-hand', slug, onHand }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setInventory(data.inventory || []);
  }

  async function restock(items: { slug: string; qty: number }[]): Promise<boolean> {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/partners/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || 'Could not place that order.');
        return false;
      }
      setInventory(data.inventory || []);
      setMsg(
        `Wholesale order submitted for payment confirmation. ${data.order.pointsEarned.toLocaleString()} Premium points will be awarded after receipt.`,
      );
      setTab('stock');
      await load();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function receive(orderId: string) {
    const res = await fetch('/api/partners/wholesale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'receive', orderId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(data.error || 'Could not confirm receipt.');
    else {
      setMsg('Receipt confirmed. Stock and points updated.');
      await load();
    }
  }

  async function convert(id: string) {
    setMsg('');
    const res = await fetch('/api/partners/perks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversionId: id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || 'Could not convert that perk.');
      return;
    }
    setOutlet((o) => (o ? { ...o, points: data.pointsRemaining } : o));
    setGiftCards((rows) => [{ code: data.code, valueNgn: data.valueNgn, status: 'active' }, ...rows]);
    setMsg(`Gift card issued · ${data.code}`);
  }

  if (!ready || authLoading) return <Shell>Opening your wholesale portal…</Shell>;

  if (!signedIn || !user) {
    return (
      <Shell>
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <Lock size={20} className="text-ember" />
          <p className="mt-3 font-semibold text-obsidian">Partner prices are for signed-in partners.</p>
          <p className="mt-1 text-sm text-obsidian/60">
            Sign in with the email on your wholesale account to see the price list and order.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/signin?next=/partners/portal" className="btn-brand inline-block rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em]">
              Sign in
            </Link>
            <Link href="/partners?open=apply" className="text-sm font-semibold text-ember">
              Not a partner yet? Apply
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // Admin with no outlet of their own: the price list in preview, nothing to order against.
  if (!outlet && isAdmin && prices) {
    return (
      <section className="min-h-[70vh] bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <Header title="Wholesale portal" sub="Admin preview — this is what approved partners see." />
          <p className="mb-6 rounded-2xl border border-ember/20 bg-ember/[0.05] px-4 py-3 text-sm text-obsidian/70">
            You&apos;re on the admin list, so the partner price list is open to you. Ordering needs an outlet account —
            approve outlets and handle wholesale orders from the{' '}
            <Link href="/admin" className="font-semibold text-ember">admin desk</Link>.
          </p>
          <PriceList prices={prices} canOrder={false} disabledReason="Preview only — admins order through the admin desk." />
        </div>
      </section>
    );
  }

  if (!outlet) {
    return (
      <Shell>
        <p className="text-sm text-obsidian/60">
          No wholesale account on <strong>{user.email}</strong> yet —{' '}
          <Link href="/partners?open=apply" className="font-semibold text-ember">apply here</Link>. Once approved, sign in
          with this email and the price list opens here.
        </p>
      </Shell>
    );
  }

  const approved = outlet.approvalStatus === 'approved';

  return (
    <section className="min-h-[70vh] bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Header
          title={outlet.venueName}
          sub={`${outlet.area ? `${outlet.area} · ` : ''}${approved ? 'Approved partner' : 'Application under review'}${isAdmin ? ' · admin' : ''}`}
        />

        <div className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${
                tab === id ? 'badge-brand' : 'border border-obsidian/10 bg-white text-obsidian/50'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        {msg && <p className="mb-6 text-sm text-ember">{msg}</p>}

        {tab === 'prices' &&
          (prices ? (
            <PriceList
              prices={prices}
              canOrder={approved}
              disabledReason="Ordering opens once your account is approved."
              onOrder={restock}
              busy={busy}
            />
          ) : (
            <div className="max-w-lg rounded-2xl border border-obsidian/8 bg-white p-6">
              <Lock size={18} className="text-ember" />
              <p className="mt-3 text-sm text-obsidian/70">{priceNote}</p>
              <p className="mt-2 text-xs text-obsidian/45">
                We&apos;ll email you when the review is done. Questions? <Link href="/contact" className="font-semibold text-ember">Contact us</Link>.
              </p>
            </div>
          ))}

        {tab === 'margin' && <PricingDesk />}

        {tab === 'card' && (
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ConviviumCard kind="premium" tier="Premium" name={outlet.venueName} points={outlet.points} />
              <p className="mt-8 max-w-sm text-sm text-obsidian/50">
                Wholesale spend banks Premium points (2 pts / ₦100). Convert into gift cards your guests load on their
                Guest Card — each code is real and redeemable at checkout.
              </p>
            </div>
            <div className="space-y-4 lg:col-span-7">
              <h2 className="font-bold">Convert perks → gift cards</h2>
              {PREMIUM_CONVERSIONS.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 rounded-2xl border border-obsidian/8 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-[11px] text-obsidian/45">{c.points.toLocaleString()} pts</p>
                  </div>
                  <button
                    type="button"
                    disabled={!approved || outlet.points < c.points}
                    onClick={() => convert(c.id)}
                    className="rounded-full border border-obsidian/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] hover:border-ember hover:text-ember disabled:opacity-30"
                  >
                    Convert
                  </button>
                </div>
              ))}
              {giftCards.length > 0 && (
                <div className="pt-4">
                  <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian/40">Issued codes</h3>
                  <ul className="space-y-2">
                    {giftCards.map((g) => (
                      <li key={g.code} className="flex justify-between rounded-2xl border border-obsidian/8 bg-white px-3 py-2 font-mono text-sm">
                        <span>{g.code}</span>
                        <span className="text-obsidian/50">
                          {formatNgn(g.valueNgn)} {g.status !== 'active' ? `· ${g.status}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'stock' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-obsidian/8 bg-white">
              <h2 className="border-b border-obsidian/8 px-4 py-3 font-bold">Wholesale orders</h2>
              {orders.length === 0 && <p className="px-4 py-6 text-sm text-obsidian/45">No orders yet — restock from the price list.</p>}
              {orders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-obsidian/6 px-4 py-3 text-sm first:border-t-0">
                  <span>
                    {order.id.slice(0, 8)} · {formatNgn(order.totalNgn)} · {order.status.replace(/_/g, ' ')}
                    {order.trackingReference ? ` · ${order.trackingReference}` : ''}
                  </span>
                  {order.status === 'dispatched' && (
                    <button type="button" className="btn-brand rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]" onClick={() => receive(order.id)}>
                      Confirm received
                    </button>
                  )}
                </div>
              ))}
            </section>

            <div className="overflow-x-auto">
              <table className="w-full rounded-2xl border border-obsidian/8 bg-white text-sm">
                <thead>
                  <tr className="border-b border-obsidian/8 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-obsidian/40">
                    <th className="p-3">Bottle</th>
                    <th className="p-3">On hand</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((row) => {
                    const drink = getDrinkBySlug(row.slug);
                    if (!drink) return null;
                    return (
                      <tr key={row.slug} className="border-b border-obsidian/6">
                        <td className="p-3">
                          <p className="font-medium">{drink.name}</p>
                          {row.onHand <= 3 && <p className="text-[10px] uppercase tracking-wider text-ember">Low — restock from the price list</p>}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={row.onHand}
                            aria-label={`On hand: ${drink.name}`}
                            onChange={(e) => setOnHand(row.slug, Number(e.target.value))}
                            className="w-20 rounded-xl border border-obsidian/10 px-2 py-1 text-sm focus:border-ember focus:ring-0"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-3 text-obsidian/45">No stock on file yet — it fills in as deliveries are received.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-ember">Wholesale portal</p>
      <h1 className="mb-1 font-serif text-3xl font-light tracking-tight">{title}</h1>
      <p className="text-sm text-obsidian/45">{sub}</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[50vh] bg-paper px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-ember">Wholesale portal</p>
        <h1 className="mb-6 font-serif text-3xl font-light tracking-tight">Partner prices &amp; restock</h1>
        {typeof children === 'string' ? <p className="text-sm text-obsidian/50">{children}</p> : children}
      </div>
    </section>
  );
}
