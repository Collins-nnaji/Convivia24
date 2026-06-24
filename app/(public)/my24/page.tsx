'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Sparkles, Users, ChevronRight } from 'lucide-react';
import DestressButton from '@/components/calendar/DestressButton';
import ReflectionPrompt from '@/components/calendar/ReflectionPrompt';
import RightNowHero from '@/components/calendar/RightNowHero';
import DayArc from '@/components/calendar/DayArc';
import WhatsNextList from '@/components/calendar/WhatsNextList';
import { useUser } from '@/components/auth/AuthProvider';
import { insertRestBuffers, type CalendarItem } from '@/lib/calendar/buffers';
import { findCurrentItem, findNextGap, upcomingItems } from '@/lib/calendar/dayShape';

const TILES = [
  { href: '/my24/calendar', label: 'Calendar', sub: 'View, add, and plan your days', icon: CalendarDays },
  { href: '/my24/plan', label: 'Plan tomorrow', sub: 'Let the Companion sketch it for you', icon: Sparkles },
  { href: '/my24/people', label: 'People', sub: 'Friends & family — WhatsApp check-ins', icon: Users },
];

export default function My24Page() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [todayItemsRaw, setTodayItemsRaw] = useState<CalendarItem[]>([]);
  const [protectingGap, setProtectingGap] = useState(false);

  // Keep "now" live so the cockpit (Right now / the day arc) stays current without a reload.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(); dayEnd.setHours(23, 59, 59, 999);
    const res = await fetch(`/api/calendar?start=${dayStart.toISOString()}&end=${dayEnd.toISOString()}`);
    const data = await res.json();
    setTodayItemsRaw(data.items || []);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  const todayItemsForArc = useMemo(() => insertRestBuffers(todayItemsRaw), [todayItemsRaw]);
  const currentItem = useMemo(() => findCurrentItem(todayItemsRaw, now), [todayItemsRaw, now]);
  const nextFew = useMemo(() => upcomingItems(todayItemsRaw, now, 3), [todayItemsRaw, now]);
  const whatsNext = currentItem ? nextFew : nextFew.slice(1);
  const gap = useMemo(() => {
    const dayEndCutoff = new Date(now);
    dayEndCutoff.setHours(22, 0, 0, 0);
    const raw = findNextGap(todayItemsRaw, now, dayEndCutoff, 45);
    if (!raw) return null;
    const startsAt = new Date(raw.starts_at);
    const cap = new Date(startsAt.getTime() + 180 * 60000);
    const endsAt = new Date(raw.ends_at) < cap ? new Date(raw.ends_at) : cap;
    return { starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), minutes: Math.round((+endsAt - +startsAt) / 60000) };
  }, [todayItemsRaw, now]);

  async function complete(id: string) {
    await fetch(`/api/calendar/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
    load();
  }

  async function deferItem(item: CalendarItem) {
    const newStart = new Date(item.starts_at); newStart.setDate(newStart.getDate() + 1);
    const newEnd = new Date(item.ends_at); newEnd.setDate(newEnd.getDate() + 1);
    await fetch(`/api/calendar/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() }),
    });
    load();
  }

  async function protectGap() {
    if (!gap || protectingGap) return;
    setProtectingGap(true);
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Protected time', starts_at: gap.starts_at, ends_at: gap.ends_at, priority: 'normal' }),
      });
      await load();
    } finally {
      setProtectingGap(false);
    }
  }

  async function applyDestress(moves: { id: string; title: string }[]) {
    await Promise.all(moves.map((m) => {
      const item = todayItemsRaw.find((i) => i.id === m.id);
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
      <section className="min-h-dvh md:min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 text-center bg-cream-base">
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
    <section className="bg-cream-base min-h-dvh md:min-h-[calc(100dvh-4rem)] pb-16 md:pb-0 md:-mt-16 md:pt-16 flex flex-col">
      <header className="shrink-0 flex items-center px-3 sm:px-4 py-2 border-b border-obsidian/10 bg-white/90">
        <span className="text-base font-semibold text-obsidian tracking-tight">My 24</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-5 sm:px-8">
          <div className="pt-6 sm:pt-9 pb-6 space-y-5">
            <RightNowHero current={currentItem} next={nextFew[0] ?? null} now={now} onComplete={complete} onAddNow={() => router.push('/my24/calendar?add=1')} />
            <DayArc items={todayItemsForArc} now={now} />
            <WhatsNextList
              items={whatsNext}
              gap={gap}
              onComplete={complete}
              onDefer={deferItem}
              onProtectGap={protectGap}
              protecting={protectingGap}
            />
          </div>

          <ReflectionPrompt />

          <div className="py-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TILES.map(({ href, label, sub, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 p-4 rounded-2xl border border-obsidian/10 bg-white hover:border-gold/40 hover:shadow-sm transition-all"
              >
                <span className="shrink-0 w-10 h-10 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-obsidian">{label}</p>
                  <p className="text-xs text-obsidian/45 mt-0.5 leading-snug">{sub}</p>
                </div>
                <ChevronRight size={16} className="shrink-0 text-obsidian/25 group-hover:text-gold-dark transition-colors" />
              </Link>
            ))}
          </div>

          <div className="pb-16" />
        </div>
      </div>

      <DestressButton onAccept={applyDestress} />
    </section>
  );
}
