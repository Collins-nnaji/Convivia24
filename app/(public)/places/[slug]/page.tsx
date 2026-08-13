import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Flame, Leaf, Users } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { PriceBand } from '@/components/meetup/VenueCard';
import { VENUES, getVenue, formatNaira } from '@/lib/dining/venues';
import { estimatePerHead } from '@/lib/split/compute';

export function generateStaticParams() {
  return VENUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const venue = getVenue((await params).slug);
  if (!venue) return { title: 'Not found | Convivia24' };
  return {
    title: `${venue.name} · ${venue.area} | Convivia24`,
    description: `${venue.blurb} Full menu and typical spend per head.`,
  };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const venue = getVenue((await params).slug);
  if (!venue) notFound();

  const perHead = estimatePerHead(venue);
  const cheapest = Math.min(...venue.sections.flatMap((s) => s.items.map((i) => i.price)));

  return (
    <div className="bg-obsidian">
      {/* ═══ HEADER ═══ */}
      <section className="relative min-h-[52vh] flex items-end overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src={venue.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-12 pt-24 w-full">
          <Link
            href="/places"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cream/50 hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft size={12} /> All places
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">
              {venue.area} &middot; {venue.city}
            </span>
            <PriceBand band={venue.priceBand} className="text-cream" />
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-light italic text-cream tracking-tight leading-[0.9] mb-4">
            {venue.name}
          </h1>
          <p className="text-cream/60 text-base sm:text-lg max-w-2xl leading-relaxed">{venue.blurb}</p>
        </div>
      </section>

      {/* ═══ THE NUMBERS ═══ */}
      <section className="border-y border-gold/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/10">
            <Stat label="Typical, all in" value={`${formatNaira(perHead)}`} sub="per head" />
            <Stat label="Cheapest thing on it" value={formatNaira(cheapest)} sub="you can eat here for less" />
            <Stat
              label="Service charge"
              value={venue.serviceChargePct === 0 ? 'None' : `${venue.serviceChargePct}%`}
              sub={venue.serviceChargePct === 0 ? 'tip if you like' : 'added to the bill'}
            />
            <Stat label="VAT" value={`${venue.vatPct}%`} sub="on food and service" />
          </div>
        </div>
      </section>

      {/* ═══ MENU ═══ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
            <div>
              <SectionLabel>The menu</SectionLabel>
              <h2 className="font-display text-3xl sm:text-5xl font-light italic text-cream tracking-tight">
                {venue.cuisine}
              </h2>
            </div>
            <Link
              href={`/meetups/new?venue=${venue.slug}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors self-start shrink-0"
            >
              Plan a meetup here <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
            {venue.sections.map((section) => (
              <div key={section.name}>
                <div className="flex items-center gap-3 border-b border-gold/20 pb-3 mb-5">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">{section.name}</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-cream/25">
                    {section.kind === 'drink' ? 'Drink' : 'Food'}
                  </span>
                </div>
                <ul className="space-y-5">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex items-baseline gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-lg italic text-cream leading-snug">{item.name}</span>
                          {item.signature && <Flame size={12} className="text-gold shrink-0" aria-label="Signature" />}
                          {item.veg && <Leaf size={12} className="text-emerald-500/70 shrink-0" aria-label="Vegetarian" />}
                          {item.shareable && <Users size={12} className="text-cream/30 shrink-0" aria-label="For the table" />}
                        </div>
                        {item.note && <p className="text-cream/35 text-xs mt-0.5">{item.note}</p>}
                      </div>
                      <span className="text-cream/70 text-sm tabular-nums shrink-0">{formatNaira(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 flex-wrap mt-12 pt-6 border-t border-gold/10 text-[10px] uppercase tracking-[0.2em] text-cream/30">
            <span className="inline-flex items-center gap-2"><Flame size={12} className="text-gold" /> Signature</span>
            <span className="inline-flex items-center gap-2"><Leaf size={12} className="text-emerald-500/70" /> Vegetarian</span>
            <span className="inline-flex items-center gap-2"><Users size={12} /> Made for the middle of the table</span>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gold">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-2xl sm:text-4xl italic text-obsidian mb-2">
              Eat here, and know the damage first.
            </h2>
            <p className="text-obsidian/60 text-sm">
              Build the order with your table &mdash; everyone sees their own share as it grows.
            </p>
          </div>
          <Link
            href={`/meetups/new?venue=${venue.slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-obsidian hover:bg-obsidian-50 text-cream text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Start a meetup <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-obsidian p-6 sm:p-8">
      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gold/50 mb-2">{label}</p>
      <p className="font-display text-2xl sm:text-3xl italic text-cream leading-none mb-2">{value}</p>
      <p className="text-cream/30 text-[11px]">{sub}</p>
    </div>
  );
}
