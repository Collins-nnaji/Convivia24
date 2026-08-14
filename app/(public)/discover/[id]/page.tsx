'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Check, MapPin, Users } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { initials } from '@/components/meetup/PersonChip';
import { toast } from '@/components/ui/Toast';
import { formatNaira } from '@/lib/dining/venues';
import { estimatePerHead } from '@/lib/split/compute';
import { getTable, seatsLeft, tableDate, tableDateKey, tableVenue } from '@/lib/social/tables';
import { joinTable, saveProfile, useProfile } from '@/lib/meetup/store';

/**
 * One open table. Everything someone needs to decide whether to spend an
 * evening with these people: who is hosting and why, who is already going, and
 * the honest number.
 */
export default function TablePage() {
  const router = useRouter();
  const id = String(useParams().id);
  const table = getTable(id);
  const profile = useProfile();
  const [name, setName] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  if (!table) {
    return (
      <div className="bg-paper min-h-screen px-5 py-24 text-center">
        <p className="font-display text-4xl italic text-obsidian mb-3">That table is gone.</p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian text-cream text-[11px] font-black uppercase tracking-[0.2em]"
        >
          Open tables <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const venue = tableVenue(table)!;
  const left = seatsLeft(table);
  const when = tableDate(table);
  const yourName = (name.trim() || profile.name).trim();

  function join() {
    if (!yourName) {
      // Say why, and put them in front of the field rather than leaving them to
      // find it — it is below the fold behind a fixed bar.
      toast('Tell them what to call you first');
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameRef.current?.focus();
      return;
    }
    // Anywhere someone tells us their name counts as onboarding. Asking again
    // two screens later is the app not paying attention.
    if (!profile.onboarded || !profile.name) {
      saveProfile({ name: yourName, onboarded: true });
    }

    const meetup = joinTable({
      title: table!.title,
      venueSlug: table!.venueSlug,
      date: tableDateKey(table!),
      time: table!.time,
      note: `Hosted by ${table!.host}. ${table!.vibe}`,
      going: table!.going,
      yourName,
      yourBudget: profile.defaultBudget ?? table!.budgetGuide,
    });
    toast(`You're in. ${table!.host} has been told.`);
    router.push(`/meetups/${meetup.id}`);
  }

  return (
    <div className="bg-paper min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))]">
      {/* Hero */}
      <div className="relative">
        <SmartImage
          src={venue.image}
          alt=""
          priority
          sizes="100vw"
          wrapperClassName="w-full aspect-[4/3] sm:aspect-[21/9]"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-obsidian/45 to-obsidian/25" />
        <div className="absolute bottom-0 inset-x-0 px-5 pb-5 max-w-2xl mx-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
            Hosted by {table.host}
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-light italic text-cream tracking-tight leading-none">
            {table.title}
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto px-5 pt-6"
      >
        <p className="font-display text-2xl italic text-obsidian/85 leading-snug mb-5">{table.vibe}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {table.tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 border border-obsidian/15 text-[9px] font-black uppercase tracking-[0.12em] text-obsidian/50"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Facts */}
        <div className="grid grid-cols-2 gap-px bg-obsidian/10 border border-obsidian/10 mb-7">
          <Fact
            icon={<MapPin size={12} />}
            label="Where"
            value={venue.name}
            sub={`${venue.area} · ${venue.cuisine}`}
            href={`/places/${venue.slug}`}
          />
          <Fact
            icon={<CalendarDays size={12} />}
            label="When"
            value={when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
            sub={table.time}
          />
          <Fact
            icon={<Users size={12} />}
            label="Seats"
            value={left === 0 ? 'Full' : `${left} left`}
            sub={`${table.taken} of ${table.seats} taken`}
          />
          <Fact
            label="Expect to spend"
            value={formatNaira(table.budgetGuide)}
            sub={`typical here is ${formatNaira(estimatePerHead(venue))}`}
          />
        </div>

        {/* Host note */}
        <div className="border-l-2 border-gold pl-4 mb-7">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
            {table.host} says
          </p>
          <p className="text-obsidian/70 text-[15px] leading-relaxed">{table.hostNote}</p>
        </div>

        {/* Going */}
        <section className="mb-7">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-3">
            Already going
          </p>
          <div className="flex flex-wrap gap-2">
            {table.going.map((person) => (
              <span
                key={person}
                className="inline-flex items-center gap-2 pl-1 pr-3 py-1 border border-obsidian/15"
              >
                <span className="grid place-items-center w-6 h-6 rounded-full bg-obsidian text-cream text-[8px] font-black">
                  {initials(person)}
                </span>
                <span className="text-obsidian/70 text-xs">{person}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Who are you */}
        {!profile.name && (
          <label className="block mb-6">
            <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-2">
              What should they call you?
            </span>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 px-4 py-3.5 outline-none focus:ring-0 transition-colors"
            />
          </label>
        )}

        <p className="text-obsidian/40 text-xs leading-relaxed">
          Taking a seat saves the plan to your device with everyone already at it, so you can build
          the order together. Nothing is charged — you settle at the till.
        </p>
      </motion.div>

      {/* Commit bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-obsidian border-t border-gold/25 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">
              {left === 0 ? 'This one is full' : `${left} seat${left === 1 ? '' : 's'} left`}
            </p>
            <p className="font-display text-xl italic text-gold leading-none tabular-nums">
              ≈ {formatNaira(table.budgetGuide)} <span className="text-cream/40 text-sm not-italic">a head</span>
            </p>
          </div>
          <button
            type="button"
            onClick={join}
            disabled={left === 0}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold active:bg-gold-light disabled:opacity-40 text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.97] transition-transform shrink-0"
          >
            <Check size={14} /> Take a seat
          </button>
        </div>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-1.5">
        {icon}
        {label}
      </p>
      <p className="font-display text-xl italic text-obsidian leading-none mb-1">{value}</p>
      <p className="text-obsidian/40 text-[11px]">{sub}</p>
    </>
  );

  return href ? (
    <Link href={href} className="bg-cream p-4 active:bg-paper transition-colors">
      {body}
    </Link>
  ) : (
    <div className="bg-cream p-4">{body}</div>
  );
}
