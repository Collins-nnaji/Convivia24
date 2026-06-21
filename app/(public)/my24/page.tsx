'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, UserPlus } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import MyDayRibbon from '@/components/calendar/MyDayRibbon';
import DestressButton from '@/components/calendar/DestressButton';
import { useUser } from '@/components/auth/AuthProvider';
import { insertRestBuffers, type CalendarItem } from '@/lib/calendar/buffers';
import { addDays, addMonths, dateKey, isSameDay, startOfMonth, startOfWeek } from '@/lib/calendar/dates';

function dayLabel(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function My24Page() {
  const { user, loading: authLoading } = useUser();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [monthItems, setMonthItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [guests, setGuests] = useState<{ name: string; email: string }[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const load = useCallback(async (forMonth: Date) => {
    setLoading(true);
    try {
      const gridStart = startOfWeek(startOfMonth(forMonth));
      const gridEnd = addDays(gridStart, 41);
      const res = await fetch(`/api/calendar?start=${gridStart.toISOString()}&end=${gridEnd.toISOString()}`);
      const data = await res.json();
      setMonthItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) load(month); }, [user, month, load]);

  const dayItems = useMemo(
    () => insertRestBuffers(monthItems.filter((i) => isSameDay(new Date(i.starts_at), selectedDate))),
    [monthItems, selectedDate],
  );

  function selectDate(d: Date) {
    setSelectedDate(d);
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) {
      setMonth(startOfMonth(d));
    }
  }

  function goToday() {
    const now = new Date();
    setSelectedDate(now);
    setMonth(startOfMonth(now));
  }

  async function complete(id: string) {
    setCompletingId(id);
    setTimeout(async () => {
      await fetch(`/api/calendar/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
      setCompletingId(null);
      load(month);
    }, 550);
  }

  function addGuest() {
    if (!guestName.trim()) return;
    setGuests((g) => [...g, { name: guestName.trim(), email: guestEmail.trim() }]);
    setGuestName(''); setGuestEmail('');
  }

  function openAddForm() {
    const opening = !adding;
    setAdding(opening);
    if (opening && !start && !end) {
      const base = new Date(selectedDate);
      base.setHours(base.getHours() + 1, 0, 0, 0);
      const later = new Date(base); later.setHours(later.getHours() + 1);
      setStart(toLocalInputValue(base));
      setEnd(toLocalInputValue(later));
    }
  }

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, starts_at: new Date(start).toISOString(), ends_at: new Date(end).toISOString(), priority, invitees: guests }),
    });
    setTitle(''); setStart(''); setEnd(''); setPriority('normal'); setGuests([]); setGuestName(''); setGuestEmail('');
    setAdding(false);
    load(month);
  }

  async function applyDestress(moves: { id: string; title: string }[]) {
    // Destress always acts on today's tasks (server-side), regardless of which
    // month/day is currently shown — fetch today's items fresh rather than
    // relying on whatever range happens to be loaded for the grid.
    const res = await fetch(`/api/calendar?date=${new Date().toISOString()}`);
    const data = await res.json();
    const todays: CalendarItem[] = data.items || [];
    await Promise.all(moves.map((m) => {
      const item = todays.find((i) => i.id === m.id);
      if (!item) return Promise.resolve();
      const newStart = new Date(item.starts_at); newStart.setDate(newStart.getDate() + 1);
      const newEnd = new Date(item.ends_at); newEnd.setDate(newEnd.getDate() + 1);
      return fetch(`/api/calendar/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }),
      });
    }));
    load(month);
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
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight">Your calendar.</h1>
            <p className="text-obsidian/50 text-sm mt-2">Lower your stress. Optimize your hours. Love your day.</p>
          </div>
        </div>

        <MonthCalendar
          month={month}
          items={monthItems}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
          onNextMonth={() => setMonth((m) => addMonths(m, 1))}
          onToday={goToday}
        />

        <div className="flex items-end justify-between gap-4 mt-10 mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-light italic text-obsidian tracking-tight">
            {isSameDay(selectedDate, new Date()) ? 'Today' : dayLabel(selectedDate)}
          </h2>
          <button
            onClick={openAddForm}
            aria-label="Add to this day"
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
            </div>

            <div className="pt-2 border-t border-obsidian/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark mb-2 flex items-center gap-1.5"><UserPlus size={12} /> Invite people (optional)</p>
              {guests.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-2">
                  {guests.map((g, i) => (
                    <li key={i} className="px-2.5 py-1 bg-cream text-obsidian/70 text-xs border border-obsidian/10">{g.name}</li>
                  ))}
                </ul>
              )}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Name" className="px-3 py-2 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none" />
                <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Email (optional)" className="px-3 py-2 border border-obsidian/15 bg-white text-sm focus:border-gold outline-none" />
                <button type="button" onClick={addGuest} className="px-3 py-2 border border-obsidian/15 hover:border-gold text-obsidian/60 hover:text-obsidian transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors">
              Add to this day
            </button>
          </form>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={dateKey(selectedDate)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-white/50 animate-pulse" />)}
              </div>
            ) : (
              <MyDayRibbon items={dayItems} completingId={completingId} onComplete={complete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <DestressButton onAccept={applyDestress} />
    </section>
  );
}
