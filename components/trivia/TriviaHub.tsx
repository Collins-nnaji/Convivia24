'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Lock, LogIn, Star, X } from 'lucide-react';
import { HouseGlyph } from '@/components/trivia/TriviaIcons';
import TasteProfileCard from '@/components/trivia/TasteProfileCard';
import TasteProfileEditor from '@/components/trivia/TasteProfileEditor';
import FeaturedRound from '@/components/trivia/FeaturedRound';
import RedeemStrip from '@/components/trivia/RedeemStrip';
import ChallengeList from '@/components/trivia/ChallengeList';
import TrendingPanel from '@/components/trivia/TrendingPanel';
import BrandStrip from '@/components/trivia/BrandStrip';
import RewardsShop from '@/components/trivia/RewardsShop';
import ChallengesHub from '@/components/trivia/ChallengesHub';
import TriviaRoundPlayer from '@/components/trivia/TriviaRound';
import { useTriviaHub } from '@/components/trivia/use-hub';
import { getRound, rankRounds, TRIVIA_ROUNDS, type TriviaRound } from '@/lib/trivia/catalog';
import { DRINKS } from '@/lib/drinks/catalog';
import { matchScore, overallMatch, type TasteProfile } from '@/lib/trivia/taste';

/** A round's taste signature, with the prize bottle's price folded in. */
function signature(round: TriviaRound) {
  const bottle = DRINKS.find((d) => d.slug === round.prizeSlug);
  return { ...round.taste, priceNgn: bottle?.priceNgn };
}

function formatWeek(weekStart: string | null): string {
  if (!weekStart) return 'Playing now';
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${fmt(start)} – ${fmt(end)}`;
}

type HubTab = 'discover' | 'challenges' | 'rewards';

export default function TriviaHub() {
  const hub = useTriviaHub();
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [playing, setPlaying] = useState<TriviaRound | null>(null);
  const [editing, setEditing] = useState(false);
  const [points, setPoints] = useState<number | null>(null);
  const [signInPrompt, setSignInPrompt] = useState(false);
  const [guestPlayApproved, setGuestPlayApproved] = useState(false);

  // Rewards is a tab here rather than its own nav entry — points are earned and
  // spent in the same place, and the URL keeps it linkable.
  const tabParam = params.get('tab');
  const tab: HubTab = tabParam === 'rewards' || tabParam === 'challenges' ? tabParam : 'discover';

  function selectTab(next: HubTab) {
    router.replace(next === 'discover' ? '/trivia' : `/trivia?tab=${next}`, { scroll: false });
  }

  const live = getRound(hub.roundSlug) || TRIVIA_ROUNDS[0];
  const scoreOf = useCallback(
    (round: TriviaRound) => matchScore(hub.profile, signature(round)),
    [hub.profile]
  );

  const overall = useMemo(
    () => overallMatch(hub.profile, TRIVIA_ROUNDS.map(signature)),
    [hub.profile]
  );

  // Practice rounds lead with whatever fits the drinker best.
  const practice = useMemo(
    () => rankRounds(TRIVIA_ROUNDS.filter((r) => r.slug !== live.slug), scoreOf),
    [live.slug, scoreOf]
  );

  // Redemptions and challenge claims both move the balance, so the hub keeps
  // its own copy once the server has spoken.
  const balance = points ?? hub.standing?.points ?? null;

  function startRound(round: TriviaRound) {
    setPlaying(round);
  }

  function playLive() {
    if (!hub.signedIn && !guestPlayApproved) {
      setSignInPrompt(true);
      return;
    }
    startRound(live);
  }

  useEffect(() => {
    if (!playing) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('app-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  function saveProfile(next: TasteProfile) {
    void hub.saveProfile(next);
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <AnimatePresence>
        {editing && (
          <TasteProfileEditor
            initial={hub.profile}
            onSave={saveProfile}
            onClose={() => setEditing(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {signInPrompt && (
          <SignInToPlay
            onClose={() => setSignInPrompt(false)}
            onGuest={() => {
              setGuestPlayApproved(true);
              setSignInPrompt(false);
              startRound(live);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {playing ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14"
          >
            <TriviaRoundPlayer
              round={playing}
              isLive={playing.slug === live.slug}
              signedIn={hub.signedIn}
              onClaim={hub.claimChallenge}
              onExit={() => setPlaying(null)}
            />
          </motion.div>
        ) : (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HubTabs tab={tab} onSelect={selectTab} />

            {tab === 'challenges' ? (
              <>
                <ChallengesHero />
                <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
                  <ChallengesHub
                    meters={hub.meters}
                    claimed={hub.claimed}
                    weekStart={hub.weekStart}
                    signedIn={hub.signedIn}
                    points={balance}
                    onPlay={playLive}
                  />
                </div>
              </>
            ) : tab === 'rewards' ? (
              <>
                <RewardsHero />
                <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
                  <RewardsShop
                    signedIn={hub.signedIn}
                    standing={hub.standing}
                    onPointsChanged={setPoints}
                  />
                </div>
              </>
            ) : (
              <>
                <Hero
                  points={balance}
                  signedIn={hub.signedIn}
                  loading={hub.loading}
                  pathname={pathname || '/trivia'}
                  profile={hub.profile}
                  overall={overall}
                  onEditProfile={() => setEditing(true)}
                  onViewRewards={() => selectTab('rewards')}
                />

                <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-14 sm:pb-20 space-y-10 sm:space-y-14">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-3">
                      This week · {formatWeek(hub.weekStart)}
                    </p>
                    <FeaturedRound round={live} match={scoreOf(live)} onPlay={playLive} />
                  </div>

                  <RedeemStrip points={balance} onExplore={() => selectTab('rewards')} />

                  <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
                    <ChallengeList
                      claimed={hub.claimed}
                      weekStart={hub.weekStart}
                      signedIn={hub.signedIn}
                      onPlay={playLive}
                      onViewAll={() => selectTab('challenges')}
                    />
                    <TrendingPanel />
                  </div>

                  <PracticeRounds rounds={practice} scoreOf={scoreOf} onPlay={startRound} />

                  <BrandStrip />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SignInToPlay({ onClose, onGuest }: { onClose: () => void; onGuest: () => void }) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-in-to-play-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ember">Before you play</p>
            <h2 id="sign-in-to-play-title" className="font-wordmark mt-2 text-xl text-obsidian sm:text-2xl">
              Keep your points
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close sign-in prompt" className="rounded-full p-2 text-obsidian/40 hover:bg-paper hover:text-obsidian">
            <X size={18} />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-obsidian/55">
          Sign in to save your score, collect challenge points and redeem rewards. You can also continue as a guest.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link href="/signin?next=%2Ftrivia" className="btn-brand inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold">
            <LogIn size={16} /> Sign in
          </Link>
          <button type="button" onClick={onGuest} className="min-h-12 rounded-xl border border-obsidian/12 bg-white px-4 text-sm font-semibold text-obsidian hover:border-ember/35">
            Continue as guest
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Hero({
  points,
  signedIn,
  loading,
  pathname,
  profile,
  overall,
  onEditProfile,
  onViewRewards,
}: {
  points: number | null;
  signedIn: boolean;
  loading: boolean;
  pathname: string;
  profile: TasteProfile | null;
  overall: number;
  onEditProfile: () => void;
  onViewRewards: () => void;
}) {
  return (
    <div className="relative overflow-hidden border-b border-obsidian/8">
      <div className="absolute inset-0 brand-gradient opacity-[0.05]" />
      <motion.div
        aria-hidden
        className="absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full bg-ember/8 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-10 sm:pt-14 sm:pb-14 grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-[10px] font-black uppercase tracking-[0.26em] text-ember mb-3"
          >
            Discover. Play. Earn. Enjoy.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="font-wordmark text-3xl sm:text-5xl leading-tight"
          >
            <span className="brand-text">Discover</span>
            <br />
            <span className="brand-text">your next drink</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="text-base text-obsidian/55 max-w-md mt-4 leading-relaxed"
          >
            Get personalised recommendations, take on brand challenges, and earn rewards on every round you play.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            {loading ? (
              <span className="h-[52px] w-40 bg-obsidian/5 animate-pulse" />
            ) : signedIn && points !== null ? (
              <>
                <span className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-obsidian text-white">
                  <Star size={16} className="text-ember fill-ember" />
                  <span className="font-logo font-black text-sm tabular-nums tracking-tight">
                    {points.toLocaleString()} PTS
                  </span>
                </span>
                <button
                  type="button"
                  onClick={onViewRewards}
                  className="inline-flex items-center gap-1.5 px-5 py-3.5 bg-white border border-obsidian/12 text-[11px] font-black uppercase tracking-[0.12em] hover:border-ember/40 transition-colors"
                >
                  View rewards <ChevronRight size={14} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/signin?next=${encodeURIComponent(pathname)}`}
                  className="px-6 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
                >
                  Sign in to earn points
                </Link>
                <button
                  type="button"
                  onClick={onViewRewards}
                  className="inline-flex items-center gap-1.5 px-5 py-3.5 bg-white border border-obsidian/12 text-[11px] font-black uppercase tracking-[0.12em] hover:border-ember/40 transition-colors"
                >
                  View rewards <ChevronRight size={14} />
                </button>
              </>
            )}
          </motion.div>
        </div>

        <div className="md:col-span-5">
          <TasteProfileCard profile={profile} match={overall} onEdit={onEditProfile} />
        </div>
      </div>
    </div>
  );
}

function PracticeRounds({
  rounds,
  scoreOf,
  onPlay,
}: {
  rounds: TriviaRound[];
  scoreOf: (round: TriviaRound) => number;
  onPlay: (round: TriviaRound) => void;
}) {
  return (
    <section>
      <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/50 mb-1">
        More houses to learn
      </h2>
      <p className="text-sm text-obsidian/45 mb-5">
        Past rounds stay open to practise on — the draw and the points only run on this week&apos;s brand.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        {rounds.map((round, i) => {
          const match = scoreOf(round);
          return (
            <motion.button
              key={round.slug}
              type="button"
              onClick={() => onPlay(round)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -3 }}
              className="text-left bg-white p-5 border border-obsidian/8 hover:border-ember/40 transition-colors shadow-[0_12px_40px_-30px_rgba(10,10,10,0.4)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 truncate">
                    {round.house}
                  </p>
                  <p className="font-logo font-extrabold uppercase tracking-tight text-lg mt-0.5">{round.brand}</p>
                </div>
                <HouseGlyph glyph={round.glyph} className="w-9 h-9 text-ember/45 shrink-0" />
              </div>

              <p className="text-[12px] text-obsidian/50 mt-2 line-clamp-2">{round.blurb}</p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35 flex items-center gap-1.5">
                  <Lock size={11} /> Practice
                </p>
                {match > 0 && (
                  <p className="text-[11px] font-bold text-ember tabular-nums">{match}% match</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/** Discover and Rewards are two faces of the same points economy, so they share a page. */
function HubTabs({ tab, onSelect }: { tab: HubTab; onSelect: (next: HubTab) => void }) {
  return (
    <div className="border-b border-obsidian/8 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex gap-1">
        {(
          [
            ['discover', 'Discover'],
            ['challenges', 'Challenges'],
            ['rewards', 'Rewards shop'],
          ] as [HubTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`relative px-4 py-4 text-sm transition-colors ${
              tab === id ? 'text-obsidian font-semibold' : 'text-obsidian/45 hover:text-obsidian/70'
            }`}
          >
            {label}
            {tab === id && <motion.span layoutId="hub-tab" className="absolute inset-x-3 bottom-0 h-0.5 bg-ember" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChallengesHero() {
  return (
    <PageHero
      title="Challenges hub"
      lead="Play, learn and earn amazing rewards."
      body="Complete challenges to earn points, unlock rewards, and level up your taste journey."
    />
  );
}

function RewardsHero() {
  return (
    <PageHero
      title="Rewards shop"
      lead="Spend your points. Enjoy exclusive rewards."
      body="Redeem points for bottles, experiences, event tickets, shop credit and more."
    />
  );
}

/** Shared masthead for the hub's secondary tabs. */
function PageHero({ title, lead, body }: { title: string; lead: string; body: string }) {
  return (
    <div className="relative overflow-hidden border-b border-obsidian/8">
      <div className="absolute inset-0 brand-gradient opacity-[0.05]" />
      <motion.div
        aria-hidden
        className="absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full bg-ember/8 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-10 sm:pt-14 sm:pb-12">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="font-logo font-black tracking-tight uppercase text-4xl sm:text-6xl leading-[0.9]"
        >
          <span className="brand-text">{title}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="text-lg font-semibold text-obsidian/70 mt-3"
        >
          {lead}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="text-base text-obsidian/50 mt-2 max-w-lg leading-relaxed"
        >
          {body}
        </motion.p>
      </div>
    </div>
  );
}
