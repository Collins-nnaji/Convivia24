'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ConviviumCard from '@/components/ConviviumCard';
import PricingDesk from '@/components/partners/PricingDesk';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import { useUser } from '@/components/auth/AuthProvider';
import { PREMIUM_CONVERSIONS, WHOLESALE_OFF_PCT, wholesalePriceNgn } from '@/lib/partners/pricing';
import { DRINKS, formatNgn, getDrinkBySlug } from '@/lib/drinks/catalog';

type Outlet = {
  id: string;
  venueName: string;
  area: string | null;
  points: number;
  lifetimePoints: number;
};

type InventoryRow = { slug: string; onHand: number };
type GiftCard = { code: string; valueNgn: number; status: string };

export default function PartnerPortalPage() {
  const { user, loading: authLoading } = useUser();
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [tab, setTab] = useState<'pricing' | 'stock' | 'wholesale' | 'card'>('card');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const outletRes = await fetch('/api/partners/outlet');
    const outletData = await outletRes.json().catch(() => ({}));
    setSignedIn(Boolean(outletData.signedIn));
    if (!outletData.outlet) {
      setReady(true);
      return;
    }
    const res = await fetch('/api/partners/wholesale');
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setOutlet(data.outlet);
      setInventory(data.inventory || []);
      setGiftCards(data.giftCards || []);
      if (new URLSearchParams(window.location.search).get('tab') === 'pricing') setTab('pricing');
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const wholesaleTotal = useMemo(() => {
    return Object.entries(cart).reduce((n, [slug, qty]) => {
      const d = getDrinkBySlug(slug);
      if (!d || qty <= 0) return n;
      return n + wholesalePriceNgn(d.priceNgn) * qty;
    }, 0);
  }, [cart]);

  function bumpCart(slug: string, delta: number) {
    setCart((prev) => {
      const next = Math.max(0, Math.min(48, (prev[slug] || 0) + delta));
      const copy = { ...prev };
      if (next === 0) delete copy[slug];
      else copy[slug] = next;
      return copy;
    });
  }

  async function setOnHand(slug: string, onHand: number) {
    const res = await fetch('/api/partners/wholesale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-on-hand', slug, onHand }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setInventory(data.inventory || []);
  }

  async function restock() {
    const items = Object.entries(cart).map(([slug, qty]) => ({ slug, qty }));
    const res = await fetch('/api/partners/wholesale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error || 'Could not place that order.');
      return;
    }
    setInventory(data.inventory || []);
    setOutlet((o) => (o ? { ...o, points: o.points + data.order.pointsEarned, lifetimePoints: o.lifetimePoints + data.order.pointsEarned } : o));
    setCart({});
    setMsg(`Wholesale drop placed. ${data.order.pointsEarned.toLocaleString()} Premium points banked.`);
    setTab('stock');
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

  if (!ready || authLoading) {
    return (
      <section className="bg-paper min-h-[50vh] px-5 py-20">
        <p className="text-sm text-obsidian/50">Opening partner desk…</p>
      </section>
    );
  }

  if (!signedIn || !user) {
    return (
      <section className="bg-paper min-h-[50vh] px-5 py-20">
        <div className="max-w-md mx-auto bg-white p-8 shadow-sm">
          <p className="text-sm text-obsidian/60 mb-4">Sign in to open your partner desk.</p>
          <Link href="/signin?next=/partners/portal" className="inline-block px-5 py-2.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (!outlet) {
    return (
      <section className="bg-paper min-h-[50vh] px-5 py-20">
        <p className="text-sm text-obsidian/50">
          No partner desk on this account yet — <Link href="/partners" className="text-ember">apply here</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Partner desk</p>
        <h1 className="text-3xl font-bold mb-1">{outlet.venueName}</h1>
        <p className="text-sm text-obsidian/45 mb-8">
          {outlet.area} · Wholesale {WHOLESALE_OFF_PCT}% below retail
        </p>

        <div className="flex gap-2 mb-8">
          {([
            ['pricing', 'Margin desk'],
            ['card', 'Premium card'],
            ['stock', 'Inventory'],
            ['wholesale', 'Wholesale'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] ${
                tab === id ? 'badge-brand' : 'bg-white border border-obsidian/10 text-obsidian/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {msg && <p className="text-sm text-ember mb-6">{msg}</p>}

        {tab === 'pricing' && <PricingDesk />}

        {tab === 'card' && (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <ConviviumCard kind="premium" tier="Premium" name={outlet.venueName} points={outlet.points} />
              <p className="text-sm text-obsidian/50 mt-8 max-w-sm">
                Wholesale spend banks Premium points (2 pts / ₦100). Convert into gift cards your guests load on
                their Guest Card — each code is real and redeemable at checkout.
              </p>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-bold">Convert perks → gift cards</h2>
              {PREMIUM_CONVERSIONS.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 bg-white border border-obsidian/8 p-4">
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-[11px] text-obsidian/45">{c.points.toLocaleString()} pts</p>
                  </div>
                  <button
                    type="button"
                    disabled={outlet.points < c.points}
                    onClick={() => convert(c.id)}
                    className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] border border-obsidian/15 hover:border-ember hover:text-ember disabled:opacity-30"
                  >
                    Convert
                  </button>
                </div>
              ))}
              {giftCards.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/40 mb-3">
                    Issued codes
                  </h3>
                  <ul className="space-y-2">
                    {giftCards.map((g) => (
                      <li key={g.code} className="flex justify-between text-sm font-mono bg-white border border-obsidian/8 px-3 py-2">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white border border-obsidian/8">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 border-b border-obsidian/8">
                  <th className="p-3">Bottle</th>
                  <th className="p-3">On hand</th>
                  <th className="p-3">Restock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((row) => {
                  const drink = getDrinkBySlug(row.slug);
                  if (!drink) return null;
                  const low = row.onHand <= 3;
                  return (
                    <tr key={row.slug} className="border-b border-obsidian/6">
                      <td className="p-3">
                        <p className="font-medium">{drink.name}</p>
                        {low && <p className="text-[10px] text-ember uppercase tracking-wider">Low</p>}
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          value={row.onHand}
                          onChange={(e) => setOnHand(row.slug, Number(e.target.value))}
                          className="w-20 border border-obsidian/10 text-sm py-1 px-2 focus:border-ember focus:ring-0"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            bumpCart(row.slug, 6);
                            setTab('wholesale');
                          }}
                          className="text-[10px] font-black uppercase tracking-wider text-ember"
                        >
                          +6 wholesale
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-3 text-obsidian/45">No stock on file yet — restock from Wholesale.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'wholesale' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {DRINKS.slice(0, 24).map((d) => {
                const qty = cart[d.slug] || 0;
                const whole = wholesalePriceNgn(d.priceNgn);
                return (
                  <article key={d.slug} className="bg-white border border-obsidian/8 p-3">
                    <div className="aspect-[3/4] relative mb-2 bg-paper">
                      <DrinkPhoto product={d} className="absolute inset-0 w-full h-full" />
                    </div>
                    <p className="text-xs font-medium line-clamp-2 min-h-[2.4rem]">{d.name}</p>
                    <p className="text-[11px] text-obsidian/40 line-through">{formatNgn(d.priceNgn)}</p>
                    <p className="text-sm font-bold">{formatNgn(whole)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" onClick={() => bumpCart(d.slug, -1)} className="px-2 border border-obsidian/15">
                        −
                      </button>
                      <span className="text-sm w-6 text-center">{qty}</span>
                      <button type="button" onClick={() => bumpCart(d.slug, 1)} className="px-2 border border-obsidian/15">
                        +
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="sticky bottom-20 md:bottom-6 bg-white border border-obsidian/10 p-4 flex items-center justify-between gap-4 shadow-lg">
              <p className="text-sm">
                Wholesale total <span className="font-bold">{formatNgn(wholesaleTotal)}</span>
              </p>
              <button
                type="button"
                disabled={wholesaleTotal <= 0}
                onClick={restock}
                className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
              >
                Place restock
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
