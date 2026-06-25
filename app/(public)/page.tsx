'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, QrCode, ScanLine, Ticket, BarChart3, Search, MapPin, Users } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import EventCard, { type EventCardData } from '@/components/EventCard';
import { CATEGORY_LABELS } from '@/lib/categories';

const TICKER = [
  'Curated Social Gatherings', 'Business Salons · Supper Clubs · Nightlife', 'Approval-Only Guestlists',
  'Digital Lounge · Intent Badges', 'Broadcast Hub · Memory Wall', 'Tickets via Convivia24',
];

const CATEGORIES = ['nightlife', 'conference', 'food', 'party', 'concert', 'festival', 'comedy', 'arts'];

const PILLARS = [
  { icon: Sparkles, title: 'Organizer dashboard', desc: 'Approval-only guestlists, broadcast hub, live revenue analytics, and co-host split payouts — built for salons, supper clubs, and promoters alike.' },
  { icon: Users, title: 'Guest experience', desc: 'A private digital lounge for every event. Intent badges, attendee directory, and one-tap Resonate to connect before you walk in.' },
  { icon: QrCode, title: 'Shared memory wall', desc: 'The morning after, a collaborative visual roll unlocks. Drop photos, react with emojis, keep the community alive for days.' },
];

const STEPS = [
  { icon: Search, title: 'Discover', desc: 'Browse curated gatherings — from daytime business salons to late-night supper clubs and parties.' },
  { icon: Ticket, title: 'Apply or book', desc: 'Open events book instantly. Exclusive listings may require a brief application before your ticket unlocks.' },
  { icon: QrCode, title: 'Lounge, door, memory', desc: 'Enter the digital lounge, scan at the door, and return for the post-event memory wall.' },
];

const ORGANIZER = [
  { icon: Sparkles, title: 'AI event builder', desc: 'Describe your gathering in a sentence. AI writes copy, suggests tiers, and sets day-or-night theming.' },
  { icon: ScanLine, title: 'Guestlist & broadcast', desc: 'Approve applications, message the full list with time-locked cues, track conversion in real time.' },
  { icon: BarChart3, title: 'Financial flow', desc: 'Live revenue, ticket conversion, check-in rates, and transparent payout timelines.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

interface CityMeta { city: string; country: string; count: number }

export default function HomePage() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [cities, setCities] = useState<CityMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then((r) => r.json()).catch(() => ({ events: [] })),
      fetch('/api/meta').then((r) => r.json()).catch(() => ({ cities: [] })),
    ]).then(([ev, meta]) => {
      setEvents(ev.events ?? []);
      setCities((meta.cities ?? []).slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  const featured = events.filter((e) => e.is_featured).slice(0, 3);
  const comingUp = [...events].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)).slice(0, 6);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[72vh] sm:min-h-[90vh] bg-paper flex items-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src="/Homepage.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-paper/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-transparent to-paper/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-28 w-full">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
              <motion.div variants={fadeUp}>
                <SectionLabel>The Experiential Event Platform</SectionLabel>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl min-[400px]:text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light italic tracking-tight text-obsidian leading-[0.92] mb-5 sm:mb-8 text-balance"
              >
                Curated<br />gatherings.
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-1 h-1 rounded-full bg-gold animate-pulse shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] sm:tracking-[0.3em] text-gold-dark">Salons · Supper Clubs · Nightlife · Worldwide</span>
              </motion.div>

              <motion.p variants={fadeUp} className="text-sm sm:text-lg text-obsidian/65 max-w-lg leading-relaxed mb-7 sm:mb-10">
                Convivia24 handles everything from exclusive daytime business mixers to vibrant lifestyle
                experiences by evening — with guestlists, digital lounges, and memory walls built in.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col min-[420px]:flex-row gap-3 sm:gap-4">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] transition-colors"
                >
                  Discover Events <ArrowRight size={14} />
                </Link>
                <Link
                  href="/concierge"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 border border-obsidian/25 text-obsidian text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] hover:border-gold hover:bg-white transition-colors"
                >
                  <Sparkles size={13} /> Ask the AI Concierge
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="bg-gold overflow-hidden py-3 sm:py-4">
        <motion.div className="flex whitespace-nowrap w-max" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="mx-5 sm:mx-8 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] sm:tracking-[0.3em] text-obsidian/70 flex items-center gap-5 sm:gap-8">
              {item}
              <span className="w-1 h-1 rounded-full bg-obsidian/40 inline-block" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ═══ FEATURED ═══ */}
      <section className="bg-paper py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <SectionLabel>Featured This Season</SectionLabel>
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight">
                The ones selling fast.
              </h2>
            </div>
            <Link href="/events" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold transition-colors group self-start">
              See all events <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => <div key={i} className="aspect-[16/10] bg-white border border-obsidian/10 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(featured.length ? featured : comingUp.slice(0, 3)).map((e, i) => <EventCard key={e.slug} event={e} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══ BROWSE BY CITY ═══ */}
      {cities.length > 0 && (
        <section className="bg-cream py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <SectionLabel variant="light">Browse by City</SectionLabel>
            <h2 className="font-display text-3xl sm:text-5xl font-light italic text-obsidian tracking-tight mb-8">
              Wherever you are.
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {cities.map((c) => (
                <Link
                  key={c.city}
                  href={`/events?city=${encodeURIComponent(c.city)}`}
                  className="group bg-white border border-obsidian/10 hover:border-gold/50 hover:shadow-md p-5 transition-all"
                >
                  <MapPin size={16} className="text-gold-dark mb-3" />
                  <p className="font-display text-xl italic text-obsidian group-hover:text-gold-dark transition-colors leading-tight">{c.city}</p>
                  <p className="text-obsidian/40 text-xs mt-0.5">{c.country}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gold-dark mt-3">{c.count} event{Number(c.count) > 1 ? 's' : ''}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ COMING UP ═══ */}
      {comingUp.length > 3 && (
        <section className="bg-paper py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <SectionLabel>Coming Up</SectionLabel>
                <h2 className="font-display text-3xl sm:text-5xl font-light italic text-obsidian tracking-tight">
                  Next on the calendar.
                </h2>
              </div>
              <Link href="/events?when=month" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-gold transition-colors group self-start">
                This month <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {comingUp.map((e, i) => <EventCard key={e.slug} event={e} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CATEGORIES ═══ */}
      <section className="bg-cream py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel variant="light">Browse by Vibe</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/events?category=${c}`}
                className="px-5 py-3 bg-white border border-obsidian/15 hover:border-gold hover:bg-gold hover:text-obsidian text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                {CATEGORY_LABELS[c]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section className="bg-paper py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel>The Three Pillars</SectionLabel>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-12">
            One platform.<br />Every kind of gathering.
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="glass-card p-8 sm:p-10 glass-card-hover">
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-display text-5xl italic text-gold/30">{String(i + 1).padStart(2, '0')}</span>
                  <p.icon className="text-gold-dark" size={22} />
                </div>
                <h3 className="font-display text-2xl italic text-obsidian mb-3">{p.title}</h3>
                <p className="text-obsidian/55 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-paper py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel>For Guests</SectionLabel>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight mb-12">
            From scroll to door<br />in under a minute.
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-white border border-obsidian/10 p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-display text-5xl italic text-gold/30">{String(i + 1).padStart(2, '0')}</span>
                  <s.icon className="text-gold-dark" size={22} />
                </div>
                <h3 className="font-display text-2xl italic text-obsidian mb-3">{s.title}</h3>
                <p className="text-obsidian/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ IMAGE BREAK / CONCIERGE ═══ */}
      <section className="relative">
        <img src="/Convivium2.png" alt="" className="w-full h-[34vh] sm:h-[44vh] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-obsidian/30 to-obsidian/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">AI Concierge</p>
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl italic text-white mb-5 drop-shadow">&ldquo;Find me something tonight.&rdquo;</h2>
            <Link href="/concierge" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
              <Sparkles size={14} /> Ask the Concierge
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOR ORGANIZERS ═══ */}
      <section className="bg-cream py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start mb-12">
            <div>
              <SectionLabel variant="light">For Organizers</SectionLabel>
              <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-light italic text-obsidian tracking-tight">
                Host gatherings<br />worth remembering.
              </h2>
            </div>
            <p className="text-obsidian/60 text-base sm:text-lg leading-relaxed lg:pt-10">
              Whether you run elite networking circles, creative agencies, or supper clubs —
              Convivia24 gives you premium host tools: approval guestlists, broadcast hub,
              financial flow, and a guest experience that sells itself.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {ORGANIZER.map((o) => (
              <div key={o.title} className="bg-white border border-obsidian/10 hover:border-gold/40 p-7 transition-colors">
                <o.icon className="text-gold-dark mb-4" size={24} />
                <h3 className="font-display text-xl italic text-obsidian mb-2">{o.title}</h3>
                <p className="text-obsidian/55 text-sm leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/create" className="inline-flex items-center gap-2 px-7 py-3.5 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors">
              Create an Event <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">Your next gathering starts here.</h2>
            <p className="text-obsidian/60 text-sm">Business salons · Supper clubs · Nightlife · In every city the culture goes</p>
          </div>
          <Link href="/events" className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0">
            Discover Events <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
