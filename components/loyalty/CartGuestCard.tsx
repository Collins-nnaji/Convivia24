'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, CreditCard } from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import { useUser } from '@/components/auth/AuthProvider';
import { enroll, getWallet, isEnrolled, type LoyaltyWallet } from '@/lib/loyalty/store';
import { nextTier, tierForPoints } from '@/lib/loyalty/program';
import { formatNgn } from '@/lib/drinks/catalog';

/**
 * The signed-in shopper's own Guest Card, collapsed above the cart summary.
 * Shows the discount their tier earns on this order, so the card is useful at
 * the moment it matters. Hidden entirely when signed out.
 */
export default function CartGuestCard({ subtotalNgn = 0 }: { subtotalNgn?: number }) {
  const { user, loading } = useUser();
  const [wallet, setWallet] = useState<LoyaltyWallet | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setWallet(getWallet());
  }, []);

  if (loading || !user) return null;

  const enrolled = wallet ? isEnrolled(wallet) : false;
  const points = wallet?.points ?? 0;
  const tier = tierForPoints(points);
  const upcoming = nextTier(points);
  const toGo = upcoming ? Math.max(0, upcoming.minPoints - points) : 0;
  const discountNgn = Math.round((subtotalNgn * tier.shopDiscountPct) / 100);

  function claim() {
    setWallet(enroll(user?.name || user?.email?.split('@')[0] || 'Guest', user?.email || ''));
    setOpen(true);
  }

  return (
    <div className="border border-obsidian/10 bg-white mb-6">
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
              ? `${tier.name} · ${points.toLocaleString('en-NG')} pts${
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
              <ConviviumCard
                kind="loyalty"
                tier={enrolled ? tier.name.toUpperCase() : 'GUEST CARD'}
                name={(enrolled ? wallet?.name : user.name || user.email) ?.toUpperCase() || 'YOUR NAME'}
                points={points}
              />

              {enrolled ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/35">Tier</dt>
                      <dd className="font-semibold">{tier.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-obsidian/35">
                        Shop discount
                      </dt>
                      <dd className="font-semibold">
                        {tier.shopDiscountPct > 0 ? `${tier.shopDiscountPct}%` : 'None yet'}
                      </dd>
                    </div>
                  </dl>
                  <p className="text-[12px] text-obsidian/45 mt-3">
                    {upcoming
                      ? `${toGo.toLocaleString('en-NG')} pts to ${upcoming.name} — ${upcoming.blurb}`
                      : 'Top tier reached. Table credit at partner rooms is yours.'}
                  </p>
                  <Link
                    href="/card"
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
                    onClick={claim}
                    className="mt-3 px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
                  >
                    Claim my card
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
