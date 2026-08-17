'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, GraduationCap, Trophy, X } from 'lucide-react';
import { TRIVIA_ROUNDS, isPass, type TriviaRound } from '@/lib/trivia/catalog';

type Stage = 'browse' | 'quiz' | 'result';

export default function TriviaExplorer() {
  const [stage, setStage] = useState<Stage>('browse');
  const [round, setRound] = useState<TriviaRound | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

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
      <div className="relative overflow-hidden border-b border-obsidian/10">
        <div className="absolute inset-0 brand-gradient opacity-[0.07]" />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-12 pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-ember mb-3">Brand trivia</p>
          <h1 className="font-logo font-black tracking-tight uppercase text-3xl sm:text-5xl text-obsidian leading-[0.95] mb-3">
            Know the house. <span className="brand-text">Win the bottle.</span>
          </h1>
          <p className="text-base text-obsidian/55 max-w-xl">
            Five questions on a sponsoring house. Pass the round and you go into that brand&apos;s draw for a
            complimentary bottle — every answer comes with the story behind it.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {stage === 'browse' && <RoundGrid onStart={startRound} />}

        {stage === 'quiz' && round && (
          <Quiz
            round={round}
            step={step}
            picked={picked}
            onChoose={choose}
            onNext={next}
            onExit={backToRounds}
          />
        )}

        {stage === 'result' && round && (
          <Result round={round} score={score} answers={answers} onRetry={() => startRound(round)} onExit={backToRounds} />
        )}
      </div>
    </section>
  );
}

function RoundGrid({ onStart }: { onStart: (round: TriviaRound) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {TRIVIA_ROUNDS.map((round) => (
        <div key={round.slug} className="bg-white p-6 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.35)] flex flex-col">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-obsidian/35">{round.house}</p>
          <h2 className="font-logo font-extrabold uppercase tracking-tight text-2xl mt-1">{round.brand}</h2>
          <p className="text-sm text-obsidian/55 mt-2 flex-1">{round.blurb}</p>
          <div className="mt-4 pt-4 border-t border-obsidian/10 flex items-center gap-2 text-[11px] text-obsidian/45">
            <Trophy size={14} className="text-ember shrink-0" />
            <span className="min-w-0 truncate">Draw prize · {round.prizeLabel}</span>
          </div>
          <p className="text-[11px] text-obsidian/40 mt-1">
            {round.questions.length} questions · {round.passScore} correct to enter
          </p>
          <button
            type="button"
            onClick={() => onStart(round)}
            className="mt-4 px-5 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
          >
            Play round
          </button>
        </div>
      ))}
    </div>
  );
}

function Quiz({
  round,
  step,
  picked,
  onChoose,
  onNext,
  onExit,
}: {
  round: TriviaRound;
  step: number;
  picked: number | null;
  onChoose: (i: number) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const question = round.questions[step];
  const answered = picked !== null;
  const correct = picked === question.answerIndex;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/45 hover:text-obsidian mb-6"
      >
        <ArrowLeft size={14} /> All rounds
      </button>

      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember">{round.brand}</p>
        <p className="text-[11px] text-obsidian/40 tabular-nums">
          {step + 1} / {round.questions.length}
        </p>
      </div>
      <div className="h-1 bg-obsidian/10 mb-8">
        <div
          className="h-full bg-ember transition-all"
          style={{ width: `${((step + (answered ? 1 : 0)) / round.questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.35)]">
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
                <button
                  type="button"
                  onClick={() => onChoose(i)}
                  disabled={answered}
                  className={`w-full text-left px-4 py-3 border text-sm flex items-center gap-3 transition-colors ${state}`}
                >
                  <span className="flex-1">{option}</span>
                  {answered && isAnswer && <Check size={16} className="text-ember shrink-0" />}
                  {answered && isPicked && !isAnswer && <X size={16} className="text-obsidian/40 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <div className="mt-6 pt-5 border-t border-obsidian/10">
            <p className={`text-[10px] font-black uppercase tracking-[0.18em] mb-2 ${correct ? 'text-ember' : 'text-obsidian/40'}`}>
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
        )}
      </div>
    </div>
  );
}

function Result({
  round,
  score,
  answers,
  onRetry,
  onExit,
}: {
  round: TriviaRound;
  score: number;
  answers: number[];
  onRetry: () => void;
  onExit: () => void;
}) {
  const passed = isPass(round, score);
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_-24px_rgba(10,10,10,0.35)]">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember mb-2">{round.brand}</p>
        <h2 className="font-logo font-extrabold uppercase tracking-tight text-3xl">
          {score} / {round.questions.length}
        </h2>
        <p className="text-sm text-obsidian/55 mt-2">
          {passed
            ? `That qualifies — enter the draw for a ${round.prizeLabel}.`
            : `You need ${round.passScore} correct to enter this draw. Read the explainers and run it back.`}
        </p>

        {passed && !code && (
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
          <div className="mt-6 pt-6 border-t border-obsidian/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-1">You&apos;re entered</p>
            <p className="font-mono text-2xl font-bold text-ember">{code}</p>
            <p className="text-sm text-obsidian/55 mt-2">
              Keep this reference — we&apos;ll email you if your name comes out for the {round.prizeLabel}.
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-obsidian/10 flex flex-wrap gap-2">
          {!passed && (
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
      </div>
    </div>
  );
}

const inputClass =
  'w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2 bg-transparent';
