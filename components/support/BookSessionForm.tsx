'use client';

import { useState, type FormEvent } from 'react';
import type { SupporterProfile } from '@/lib/support/repo';

function defaultDateTime(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookSessionForm({
  supporter,
  onBooked,
  onCancel,
}: {
  supporter: SupporterProfile;
  onBooked: () => void;
  onCancel: () => void;
}) {
  const [when, setWhen] = useState(defaultDateTime());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/support/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supporter_id: supporter.user_id,
          starts_at: new Date(when).toISOString(),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not send that request.'); return; }
      onBooked();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 p-4 rounded-xl border border-gold/30 bg-champagne/10 space-y-3">
      <p className="text-xs text-obsidian/55">Requesting time with <span className="font-semibold text-obsidian">{supporter.display_name}</span> — they&apos;ll confirm with a call link, or decline.</p>
      <input
        type="datetime-local"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-lg border border-obsidian/15 bg-white text-sm focus:border-gold outline-none transition-colors"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything you'd like them to know beforehand? (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-obsidian/15 bg-white text-sm resize-none focus:border-gold outline-none transition-colors"
      />
      {error && <p className="text-rose-600 text-xs">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting} className="btn-brand px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] disabled:opacity-50">
          {submitting ? 'Sending…' : 'Send request'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/50 hover:text-obsidian transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
