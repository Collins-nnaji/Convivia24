'use client';

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, UserPlus, Rss, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, CalendarClock } from 'lucide-react';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import WeekStrip from '@/components/calendar/WeekStrip';
import MyDayRibbon from '@/components/calendar/MyDayRibbon';
import UpcomingPanel from '@/components/calendar/UpcomingPanel';
import SubpageHeader from '@/components/calendar/SubpageHeader';
import { useUser } from '@/components/auth/AuthProvider';
import { insertRestBuffers, type CalendarItem } from '@/lib/calendar/buffers';
import { addDays, addMonths, dateKey, isSameDay, startOfMonth, startOfWeek } from '@/lib/calendar/dates';
import { seedToTimes, type DaySeed } from '@/lib/calendar/seeds';

/** A short, calm one-liner describing the shape of a day. */
function intentForDay(items: CalendarItem[]): string {
  const real = items.filter((i) => !i.is_rest_block);
  const n = real.length;
  if (n === 0) return 'An open day — room to breathe.';
  if (n >= 5) return 'A full day — pace yourself.';
  const highs = real.filter((i) => i.priority === 'high').length;
  if (highs >= 2) return 'A focused day — protect your energy.';
  if (real.every((i) => i.priority === 'low')) return 'A gentle, easy day.';
  return 'A calm, focused day.';
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CalendarPageInner() {
  const { user, loading: authLoading } = useUser();
  const params = useSearchParams();
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
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

  // Default to the compact week strip on small screens for an app-like feel.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      setCalendarCollapsed(true);
    }
  }, []);

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

  /** "Add something" arriving from elsewhere (e.g. the My 24 home cockpit) always means today. */
  function addNow() {
    const today = new Date();
    setSelectedDate(today);
    if (today.getMonth() !== month.getMonth() || today.getFullYear() !== month.getFullYear()) setMonth(startOfMonth(today));
    setAdding(true);
    const base = new Date(today); base.setHours(base.getHours() + 1, 0, 0, 0);
    const later = new Date(base); later.setHours(later.getHours() + 1);
    setStart(toLocalInputValue(base));
    setEnd(toLocalInputValue(later));
  }

  // Pick up cross-page navigation signals once on arrival: `?date=` (jump to a
  // day, e.g. after accepting tomorrow's plan) or `?add=1` (open the add form
  // for today, e.g. from the cockpit's "Add something" button).
  useEffect(() => {
    const dateParam = params.get('date');
    if (dateParam) {
      const d = new Date(`${dateParam}T00:00:00`);
      if (!isNaN(+d)) selectDate(d);
    } else if (params.get('add') === '1') {
      addNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dayItems = useMemo(
    () => insertRestBuffers(monthItems.filter((i) => isSameDay(new Date(i.starts_at), selectedDate))),
    [monthItems, selectedDate],
  );

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

  async function addSeed(day: Date, seed: DaySeed) {
    const { starts_at, ends_at } = seedToTimes(day, seed);
    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: seed.title, starts_at, ends_at, priority: seed.priority }),
    });
    load(month);
  }

  if (!authLoading && !user) {
    return (
      <section className="min-h-dvh md:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 text-center bg-cream-base">
        <div>
          <p className="text-obsidian/70 text-sm mb-4">Sign in to open your calendar.</p>
          <Link href="/signin?next=/my24/calendar" className="inline-flex items-center gap-2 px-5 py-2.5 bg-obsidian hover:bg-obsidian-50 text-cream text-xs font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  const isTodaySel = isSameDay(selectedDate, new Date());
  const isTomorrowSel = isSameDay(selectedDate, addDays(new Date(), 1));
  const heroEyebrow = isTodaySel ? 'Today' : isTomorrowSel ? 'Tomorrow' : selectedDate.toLocaleDateString('en-GB', { month: 'long' });
  const heroWeekday = selectedDate.toLocaleDateString('en-GB', { weekday: 'long' });
  const heroDateShort = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const heroIntent = intentForDay(dayItems);

  return (
    <section className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)] pb-16 md:pb-0 md:-mt-16 md:pt-16 flex flex-col">
      <SubpageHeader
        title="Calendar"
        icon={<CalendarDays size={16} className="text-gold-dark" />}
        action={
          <button
            type="button"
            onClick={toggleFeed}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs transition-colors ${feedOpen ? 'text-obsidian' : 'text-obsidian/50 hover:text-obsidian'}`}
          >
            <Rss size={13} />
            <span className="hidden sm:inline">Feed</span>
          </button>
        }
      />

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

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 sm:px-8">
          <div className="border-t border-obsidian/10 pt-4">
            <div className="flex items-center justify-between gap-2 pb-2">
              <button
                onClick={() => setCalendarCollapsed((v) => !v)}
                aria-label={calendarCollapsed ? 'Show full calendar' : 'Collapse calendar'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-obsidian/70 hover:text-obsidian transition-colors"
              >
                {selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                {calendarCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>
              {calendarCollapsed && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => selectDate(addDays(selectedDate, -7))} aria-label="Previous week" className="w-7 h-7 flex items-center justify-center rounded-full text-obsidian/40 hover:text-obsidian hover:bg-obsidian/[0.04] transition-colors"><ChevronLeft size={14} /></button>
                  <button onClick={goToday} className="px-2.5 h-7 text-[10px] font-black uppercase tracking-[0.12em] text-gold-dark hover:text-obsidian rounded-full transition-colors">Today</button>
                  <button onClick={() => selectDate(addDays(selectedDate, 7))} aria-label="Next week" className="w-7 h-7 flex items-center justify-center rounded-full text-obsidian/40 hover:text-obsidian hover:bg-obsidian/[0.04] transition-colors"><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
            {calendarCollapsed
              ? <WeekStrip selectedDate={selectedDate} items={monthItems} onSelectDate={selectDate} />
              : (
                <MonthCalendar
                  month={month}
                  items={monthItems}
                  selectedDate={selectedDate}
                  onSelectDate={selectDate}
                  onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
                  onNextMonth={() => setMonth((m) => addMonths(m, 1))}
                  onToday={goToday}
                />
              )}
          </div>

          <div className="pt-6 pb-2 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gold-dark mb-2.5">{heroEyebrow}</p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light italic brand-text leading-[0.9]">{heroWeekday}</h1>
              <p className="font-display italic text-obsidian/55 text-lg sm:text-xl mt-3">{heroDateShort} · {heroIntent}</p>
            </div>
            <button
              onClick={openAddForm}
              aria-label="Add to this day"
              className="btn-brand shrink-0 w-11 h-11 rounded-full flex items-center justify-center mt-1.5"
            >
              {adding ? <X size={18} /> : <Plus size={18} />}
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

              <button type="submit" className="btn-brand w-full py-2.5 text-xs font-black uppercase tracking-[0.12em]">
                Add
              </button>
            </form>
          )}

          <div className="pb-12 min-h-[28vh]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={dateKey(selectedDate)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {loading ? (
                  <div className="space-y-3 pt-4">
                    {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-white/60 animate-pulse" />)}
                  </div>
                ) : (
                  <MyDayRibbon
                    items={dayItems}
                    completingId={completingId}
                    onComplete={complete}
                    selectedDate={selectedDate}
                    onAddSuggestion={(seed) => addSeed(selectedDate, seed)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-obsidian/10 pt-4 pb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-obsidian/45 flex items-center gap-1.5 mb-3">
              <CalendarClock size={13} className="text-gold-dark" /> Next few days
            </p>
            <div className="rounded-2xl border border-obsidian/10 overflow-hidden bg-white">
              <UpcomingPanel items={monthItems} onSelectDate={selectDate} onAddSeed={addSeed} hideHeader />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)]" />}>
      <CalendarPageInner />
    </Suspense>
  );
}
