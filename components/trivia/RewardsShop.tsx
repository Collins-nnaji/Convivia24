'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Gift,
  LayoutGrid,
  Lock,
  Sparkles,
  Star,
  Ticket,
  Wallet,
  Wine,
  X,
} from 'lucide-react';
import {
  REWARD_CATEGORIES,
  rewardImage,
  rewardsIn,
  sortRewards,
  type Reward,
  type RewardCategory,
  type RewardSort,
} from '@/lib/loyalty/rewards';
import { LOYALTY_TIERS } from '@/lib/loyalty/program';
import { formatNgn } from '@/lib/drinks/catalog';

const ICONS = { LayoutGrid, Wine, Sparkles, Ticket, Wallet, Gift } as const;

type Redemption = {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  code: string;
  createdAt: string;
};

type Standing = { points: number; tierName: string; claimed: boolean } | null;

export default function RewardsShop({
  signedIn,
  standing,
  onPointsChanged,
}: {
  signedIn: boolean;
  standing: Standing;
  /** Keeps the hub's points pill in step after a redemption. */
  onPointsChanged?: (points: number) => void;
}) {
  const pathname = usePathname();
  const [category, setCategory] = useState<RewardCategory | 'all'>('all');
  const [sort, setSort] = useState<RewardSort>('recommended');
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [points, setPoints] = useState(standing?.points ?? 0);
  const [claiming, setClaiming] = useState<Reward | null>(null);

  useEffect(() => setPoints(standing?.points ?? 0), [standing?.points]);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch('/api/loyalty/rewards')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setRedemptions(data.redemptions || []);
        if (data.standing?.points != null) setPoints(data.standing.points);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const shown = useMemo(
    () => sortRewards(rewardsIn(category), sort, points),
    [category, sort, points]
  );
  const featured = shown.slice(0, 4);
  const rest = shown.slice(4);
  const redeemedIds = new Set(redemptions.map((r) => r.rewardId));

  function onRedeemed(redemption: Redemption, nextPoints: number) {
    setRedemptions((prev) => [redemption, ...prev]);
    setPoints(nextPoints);
    onPointsChanged?.(nextPoints);
  }

  return (
    <div className="space-y-6 sm:space-y-12">
      <BalanceCard signedIn={signedIn} points={points} tierName={standing?.tierName} pathname={pathname || '/trivia'} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {REWARD_CATEGORIES.map((c) => {
            const Icon = ICONS[c.icon as keyof typeof ICONS] ?? Gift;
            const on = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex shrink-0 items-center gap-1 px-2.5 py-2 border transition-colors sm:min-w-[86px] sm:flex-col sm:gap-1.5 sm:px-4 sm:py-3 ${
                  on
                    ? 'border-ember bg-ember/5 text-ember'
                    : 'border-obsidian/10 bg-white text-obsidian/55 hover:border-obsidian/30'
                }`}
              >
                <Icon size={15} className="sm:w-[17px] sm:h-[17px]" />
                <span className="text-[9px] font-black uppercase tracking-[0.06em] whitespace-nowrap sm:text-[10px] sm:tracking-[0.08em]">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-[12px] text-obsidian/45">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as RewardSort)}
            className="border border-obsidian/12 bg-white text-sm py-2 pl-3 pr-8 focus:border-ember focus:ring-0"
          >
            <option value="recommended">Recommended</option>
            <option value="points-asc">Points: low to high</option>
            <option value="points-desc">Points: high to low</option>
          </select>
        </label>
      </div>

      <section>
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50 mb-4">
          Featured rewards
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {featured.map((reward, i) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              index={i}
              points={points}
              signedIn={signedIn}
              redeemed={redeemedIds.has(reward.id)}
              onClaim={() => setClaiming(reward)}
              large
            />
          ))}
        </div>
      </section>

      {rest.length > 0 && (
        <section>
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50 mb-4">
            More rewards
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {rest.map((reward, i) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                index={i}
                points={points}
                signedIn={signedIn}
                redeemed={redeemedIds.has(reward.id)}
                onClaim={() => setClaiming(reward)}
              />
            ))}
          </div>
        </section>
      )}

      {redemptions.length > 0 && <RedemptionHistory redemptions={redemptions} />}

      <EarnMoreStrip />

      <AnimatePresence>
        {claiming && (
          <RedeemDialog
            reward={claiming}
            points={points}
            onClose={() => setClaiming(null)}
            onRedeemed={onRedeemed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BalanceCard({
  signedIn,
  points,
  tierName,
  pathname,
}: {
  signedIn: boolean;
  points: number;
  tierName?: string;
  pathname: string;
}) {
  return (
    <div className="relative overflow-hidden bg-obsidian text-white p-6 sm:p-8">
      <motion.div
        aria-hidden
        className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-ember/25 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Star size={20} className="text-ember fill-ember" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
              Your points balance
            </p>
            {signedIn ? (
              <>
                <p className="font-logo font-black text-3xl tracking-tight tabular-nums mt-1">
                  {points.toLocaleString()} PTS
                </p>
                <p className="text-[12px] text-white/50 mt-1">
                  {tierName ? `${tierName} tier · keep earning to unlock more` : 'Keep earning to unlock more'}
                </p>
              </>
            ) : (
              <p className="text-sm text-white/60 mt-1 max-w-sm">
                Sign in to see your balance and redeem. Everything below is browsable either way.
              </p>
            )}
          </div>
        </div>

        {!signedIn && (
          <Link
            href={`/signin?next=${encodeURIComponent(pathname)}`}
            className="px-6 py-3.5 bg-white text-obsidian text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}

const BADGE_LABELS: Record<string, string> = {
  hot: 'Hot',
  popular: 'Popular',
  new: 'New',
  limited: 'Limited',
};

function RewardCard({
  reward,
  index,
  points,
  signedIn,
  redeemed,
  onClaim,
  large = false,
}: {
  reward: Reward;
  index: number;
  points: number;
  signedIn: boolean;
  redeemed: boolean;
  onClaim: () => void;
  large?: boolean;
}) {
  const image = rewardImage(reward);
  const affordable = points >= reward.costPoints;
  const tier = LOYALTY_TIERS.find((t) => t.id === reward.minTier);
  const tierLocked = Boolean(tier && points < tier.minPoints);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 7) * 0.04, duration: 0.3 }}
      className="bg-white border border-obsidian/8 flex flex-col hover:border-ember/35 transition-colors"
    >
      <div className={`relative h-24 bg-paper overflow-hidden sm:h-auto ${large ? 'sm:aspect-[4/3]' : 'sm:aspect-[3/2]'}`}>
        {image ? (
          <Image src={image} alt={reward.name} fill sizes="(max-width: 640px) 160px, 280px" className="object-contain p-2 sm:p-4" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryMark category={reward.category} />
          </div>
        )}
        {reward.badge && (
          <span className="absolute top-1.5 left-1.5 badge-brand text-[8px] font-black uppercase tracking-[0.08em] px-1.5 py-0.5 sm:top-3 sm:left-3 sm:text-[9px] sm:tracking-[0.12em] sm:px-2.5 sm:py-1">
            {BADGE_LABELS[reward.badge]}
          </span>
        )}
      </div>

      <div className="p-2.5 flex-1 flex flex-col sm:p-4">
        <p className="font-bold text-xs leading-snug sm:text-sm">{reward.name}</p>
        <p className="hidden text-[12px] text-obsidian/45 mt-1 leading-relaxed sm:block">{reward.detail}</p>

        <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-ember tabular-nums sm:mt-3 sm:gap-1.5 sm:text-sm">
          <Star size={11} className="fill-ember sm:w-[13px] sm:h-[13px]" />
          {reward.costPoints.toLocaleString()} pts
          {reward.valueNgn && (
            <span className="hidden text-[11px] font-medium text-obsidian/35 sm:inline">
              · worth {formatNgn(reward.valueNgn)}
            </span>
          )}
        </p>
        <p className="hidden text-[11px] text-obsidian/35 mt-1 sm:block">{reward.availability}</p>

        <div className="mt-auto pt-2 sm:mt-4 sm:pt-1">
          {redeemed ? (
            <span className="w-full min-h-9 inline-flex items-center justify-center gap-1 py-2 border border-ember/30 text-ember text-[8px] font-black uppercase tracking-[0.08em] sm:gap-1.5 sm:py-3 sm:text-[10px] sm:tracking-[0.12em]">
              <Check size={13} /> Redeemed
            </span>
          ) : tierLocked ? (
            <span className="w-full min-h-9 inline-flex items-center justify-center gap-1 py-2 border border-obsidian/10 text-obsidian/35 text-[8px] font-black uppercase tracking-[0.08em] sm:gap-1.5 sm:py-3 sm:text-[10px] sm:tracking-[0.12em]">
              <Lock size={12} /> {tier?.name} tier
            </span>
          ) : !signedIn ? (
            <Link
              href="/signin?next=%2Ftrivia%3Ftab%3Drewards"
              className="w-full min-h-9 flex items-center justify-center px-1 py-2 text-center border border-obsidian/15 text-[8px] font-black uppercase tracking-[0.08em] text-obsidian/60 hover:border-ember hover:text-ember transition-colors sm:block sm:py-3 sm:text-[10px] sm:tracking-[0.12em]"
            >
              Sign in to redeem
            </Link>
          ) : (
            <button
              type="button"
              onClick={onClaim}
              disabled={!affordable}
              className="w-full min-h-9 px-1 py-2 btn-brand text-[8px] font-black uppercase tracking-[0.08em] disabled:opacity-40 sm:py-3 sm:text-[10px] sm:tracking-[0.12em]"
            >
              {affordable ? 'Redeem now' : `${(reward.costPoints - points).toLocaleString()} pts to go`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CategoryMark({ category }: { category: RewardCategory }) {
  const Icon =
    category === 'bottles'
      ? Wine
      : category === 'tickets'
        ? Ticket
        : category === 'credit'
          ? Wallet
          : category === 'experiences'
            ? Sparkles
            : Gift;
  return <Icon size={34} className="text-ember/25" />;
}

function RedemptionHistory({ redemptions }: { redemptions: Redemption[] }) {
  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Your redemptions
        </h2>
      </div>
      <ul className="divide-y divide-obsidian/6">
        {redemptions.map((r) => (
          <li key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{r.rewardName}</p>
              <p className="text-[11px] text-obsidian/40 mt-0.5">
                {new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {r.pointsSpent.toLocaleString()} pts
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-ember shrink-0">{r.code}</p>
          </li>
        ))}
      </ul>
      <p className="px-5 py-3.5 border-t border-obsidian/8 bg-paper/60 text-[12px] text-obsidian/45">
        Quote your code at checkout, at the door, or to support — we&apos;ll apply it against the reward.
      </p>
    </section>
  );
}

function EarnMoreStrip() {
  const ITEMS = [
    { icon: Wine, title: 'Shop & earn', detail: 'Points on every order you place.' },
    { icon: Sparkles, title: 'Complete challenges', detail: 'Play the weekly brand round for points.' },
    { icon: Gift, title: 'Refer friends', detail: 'Invite people and earn together.' },
  ];
  return (
    <section className="brand-gradient text-white p-6 sm:p-8 grid lg:grid-cols-[minmax(0,1fr)_2fr] gap-6 lg:gap-10 items-center">
      <div>
        <h2 className="font-logo font-black uppercase tracking-tight text-2xl">More points. More rewards.</h2>
        <p className="text-sm text-white/60 mt-2 leading-relaxed">
          Complete challenges, refer friends and shop to build a balance worth spending.
        </p>
      </div>
      <ul className="grid sm:grid-cols-3 gap-5">
        {ITEMS.map(({ icon: Icon, title, detail }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon size={18} className="text-white/70 shrink-0 mt-0.5" />
            <span>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="block text-[12px] text-white/55 mt-0.5 leading-relaxed">{detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RedeemDialog({
  reward,
  points,
  onClose,
  onRedeemed,
}: {
  reward: Reward;
  points: number;
  onClose: () => void;
  onRedeemed: (redemption: Redemption, points: number) => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Redemption | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function confirm() {
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/loyalty/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: reward.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not redeem that reward.');
        return;
      }
      setDone(data.redemption);
      onRedeemed(data.redemption, data.standing?.points ?? points - reward.costPoints);
    } catch {
      setError('Could not redeem that reward.');
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-obsidian/55 backdrop-blur-[2px]" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Redeem ${reward.name}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative w-full sm:max-w-md bg-white shadow-2xl p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-obsidian/35 hover:text-obsidian"
        >
          <X size={18} />
        </button>

        {done ? (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember mb-2">Redeemed</p>
            <h2 className="text-xl font-bold">{reward.name}</h2>
            <p className="font-mono text-2xl font-bold text-ember mt-4">{done.code}</p>
            <p className="text-sm text-obsidian/55 mt-2 leading-relaxed">
              Quote this reference to claim it. It also sits under your redemptions on this page.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">
              Confirm redemption
            </p>
            <h2 className="text-xl font-bold">{reward.name}</h2>
            <p className="text-sm text-obsidian/55 mt-2 leading-relaxed">{reward.detail}</p>

            <dl className="mt-5 pt-5 border-t border-obsidian/10 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-obsidian/50">Cost</dt>
                <dd className="font-semibold tabular-nums">{reward.costPoints.toLocaleString()} pts</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-obsidian/50">Balance after</dt>
                <dd className="font-semibold tabular-nums">
                  {Math.max(0, points - reward.costPoints).toLocaleString()} pts
                </dd>
              </div>
            </dl>

            {error && <p className="text-sm text-ember mt-4">{error}</p>}

            <button
              type="button"
              onClick={confirm}
              disabled={sending}
              className="mt-6 w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {sending ? 'Redeeming…' : 'Confirm and redeem'}
            </button>
            <p className="text-[11px] text-obsidian/40 mt-3 leading-relaxed">
              Points come off as soon as you confirm. Redemptions are not reversible — contact support if
              something is wrong.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
