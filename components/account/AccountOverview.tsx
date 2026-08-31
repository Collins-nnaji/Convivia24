'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Gift, MapPin, Package, Star, Target, Trophy } from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import MatchRing from '@/components/account/MatchRing';
import { useTriviaHub } from '@/components/trivia/use-hub';
import { overallMatch, hasTasteProfile, tasteHighlights } from '@/lib/trivia/taste';
import { TRIVIA_ROUNDS } from '@/lib/trivia/catalog';
import { LOYALTY_TIERS, nextTier, tierForPoints } from '@/lib/loyalty/program';

type Hub = ReturnType<typeof useTriviaHub>;

type Redemption = { id: string; pointsSpent: number };

export default function AccountOverview({
  hub,
  onOpenTaste,
}: {
  hub: Hub;
  onEditTaste: () => void;
  onOpenTaste: () => void;
}) {
  const { user } = useUser();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  useEffect(() => {
    fetch('/api/loyalty/rewards')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setRedemptions(data.redemptions || []))
      .catch(() => {});
  }, []);

  const points = hub.standing?.points ?? 0;
  const tier = tierForPoints(points);
  const upcoming = nextTier(points);
  const ceiling = upcoming?.minPoints ?? LOYALTY_TIERS[LOYALTY_TIERS.length - 1].minPoints;
  const pct = ceiling > 0 ? Math.min(100, (points / ceiling) * 100) : 100;

  const spent = redemptions.reduce((n, r) => n + r.pointsSpent, 0);
  const match = useMemo(
    () => overallMatch(hub.profile, TRIVIA_ROUNDS.map((r) => r.taste)),
    [hub.profile]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-logo font-black uppercase tracking-tight text-2xl sm:text-3xl">
          <span className="brand-text">My profile</span>
        </h1>
        <p className="text-obsidian/50 mt-2 text-sm">Your account, points and taste at a glance.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        <div className="bg-white border border-obsidian/8 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-full bg-ember/8 flex items-center justify-center shrink-0 font-logo font-black text-xl text-ember">
              {(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-snug truncate">{user?.name || 'Your account'}</p>
              <p className="text-[12px] text-obsidian/45 mt-1 truncate">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-ember/6 text-ember text-[10px] font-black uppercase tracking-[0.12em]">
                <Trophy size={11} /> {tier.name} member
              </span>
            </div>
          </div>

          <dl className="mt-5 pt-5 border-t border-obsidian/8 space-y-2.5 text-sm">
            <Row label="Email" value={user?.email ?? '—'} />
            <Row label="Tier" value={tier.name} />
            <Row
              label="Shop discount"
              value={tier.shopDiscountPct > 0 ? `${tier.shopDiscountPct}% off every order` : 'None yet'}
            />
          </dl>

          <p className="text-[12px] text-obsidian/40 mt-4 leading-relaxed">
            Name and email come from your sign-in account — change them there and they update here.
          </p>
        </div>

        <div className="bg-obsidian text-white">
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
              Your points balance
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Star size={22} className="text-ember fill-ember shrink-0" />
              <p className="font-logo font-black text-3xl tracking-tight tabular-nums">
                {points.toLocaleString()} PTS
              </p>
            </div>
            <p className="text-[12px] text-white/50 mt-2">
              {upcoming
                ? `${(upcoming.minPoints - points).toLocaleString()} pts to ${upcoming.name}`
                : 'Top tier reached'}
            </p>
            <div className="h-1.5 bg-white/12 overflow-hidden mt-3">
              <motion.div
                className="h-full bg-ember"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          <ul className="grid grid-cols-3 border-t border-white/10 divide-x divide-white/10">
            <Stat icon={Gift} label="Rewards" value={redemptions.length} />
            <Stat icon={Star} label="Points earned" value={hub.standing?.points ?? 0} />
            <Stat icon={Target} label="Points spent" value={spent} />
          </ul>

          <Link
            href="/discover?tab=rewards-shop"
            className="block px-5 sm:px-6 py-3.5 border-t border-white/10 text-[11px] font-black uppercase tracking-[0.12em] text-white/70 hover:text-white transition-colors"
          >
            View rewards shop <ChevronRight size={13} className="inline" />
          </Link>
        </div>
      </div>

      <div className="bg-white border border-obsidian/8 p-5 sm:p-6">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50 mb-4">
          Your taste profile summary
        </h2>

        {hasTasteProfile(hub.profile) ? (
          <div className="flex items-start gap-5 flex-wrap">
            <MatchRing value={match} />
            <div className="min-w-0 flex-1">
              <p className="font-bold">You have a refined taste</p>
              <p className="text-sm text-obsidian/55 mt-1.5 leading-relaxed max-w-md">
                We&apos;ve learned enough to match bottles to you. Keep rating and playing rounds and the
                match sharpens.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tasteHighlights(hub.profile).map((chip) => (
                  <span key={chip} className="px-2.5 py-1 bg-ember/6 text-ember text-[11px] font-medium rounded-full">
                    {chip}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onOpenTaste}
                className="mt-4 px-5 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember transition-colors"
              >
                View full taste profile
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-obsidian/55 leading-relaxed max-w-md">
              You have not built a taste profile yet. Four quick questions and every recommendation on the
              site starts matching what you actually drink.
            </p>
            <button
              type="button"
              onClick={onOpenTaste}
              className="mt-4 px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
            >
              Build my profile
            </button>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <QuickLink href="/orders" icon={Package} title="Orders" detail="Track deliveries and past orders" />
        <QuickLink
          href="/discover#challenges"
          icon={Target}
          title="Challenges"
          detail="See what you can still earn"
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-obsidian/45 shrink-0">{label}</dt>
      <dd className="text-obsidian/75 text-right truncate">{value}</dd>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: number }) {
  return (
    <li className="p-4 text-center">
      <Icon size={15} className="mx-auto text-white/45 mb-1.5" />
      <p className="font-logo font-black text-lg tabular-nums leading-none">{value.toLocaleString()}</p>
      <p className="text-[10px] text-white/40 mt-1.5">{label}</p>
    </li>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: typeof MapPin;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-obsidian/8 p-5 flex items-center gap-4 hover:border-ember/35 transition-colors"
    >
      <span className="w-10 h-10 rounded-full bg-ember/6 flex items-center justify-center shrink-0">
        <Icon size={17} className="text-ember" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-sm">{title}</span>
        <span className="block text-[12px] text-obsidian/45 mt-0.5">{detail}</span>
      </span>
      <ChevronRight size={16} className="text-obsidian/20 group-hover:text-ember transition-colors" />
    </Link>
  );
}
