'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ConviviumCard from '@/components/ConviviumCard';
import { enroll, getWallet, isEnrolled, type LoyaltyWallet } from '@/lib/loyalty/store';
import { nextTier, tierForPoints } from '@/lib/loyalty/program';

/**
 * Every visitor's own Guest Card, shown in the landing hero. Claiming it is a
 * name and an email — no purchase, no partner account.
 */
export default function HeroGuestCard() {
  const [wallet, setWallet] = useState<LoyaltyWallet | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setWallet(getWallet());
  }, []);

  function claim(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email, then the card is yours.');
      return;
    }
    setError('');
    setWallet(enroll(name.trim(), email.trim()));
  }

  const enrolled = wallet ? isEnrolled(wallet) : false;
  const points = wallet?.points ?? 0;
  const tier = tierForPoints(points);
  const upcoming = nextTier(points);
  const toGo = upcoming ? Math.max(0, upcoming.minPoints - points) : 0;

  return (
    <div className="w-full max-w-[420px] mx-auto md:mx-0">
      <motion.div
        initial={{ opacity: 0, y: 16, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ y: -4 }}
      >
        <ConviviumCard
          kind="loyalty"
          tier={enrolled ? tier.name.toUpperCase() : 'GUEST CARD'}
          name={enrolled ? (wallet?.name || 'YOUR NAME').toUpperCase() : 'YOUR NAME'}
          points={points}
        />
      </motion.div>

      {enrolled ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <p className="text-sm text-obsidian/60">
            <span className="font-semibold text-obsidian">{tier.name}</span> · {points.toLocaleString('en-NG')} pts
            {tier.shopDiscountPct > 0 ? ` · ${tier.shopDiscountPct}% off shop` : ''}
          </p>
          <p className="text-[12px] text-obsidian/45 mt-1">
            {upcoming
              ? `${toGo.toLocaleString('en-NG')} pts to ${upcoming.name} — earn on every order, RSVP and review.`
              : 'Top tier reached. Table credit at partner rooms is yours.'}
          </p>
          <Link
            href="/card"
            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-wordmark-sm text-ember hover:gap-2.5 transition-all"
          >
            Open my card <ArrowRight size={12} />
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={claim} className="mt-4">
          <p className="text-sm text-obsidian/60 mb-3 flex items-start gap-1.5">
            <Sparkles size={14} className="text-ember shrink-0 mt-0.5" />
            <span>Claim your Guest Card — points on every order, RSVP and review. Free, no purchase.</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              aria-label="Your name"
              className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent"
            />
          </div>
          {error && <p className="text-[12px] text-ember mt-2">{error}</p>}
          <button type="submit" className="mt-3 px-5 py-2.5 btn-brand text-[10px] font-wordmark-sm">
            Claim my card
          </button>
        </form>
      )}
    </div>
  );
}
