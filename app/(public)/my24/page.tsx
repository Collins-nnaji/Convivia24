'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import MyDayRibbon from '@/components/calendar/MyDayRibbon';
import DestressButton from '@/components/calendar/DestressButton';
import { useUser } from '@/components/auth/AuthProvider';
import type { CalendarItem } from '@/lib/calendar/buffers';

function todayLabel() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function My24Page() {
  const { user, loading: authLoading } = useUser();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  async function complete(id: string) {
    setCompletingId(id);
    setTimeout(async () => {
      await fetch(`/api/calendar/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
      setCompletingId(null);
      load();
    }, 550);
  }

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, starts_at: new Date(start).toISOString(), ends_at: new Date(end).toISOString(), priority }),
    });
    setTitle(''); setStart(''); setEnd(''); setPriority('normal');
    setAdding(false);
    load();
  }

  async function applyDestress(moves: { id: string; title: string }[]) {
    await Promise.all(moves.map((m) => {
      const item = items.find((i) => i.id === m.id);
      if (!item) return Promise.resolve();
      const newStart = new Date(item.starts_at); newStart.setDate(newStart.getDate() + 1);
      const newEnd = new Date(item.ends_at); newEnd.setDate(newEnd.getDate() + 1);
      return fetch(`/api/calendar/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }),
      });
    }));
    load();
  }

  if (!authLoading && !user) {
    return (
      <section className="zen-ribbon-bg min-h-[70vh] flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-display text-3xl italic text-obsidian mb-4">Sign in to see your day.</p>
          <Link href="/signin?next=/my24" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="zen-ribbon-bg min-h-[90vh] -mt-16 pt-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        <SectionLabel>My 24</SectionLabel>
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight">{todayLabel()}</h1>
            <p className="text-obsidian/50 text-sm mt-2">Lower your stress. Optimize your hours. Love your day.</p>
          </div>
          <button
            onClick={() => setAdding((v) => !v)}
            aria-label="Add to your day"
            className="shrink-0 w-11 h-11 rounded-full bg-obsidian hover:bg-obsidian-50 text-cream flex items-center justify-center transition-colors"
          >
            {adding ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {adding && (
          <form onSubmit={addTask} className="mb-10 p-5 border border-gold/30 bg-white/70 space-y-3">
            <input
              value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?"
              className="w-full px-3 py-2.5 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="px-3 py-2.5 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none" />
              <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="px-3 py-2.5 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="px-3 py-2.5 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none">
                <option value="low">Low priority</option>
                <option value="normal">Normal</option>
                <option value="high">High priority</option>
              </select>
              <button type="submit" className="ml-auto px-5 py-2.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors">
                Add
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-white/50 animate-pulse" />)}
          </div>
        ) : (
          <MyDayRibbon items={items} completingId={completingId} onComplete={complete} />
        )}
      </div>

      <DestressButton onAccept={applyDestress} />
    </section>
  );
}
