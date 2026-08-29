'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, GraduationCap, Sparkles, X } from 'lucide-react';
import { HouseGlyph } from '@/components/trivia/TriviaIcons';
import { isPass, type TriviaRound as Round } from '@/lib/trivia/catalog';
import { getChallenge } from '@/lib/trivia/challenges';
import { DRINKS } from '@/lib/drinks/catalog';

export type ClaimFn = (
  challengeId: string,
  roundSlug: string,
  answers: number[]
) => Promise<{ awarded?: boolean; pointsAwarded?: number; error?: string }>;

const prizeBottle = (round: Round) => DRINKS.find((d) => d.slug === round.prizeSlug);

/** The five-question round: quiz, then result with points and the draw entry. */
export default function TriviaRoundPlayer({
  round,
  isLive,
  signedIn,
  onClaim,
  onExit,
}: {
  round: Round;
  isLive: boolean;
  signedIn: boolean;
  onClaim: ClaimFn;
  onExit: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const score = useMemo(
    () => round.questions.reduce((n, q, i) => (answers[i] === q.answerIndex ? n + 1 : n), 0),
    [round, answers]
  );

  function choose(index: number) {
    if (picked !== null) return;
    setPicked(index);
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = index;
      return next;
    });
  }

  function next() {
    if (step + 1 >= round.questions.length) {
      setDone(true);
      return;
    }
    setStep(step + 1);
    setPicked(null);
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setPicked(null);
    setDone(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian mb-6"
      >
        <ArrowLeft size={14} /> Back to Discover
      </button>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Result
              round={round}
              score={score}
              answers={answers}
              isLive={isLive}
              signedIn={signedIn}
              onClaim={onClaim}
              onRetry={restart}
              onExit={onExit}
            />
          </motion.div>
        ) : (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Quiz
              round={round}
              step={step}
              picked={picked}
              isLive={isLive}
              onChoose={choose}
              onNext={next}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Quiz({
  round,
  step,
  picked,
  isLive,
  onChoose,
  onNext,
}: {
  round: Round;
  step: number;
  picked: number | null;
  isLive: boolean;
  onChoose: (i: number) => void;
  onNext: () => void;
}) {
  const question = round.questions[step];
  const answered = picked !== null;
  const correct = picked === question.answerIndex;
  const progress = ((step + (answered ? 1 : 0)) / round.questions.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember flex items-center gap-2">
          <HouseGlyph glyph={round.glyph} className="w-4 h-4" />
          {round.brand}
          {!isLive && <span className="text-obsidian/35">· practice</span>}
        </p>
        <p className="text-[11px] text-obsidian/40 tabular-nums">
          {step + 1} / {round.questions.length}
        </p>
      </div>
      <div className="h-1 bg-obsidian/10 mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-ember"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.35)]"
        >
          <h2 className="text-xl font-bold leading-snug mb-6">{question.prompt}</h2>

          <ul className="space-y-2.5">
            {question.options.map((option, i) => {
              const isAnswer = i === question.answerIndex;
              const isPicked = picked === i;
              const state = !answered
                ? 'border-obsidian/12 hover:border-obsidian/35'
                : isAnswer
                  ? 'border-ember bg-ember/5'
                  : isPicked
                    ? 'border-obsidian/25 bg-obsidian/[0.03] text-obsidian/50'
                    : 'border-obsidian/10 text-obsidian/40';
              return (
                <li key={option}>
                  <motion.button
                    type="button"
                    onClick={() => onChoose(i)}
                    disabled={answered}
                    whileHover={answered ? undefined : { x: 3 }}
                    animate={answered && isAnswer ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className={`w-full text-left px-4 py-3 border text-sm flex items-center gap-3 transition-colors ${state}`}
                  >
                    <span className="flex-1">{option}</span>
                    {answered && isAnswer && <Check size={16} className="text-ember shrink-0" />}
                    {answered && isPicked && !isAnswer && <X size={16} className="text-obsidian/40 shrink-0" />}
                  </motion.button>
                </li>
              );
            })}
          </ul>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-5 border-t border-obsidian/10">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.18em] mb-2 ${
                      correct ? 'text-ember' : 'text-obsidian/40'
                    }`}
                  >
                    {correct ? 'Correct' : 'Not quite'}
                  </p>
                  <p className="text-sm text-obsidian/65 leading-relaxed flex gap-2">
                    <GraduationCap size={16} className="text-ember shrink-0 mt-0.5" />
                    <span>{question.explainer}</span>
                  </p>
                  <button
                    type="button"
                    onClick={onNext}
                    className="mt-5 px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
                  >
                    {step + 1 >= round.questions.length ? 'See result' : 'Next question'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Result({
  round,
  score,
  answers,
  isLive,
  signedIn,
  onClaim,
  onRetry,
  onExit,
}: {
  round: Round;
  score: number;
  answers: number[];
  isLive: boolean;
  signedIn: boolean;
  onClaim: ClaimFn;
  onRetry: () => void;
  onExit: () => void;
}) {
  const passed = isPass(round, score);
  const bottle = prizeBottle(round);
  const challenge = getChallenge('trivia');
  const [earned, setEarned] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // Points land as soon as the round is passed — the draw entry is a separate,
  // optional step, so it must not gate what was already earned.
  useEffect(() => {
    if (!isLive || !passed || !signedIn || !challenge) return;
    let cancelled = false;
    onClaim(challenge.id, round.slug, answers).then((res) => {
      if (!cancelled && res.awarded) setEarned(res.pointsAwarded ?? challenge.points);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, passed, signedIn, round.slug]);

  async function enterDraw(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/trivia/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundSlug: round.slug, name, email, phone, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not record your entry.');
        return;
      }
      setCode(data.entry.code);
    } catch {
      setError('Could not record your entry.');
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.35)]"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember mb-2">{round.brand}</p>
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="font-logo font-extrabold uppercase tracking-tight text-3xl"
          >
            {score} / {round.questions.length}
          </motion.h2>
          <p className="text-sm text-obsidian/55 mt-2">
            {!isLive
              ? 'Practice round — this house is not the one running this week, so there is no draw entry.'
              : passed
                ? `That qualifies — enter the draw for a ${round.prizeLabel}.`
                : `You need ${round.passScore} correct to enter this draw. Read the explainers and run it back.`}
          </p>
        </div>
        {bottle?.image && (
          <motion.div
            className="relative w-20 h-28 shrink-0 hidden sm:block"
            animate={passed && isLive ? { rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 0.7 }}
          >
            <Image src={bottle.image} alt={bottle.name} fill sizes="80px" className="object-contain" />
          </motion.div>
        )}
      </div>

      {isLive && passed && earned !== null && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-ember/6 text-ember text-[12px] font-bold"
        >
          <Sparkles size={14} /> +{earned} points added to your balance
        </motion.p>
      )}

      {isLive && passed && !signedIn && challenge && (
        <p className="mt-4 text-[12px] text-obsidian/50 bg-paper px-4 py-3 border border-obsidian/8">
          Sign in to bank the {challenge.points} points for this round — your draw entry below works either way.
        </p>
      )}

      {isLive && passed && !code && (
        <form onSubmit={enterDraw} className="mt-6 pt-6 border-t border-obsidian/10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
              Phone (optional)
            </span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </label>
          <p className="text-[11px] text-obsidian/40 leading-relaxed">
            One entry per brand round. Winners are drawn by Convivia24 and contacted on the details above. 18+ only —
            prizes are collected in Lagos with ID.
          </p>
          {error && <p className="text-sm text-ember">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {sending ? 'Entering…' : 'Enter the draw'}
          </button>
        </form>
      )}

      {code && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-obsidian/10"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">You&apos;re entered</p>
          <p className="font-mono text-2xl font-bold text-ember">{code}</p>
          <p className="text-sm text-obsidian/55 mt-2">
            Keep this reference — we&apos;ll email you if your name comes out for the {round.prizeLabel}.
          </p>
        </motion.div>
      )}

      <div className="mt-6 pt-6 border-t border-obsidian/10 flex flex-wrap gap-2">
        {!code && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Play again
          </button>
        )}
        <button
          type="button"
          onClick={onExit}
          className="px-5 py-3 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.12em]"
        >
          Other rounds
        </button>
        <Link
          href={`/shop/${round.prizeSlug}`}
          className="px-5 py-3 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.12em]"
        >
          Shop {round.brand}
        </Link>
      </div>
    </motion.div>
  );
}

const inputClass =
  'w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent';
