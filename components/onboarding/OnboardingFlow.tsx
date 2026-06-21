'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Waves, Target, Scale, Users, Compass, Sunrise, Sun, CloudSun, Sunset, Moon,
  Layers, Shuffle, AlarmClock, HeartCrack, MessageSquareWarning, Briefcase,
  Dumbbell, Heart, BedDouble, Sprout, PiggyBank, Coffee, Trees, Activity,
  Palette, CalendarX, CalendarClock, CalendarDays, CalendarCheck, Pause, Tent,
  Check, ArrowRight, ArrowLeft, Sparkles, type LucideIcon,
} from 'lucide-react';
import { ONBOARDING_QUESTIONS, type ProfileData } from '@/lib/profile/questions';

const ICONS: Record<string, LucideIcon> = {
  Waves, Target, Scale, Users, Compass, Sunrise, Sun, CloudSun, Sunset, Moon,
  Layers, Shuffle, AlarmClock, HeartCrack, MessageSquareWarning, Briefcase,
  Dumbbell, Heart, BedDouble, Sprout, PiggyBank, Coffee, Trees, Activity,
  Palette, CalendarX, CalendarClock, CalendarDays, CalendarCheck, Pause, Tent,
};

export default function OnboardingFlow({
  userName,
  onComplete,
  onSkip,
}: {
  userName?: string | null;
  onComplete: (answers: ProfileData) => Promise<void>;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(-1); // -1 = welcome screen
  const [answers, setAnswers] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);

  const total = ONBOARDING_QUESTIONS.length;
  const q = step >= 0 ? ONBOARDING_QUESTIONS[step] : null;
  const selected = useMemo(() => (q ? answers[q.id] ?? [] : []), [answers, q]);
  const canAdvance = !q || selected.length > 0;

  function toggle(value: string) {
    if (!q) return;
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.multi) {
        return { ...prev, [q.id]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
      }
      return { ...prev, [q.id]: [value] };
    });
    // Auto-advance single-choice questions for a snappy feel.
    if (!q.multi && step < total - 1) {
      setTimeout(() => setStep((s) => s + 1), 220);
    }
  }

  async function finish() {
    setSaving(true);
    try {
      await onComplete(answers);
    } finally {
      setSaving(false);
    }
  }

  const firstName = (userName || '').trim().split(/\s+/)[0];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col"
    >
      {/* Progress */}
      <div className="shrink-0 px-5 sm:px-8 pt-6">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-obsidian/8 overflow-hidden">
            <motion.div
              className="h-full brand-gradient"
              initial={false}
              animate={{ width: `${Math.max(0, ((step + 1) / (total + 1)) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            />
          </div>
          <button onClick={onSkip} className="text-xs text-obsidian/40 hover:text-obsidian transition-colors shrink-0">
            Skip for now
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-8 flex items-center">
        <div className="max-w-xl w-full mx-auto py-8">
          <AnimatePresence mode="wait" initial={false}>
            {step === -1 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <span className="inline-flex w-14 h-14 items-center justify-center rounded-2xl brand-gradient text-white mb-6">
                  <Sparkles size={24} />
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-light italic brand-text leading-tight">
                  {firstName ? `Hi ${firstName},` : 'Welcome,'}
                </h1>
                <p className="text-obsidian/60 text-base sm:text-lg mt-4 leading-relaxed">
                  Let&rsquo;s spend a minute getting to know you, so your companion can plan days that actually fit your life. A few quick taps — no typing.
                </p>
                <button
                  onClick={() => setStep(0)}
                  className="btn-brand mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.18em]"
                >
                  Let&rsquo;s begin <ArrowRight size={15} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={q!.id}
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark mb-3">
                  Question {step + 1} of {total}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl italic text-obsidian leading-snug">{q!.title}</h2>
                {q!.subtitle && <p className="text-obsidian/45 text-sm mt-2">{q!.subtitle}</p>}
                {q!.multi && <p className="text-obsidian/35 text-xs mt-1.5 italic">Choose any that apply</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
                  {q!.options.map((opt) => {
                    const Icon = opt.icon ? ICONS[opt.icon] : undefined;
                    const isOn = selected.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle(opt.value)}
                        className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
                          isOn
                            ? 'border-gold bg-gold/[0.06] shadow-[0_4px_16px_-10px_rgba(200,30,46,0.5)]'
                            : 'border-obsidian/10 hover:border-obsidian/25 hover:bg-obsidian/[0.02]'
                        }`}
                      >
                        {Icon && (
                          <span className={`shrink-0 ${isOn ? 'text-gold-dark' : 'text-obsidian/40 group-hover:text-obsidian/60'} transition-colors`}>
                            <Icon size={20} strokeWidth={1.8} />
                          </span>
                        )}
                        <span className={`text-sm ${isOn ? 'text-obsidian font-medium' : 'text-obsidian/70'}`}>{opt.label}</span>
                        <span className={`ml-auto shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isOn ? 'brand-gradient text-white scale-100' : 'scale-0'
                        }`}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center gap-1.5 text-sm text-obsidian/50 hover:text-obsidian transition-colors"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  {step < total - 1 ? (
                    <button
                      type="button"
                      onClick={() => canAdvance && setStep((s) => s + 1)}
                      disabled={!canAdvance}
                      className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em]"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finish}
                      disabled={!canAdvance || saving}
                      className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em]"
                    >
                      {saving ? 'Saving…' : <>Finish <Check size={14} /></>}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
