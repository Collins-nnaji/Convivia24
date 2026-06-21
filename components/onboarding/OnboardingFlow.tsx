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
    if (saving) return;
    setSaving(true);
    try {
      await onComplete(answers);
    } catch {
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
        <div className="max-w-3xl mx-auto flex items-center gap-3">
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
        <div className="max-w-3xl w-full mx-auto py-8 sm:py-12">
          <AnimatePresence mode="wait" initial={false}>
            {step === -1 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <span className="inline-flex w-16 h-16 items-center justify-center rounded-2xl brand-gradient text-white mb-7">
                  <Sparkles size={28} />
                </span>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light italic brand-text leading-tight">
                  {firstName ? `Hi ${firstName},` : 'Welcome,'}
                </h1>
                <p className="text-obsidian/60 text-lg sm:text-xl mt-5 leading-relaxed max-w-xl mx-auto">
                  Let&rsquo;s spend a minute getting to know you, so your companion can plan days that actually fit your life. A few quick taps — no typing.
                </p>
                <button
                  onClick={() => setStep(0)}
                  className="btn-brand mt-9 inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[13px] font-black uppercase tracking-[0.18em]"
                >
                  Let&rsquo;s begin <ArrowRight size={16} />
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
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl italic text-obsidian leading-snug">{q!.title}</h2>
                {q!.subtitle && <p className="text-obsidian/45 text-base sm:text-lg mt-3">{q!.subtitle}</p>}
                {q!.multi && <p className="text-obsidian/35 text-sm mt-1.5 italic">Choose any that apply</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7 sm:mt-8">
                  {q!.options.map((opt) => {
                    const Icon = opt.icon ? ICONS[opt.icon] : undefined;
                    const isOn = selected.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle(opt.value)}
                        className={`group relative flex items-center gap-3.5 px-5 py-4 sm:py-5 rounded-xl border text-left transition-all duration-150 ${
                          isOn
                            ? 'border-gold bg-gold/[0.08] shadow-[0_6px_20px_-12px_rgba(201,168,76,0.7)]'
                            : 'border-obsidian/10 hover:border-obsidian/25 hover:bg-obsidian/[0.02]'
                        }`}
                      >
                        {Icon && (
                          <span className={`shrink-0 ${isOn ? 'text-gold-dark' : 'text-obsidian/40 group-hover:text-obsidian/60'} transition-colors`}>
                            <Icon size={24} strokeWidth={1.8} />
                          </span>
                        )}
                        <span className={`text-base sm:text-lg ${isOn ? 'text-obsidian font-medium' : 'text-obsidian/70'}`}>{opt.label}</span>
                        <span className={`ml-auto shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isOn ? 'brand-gradient text-white scale-100' : 'scale-0'
                        }`}>
                          <Check size={13} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-9 sm:mt-10">
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center gap-1.5 text-base text-obsidian/50 hover:text-obsidian transition-colors"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  {step < total - 1 ? (
                    <button
                      type="button"
                      onClick={() => canAdvance && setStep((s) => s + 1)}
                      disabled={!canAdvance}
                      className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-[0.15em]"
                    >
                      Next <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finish}
                      disabled={!canAdvance || saving}
                      className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-[0.15em]"
                    >
                      {saving ? 'Saving…' : <>Finish <Check size={15} /></>}
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
