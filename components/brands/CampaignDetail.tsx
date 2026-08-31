'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Gift,
  Share2,
  Star,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Campaign, LeaderboardRow, Participation } from '@/lib/brands/campaigns';
import type { Brand } from '@/lib/brands/catalog';

const HOW_IT_WORKS = [
  { icon: UserPlus, title: 'Join the campaign', detail: 'Add yourself to the board. Free to enter.' },
  { icon: ClipboardList, title: 'Complete tasks', detail: 'Work through the list at your own pace.' },
  { icon: Star, title: 'Earn points', detail: 'Every task you finish adds to your score.' },
  { icon: Trophy, title: 'Climb the board', detail: 'Your rank is live against everyone playing.' },
  { icon: Gift, title: 'Win rewards', detail: 'Top finishers take the sponsored rewards.' },
];

function formatDate(iso: string | null): string {
  if (!iso) return 'Open-ended';
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CampaignDetail({
  campaign,
  brand,
  others,
}: {
  campaign: Campaign;
  brand: Brand | null;
  others: Campaign[];
}) {
  const pathname = usePathname();
  const [me, setMe] = useState<Participation>({ joined: false, completedTasks: [], points: 0, rank: null });
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [participants, setParticipants] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/campaigns/${encodeURIComponent(campaign.slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.campaign) return;
        setMe(data.me);
        setBoard(data.leaderboard || []);
        setParticipants(Number(data.participants) || 0);
        setSignedIn(Boolean(data.signedIn));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [campaign.slug]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/campaigns/${encodeURIComponent(campaign.slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      setMe(data.me);
      setBoard(data.leaderboard || []);
      if (body.action === 'join') setParticipants((n) => n + 1);
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: campaign.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      /* dismissed, or clipboard blocked */
    }
  }

  const totalPoints = campaign.tasks.reduce((n, t) => n + t.points, 0);
  const done = me.completedTasks.length;
  const pct = campaign.tasks.length > 0 ? Math.round((done / campaign.tasks.length) * 100) : 0;
  const heroBottle = brand?.products.find((p) => p.image);

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="relative overflow-hidden brand-gradient text-white">
        <motion.div
          aria-hidden
          className="absolute -right-20 -top-24 w-[440px] h-[440px] rounded-full bg-ember/25 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-[12px] text-white/45 flex-wrap">
              <li>
                <Link href="/brands" className="hover:text-white transition-colors">
                  Brands
                </Link>
              </li>
              <ChevronRight size={12} />
              {brand && (
                <>
                  <li>
                    <Link href={`/brands/${brand.slug}`} className="hover:text-white transition-colors">
                      {brand.name}
                    </Link>
                  </li>
                  <ChevronRight size={12} />
                </>
              )}
              <li className="text-white/80 truncate">{campaign.title}</li>
            </ol>
          </nav>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pb-10 pt-8 sm:pb-14 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 min-w-0">
            {brand && (
              <Link
                href={`/brands/${brand.slug}`}
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/60 hover:text-white transition-colors"
              >
                {brand.name}
              </Link>
            )}

            <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/12 text-[9px] font-black uppercase tracking-[0.16em]">
              {campaign.live ? 'Live campaign' : 'Closed'}
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="font-logo font-black tracking-tight uppercase text-3xl sm:text-5xl leading-[0.95] mt-4"
            >
              {campaign.title}
            </motion.h1>

            {campaign.tagline && (
              <p className="text-base font-semibold text-white/75 mt-3">{campaign.tagline}</p>
            )}
            {campaign.blurb && (
              <p className="text-sm text-white/60 mt-2 max-w-lg leading-relaxed">{campaign.blurb}</p>
            )}

            <ul className="flex flex-wrap gap-x-8 gap-y-3 mt-6">
              <HeroStat icon={Star} value={`${campaign.rewardPoints.toLocaleString()}`} label="Points on offer" />
              <HeroStat icon={Users} value={participants.toLocaleString()} label="Participants" />
              <HeroStat
                icon={Calendar}
                value={campaign.daysLeft != null ? `${campaign.daysLeft} days` : 'Open'}
                label={campaign.daysLeft != null ? 'Left to play' : 'No end date'}
              />
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {me.joined ? (
                <a
                  href="#campaign-tasks"
                  className="px-6 py-3.5 bg-white text-obsidian text-[11px] font-black uppercase tracking-[0.14em]"
                >
                  Continue challenge
                </a>
              ) : signedIn ? (
                <button
                  type="button"
                  onClick={() => post({ action: 'join' })}
                  disabled={busy || !campaign.live}
                  className="px-6 py-3.5 bg-white text-obsidian text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
                >
                  {busy ? 'Joining…' : campaign.live ? 'Join challenge' : 'Campaign closed'}
                </button>
              ) : (
                <Link
                  href={`/signin?next=${encodeURIComponent(pathname || '/brands')}`}
                  className="px-6 py-3.5 bg-white text-obsidian text-[11px] font-black uppercase tracking-[0.14em]"
                >
                  Sign in to join
                </Link>
              )}

              <button
                type="button"
                onClick={share}
                className="px-6 py-3.5 border border-white/35 hover:border-white text-[11px] font-black uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors"
              >
                <Share2 size={14} /> {shared ? 'Link copied' : 'Share challenge'}
              </button>
            </div>

            {error && <p className="text-sm text-white/85 mt-3">{error}</p>}
          </div>

          <div className="md:col-span-5">
            <div className="relative aspect-square max-w-[260px] mx-auto">
              {heroBottle?.image && (
                <motion.div
                  className="absolute inset-[8%]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src={heroBottle.image}
                    alt={heroBottle.name}
                    fill
                    priority
                    sizes="260px"
                    className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12 grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        <div className="min-w-0 space-y-6">
          <section className="bg-white border border-obsidian/8 p-5 sm:p-7">
            <h2 className="text-lg font-bold mb-5">How it works</h2>
            <ol className="grid sm:grid-cols-5 gap-5">
              {HOW_IT_WORKS.map(({ icon: Icon, title, detail }, i) => (
                <li key={title} className="text-center">
                  <span className="w-11 h-11 mx-auto rounded-full bg-ember/8 flex items-center justify-center mb-2.5">
                    <Icon size={17} className="text-ember" />
                  </span>
                  <p className="text-[13px] font-semibold leading-tight">
                    {i + 1}. {title}
                  </p>
                  <p className="text-[11px] text-obsidian/45 mt-1.5 leading-relaxed">{detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="campaign-tasks" className="bg-white border border-obsidian/8 scroll-mt-24">
            <div className="px-5 py-4 border-b border-obsidian/8 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Tasks</h2>
              <span className="text-[12px] text-obsidian/40 tabular-nums">
                {totalPoints.toLocaleString()} pts across {campaign.tasks.length}
              </span>
            </div>

            {campaign.tasks.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-obsidian/40">
                No tasks have been published for this campaign yet.
              </p>
            ) : (
              <ul className="divide-y divide-obsidian/6">
                {campaign.tasks.map((task, i) => {
                  const complete = me.completedTasks.includes(task.id);
                  return (
                    <li key={task.id} className="p-4 sm:px-5 flex items-center gap-4">
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-black ${
                          complete ? 'bg-ember text-white' : 'bg-ember/8 text-ember'
                        }`}
                      >
                        {complete ? <Check size={15} /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug">{task.title}</span>
                        <span className="block text-[12px] text-obsidian/45 mt-0.5 leading-relaxed">
                          {task.detail}
                        </span>
                      </span>
                      <span className="text-[12px] font-bold text-ember tabular-nums shrink-0 hidden sm:block">
                        {task.points} pts
                      </span>
                      {complete ? (
                        <span className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-ember shrink-0">
                          Done
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => post({ action: 'complete', taskId: task.id })}
                          disabled={busy || !me.joined || !campaign.live}
                          className="px-4 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.1em] shrink-0 disabled:opacity-40"
                        >
                          Mark done
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {!me.joined && campaign.tasks.length > 0 && (
              <p className="px-5 py-3.5 border-t border-obsidian/8 bg-paper/60 text-[12px] text-obsidian/50">
                Join the campaign to start ticking tasks off.
              </p>
            )}
          </section>

          <Leaderboard board={board} me={me} />

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
            {brand && (
              <section className="bg-white border border-obsidian/8 p-5 sm:p-6">
                <h2 className="text-lg font-bold">About the brand</h2>
                <p className="text-sm text-obsidian/55 mt-3 leading-relaxed">{brand.info.history}</p>
                <Link
                  href={`/brands/${brand.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember transition-colors"
                >
                  Explore {brand.name} <ChevronRight size={13} />
                </Link>
              </section>
            )}

            <section className="bg-white border border-obsidian/8 p-5 sm:p-6">
              <h2 className="text-lg font-bold">Rules &amp; guidelines</h2>
              <ul className="mt-3 space-y-2.5">
                {(campaign.rules.length > 0 ? campaign.rules : DEFAULT_RULES).map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5 text-sm text-obsidian/60 leading-relaxed">
                    <Check size={14} className="text-ember shrink-0 mt-1" />
                    {rule}
                  </li>
                ))}
              </ul>
              <Link
                href="/terms-of-use"
                className="mt-4 inline-block text-[11px] font-black uppercase tracking-[0.12em] text-ember"
              >
                View full terms →
              </Link>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <RewardsPanel campaign={campaign} />
          <DetailsPanel campaign={campaign} brand={brand} participants={participants} />
          <ProgressPanel campaign={campaign} me={me} pct={pct} done={done} />
        </div>
      </div>

      {others.length > 0 && (
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-14 sm:pb-20">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
              You may also like
            </h2>
            <Link
              href="/brands"
              className="text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-ember inline-flex items-center gap-1 transition-colors"
            >
              View all challenges <ChevronRight size={13} />
            </Link>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {others.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/campaigns/${other.slug}`}
                  className="group block h-full bg-white border border-obsidian/8 p-4 hover:border-ember/35 transition-colors"
                >
                  <p className="text-[13px] font-semibold leading-snug line-clamp-2">{other.title}</p>
                  <p className="text-[12px] font-bold text-ember tabular-nums mt-2">
                    {other.rewardPoints.toLocaleString()} pts
                  </p>
                  {other.daysLeft != null && (
                    <p className="text-[11px] text-obsidian/35 mt-1">Ends in {other.daysLeft} days</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const DEFAULT_RULES = [
  'Participants must be 18 years or older.',
  'Complete tasks to be eligible for rewards.',
  'Points are awarded for each completed task.',
  'Top rewards are limited and subject to availability.',
  'Convivia24 may disqualify suspicious activity.',
];

function HeroStat({ icon: Icon, value, label }: { icon: typeof Star; value: string; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <Icon size={17} className="text-white/50 shrink-0" />
      <span>
        <span className="block font-logo font-black text-lg leading-none tabular-nums">{value}</span>
        <span className="block text-[11px] text-white/45 mt-1">{label}</span>
      </span>
    </li>
  );
}

function Leaderboard({ board, me }: { board: LeaderboardRow[]; me: Participation }) {
  const MEDALS = ['🥇', '🥈', '🥉'];
  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-lg font-bold">Leaderboard</h2>
      </div>

      {board.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-obsidian/40">
          Nobody has scored yet. Join and the board fills up as people finish tasks.
        </p>
      ) : (
        <>
          <div className="hidden sm:grid grid-cols-[60px_1fr_100px_110px] gap-4 px-5 py-3 border-b border-obsidian/8 text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35">
            <span>Rank</span>
            <span>Participant</span>
            <span className="text-right">Points</span>
            <span className="text-right">Tasks</span>
          </div>
          <ul className="divide-y divide-obsidian/6">
            {board.map((row) => (
              <li
                key={row.ownerId}
                className="px-5 py-3.5 sm:grid sm:grid-cols-[60px_1fr_100px_110px] gap-4 items-center flex justify-between"
              >
                <span className="text-sm font-bold tabular-nums">
                  {MEDALS[row.rank - 1] ?? row.rank}
                </span>
                <span className="text-sm font-medium truncate">{row.displayName}</span>
                <span className="text-sm font-semibold tabular-nums sm:text-right">
                  {row.points.toLocaleString()}
                </span>
                <span className="hidden sm:block text-[12px] text-obsidian/45 tabular-nums text-right">
                  {row.completed} done
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {me.joined && me.rank != null && !board.some((r) => r.rank === me.rank) && (
        <div className="px-5 py-3.5 border-t border-obsidian/8 bg-ember/[0.04] sm:grid sm:grid-cols-[60px_1fr_100px_110px] gap-4 items-center flex justify-between">
          <span className="text-sm font-bold tabular-nums">{me.rank}</span>
          <span className="text-sm font-semibold">You</span>
          <span className="text-sm font-semibold tabular-nums sm:text-right">
            {me.points.toLocaleString()}
          </span>
          <span className="hidden sm:block text-[12px] text-obsidian/45 tabular-nums text-right">
            {me.completedTasks.length} done
          </span>
        </div>
      )}
    </section>
  );
}

function RewardsPanel({ campaign }: { campaign: Campaign }) {
  return (
    <section className="brand-gradient text-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Challenge rewards</h2>
      <p className="text-[12px] text-white/60 mt-1.5 leading-relaxed">
        Complete tasks, earn points, and unlock rewards from the shop.
      </p>

      <div className="mt-5 pt-5 border-t border-white/15">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Top reward</p>
        <p className="font-semibold mt-1.5">{campaign.topReward || 'Points to spend in the rewards shop'}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold">
          <Star size={13} className="fill-current" /> {campaign.rewardPoints.toLocaleString()} pts
        </p>
      </div>

      <Link
        href="/discover?tab=rewards-shop"
        className="mt-5 w-full py-3 bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
      >
        View all rewards <ChevronRight size={13} />
      </Link>
    </section>
  );
}

function DetailsPanel({
  campaign,
  brand,
  participants,
}: {
  campaign: Campaign;
  brand: Brand | null;
  participants: number;
}) {
  const rows: [string, string][] = [
    ['Brand', brand?.name ?? campaign.brandSlug],
    ['Participants', participants.toLocaleString()],
    ['Starts', formatDate(campaign.startsAt)],
    ['Ends', formatDate(campaign.endsAt)],
    ['Entry', campaign.entryPoints > 0 ? `${campaign.entryPoints.toLocaleString()} points` : 'Free'],
  ];

  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Campaign details
        </h2>
      </div>
      <dl className="divide-y divide-obsidian/6">
        {rows.map(([label, value]) => (
          <div key={label} className="px-5 py-3 flex justify-between gap-4 text-sm">
            <dt className="text-obsidian/45">{label}</dt>
            <dd className="text-obsidian/75 text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ProgressPanel({
  campaign,
  me,
  pct,
  done,
}: {
  campaign: Campaign;
  me: Participation;
  pct: number;
  done: number;
}) {
  const r = 42;
  const circumference = 2 * Math.PI * r;

  return (
    <section className="bg-white border border-obsidian/8">
      <div className="px-5 py-4 border-b border-obsidian/8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50">
          Your progress
        </h2>
      </div>

      {!me.joined ? (
        <p className="px-5 py-8 text-sm text-obsidian/50 leading-relaxed">
          Join the campaign and your score, rank and completed tasks appear here.
        </p>
      ) : (
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative w-[96px] h-[96px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" className="text-ember/12" strokeWidth="7" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  className="text-ember"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-logo font-black text-xl tabular-nums">
                {pct}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm">
                {pct === 100 ? 'Campaign complete' : pct > 0 ? 'Good progress' : 'Just getting started'}
              </p>
              <p className="text-[12px] text-obsidian/45 mt-1 leading-relaxed">
                Keep going and earn more points.
              </p>
            </div>
          </div>

          <dl className="mt-5 pt-5 border-t border-obsidian/8 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-obsidian/45 inline-flex items-center gap-2">
                <ClipboardList size={14} className="text-ember" /> Tasks completed
              </dt>
              <dd className="font-semibold tabular-nums">
                {done} / {campaign.tasks.length}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-obsidian/45 inline-flex items-center gap-2">
                <Star size={14} className="text-ember" /> Points earned
              </dt>
              <dd className="font-semibold tabular-nums">{me.points.toLocaleString()} pts</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-obsidian/45 inline-flex items-center gap-2">
                <Award size={14} className="text-ember" /> Your rank
              </dt>
              <dd className="font-semibold tabular-nums">#{me.rank}</dd>
            </div>
          </dl>

          <a
            href="#campaign-tasks"
            className="mt-5 w-full py-3 btn-brand text-[10px] font-black uppercase tracking-[0.12em] inline-flex items-center justify-center"
          >
            Continue challenge
          </a>
        </div>
      )}
    </section>
  );
}
