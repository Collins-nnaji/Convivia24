'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, UserPlus, Rss } from 'lucide-react';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import MyDayRibbon from '@/components/calendar/MyDayRibbon';
import DestressButton from '@/components/calendar/DestressButton';
import DayPlanner from '@/components/calendar/DayPlanner';
import DiscoveryPanel from '@/components/calendar/DiscoveryPanel';
import PeoplePanel from '@/components/calendar/PeoplePanel';
import ReflectionPrompt from '@/components/calendar/ReflectionPrompt';
import { useUser } from '@/components/auth/AuthProvider';
import { insertRestBuffers, type CalendarItem } from '@/lib/calendar/buffers';
import { addDays, addMonths, dateKey, isSameDay, startOfMonth, startOfWeek } from '@/lib/calendar/dates';

function dayLabel(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
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
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [feedCopied, setFeedCopied] = useState(false);

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

  async function toggleFeed() {
    const opening = !feedOpen;
    setFeedOpen(opening);
    if (opening && !feedUrl) {
      try {
        const res = await fetch('/api/calendar/feed-token');
        const data = await res.json();
        setFeedUrl(data.url || null);
      } catch {
        setFeedUrl(null);
      }
    }
  }

  async function copyFeedUrl() {
    if (!feedUrl) return;
    await navigator.clipboard.writeText(feedUrl);
    setFeedCopied(true);
    setTimeout(() => setFeedCopied(false), 1500);
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

  async function acceptDayPlan(blocks: { title: string; starts_at: string; ends_at: string; priority: 'low' | 'normal' | 'high'; notes?: string }[]) {
    await Promise.all(blocks.map((b) => fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: b.title, starts_at: b.starts_at, ends_at: b.ends_at, priority: b.priority, notes: b.notes }),
    })));
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    selectDate(tomorrow);
    load(startOfMonth(tomorrow));
  }

  async function applyDestress(moves: { id: string; title: string }[]) {
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
      <section className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 text-center bg-cream-base">
        <div>
          <p className="text-obsidian/70 text-sm mb-4">Sign in to open My 24.</p>
          <Link href="/signin?next=/my24" className="inline-flex items-center gap-2 px-5 py-2.5 bg-obsidian hover:bg-obsidian-50 text-cream text-xs font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream-base min-h-[calc(100dvh-4rem)] pb-16 md:pb-0 -mt-16 pt-16 flex flex-col">
      <header className="shrink-0 flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-b border-obsidian/10 bg-white/90">
        <span className="text-sm font-semibold text-obsidian tracking-tight">My 24</span>
        <button
          type="button"
          onClick={toggleFeed}
          className={`flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${
            feedOpen ? 'text-obsidian' : 'text-obsidian/50 hover:text-obsidian'
          }`}
        >
          <Rss size={13} />
          <span className="hidden sm:inline">Calendar feed</span>
        </button>
      </header>

      {feedOpen && (
        <div className="shrink-0 px-3 sm:px-4 py-2 border-b border-obsidian/10 bg-white/60 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-obsidian/45 text-xs sm:flex-1">Subscribe in Google, Apple, or Outlook.</p>
          <div className="flex items-center gap-1.5">
            <input
              readOnly
              value={feedUrl ?? 'Loading…'}
              onFocus={(e) => e.target.select()}
              className="flex-1 sm:w-56 px-2 py-1.5 border border-obsidian/10 bg-white text-xs text-obsidian/70"
            />
            <button
              type="button"
              onClick={copyFeedUrl}
              className="shrink-0 px-2.5 py-1.5 border border-obsidian/10 hover:border-gold text-obsidian/60 hover:text-obsidian text-xs transition-colors"
            >
              {feedCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <ReflectionPrompt />

      <DayPlanner onAccept={acceptDayPlan} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_220px] min-h-0 border-t border-obsidian/10">
        <div className="border-b lg:border-b-0 lg:border-r border-obsidian/10 min-h-0">
          <MonthCalendar
            month={month}
            items={monthItems}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
            onNextMonth={() => setMonth((m) => addMonths(m, 1))}
            onToday={goToday}
          />
        </div>

        <div className="flex flex-col min-h-0 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-obsidian/10 bg-cream-base/95 backdrop-blur-sm">
            <p className="text-sm font-medium text-obsidian">
              {isSameDay(selectedDate, new Date()) ? 'Today' : dayLabel(selectedDate)}
            </p>
            <button
              onClick={openAddForm}
              aria-label="Add to this day"
              className="shrink-0 w-8 h-8 rounded-full bg-obsidian hover:bg-obsidian-50 text-cream flex items-center justify-center transition-colors"
            >
              {adding ? <X size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {adding && (
            <form onSubmit={addTask} className="px-3 sm:px-4 py-3 border-b border-obsidian/10 bg-white/80 space-y-2">
              <input
                value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?"
                className="w-full px-2.5 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="px-2.5 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none" />
                <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="px-2.5 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="px-2.5 py-2 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="pt-1 border-t border-obsidian/10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-obsidian/40 mb-1.5 flex items-center gap-1"><UserPlus size={11} /> Invite</p>
                {guests.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 mb-1.5">
                    {guests.map((g, i) => (
                      <li key={i} className="px-2 py-0.5 bg-cream text-obsidian/70 text-xs border border-obsidian/10">{g.name}</li>
                    ))}
                  </ul>
                )}
                <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Name" className="px-2.5 py-1.5 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none" />
                  <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Email" className="px-2.5 py-1.5 border border-obsidian/10 bg-white text-sm focus:border-gold outline-none" />
                  <button type="button" onClick={addGuest} className="px-2 py-1.5 border border-obsidian/10 hover:border-gold text-obsidian/60 hover:text-obsidian transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-gold hover:bg-gold-light text-obsidian text-xs font-semibold transition-colors">
                Add
              </button>
            </form>
          )}

          <div className="flex-1 px-3 sm:px-4 py-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={dateKey(selectedDate)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {loading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => <div key={i} className="h-14 bg-white/50 animate-pulse" />)}
                  </div>
                ) : (
                  <MyDayRibbon items={dayItems} completingId={completingId} onComplete={complete} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <aside className="hidden xl:flex flex-col gap-0 border-l border-obsidian/10 min-h-0">
          <DiscoveryPanel />
          <PeoplePanel />
        </aside>
      </div>

      <DestressButton onAccept={applyDestress} />
    </section>
  );
}
