'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plug, RefreshCw, Sparkles } from 'lucide-react';
import IntegrationCard from '@/components/integrations/IntegrationCard';
import EventMonthCalendar, { type CalendarEventDot } from '@/components/calendar/EventMonthCalendar';
import { INTEGRATIONS, CATEGORY_LABELS, type IntegrationCategory } from '@/lib/integrations/catalog';
import { addMonths, isSameDay, startOfMonth } from '@/lib/calendar/dates';

interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  starts_at: string;
  city: string;
  venue?: string | null;
  status: string;
}

interface StatusPayload {
  integrations: (typeof INTEGRATIONS[number] & { status: string })[];
  summary: { connected: number; ready: number; total: number };
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [category, setCategory] = useState<IntegrationCategory | 'all'>('all');

  function load() {
    setLoading(true);
    Promise.all([
      fetch('/api/integrations/status').then((r) => r.json()),
      fetch('/api/events?all=1').then((r) => r.json()).catch(() => ({ events: [] })),
    ])
      .then(([st, ev]) => {
        setStatus(st);
        setEvents((ev.events ?? []).filter((e: AdminEvent) => e.status === 'published'));
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const calendarEvents: CalendarEventDot[] = useMemo(
    () => events.map((e) => ({ id: e.id, starts_at: e.starts_at, title: e.title, slug: e.slug, city: e.city, venue: e.venue })),
    [events],
  );

  const selectedEvents = useMemo(
    () => events.filter((e) => isSameDay(new Date(e.starts_at), selected)),
    [events, selected],
  );

  const filtered = useMemo(() => {
    const list = status?.integrations ?? INTEGRATIONS;
    if (category === 'all') return list;
    return list.filter((i) => i.category === category);
  }, [status, category]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-copper-deep mb-2 flex items-center gap-2">
            <Plug size={14} /> Connections
          </p>
          <h1 className="font-display text-3xl italic text-ink mb-2">Integrations</h1>
          <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
            Connect the tools your guests already use — calendar, maps, WhatsApp, and email — plus payment providers when you&apos;re ready to go live.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-secondary text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {status && (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Connected', value: status.summary.connected },
            { label: 'Ready to enable', value: status.summary.ready },
            { label: 'Total integrations', value: status.summary.total },
          ].map((s) => (
            <div key={s.label} className="glass-card p-5">
              <p className="text-2xl font-display italic text-ink">{s.value}</p>
              <p className="text-xs text-ink-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`chip ${category === 'all' ? 'chip-active' : 'chip-inactive'}`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as IntegrationCategory[]).map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`chip ${category === c ? 'chip-active' : 'chip-inactive'}`}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start mb-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <IntegrationCard
              key={item.id}
              integration={item}
              status={item.status as typeof item.status}
              onConnect={() => {
                if (item.id === 'paystack' || item.id === 'stripe') {
                  window.location.href = '/admin/finance';
                } else if (item.id === 'google_calendar') {
                  window.location.href = '/calendar';
                } else {
                  window.open('https://github.com/Collins-nnaji/Convivia24', '_blank');
                }
              }}
            />
          ))}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-below-nav">
          <div className="glass-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-3 flex items-center gap-2">
              <Sparkles size={12} /> Event run sheet
            </p>
            <EventMonthCalendar
              month={month}
              events={calendarEvents}
              selectedDate={selected}
              onSelectDate={setSelected}
              onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
              onNextMonth={() => setMonth((m) => addMonths(m, 1))}
              onToday={() => { const t = new Date(); setMonth(startOfMonth(t)); setSelected(t); }}
              compact
            />
          </div>
          {selectedEvents.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">On this day</p>
              {selectedEvents.map((ev) => (
                <Link key={ev.id} href={`/admin/events/${ev.id}`} className="block text-sm font-medium text-ink hover:text-copper-deep">
                  {ev.title}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="glass-card p-5 text-sm text-ink-muted leading-relaxed">
        <p className="font-semibold text-ink mb-2">How connections work</p>
        <p>
          Calendar, Maps, and WhatsApp links work today without extra setup. Payment and email integrations activate when you add the API keys listed on each card to your deployment environment.
        </p>
      </div>
    </div>
  );
}
