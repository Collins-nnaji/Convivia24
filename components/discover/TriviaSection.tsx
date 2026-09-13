'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { HouseGlyph } from '@/components/trivia/TriviaIcons';
import FeaturedRound from '@/components/trivia/FeaturedRound';
import ChallengesHub from '@/components/trivia/ChallengesHub';
import TriviaRoundPlayer from '@/components/trivia/TriviaRound';
import { useTriviaHub } from '@/components/trivia/use-hub';
import type { TriviaRound } from '@/lib/trivia/catalog';
import PageHeader from './PageHeader';
import SignInToPlay from './SignInToPlay';
import { formatWeek, useRounds } from './useRounds';

export default function TriviaSection() {
  const hub = useTriviaHub();
  const router = useRouter();
  const params = useSearchParams();
  const { live, scoreOf, practice } = useRounds(hub);
  const [playing, setPlaying] = useState<TriviaRound | null>(null);
  const [signInPrompt, setSignInPrompt] = useState(false);
  const [guestPlayApproved, setGuestPlayApproved] = useState(false);
  const points = hub.standing?.points ?? null;

  function playLive() {
    if (!hub.signedIn && !guestPlayApproved) {
      setSignInPrompt(true);
      return;
    }
    setPlaying(live);
  }

  // `/discover/trivia?play=live` (from the hub's featured card) starts the round straight away.
  const wantsLive = params.get('play') === 'live';
  useEffect(() => {
    if (!wantsLive || hub.loading) return;
    router.replace('/discover/trivia', { scroll: false });
    if (hub.signedIn) setPlaying(live);
    else setSignInPrompt(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantsLive, hub.loading]);

  useEffect(() => {
    if (playing) return;
    if (window.location.hash !== '#challenges') return;
    const el = document.getElementById('challenges');
    if (!el) return;
    const frame = requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('app-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  return (
    <>
      <AnimatePresence>
        {signInPrompt && (
          <SignInToPlay
            next="/discover/trivia?play=live"
            onClose={() => setSignInPrompt(false)}
            onGuest={() => {
              setGuestPlayApproved(true);
              setSignInPrompt(false);
              setPlaying(live);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {playing ? (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-6 sm:px-6 sm:py-8">
            <TriviaRoundPlayer
              round={playing}
              isLive={playing.slug === live.slug}
              signedIn={hub.signedIn}
              onClaim={hub.claimChallenge}
              onExit={() => setPlaying(null)}
            />
          </motion.div>
        ) : (
          <motion.div key="trivia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PageHeader eyebrow={`This week · ${formatWeek(hub.weekStart)}`} title="Trivia" />

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <FeaturedRound round={live} match={scoreOf(live)} onPlay={playLive} />

              <section id="challenges" className="scroll-mt-32">
                <ChallengesHub
                  meters={hub.meters}
                  claimed={hub.claimed}
                  weekStart={hub.weekStart}
                  signedIn={hub.signedIn}
                  points={points}
                  onPlay={playLive}
                />
              </section>

              <PracticeRounds rounds={practice} scoreOf={scoreOf} onPlay={setPlaying} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
      <header className="mb-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-obsidian/55">More houses to learn</h2>
        <p className="mt-1 text-[14px] text-obsidian/55">
          Past rounds stay open to practise on — the draw and the points only run on this week&apos;s brand.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rounds.map((round, i) => {
          const match = scoreOf(round);
          return (
            <motion.button
              key={round.slug}
              type="button"
              onClick={() => onPlay(round)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="w-full rounded-2xl border border-obsidian/10 bg-white p-4 text-left transition-colors hover:border-ember/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian/40">{round.house}</p>
                  <p className="mt-0.5 font-logo text-lg font-extrabold uppercase tracking-tight">{round.brand}</p>
                </div>
                <HouseGlyph glyph={round.glyph} className="h-9 w-9 shrink-0 text-ember/45" />
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-obsidian/55">{round.blurb}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian/40">
                  <Lock size={11} /> Practice
                </p>
                {match > 0 && <p className="text-[12px] font-bold tabular-nums text-ember">{match}% match</p>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
