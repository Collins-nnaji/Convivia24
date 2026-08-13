'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Plus, Users } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useMeetups, type Meetup } from '@/lib/meetup/store';
import { computeBill } from '@/lib/split/compute';
import { getVenue, formatNaira } from '@/lib/dining/venues';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function MeetupsPage() {
  const meetups = useMeetups();

  return (
    <div className="bg-paper min-h-screen">
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 sm:pb-28">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div variants={fadeUp}>
            <SectionLabel variant="light">Your table</SectionLabel>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10 sm:mb-12">
            <div>
              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic text-obsidian tracking-tight mb-3"
              >
                Meetups.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-obsidian/55 text-base max-w-xl leading-relaxed">
                Every plan you have going, and what it is going to cost you. Meetups live on this device
                until you share them.
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                href="/meetups/new"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
              >
                <Plus size={14} /> New meetup
              </Link>
            </motion.div>
          </div>

          {meetups.length === 0 ? (
            <motion.div variants={fadeUp} className="border border-obsidian/10 bg-cream p-10 sm:p-16 text-center">
              <p className="font-display text-3xl italic text-obsidian mb-3">Nothing planned yet.</p>
              <p className="text-obsidian/50 text-sm max-w-md mx-auto mb-8">
                Pick a place, add the people, and build the order together. The split works itself out
                as you go.
              </p>
              <Link
                href="/places"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                Browse the menus <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {meetups.map((m) => (
                <motion.div key={m.id} variants={fadeUp}>
                  <MeetupRow meetup={m} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}

function MeetupRow({ meetup }: { meetup: Meetup }) {
  const venue = getVenue(meetup.venueSlug);
  const bill = venue
    ? computeBill(venue, meetup.attendees, meetup.lines, { tipPct: meetup.tipPct })
    : null;

  const when = new Date(`${meetup.date}T${meetup.time || '00:00'}`);
  const dateLabel = Number.isNaN(when.getTime())
    ? meetup.date
    : when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <Link
      href={`/meetups/${meetup.id}`}
      className="group flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 bg-cream border border-obsidian/10 hover:border-gold/60 p-6 sm:p-7 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <h2 className="font-display text-2xl sm:text-3xl italic text-obsidian leading-none mb-3 truncate group-hover:text-gold-dark transition-colors">
          {meetup.title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-obsidian/45">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} className="text-gold-dark" />
            {venue ? `${venue.name} · ${venue.area}` : 'Venue removed'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={12} className="text-gold-dark" />
            {dateLabel}{meetup.time && ` · ${meetup.time}`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={12} className="text-gold-dark" />
            {meetup.attendees.length} {meetup.attendees.length === 1 ? 'person' : 'people'}
          </span>
        </div>
      </div>

      <div className="flex items-end sm:items-center gap-8 sm:gap-10 shrink-0">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/35 mb-1">The bill</p>
          <p className="font-display text-2xl italic text-obsidian leading-none tabular-nums">
            {bill ? formatNaira(bill.total) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/35 mb-1">Even split</p>
          <p className="font-display text-2xl italic text-gold-dark leading-none tabular-nums">
            {bill ? formatNaira(bill.evenSplit) : '—'}
          </p>
        </div>
        <ArrowRight size={16} className="text-obsidian/25 group-hover:text-gold-dark group-hover:translate-x-1 transition-all hidden sm:block" />
      </div>
    </Link>
  );
}
