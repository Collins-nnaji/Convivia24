'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import {
  EMPTY_TASTE_PROFILE,
  FLAVOUR_OPTIONS,
  OCCASION_OPTIONS,
  PRICE_OPTIONS,
  SPIRIT_OPTIONS,
  type PriceBand,
  type TasteOption,
  type TasteProfile,
} from '@/lib/trivia/taste';

type Step = {
  key: 'spirits' | 'flavours' | 'occasions' | 'priceBand';
  title: string;
  hint: string;
  options: TasteOption[];
  multi: boolean;
  max?: number;
};

const STEPS: Step[] = [
  {
    key: 'spirits',
    title: 'What are you drinking?',
    hint: 'Pick up to three.',
    options: SPIRIT_OPTIONS,
    multi: true,
    max: 3,
  },
  {
    key: 'flavours',
    title: 'How do you like it?',
    hint: 'Pick up to three.',
    options: FLAVOUR_OPTIONS,
    multi: true,
    max: 3,
  },
  {
    key: 'occasions',
    title: 'When are you pouring?',
    hint: 'Pick up to two.',
    options: OCCASION_OPTIONS,
    multi: true,
    max: 2,
  },
  {
    key: 'priceBand',
    title: 'What does a bottle usually cost you?',
    hint: 'Used to keep suggestions in range.',
    options: PRICE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    multi: false,
  },
];

export default function TasteProfileEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: TasteProfile | null;
  onSave: (profile: TasteProfile) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TasteProfile>(initial ?? EMPTY_TASTE_PROFILE);
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  // Escape closes — the editor is a detour, not a gate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggle(value: string) {
    setDraft((prev) => {
      if (!current.multi) return { ...prev, priceBand: value as PriceBand };
      const list = prev[current.key] as string[];
      const has = list.includes(value);
      const next = has
        ? list.filter((v) => v !== value)
        : [...list, value].slice(-(current.max ?? 3));
      return { ...prev, [current.key]: next };
    });
  }

  const selected: string[] = current.multi
    ? (draft[current.key] as string[])
    : draft.priceBand
      ? [draft.priceBand]
      : [];

  const canAdvance = step === 0 ? draft.spirits.length > 0 : true;
  const last = step === STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-obsidian/55 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Taste profile"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative w-full sm:max-w-lg bg-white shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">Taste profile</p>
            <p className="text-[11px] text-obsidian/40 mt-1 tabular-nums">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-obsidian/35 hover:text-obsidian transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-1 bg-obsidian/8 mx-6 mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-ember"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.24 }}
            className="p-6"
          >
            <h2 className="text-xl font-bold leading-snug">{current.title}</h2>
            <p className="text-sm text-obsidian/45 mt-1 mb-5">{current.hint}</p>

            <div className="grid grid-cols-2 gap-2.5">
              {current.options.map((option) => {
                const on = selected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={`px-4 py-3 border text-sm text-left flex items-center justify-between gap-2 transition-colors ${
                      on
                        ? 'border-ember bg-ember/5 text-obsidian'
                        : 'border-obsidian/12 hover:border-obsidian/35 text-obsidian/70'
                    }`}
                  >
                    <span>{option.label}</span>
                    {on && <Check size={15} className="text-ember shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="px-6 pb-6 flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.12em]"
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => {
              if (last) {
                onSave(draft);
                onClose();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 px-6 py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {last ? 'Save profile' : 'Next'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
