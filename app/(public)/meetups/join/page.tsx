'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';
import { initials } from '@/components/meetup/PersonChip';
import { decodeMeetup, type DecodedMeetup } from '@/lib/meetup/share';
import { importMeetup, setYou } from '@/lib/meetup/store';
import { getVenue, formatNaira, getMenuItem } from '@/lib/dining/venues';
import { computeBill } from '@/lib/split/compute';

/**
 * The other end of a share link. The plan rides in the URL fragment, so this
 * page can preview the whole evening — the table, the order, and what each
 * person is carrying — before anyone commits it to their device.
 */
export default function JoinPage() {
  const router = useRouter();
  const [decoded, setDecoded] = useState<DecodedMeetup | null | 'pending'>('pending');
  const [me, setMe] = useState<number | null>(null);

  useEffect(() => {
    const code = window.location.hash.replace(/^#/, '');
    setDecoded(code ? decodeMeetup(code) : null);
  }, []);

  if (decoded === 'pending') {
    return <div className="bg-paper min-h-screen" />;
  }

  const venue = decoded ? getVenue(decoded.venueSlug) : undefined;

  if (!decoded || !venue) {
    return (
      <div className="bg-paper min-h-screen px-5 py-20 text-center">
        <p className="font-display text-4xl italic text-obsidian mb-3">That link didn&apos;t open.</p>
        <p className="text-obsidian/50 text-sm mb-8 max-w-sm mx-auto">
          It may have been cut short on the way — links break when a chat app wraps them. Ask for the
          whole thing, or start the meetup yourself.
        </p>
        <Link
          href="/meetups/new"
          className="inline-flex items-center gap-2 px-7 py-4 bg-gold text-obsidian text-[11px] font-black uppercase tracking-[0.2em]"
        >
          Start a meetup <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // Preview the split using throwaway ids — nothing is stored until they accept.
  const previewAttendees = decoded.attendees.map((a, i) => ({ id: String(i), name: a.name, budget: a.budget }));
  const previewLines = decoded.lines.map((l, i) => ({
    id: String(i),
    itemId: l.itemId,
    qty: l.qty,
    payerIds: l.payerIndexes.map(String),
  }));
  const bill = computeBill(venue, previewAttendees, previewLines, { tipPct: decoded.tipPct });

  const when = new Date(`${decoded.date}T${decoded.time || '00:00'}`);
  const dateLabel = Number.isNaN(when.getTime())
    ? decoded.date
    : when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  function accept() {
    const meetup = importMeetup(decoded as DecodedMeetup);
    if (me != null) setYou(meetup.id, meetup.attendees[me].id);
    router.push(`/meetups/${meetup.id}`);
  }

  const yourTotal = me != null ? bill.people[me].total : null;

  return (
    <div className="bg-paper min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <div className="max-w-2xl mx-auto px-5 py-8 md:py-14">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-dark mb-3">
            You have been invited
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-light italic text-obsidian tracking-tight mb-5 leading-none">
            {decoded.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-obsidian/45 mb-8">
            <Link href={`/places/${venue.slug}`} className="inline-flex items-center gap-1.5 active:text-gold-dark">
              <MapPin size={12} className="text-gold-dark" />
              {venue.name} &middot; {venue.area}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} className="text-gold-dark" />
              {dateLabel}
              {decoded.time && ` · ${decoded.time}`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} className="text-gold-dark" />
              {decoded.attendees.length} at the table
            </span>
          </div>

          {decoded.note && (
            <p className="text-obsidian/60 text-sm border-l-2 border-gold/40 pl-4 mb-8">{decoded.note}</p>
          )}

          {/* Who are you? */}
          <section className="mb-8">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-3">
              Which one is you?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {bill.people.map((p, i) => (
                <button
                  key={p.attendeeId}
                  type="button"
                  onClick={() => setMe(me === i ? null : i)}
                  aria-pressed={me === i}
                  className={`flex items-center gap-3 p-3 border text-left active:scale-[0.98] transition-all ${
                    me === i ? 'bg-obsidian border-obsidian text-cream' : 'bg-cream border-obsidian/15 text-obsidian'
                  }`}
                >
                  <span
                    className={`grid place-items-center w-8 h-8 rounded-full text-[10px] font-black shrink-0 ${
                      me === i ? 'bg-gold text-obsidian' : 'bg-obsidian/10 text-obsidian/60'
                    }`}
                  >
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{p.name}</span>
                    <span className={`block text-xs tabular-nums ${me === i ? 'text-gold' : 'text-obsidian/45'}`}>
                      {formatNaira(p.total)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* The order so far */}
          <section className="mb-8">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-3">
              On the order already
            </p>
            {previewLines.length === 0 ? (
              <p className="text-obsidian/40 text-sm">Nothing yet — you are early.</p>
            ) : (
              <ul className="divide-y divide-obsidian/10 border-y border-obsidian/10">
                {previewLines.map((l) => {
                  const item = getMenuItem(venue, l.itemId);
                  if (!item) return null;
                  return (
                    <li key={l.id} className="py-2.5 flex items-baseline justify-between gap-4">
                      <span className="text-obsidian/70 text-sm min-w-0">
                        <span className="text-obsidian/40 tabular-nums mr-2">{l.qty}×</span>
                        {item.name}
                        {l.payerIds.length > 1 && (
                          <span className="text-obsidian/35 text-xs"> · split {l.payerIds.length} ways</span>
                        )}
                      </span>
                      <span className="text-obsidian/50 text-sm tabular-nums shrink-0">
                        {formatNaira(item.price * l.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <p className="text-obsidian/40 text-xs leading-relaxed">
            Accepting saves your own copy of this plan. Nothing is charged — Convivia24 never takes
            payment, it just tells everyone what they owe.
          </p>
        </motion.div>
      </div>

      {/* Commit bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-obsidian border-t border-gold/25 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">
              {yourTotal != null ? 'Your share' : 'The bill'}
            </p>
            <p className="font-display text-xl italic text-gold leading-none tabular-nums">
              {formatNaira(yourTotal ?? bill.total)}
            </p>
          </div>
          <button
            type="button"
            onClick={accept}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold active:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.97] transition-transform"
          >
            I&apos;m in <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
