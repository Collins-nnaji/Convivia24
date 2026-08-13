import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { estimatePerHead } from '@/lib/split/compute';
import { formatNaira, type Venue } from '@/lib/dining/venues';

export function PriceBand({ band, className = '' }: { band: number; className?: string }) {
  return (
    <span className={`text-[11px] font-black tracking-[0.15em] ${className}`} aria-label={`Price band ${band} of 4`}>
      <span className="text-gold">{'₦'.repeat(band)}</span>
      <span className="text-current opacity-25">{'₦'.repeat(4 - band)}</span>
    </span>
  );
}

export default function VenueCard({ venue, href }: { venue: Venue; href?: string }) {
  const dishes = venue.sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <Link
      href={href ?? `/places/${venue.slug}`}
      className="group flex flex-col bg-obsidian border border-gold/10 hover:border-gold/40 transition-colors duration-300 overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={venue.image}
          alt={venue.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/70 mb-1">
              {venue.area} &middot; {venue.city}
            </p>
            <h3 className="font-display text-2xl italic text-cream leading-none">{venue.name}</h3>
          </div>
          <PriceBand band={venue.priceBand} className="text-cream mb-1" />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cream/30 mb-3">{venue.cuisine}</p>
        <p className="text-cream/45 text-sm leading-relaxed mb-5 flex-1">{venue.blurb}</p>

        <div className="flex items-end justify-between gap-4 border-t border-gold/10 pt-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/30 mb-1">Typical, all in</p>
            <p className="font-display text-xl italic text-gold leading-none">
              {formatNaira(estimatePerHead(venue))}
              <span className="text-cream/30 text-xs not-italic font-sans"> / head</span>
            </p>
          </div>
          <span className="text-gold/60 group-hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-1.5 transition-colors shrink-0">
            {dishes} on the menu <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}
