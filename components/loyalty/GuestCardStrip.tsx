'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, CreditCard } from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import { useUser } from '@/components/auth/AuthProvider';
import { useCart } from '@/components/cart/CartProvider';
import { formatNgn } from '@/lib/drinks/catalog';

type Standing = {
  claimed: boolean;
  points: number;
  tierName: string;
  discountPct: number;
  nextTierName: string | null;
  pointsToNextTier: number;
};

/**
 * The signed-in shopper's own Guest Card, collapsed. Sits on the shop and in
 * the cart, and shows the discount their tier earns on what is in the cart
 * right now. Hidden entirely when signed out.
 */
export default function GuestCardStrip({
  className = '',
  variant = 'strip',
}: {
  className?: string;
  variant?: 'strip' | 'inline';
}) {
  const { user, loading } = useUser();
  const { subtotalNgn } = useCart();
  const [standing, setStanding] = useState<Standing | null>(null);
  const [open, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/loyalty/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStanding(data?.standing ?? null))
      .catch(() => {});
  }, [user]);

  if (loading || !user) return null;

  const enrolled = Boolean(standing?.claimed);
  const points = standing?.points ?? 0;
  const discountPct = standing?.discountPct ?? 0;
  const discountNgn = Math.round((subtotalNgn * discountPct) / 100);

  const summary = enrolled
    ? `${standing?.tierName} · ${points.toLocaleString('en-NG')} pts${
        discountNgn > 0 ? ` · ${formatNgn(discountNgn)} off` : ''
      }`
    : 'Claim for points on every order';

  async function claim() {
    setClaiming(true);
    try {
      const res = await fetch('/api/loyalty/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user?.name || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStanding(data.standing);
    } finally {
      setClaiming(false);
    }
  }

  if (variant === 'inline') {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="shop-guest-card-inline"
          className="w-full inline-flex items-center gap-2.5 rounded-xl border border-ember/15 bg-ember/[0.05] px-3 py-2.5 text-left hover:bg-ember/[0.08] transition-colors"
        >
          <span className="shrink-0 w-8 h-8 grid place-items-center rounded-lg bg-white text-ember shadow-sm">
            <CreditCard size={15} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-ember leading-none mb-0.5">
              Guest Card
            </span>
            <span className="block text-xs text-obsidian/60 truncate">{summary}</span>
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-obsidian/40 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="shop-guest-card-inline"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[min(100vw-1.5rem,320px)] border border-obsidian/10 bg-white shadow-lg rounded-xl overflow-hidden p-4 sm:p-5"
            >
              <GuestCardDetails
                enrolled={enrolled}
                standing={standing}
                user={user}
                points={points}
                discountPct={discountPct}
                claiming={claiming}
                onClaim={claim}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`border border-obsidian/10 bg-white ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="cart-guest-card"
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="shrink-0 w-8 h-8 grid place-items-center bg-paper text-ember">
          <CreditCard size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-ember">Guest Card</span>
          <span className="block text-[12px] text-obsidian/55 truncate">
            {enrolled
              ? `${standing?.tierName} · ${points.toLocaleString('en-NG')} pts${
                  discountNgn > 0 ? ` · ${formatNgn(discountNgn)} off this order` : ''
                }`
              : 'Not claimed yet — points on every order'}
          </span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-obsidian/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="cart-guest-card"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-obsidian/10 p-4 sm:p-5">
              <GuestCardDetails
                enrolled={enrolled}
                standing={standing}
                user={user}
                points={points}
                discountPct={discountPct}
                claiming={claiming}
                onClaim={claim}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GuestCardDetails({
  enrolled,
  standing,
  user,
  points,
  discountPct,
  claiming,
  onClaim,
}: {
  enrolled: boolean;
  standing: Standing | null;
  user: { name?: string | null; email?: string | null };
  points: number;
  discountPct: number;
  claiming: boolean;
  onClaim: () => void;
}) {
  return (
    <>
      <ConviviumCard
        kind="loyalty"
        tier={enrolled ? (standing?.tierName || 'GUEST').toUpperCase() : 'GUEST CARD'}
        name={(user.name || user.email)?.toUpperCase() || 'YOUR NAME'}
        points={points}
      />

      {enrolled ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/35">Tier</dt>
              <dd className="font-semibold">{standing?.tierName}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/35">Shop discount</dt>
              <dd className="font-semibold">{discountPct > 0 ? `${discountPct}%` : 'None yet'}</dd>
            </div>
          </dl>
          <p className="text-[12px] text-obsidian/45 mt-3">
            {standing?.nextTierName
              ? `${standing.pointsToNextTier.toLocaleString('en-NG')} pts to ${standing.nextTierName} — keep earning on orders, RSVPs and reviews.`
              : 'Top tier reached. Table credit at partner rooms is yours.'}
          </p>
          <Link
            href="/guest-card"
            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-ember hover:gap-2.5 transition-all"
          >
            Manage card & perks <ArrowRight size={12} />
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-obsidian/60 mt-4">
            Claim your card on this account and start earning from this order — 1 pt per ₦100, plus RSVPs and
            reviews.
          </p>
          <button
            type="button"
            onClick={onClaim}
            disabled={claiming}
            className="mt-3 px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {claiming ? 'Claiming…' : 'Claim my card'}
          </button>
        </>
      )}
    </>
  );
}
