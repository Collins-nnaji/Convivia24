'use client';

import { useState } from 'react';
import { Check, Film, Music } from 'lucide-react';
import type { TasteQuestion } from '@/lib/profile/tasteQuestions';

/** A small one-question taste check-in, styled like a companion chat bubble —
 *  surfaced occasionally so movie/music recommendations keep improving. */
export default function TasteQuestionCard({
  question,
  onAnswer,
}: {
  question: TasteQuestion;
  onAnswer: (questionId: string, value: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const Icon = question.id.startsWith('movie') ? Film : Music;

  async function pick(value: string) {
    if (saving) return;
    setSaving(value);
    await onAnswer(question.id, value).catch(() => setSaving(null));
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3.5 rounded-2xl rounded-bl-md bg-champagne/10 border border-champagne/30 shadow-sm">
        <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark mb-2.5">
          <Icon size={12} /> Getting to know your taste
        </p>
        <p className="text-sm text-obsidian leading-relaxed mb-3">{question.title}</p>
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              disabled={!!saving}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
                saving === opt.value
                  ? 'border-gold bg-gold/15 text-obsidian'
                  : 'border-obsidian/15 text-obsidian/70 hover:border-gold hover:bg-gold/5 disabled:opacity-40'
              }`}
            >
              {saving === opt.value && <Check size={11} className="text-gold-dark" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
