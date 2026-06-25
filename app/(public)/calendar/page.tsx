'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ArrowRight, MapPin, Clock } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/components/auth/AuthProvider';
import EventMonthCalendar, { type CalendarEventDot } from '@/components/calendar/EventMonthCalendar';
import EventIntegrationBar from '@/components/integrations/EventIntegrationBar';
import { addMonths, isSameDay, startOfMonth } from '@/lib/calendar/dates';
import { IntegrationStrip } from '@/components/integrations/IntegrationCard';

interface MyOrder {
  reference: string;
  event_title: string;
  event_slug: string;
  starts_at: string;
  venue: string | null;
  city: string;
  cover_image: string | null;
  status: string;
}

export default function MyCalendarPage() {
  const { user, loading: authLoading } = useUser();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetch('/api/me/orders')
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setOrders((d.orders ?? []).filter((o: MyOrder) => o.status === 'paid')))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const calendarEvents: CalendarEventDot[] = useMemo(
    () => orders.map((o) => ({
      id: o.reference,
      starts_at: o.starts_at,
      title: o.event_title,
      slug: o.event_slug,
      city: o.city,
      venue: o.venue,
    })),
    [orders],
  );

  const selectedEvents = useMemo(
    () => orders.filter((o) => isSameDay(new Date(o.starts_at), selected)),
    [orders, selected],
  );

  const upcoming = useMemo(
    () => [...orders].filter((o) => new Date(o.starts_at) >= new Date()).sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)).slice(0, 3),
    [orders],
  );

  return (
    <section className="bg-paper min-h-screen py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <SectionLabel>My calendar</SectionLabel>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight mb-2">
              Your events, mapped.
            </h1>
            <p className="text-obsidian/55 text-sm sm:text-base max-w-xl">
              See everything you&apos;ve booked, add to Google Calendar or Apple Calendar, get directions, and share with friends.
            </p>
          </div>
          <Link href="/tickets" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold shrink-0">
            List view <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mb-8">
          <IntegrationStrip />
        </div>

        {!authLoading && !user && (
          <div className="glass-card p-8 text-center mb-8">
            <CalendarDays size={32} className="text-gold-dark mx-auto mb-3" />
            <p className="font-display text-2xl italic text-obsidian mb-2">Sign in to see your calendar.</p>
            <p className="text-obsidian/55 text-sm mb-5">Your booked events appear here with one-tap calendar and maps links.</p>
            <Link href="/signin?next=/calendar" className="btn-primary">Sign in</Link>
          </div>
        )}

        {user && (
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 lg:gap-8 items-start">
            <div>
              {loading ? (
                <div className="aspect-[4/3] rounded-2xl bg-white border border-obsidian/10 animate-pulse" />
              ) : (
                <EventMonthCalendar
                  month={month}
                  events={calendarEvents}
                  selectedDate={selected}
                  onSelectDate={setSelected}
                  onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
                  onNextMonth={() => setMonth((m) => addMonths(m, 1))}
                  onToday={() => { const t = new Date(); setMonth(startOfMonth(t)); setSelected(t); }}
                />
              )}
            </div>

            <div className="space-y-5">
              <div className="glass-card p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-2">
                  {selected.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                {selectedEvents.length === 0 ? (
                  <p className="text-sm text-ink-muted">No bookings on this day. <Link href="/events" className="text-copper hover:underline">Discover events</Link></p>
                ) : (
                  <div className="space-y-4">
                    {selectedEvents.map((ev) => (
                      <div key={ev.reference} className="border-t border-ink/8 pt-4 first:border-0 first:pt-0">
                        <Link href={`/orders/${ev.reference}`} className="font-display text-xl italic text-ink hover:text-copper-deep transition-colors">
                          {ev.event_title}
                        </Link>
                        <p className="flex items-center gap-2 text-xs text-ink-muted mt-1">
                          <Clock size={12} className="text-copper" />
                          {new Date(ev.starts_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          {ev.venue && (
                            <>
                              <MapPin size={12} className="text-copper ml-2" />
                              {ev.venue}, {ev.city}
                            </>
                          )}
                        </p>
                        <div className="mt-3">
                          <EventIntegrationBar
                            compact
                            title={ev.event_title}
                            slug={ev.event_slug}
                            starts_at={ev.starts_at}
                            venue={ev.venue}
                            city={ev.city}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {upcoming.length > 0 && (
                <div className="glass-card p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-deep mb-3">Coming up</p>
                  <ul className="space-y-3">
                    {upcoming.map((ev) => (
                      <li key={ev.reference}>
                        <Link href={`/orders/${ev.reference}`} className="flex items-center gap-3 group">
                          <img src={ev.cover_image || '/Convivium.png'} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate group-hover:text-copper-deep">{ev.event_title}</p>
                            <p className="text-xs text-ink-muted">{new Date(ev.starts_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!user && (
          <div className="opacity-60 pointer-events-none">
            <EventMonthCalendar
              month={month}
              events={[]}
              selectedDate={selected}
              onSelectDate={setSelected}
              onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
              onNextMonth={() => setMonth((m) => addMonths(m, 1))}
              onToday={() => { const t = new Date(); setMonth(startOfMonth(t)); setSelected(t); }}
              compact
            />
          </div>
        )}
      </div>
    </section>
  );
}
