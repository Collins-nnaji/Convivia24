'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, GraduationCap, Lock, Trophy, X } from 'lucide-react';
import { HeroHalo, HouseGlyph } from '@/components/trivia/TriviaIcons';
import { TRIVIA_ROUNDS, getRound, isPass, type TriviaRound } from '@/lib/trivia/catalog';
import { DRINKS } from '@/lib/drinks/catalog';

type Stage = 'browse' | 'quiz' | 'result';

const prizeBottle = (round: TriviaRound) => DRINKS.find((d) => d.slug === round.prizeSlug);

function formatWeek(weekStart: string | null): string {
  if (!weekStart) return 'Playing now';
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function TriviaExplorer() {
  const [liveSlug, setLiveSlug] = useState<string>(TRIVIA_ROUNDS[0].slug);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('browse');
  const [round, setRound] = useState<TriviaRound | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/trivia/week')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (getRound(data.roundSlug)) setLiveSlug(data.roundSlug);
        setWeekStart(data.weekStart ?? null);
      })
      .catch(() => {});
  }, []);

  const live = getRound(liveSlug) || TRIVIA_ROUNDS[0];
  const others = TRIVIA_ROUNDS.filter((r) => r.slug !== live.slug);

  const score = useMemo(
    () => (round ? round.questions.reduce((n, q, i) => (answers[i] === q.answerIndex ? n + 1 : n), 0) : 0),
    [round, answers]
  );

  function startRound(next: TriviaRound) {
    setRound(next);
    setStep(0);
    setAnswers([]);
    setPicked(null);
    setStage('quiz');
  }

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
    if (!round) return;
    if (step + 1 >= round.questions.length) {
      setStage('result');
      return;
    }
    setStep(step + 1);
    setPicked(null);
  }

  function backToRounds() {
    setStage('browse');
    setRound(null);
    setPicked(null);
    setAnswers([]);
    setStep(0);
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <AnimatePresence mode="wait">
        {stage === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Hero round={live} weekStart={weekStart} onPlay={() => startRound(live)} />
            <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
              <h2 className="font-logo font-extrabold uppercase tracking-tight text-xl mb-1">Practice rounds</h2>
              <p className="text-sm text-obsidian/50 mb-6">
                Past houses stay open to learn from — the draw only runs on this week&apos;s brand.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {others.map((r, i) => (
                  <motion.button
                    key={r.slug}
                    type="button"
                    onClick={() => startRound(r)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    whileHover={{ y: -3 }}
                    className="text-left bg-white p-5 shadow-[0_12px_40px_-26px_rgba(10,10,10,0.4)] border border-obsidian/8 hover:border-ember/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 truncate">
                          {r.house}
                        </p>
                        <p className="font-logo font-extrabold uppercase tracking-tight text-lg mt-0.5">{r.brand}</p>
                      </div>
                      <HouseGlyph glyph={r.glyph} className="w-9 h-9 text-ember/45 shrink-0" />
                    </div>
                    <p className="text-[12px] text-obsidian/50 mt-2 line-clamp-2">{r.blurb}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/35 mt-3 flex items-center gap-1.5">
                      <Lock size={11} /> Practice · no draw
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'quiz' && round && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14"
          >
            <Quiz
              round={round}
              step={step}
              picked={picked}
              isLive={round.slug === live.slug}
              onChoose={choose}
              onNext={next}
              onExit={backToRounds}
            />
          </motion.div>
        )}

        {stage === 'result' && round && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-14"
          >
            <Result
              round={round}
              score={score}
              answers={answers}
              isLive={round.slug === live.slug}
              onRetry={() => startRound(round)}
              onExit={backToRounds}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Hero({
  round,
  weekStart,
  onPlay,
}: {
  round: TriviaRound;
  weekStart: string | null;
  onPlay: () => void;
}) {
  const bottle = prizeBottle(round);
  return (
    <div className="relative overflow-hidden border-b border-obsidian/10">
      <div className="absolute inset-0 brand-gradient opacity-[0.07]" />
      <motion.div
        aria-hidden
        className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-ember/10 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-3"
          >
            <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-obsidian text-white text-[9px] font-black uppercase tracking-[0.18em]">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-ember"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              This week
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/40">
              {formatWeek(weekStart)}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[10px] font-black uppercase tracking-[0.24em] text-obsidian/40 mb-2"
          >
            {round.house}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="font-logo font-black tracking-tight uppercase text-4xl sm:text-6xl text-obsidian leading-[0.92] mb-3"
          >
            <span className="brand-text">{round.brand}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="text-base text-obsidian/55 max-w-lg"
          >
            {round.blurb}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <motion.button
              type="button"
              onClick={onPlay}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.16em]"
            >
              Play this week&apos;s round
            </motion.button>
            <span className="text-[11px] text-obsidian/45">
              {round.questions.length} questions · {round.passScore} correct to enter
            </span>
          </motion.div>

          <div className="mt-5 pt-5 border-t border-obsidian/10 flex items-center gap-2 text-sm text-obsidian/55">
            <Trophy size={15} className="text-ember shrink-0" />
            <span>
              Draw prize · <span className="font-medium text-obsidian/75">{round.prizeLabel}</span>
            </span>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative aspect-square max-w-[320px] mx-auto">
            <HeroHalo className="absolute inset-0 w-full h-full text-ember" />
            <HouseGlyph
              glyph={round.glyph}
              className="absolute right-1 top-1 w-14 h-14 text-ember/35"
            />
            <motion.div
              className="absolute inset-[12%]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {bottle?.image ? (
                <Image
                  src={bottle.image}
                  alt={bottle.name}
                  fill
                  sizes="200px"
                  className="object-contain drop-shadow-[0_18px_28px_rgba(10,10,10,0.28)]"
                />
              ) : (
                <HouseGlyph glyph={round.glyph} className="w-full h-full text-ember/40" />
              )}
            </motion.div>
          </div>
        </div>
      </div>
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
  onExit,
}: {
  round: TriviaRound;
  step: number;
  picked: number | null;
  isLive: boolean;
  onChoose: (i: number) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const question = round.questions[step];
  const answered = picked !== null;
  const correct = picked === question.answerIndex;
  const progress = ((step + (answered ? 1 : 0)) / round.questions.length) * 100;

  return (
    <div>
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian mb-6"
      >
        <ArrowLeft size={14} /> All rounds
      </button>

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
  onRetry,
  onExit,
}: {
  round: TriviaRound;
  score: number;
  answers: number[];
  isLive: boolean;
  onRetry: () => void;
  onExit: () => void;
}) {
  const passed = isPass(round, score);
  const bottle = prizeBottle(round);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

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
