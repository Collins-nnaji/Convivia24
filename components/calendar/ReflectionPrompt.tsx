'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Moon } from 'lucide-react';
import { MOOD_OPTIONS, ENERGY_OPTIONS } from '@/lib/checkin/options';

interface CheckIn { highlight: string | null; mood: string | null; energy: string | null }

/** A quick daily check-in — mood + energy taps, plus an optional note. Mood/energy
 *  save instantly on tap; the note has its own Save step since it's free text. */
export default function ReflectionPrompt() {
  const [highlight, setHighlight] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setVisible(hour >= 17 || hour < 4);
    fetch('/api/reflection')
      .then((r) => r.json())
      .then((d) => {
        const r: CheckIn | null = d.reflection;
        if (r) {
          if (r.highlight) { setHighlight(r.highlight); setHighlightSaved(true); }
          setMood(r.mood);
          setEnergy(r.energy);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(fields: { highlight?: string; mood?: string; energy?: string }) {
    await fetch('/api/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
  }

  function pickMood(value: string) {
    setMood(value);
    save({ mood: value });
  }

  function pickEnergy(value: string) {
    setEnergy(value);
    save({ energy: value });
  }

  async function submitHighlight(e: FormEvent) {
    e.preventDefault();
    if (!highlight.trim()) return;
    await save({ highlight });
    setHighlightSaved(true);
  }

  if (!visible || loading) return null;

  return (
    <div className="shrink-0 px-3 sm:px-4 py-3 border-b border-obsidian/10 bg-champagne/10 space-y-2.5">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-obsidian/40 shrink-0">
          <Moon size={12} className="text-gold-dark/60" /> Check in
        </span>
        <div className="flex items-center gap-1">
          {MOOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pickMood(o.value)}
              aria-label={o.label}
              title={o.label}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all ${
                mood === o.value ? 'bg-gold/20 ring-1 ring-gold scale-110' : 'hover:bg-obsidian/[0.04]'
              }`}
            >
              {o.emoji}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-obsidian/10 shrink-0" />
        <div className="flex items-center gap-1">
          {ENERGY_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pickEnergy(o.value)}
              aria-label={o.label}
              title={o.label}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all ${
                energy === o.value ? 'bg-gold/20 ring-1 ring-gold scale-110' : 'hover:bg-obsidian/[0.04]'
              }`}
            >
              {o.emoji}
            </button>
          ))}
        </div>
      </div>

      {highlightSaved ? (
        <p className="text-xs text-obsidian/55 pl-0.5">&ldquo;{highlight}&rdquo;</p>
      ) : (
        <form onSubmit={submitHighlight} className="flex items-center gap-2">
          <input
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Anything you want to note about today?"
            className="flex-1 bg-transparent text-sm text-obsidian placeholder:text-obsidian/40 outline-none"
          />
          <button type="submit" className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-gold-dark hover:text-obsidian transition-colors">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
