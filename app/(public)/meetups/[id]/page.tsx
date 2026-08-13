'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Plus, Trash2, X } from 'lucide-react';
import MenuPicker from '@/components/meetup/MenuPicker';
import OrderList from '@/components/meetup/OrderList';
import SplitTable from '@/components/meetup/SplitTable';
import PersonChip, { initials } from '@/components/meetup/PersonChip';
import { getVenue, formatNaira } from '@/lib/dining/venues';
import { computeBill } from '@/lib/split/compute';
import {
  addAttendee,
  addLine,
  deleteMeetup,
  removeAttendee,
  removeLine,
  setLinePayers,
  setLineQty,
  setTip,
  updateAttendee,
  useMeetup,
} from '@/lib/meetup/store';

const TIPS = [0, 5, 10, 15];

export default function MeetupPage() {
  const router = useRouter();
  const id = String(useParams().id);
  const meetup = useMeetup(id);
  const [mounted, setMounted] = useState(false);
  const [ordering, setOrdering] = useState<string[]>([]);
  const [showPeople, setShowPeople] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => setMounted(true), []);

  // Default to ordering for the first person at the table.
  useEffect(() => {
    if (!meetup) return;
    setOrdering((prev) => {
      const valid = prev.filter((pid) => meetup.attendees.some((a) => a.id === pid));
      if (valid.length > 0) return valid;
      return meetup.attendees.length ? [meetup.attendees[0].id] : [];
    });
  }, [meetup]);

  const venue = meetup ? getVenue(meetup.venueSlug) : undefined;

  const bill = useMemo(
    () => (meetup && venue ? computeBill(venue, meetup.attendees, meetup.lines, { tipPct: meetup.tipPct }) : null),
    [meetup, venue],
  );

  if (!mounted) return <div className="bg-paper min-h-screen" />;

  if (!meetup || !venue) {
    return (
      <div className="bg-paper min-h-screen">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-24 text-center">
          <p className="font-display text-4xl italic text-obsidian mb-3">This meetup isn&apos;t here.</p>
          <p className="text-obsidian/50 text-sm mb-8">
            Meetups are stored on the device that created them. If this one was made elsewhere, it
            won&apos;t show up here.
          </p>
          <Link
            href="/meetups"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
          >
            <ArrowLeft size={14} /> Back to meetups
          </Link>
        </div>
      </div>
    );
  }

  const when = new Date(`${meetup.date}T${meetup.time || '00:00'}`);
  const dateLabel = Number.isNaN(when.getTime())
    ? meetup.date
    : when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const wholeTable = ordering.length === meetup.attendees.length && meetup.attendees.length > 0;

  function toggleOrdering(pid: string) {
    setOrdering((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]));
  }

  return (
    <div className="bg-paper min-h-screen pb-24 lg:pb-0">
      {/* ═══ HEADER ═══ */}
      <header className="bg-obsidian">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
          <Link
            href="/meetups"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cream/40 hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft size={12} /> Meetups
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="min-w-0">
              <h1 className="font-display text-4xl sm:text-6xl font-light italic text-cream tracking-tight mb-4 leading-none">
                {meetup.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-cream/45">
                <Link href={`/places/${venue.slug}`} className="inline-flex items-center gap-1.5 hover:text-gold transition-colors">
                  <MapPin size={12} className="text-gold" />
                  {venue.name} &middot; {venue.area}
                </Link>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-gold" />
                  {dateLabel}{meetup.time && ` · ${meetup.time}`}
                </span>
              </div>
              {meetup.note && <p className="text-cream/35 text-sm mt-4 max-w-xl">{meetup.note}</p>}
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${meetup.title}"? This cannot be undone.`)) {
                  deleteMeetup(meetup.id);
                  router.push('/meetups');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-cream/15 text-cream/40 hover:border-red-500/60 hover:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] transition-colors self-start shrink-0"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      </header>

      {/* ═══ ORDERING FOR ═══ */}
      <div className="sticky top-16 z-30 bg-paper/95 backdrop-blur-md border-b border-obsidian/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 shrink-0">
            Ordering for
          </span>
          {meetup.attendees.map((a) => (
            <PersonChip
              key={a.id}
              person={a}
              selected={ordering.includes(a.id)}
              onClick={() => toggleOrdering(a.id)}
              size="sm"
            />
          ))}
          <button
            type="button"
            onClick={() => setOrdering(wholeTable ? [meetup.attendees[0]?.id].filter(Boolean) as string[] : meetup.attendees.map((a) => a.id))}
            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] border transition-colors shrink-0 ${
              wholeTable ? 'bg-gold border-gold text-obsidian' : 'border-gold/50 text-gold-dark hover:bg-gold/10'
            }`}
          >
            Whole table
          </button>
          <button
            type="button"
            onClick={() => setShowPeople((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-obsidian/40 hover:text-obsidian transition-colors shrink-0"
          >
            <Plus size={12} /> People
          </button>
        </div>

        {showPeople && (
          <div className="border-t border-obsidian/10 bg-cream">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-4">
                The table &mdash; set a budget and Convivia24 will flag anyone going past it
              </p>
              <div className="space-y-2.5 mb-4">
                {meetup.attendees.map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-obsidian text-cream text-[9px] font-black shrink-0">
                      {initials(a.name)}
                    </span>
                    <input
                      value={a.name}
                      onChange={(e) => updateAttendee(meetup.id, a.id, { name: e.target.value })}
                      aria-label="Name"
                      className="flex-1 min-w-0 bg-transparent border-b border-obsidian/15 focus:border-gold text-obsidian text-sm py-1.5 px-0 outline-none focus:ring-0 transition-colors"
                    />
                    <input
                      value={a.budget ?? ''}
                      onChange={(e) => {
                        const n = Number(e.target.value.replace(/[^0-9]/g, ''));
                        updateAttendee(meetup.id, a.id, { budget: n > 0 ? n : undefined });
                      }}
                      inputMode="numeric"
                      placeholder="Budget ₦"
                      aria-label={`Budget for ${a.name}`}
                      className="w-28 sm:w-36 bg-transparent border-b border-obsidian/15 focus:border-gold text-obsidian text-sm py-1.5 px-0 tabular-nums outline-none focus:ring-0 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttendee(meetup.id, a.id)}
                      disabled={meetup.attendees.length <= 1}
                      aria-label={`Remove ${a.name}`}
                      className="p-1.5 text-obsidian/25 hover:text-red-600 disabled:opacity-20 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newName.trim()) return;
                  addAttendee(meetup.id, newName.trim());
                  setNewName('');
                }}
                className="flex gap-2"
              >
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Add someone…"
                  aria-label="Add someone"
                  className="flex-1 bg-paper border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 text-sm px-3 py-2 outline-none focus:ring-0 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-obsidian hover:bg-obsidian-50 text-cream text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ═══ BODY ═══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
        {/* Menu */}
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-3xl sm:text-4xl italic text-obsidian leading-none">The menu</h2>
            <Link href={`/places/${venue.slug}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 hover:text-gold-dark transition-colors shrink-0">
              About {venue.name}
            </Link>
          </div>

          {ordering.length === 0 && (
            <p className="mb-5 p-4 border border-gold/40 bg-gold/10 text-obsidian/70 text-sm">
              Pick who you are ordering for first &mdash; tap a name above.
            </p>
          )}

          <MenuPicker
            venue={venue}
            disabled={ordering.length === 0}
            countFor={(itemId) =>
              meetup.lines.filter((l) => l.itemId === itemId).reduce((n, l) => n + l.qty, 0)
            }
            onAdd={(item) => addLine(meetup.id, item.id, ordering)}
          />
        </section>

        {/* Order + split */}
        <aside id="split" className="lg:sticky lg:top-32 space-y-8 scroll-mt-32">
          <section>
            <h2 className="font-display text-2xl italic text-obsidian mb-4">The order</h2>
            <OrderList
              venue={venue}
              attendees={meetup.attendees}
              lines={meetup.lines}
              onQty={(lineId, qty) => setLineQty(meetup.id, lineId, qty)}
              onPayers={(lineId, payerIds) => setLinePayers(meetup.id, lineId, payerIds)}
              onRemove={(lineId) => removeLine(meetup.id, lineId)}
            />
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-2xl italic text-obsidian">The split</h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35">Tip</span>
                <div className="flex gap-px bg-obsidian/10 border border-obsidian/15">
                  {TIPS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTip(meetup.id, t)}
                      className={`px-2.5 py-1 text-[10px] font-black tabular-nums transition-colors ${
                        meetup.tipPct === t ? 'bg-obsidian text-cream' : 'bg-cream text-obsidian/45 hover:text-obsidian'
                      }`}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {bill && (
              <div className="bg-cream border border-obsidian/10 p-5">
                <SplitTable bill={bill} />
              </div>
            )}

            <p className="text-obsidian/35 text-[11px] leading-relaxed mt-4">
              Includes {venue.serviceChargePct}% service and {venue.vatPct}% VAT, charged on each
              person&apos;s own share. Convivia24 does not take payment &mdash; settle at the till.
            </p>
          </section>
        </aside>
      </div>

      {/* ═══ MOBILE SUMMARY ═══ */}
      {bill && (
        <a
          href="#split"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-obsidian border-t border-gold/20 px-5 py-3.5 flex items-center justify-between gap-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))]"
        >
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">The bill</p>
            <p className="font-display text-xl italic text-cream leading-none tabular-nums">
              {formatNaira(bill.total)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">Even split</p>
            <p className="font-display text-xl italic text-gold leading-none tabular-nums">
              {formatNaira(bill.evenSplit)}
            </p>
          </div>
        </a>
      )}
    </div>
  );
}
