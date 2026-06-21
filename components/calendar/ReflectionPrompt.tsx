'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Moon } from 'lucide-react';

export default function ReflectionPrompt() {
  const [highlight, setHighlight] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setVisible(hour >= 17 || hour < 4);
    fetch('/api/reflection')
      .then((r) => r.json())
      .then((d) => { if (d.reflection) { setHighlight(d.reflection.highlight); setSaved(true); } })
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!highlight.trim()) return;
    await fetch('/api/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ highlight }),
    });
    setSaved(true);
  }

  if (!visible || loading) return null;

  return (
    <div className="shrink-0 px-3 sm:px-4 py-2.5 border-b border-obsidian/10 bg-champagne/10">
      {saved ? (
        <p className="text-xs text-obsidian/55 flex items-center gap-1.5">
          <Moon size={12} className="text-gold-dark/60" /> Noted — &ldquo;{highlight}&rdquo;
        </p>
      ) : (
        <form onSubmit={submit} className="flex items-center gap-2">
          <Moon size={13} className="text-gold-dark/60 shrink-0" />
          <input
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="How was today? What was the best part?"
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
