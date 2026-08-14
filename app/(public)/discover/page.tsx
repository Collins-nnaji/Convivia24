'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { initials } from '@/components/meetup/PersonChip';
import { formatNaira } from '@/lib/dining/venues';
import { OPEN_TABLES, allTags, seatsLeft, tableDate, tableVenue, type OpenTable } from '@/lib/social/tables';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/**
 * Open tables — the half of the idea that is about who you eat with, not what
 * it costs. Every card leads with the vibe and the seats left, because those
 * are what someone decides on.
 */
export default function DiscoverPage() {
  const [tag, setTag] = useState<string | null>(null);
  const tags = allTags();

  const tables = useMemo(
    () => OPEN_TABLES.filter((t) => !tag || t.tags.includes(tag)).sort((a, b) => a.inDays - b.inDays),
    [tag],
  );

  return (
    <div className="bg-paper min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 pt-6 md:pt-16 pb-12">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight leading-none mb-2"
          >
            Open tables.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-obsidian/50 text-sm sm:text-base leading-relaxed mb-6">
            Gatherings with a seat spare. Someone is already going — you just say yes, and you know
            what the evening costs before you do.
          </motion.p>

          {/* Vibe filter */}
          <motion.div
            variants={fadeUp}
            className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] md:static z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-2.5 sm:py-0 bg-paper/95 backdrop-blur-md sm:bg-transparent mb-6 sm:mb-8"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Chip label="Everything" active={tag === null} onClick={() => setTag(null)} />
              {tags.map((t) => (
                <Chip key={t} label={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} />
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            {tables.map((t) => (
              <motion.div key={t.id} variants={fadeUp}>
                <TableCard table={t} />
              </motion.div>
            ))}
          </div>

          {tables.length === 0 && (
            <p className="text-obsidian/40 text-sm text-center py-12 border border-obsidian/10">
              No open tables with that vibe this week.
            </p>
          )}

          <motion.div variants={fadeUp} className="mt-10 pt-8 border-t border-obsidian/10">
            <p className="font-display text-2xl italic text-obsidian mb-2">Host your own.</p>
            <p className="text-obsidian/50 text-sm mb-5">
              Pick a place, say what kind of evening it is, and leave a seat spare.
            </p>
            <Link
              href="/meetups/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-obsidian active:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-transform"
            >
              Start a table <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.12em] whitespace-nowrap border shrink-0 active:scale-95 transition-all ${
        active ? 'bg-obsidian border-obsidian text-cream' : 'border-obsidian/20 text-obsidian/50'
      }`}
    >
      {label}
    </button>
  );
}

function TableCard({ table }: { table: OpenTable }) {
  const venue = tableVenue(table);
  const left = seatsLeft(table);
  const when = tableDate(table);

  return (
    <Link
      href={`/discover/${table.id}`}
      className="group block bg-cream border border-obsidian/10 active:border-gold hover:border-gold/60 active:scale-[0.99] transition-all overflow-hidden"
    >
      {venue && (
        <div className="relative">
          <SmartImage
            src={venue.image}
            alt=""
            sizes="(max-width: 640px) 100vw, 640px"
            wrapperClassName="w-full aspect-[16/7]"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/25 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold/80 mb-1">
                Hosted by {table.host}
              </p>
              <h2 className="font-display text-2xl italic text-cream leading-none truncate">{table.title}</h2>
            </div>
            <span
              className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] shrink-0 ${
                left <= 2 ? 'bg-gold text-obsidian' : 'bg-obsidian/70 text-cream'
              }`}
            >
              {left === 0 ? 'Full' : `${left} seat${left === 1 ? '' : 's'} left`}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <p className="font-display text-lg italic text-obsidian/80 leading-snug mb-4">{table.vibe}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-obsidian/45 mb-4">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={11} className="text-gold-dark" />
            {venue?.name} &middot; {venue?.area}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={11} className="text-gold-dark" />
            {when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} &middot;{' '}
            {table.time}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-obsidian/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex -space-x-1.5 shrink-0">
              {table.going.slice(0, 4).map((name) => (
                <span
                  key={name}
                  title={name}
                  className="grid place-items-center w-6 h-6 rounded-full bg-obsidian text-cream text-[8px] font-black ring-2 ring-cream"
                >
                  {initials(name)}
                </span>
              ))}
              {table.going.length > 4 && (
                <span className="grid place-items-center w-6 h-6 rounded-full bg-obsidian/15 text-obsidian/60 text-[8px] font-black ring-2 ring-cream">
                  +{table.going.length - 4}
                </span>
              )}
            </span>
            <span className="text-[10px] text-obsidian/35">
              <Users size={10} className="inline -mt-0.5 mr-1" />
              {table.taken} going
            </span>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-0.5">
              Expect
            </p>
            <p className="font-display text-lg italic text-gold-dark leading-none tabular-nums">
              {formatNaira(table.budgetGuide)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
