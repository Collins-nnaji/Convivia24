'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ConviviumCard from '@/components/ConviviumCard';
import { enroll, getWallet, isEnrolled, redeemPerk } from '@/lib/loyalty/store';
import { LOYALTY_PERKS, LOYALTY_TIERS, nextTier, tierForPoints } from '@/lib/loyalty/program';
import { formatNgn } from '@/lib/drinks/catalog';

export default function GuestCardPanel() {
  const [wallet, setWallet] = useState(getWallet);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setWallet(getWallet());
  }, []);

  const enrolled = isEnrolled(wallet);
  const tier = tierForPoints(wallet.points);
  const upcoming = nextTier(wallet.points);
  const progress = useMemo(() => {
    if (!upcoming) return 100;
    const prev = LOYALTY_TIERS.filter((t) => t.minPoints <= wallet.points).at(-1)?.minPoints || 0;
    return Math.min(100, Math.round(((wallet.points - prev) / (upcoming.minPoints - prev)) * 100));
  }, [upcoming, wallet.points]);

  function onEnroll(e: FormEvent) {
    e.preventDefault();
    setWallet(enroll(name, email));
    setMsg('Your Guest Card is live.');
  }

  function onRedeem(id: string) {
    const result = redeemPerk(id);
    if ('error' in result) {
      setMsg(result.error);
      return;
    }
    setWallet(result);
    setMsg('Perk unlocked.');
  }

  return (
    <div className="grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5">
        <ConviviumCard
          kind="loyalty"
          tier={tier.name}
          name={enrolled ? wallet.name : 'YOUR NAME'}
          points={wallet.points}
        />
        {enrolled && (
          <div className="mt-8">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40 mb-2">
              <span>{tier.name}</span>
              <span>{upcoming ? `${upcoming.name} · ${upcoming.minPoints.toLocaleString()} pts` : 'Top tier'}</span>
            </div>
            <div className="h-1.5 bg-obsidian/10 overflow-hidden">
              <div className="h-full brand-gradient" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-obsidian/60 mt-4">
              Shop discount <span className="font-semibold text-obsidian">{tier.shopDiscountPct}%</span>
              {wallet.walletNgn > 0 && (
                <>
                  {' '}
                  · Wallet <span className="font-semibold text-obsidian">{formatNgn(wallet.walletNgn)}</span>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-7 space-y-8">
        {!enrolled ? (
          <form onSubmit={onEnroll} className="bg-white border border-obsidian/8 p-6 space-y-4 shadow-sm">
            <h2 className="font-bold">Activate your card</h2>
            <p className="text-sm text-obsidian/50">
              Perks at partner rooms, discounts on drops, and gift cards issued from the partner desk.
            </p>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
            />
            <button type="submit" className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]">
              Get the card · 400 pts
            </button>
          </form>
        ) : (
          <>
            <div>
              <h2 className="font-bold mb-3">Redeem perks</h2>
              <ul className="space-y-2">
                {LOYALTY_PERKS.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 bg-white border border-obsidian/8 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-[11px] text-obsidian/45">
                        {p.detail} · {p.cost.toLocaleString()} pts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRedeem(p.id)}
                      className="shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] border border-obsidian/15 hover:border-ember hover:text-ember"
                    >
                      Redeem
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-obsidian/8 p-5">
              <p className="text-sm text-obsidian/60">
                Have a gift card code from a partner venue?{' '}
                <Link href="/shop" className="text-ember font-semibold">
                  Enter it at checkout
                </Link>{' '}
                — it comes straight off your order total.
              </p>
            </div>

            <div>
              <h2 className="font-bold mb-3">Activity</h2>
              {wallet.activity.length === 0 ? (
                <p className="text-sm text-obsidian/45">
                  RSVP an{' '}
                  <Link href="/events" className="text-ember">
                    event
                  </Link>
                  , check in at a venue, or place a drop.
                </p>
              ) : (
                <ul className="space-y-2">
                  {wallet.activity.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex justify-between text-sm border-b border-obsidian/6 pb-2">
                      <span className="text-obsidian/70">{a.label}</span>
                      <span className={a.points >= 0 ? 'text-ember' : 'text-obsidian/40'}>
                        {a.points > 0 ? '+' : ''}
                        {a.points}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
        {msg && <p className="text-sm text-ember">{msg}</p>}
      </div>
    </div>
  );
}
