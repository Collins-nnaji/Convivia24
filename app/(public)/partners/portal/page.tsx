'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConviviumCard from '@/components/ConviviumCard';
import DrinkPhoto from '@/components/shop/DrinkPhoto';
import {
  PREMIUM_CONVERSIONS,
  WHOLESALE_OFF_PCT,
  convertPremiumPerk,
  getPartner,
  isPartner,
  partnerGiftCards,
  placeWholesaleOrder,
  setOnHand,
  wholesalePriceNgn,
} from '@/lib/partners/store';
import { DRINKS, formatNgn, getDrinkBySlug } from '@/lib/drinks/catalog';

export default function PartnerPortalPage() {
  const router = useRouter();
  const [partner, setPartner] = useState(() => getPartner());
  const [tab, setTab] = useState<'stock' | 'wholesale' | 'card'>('card');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = getPartner();
    setPartner(p);
    setReady(true);
    if (!isPartner(p)) router.replace('/partners');
  }, [router]);

  const giftCards = useMemo(
    () => (partner.venueName ? partnerGiftCards(partner.venueName) : []),
    [partner]
  );

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

  function restock() {
    const items = Object.entries(cart).map(([slug, qty]) => ({ slug, qty }));
    const result = placeWholesaleOrder(items);
    if ('error' in result) {
      setMsg(result.error);
      return;
    }
    setPartner(result);
    setCart({});
    setMsg('Wholesale drop placed. Stock updated. Premium points banked.');
    setTab('stock');
  }

  function convert(id: string) {
    const result = convertPremiumPerk(id);
    if ('error' in result) {
      setMsg(result.error);
      return;
    }
    setPartner(result.profile);
    setMsg(`Gift card issued · ${result.code}`);
  }

  if (!ready || !isPartner(partner)) {
    return (
      <section className="bg-paper min-h-[50vh] px-5 py-20">
        <p className="text-sm text-obsidian/50">
          Opening partner desk… or <Link href="/partners" className="text-ember">apply here</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">Partner desk</p>
        <h1 className="text-3xl font-bold mb-1">{partner.venueName}</h1>
        <p className="text-sm text-obsidian/45 mb-8">
          {partner.area} · Wholesale {WHOLESALE_OFF_PCT}% below retail
        </p>

        <div className="flex gap-2 mb-8">
          {([
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

        {tab === 'card' && (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <ConviviumCard
                kind="premium"
                tier="Premium"
                name={partner.venueName}
                points={partner.points}
              />
              <p className="text-sm text-obsidian/50 mt-8 max-w-sm">
                Wholesale spend banks Premium points (2 pts / ₦100). Convert into gift cards your guests load on
                their Guest Card.
              </p>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-bold">Convert perks → gift cards</h2>
              {PREMIUM_CONVERSIONS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-4 bg-white border border-obsidian/8 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-[11px] text-obsidian/45">{c.points.toLocaleString()} pts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => convert(c.id)}
                    className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] border border-obsidian/15 hover:border-ember hover:text-ember"
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
                          {formatNgn(g.valueNgn)} {g.remainingNgn === 0 ? '· used' : ''}
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
                {partner.inventory.map((row) => {
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
                          onChange={(e) => setPartner(setOnHand(row.slug, Number(e.target.value)))}
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
