'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import MyDayRibbon from '@/components/calendar/MyDayRibbon';
import { insertRestBuffers, type CalendarItem } from '@/lib/calendar/buffers';
import { addDays, dateKey, isSameDay, startOfMonth } from '@/lib/calendar/dates';

const STEP_MS = 2200;
const STEPS = 6;

function atTime(day: Date, hour: number, minute = 0) {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function buildDemoItems(today: Date): CalendarItem[] {
  const base = (offset: number) => addDays(today, offset);
  const item = (
    id: string,
    day: Date,
    title: string,
    startH: number,
    startM: number,
    endH: number,
    endM: number,
    priority: CalendarItem['priority'] = 'normal',
    invitees?: CalendarItem['invitees'],
  ): CalendarItem => ({
    id,
    title,
    starts_at: atTime(day, startH, startM),
    ends_at: atTime(day, endH, endM),
    priority,
    kind: invitees ? 'gathering' : 'task',
    location: null,
    notes: null,
    is_rest_block: false,
    source: 'manual',
    status: 'active',
    invitees,
  });

  return [
    item('demo-1', today, 'Morning standup', 9, 0, 9, 30, 'normal'),
    item('demo-2', today, 'Lunch with Sam', 12, 0, 13, 0, 'high', [
      { id: 'g1', name: 'Sam', email: 'sam@example.com', status: 'accepted', response_token: 'demo' },
    ]),
    item('demo-3', today, 'Deep work block', 13, 10, 15, 0, 'normal'),
    item('demo-4', base(2), 'Team sync', 10, 0, 11, 0, 'normal'),
    item('demo-5', base(-3), 'Dinner plans', 19, 0, 21, 0, 'high'),
    item('demo-6', base(5), 'Weekend reset', 11, 0, 12, 30, 'low'),
  ];
}

export default function CalendarAppPreview() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [step, setStep] = useState(0);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const allItems = useMemo(() => buildDemoItems(today), [today]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep((s) => (s + 1) % STEPS);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 0) {
      setSelectedDate(today);
      setMonth(startOfMonth(today));
      setCompletingId(null);
      setCompletedIds([]);
      return;
    }
    if (step === 1) {
      setSelectedDate(today);
      return;
    }
    if (step === 4) {
      setCompletingId('demo-1');
      const t = window.setTimeout(() => {
        setCompletedIds(['demo-1']);
        setCompletingId(null);
      }, 650);
      return () => window.clearTimeout(t);
    }
    setCompletingId(null);
  }, [step, today]);

  const dayItemsRaw = useMemo(
    () =>
      allItems.filter(
        (i) =>
          isSameDay(new Date(i.starts_at), selectedDate) &&
          i.status === 'active' &&
          !completedIds.includes(i.id),
      ),
    [allItems, selectedDate, completedIds],
  );

  const visibleDayItems = useMemo(() => {
    if (step < 2) return [];
    if (step === 2) return dayItemsRaw.filter((i) => i.id === 'demo-1' || i.id === 'demo-2');
    if (step === 3) return dayItemsRaw.filter((i) => i.id !== 'demo-3');
    return insertRestBuffers(dayItemsRaw);
  }, [dayItemsRaw, step]);

  const showRibbon = step >= 2;

  return (
    <div className="relative w-full max-w-[420px] lg:max-w-[460px] mx-auto lg:mx-0 pointer-events-none select-none">
      <div className="absolute -inset-3 rounded-[2.5rem] bg-gold/10 blur-2xl" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="relative rounded-[1.75rem] border border-obsidian/10 bg-obsidian shadow-2xl shadow-obsidian/20 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 bg-obsidian border-b border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/80">My 24</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Live preview</span>
          </div>
        </div>

        <div className="zen-ribbon-bg max-h-[460px] overflow-hidden">
          <div className="p-2.5 sm:p-3 space-y-2.5">
            <MonthCalendar
              month={month}
              items={allItems}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onPrevMonth={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              onNextMonth={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              onToday={() => {
                setSelectedDate(today);
                setMonth(startOfMonth(today));
              }}
            />

            <AnimatePresence mode="wait">
              {showRibbon && (
                <motion.div
                  key={dateKey(selectedDate)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <div className="flex items-center justify-between px-1 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark">Today</p>
                    <span className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-gold-dark text-lg leading-none">+</span>
                  </div>
                  <MyDayRibbon items={visibleDayItems} completingId={completingId} onComplete={() => {}} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-10 bg-gradient-to-t from-[#F1E6CC] to-transparent" aria-hidden />
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/90 text-obsidian text-[9px] font-black uppercase tracking-[0.15em] shadow-lg">
          <span className="w-1 h-1 rounded-full bg-obsidian animate-pulse" />
          Auto-play
        </div>
      </motion.div>
    </div>
  );
}
