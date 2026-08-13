'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronRight, MapPin, Plus, Share2, Users } from 'lucide-react';
import { initials } from '@/components/meetup/PersonChip';
import { toast } from '@/components/ui/Toast';
import { useMeetups, type Meetup } from '@/lib/meetup/store';
import { shareMeetup } from '@/lib/meetup/share';
import { computeBill } from '@/lib/split/compute';
import { getVenue, formatNaira } from '@/lib/dining/venues';

export default function MeetupsPage() {
  const meetups = useMeetups();

  // Soonest first; anything already past drops to the bottom.
  const now = Date.now();
  const sorted = [...meetups].sort((a, b) => {
    const ta = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const tb = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    const pastA = ta < now, pastB = tb < now;
    if (pastA !== pastB) return pastA ? 1 : -1;
    return pastA ? tb - ta : ta - tb;
  });

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 md:pt-16 pb-12">
        <div className="flex items-end justify-between gap-5 mb-7 md:mb-10">
          <div>
            <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight leading-none mb-2">
              Meetups
            </h1>
            <p className="text-obsidian/45 text-sm">
              {meetups.length === 0
                ? 'Nothing planned yet.'
                : `${meetups.length} plan${meetups.length === 1 ? '' : 's'} on this device.`}
            </p>
          </div>
          <Link
            href="/meetups/new"
            className="hidden md:inline-flex items-center gap-2 px-6 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            <Plus size={14} /> New meetup
          </Link>
        </div>

        {meetups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-obsidian/10 bg-cream p-8 sm:p-14 text-center"
          >
            <p className="font-display text-3xl italic text-obsidian mb-3">Start with a place.</p>
            <p className="text-obsidian/50 text-sm max-w-sm mx-auto mb-8">
              Pick where you are eating, add the people, and build the order together. The split works
              itself out as you go.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/meetups/new"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gold active:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
              >
                Start a meetup <ArrowRight size={14} />
              </Link>
              <Link
                href="/places"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-obsidian/20 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
              >
                Browse the menus
              </Link>
            </div>
          </motion.div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {sorted.map((m, i) => (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
                >
                  <MeetupCard meetup={m} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

function MeetupCard({ meetup }: { meetup: Meetup }) {
  const venue = getVenue(meetup.venueSlug);
  const bill = venue ? computeBill(venue, meetup.attendees, meetup.lines, { tipPct: meetup.tipPct }) : null;
  const you = bill?.people.find((p) => p.attendeeId === meetup.youId);

  const when = new Date(`${meetup.date}T${meetup.time || '00:00'}`);
  const valid = !Number.isNaN(when.getTime());
  const past = valid && when.getTime() < Date.now();
  const dateLabel = valid
    ? when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    : meetup.date;

  const items = meetup.lines.reduce((n, l) => n + l.qty, 0);

  async function onShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareMeetup(meetup);
    if (result === 'copied') toast('Link copied — paste it to the table');
    else if (result === 'failed') toast('Could not share the link', 'error');
  }

  return (
    <Link
      href={`/meetups/${meetup.id}`}
      className={`group block bg-cream border border-obsidian/10 active:border-gold hover:border-gold/60 active:scale-[0.99] transition-all ${
        past ? 'opacity-60' : ''
      }`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl italic text-obsidian leading-none mb-2 truncate group-hover:text-gold-dark transition-colors">
              {meetup.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-obsidian/45">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={11} className="text-gold-dark" />
                {venue ? venue.name : 'Venue removed'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={11} className="text-gold-dark" />
                {past && <span className="text-obsidian/30">Was </span>}
                {dateLabel}
                {meetup.time && ` · ${meetup.time}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onShare}
            aria-label={`Share ${meetup.title}`}
            className="p-2 -m-1 text-obsidian/30 active:text-gold-dark active:scale-90 transition-all shrink-0"
          >
            <Share2 size={17} />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4 pt-3 border-t border-obsidian/10">
          {/* Faces */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex -space-x-1.5 shrink-0">
              {meetup.attendees.slice(0, 4).map((a) => (
                <span
                  key={a.id}
                  title={a.name}
                  className={`grid place-items-center w-6 h-6 rounded-full text-[8px] font-black ring-2 ring-cream ${
                    a.id === meetup.youId ? 'bg-gold text-obsidian' : 'bg-obsidian text-cream'
                  }`}
                >
                  {initials(a.name)}
                </span>
              ))}
              {meetup.attendees.length > 4 && (
                <span className="grid place-items-center w-6 h-6 rounded-full bg-obsidian/15 text-obsidian/60 text-[8px] font-black ring-2 ring-cream">
                  +{meetup.attendees.length - 4}
                </span>
              )}
            </span>
            <span className="text-[10px] text-obsidian/35 truncate">
              <Users size={10} className="inline -mt-0.5 mr-1" />
              {items === 0 ? 'Nothing ordered' : `${items} item${items === 1 ? '' : 's'}`}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-0.5">
                {you ? 'Your share' : 'The bill'}
              </p>
              <p
                className={`font-display text-xl sm:text-2xl italic leading-none tabular-nums ${
                  you?.overBudget ? 'text-red-600' : 'text-obsidian'
                }`}
              >
                {bill ? formatNaira(you ? you.total : bill.total) : '—'}
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-obsidian/20 group-hover:text-gold-dark group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
