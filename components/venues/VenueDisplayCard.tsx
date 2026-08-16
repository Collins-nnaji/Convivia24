import Link from 'next/link';
import { Star } from 'lucide-react';
import NightArt from '@/components/graphics/NightArt';
import { VENUE_KIND_LABELS, type Venue } from '@/lib/venues/catalog';
import { venueRating } from '@/lib/venues/reviews';
import { formatKm } from '@/lib/geo/lagos';

export default function VenueDisplayCard({ venue, km }: { venue: Venue; km?: number }) {
  const { avg, count } = venueRating(venue.slug);
  return (
    <Link
      href={`/events/venues/${venue.slug}`}
      className="group bg-white border border-obsidian/8 hover:border-ember/35 transition-colors overflow-hidden shadow-sm flex flex-col"
    >
      <NightArt kind={venue.kind} label={VENUE_KIND_LABELS[venue.kind]} className="aspect-[16/10]" />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-obsidian">{venue.name}</h3>
        <p className="text-xs text-obsidian/50 mt-0.5">
          {venue.area}
          {km != null && ` · ${formatKm(km)}`}
        </p>
        <p className="text-xs text-obsidian/50 mt-2 leading-relaxed line-clamp-2">{venue.tagline}</p>
        <p className="text-[11px] text-obsidian/55 mt-auto pt-3 flex items-center gap-1">
          <Star size={11} className="text-ember" fill="currentColor" />
          {avg.toFixed(1)} · {count} reviews
        </p>
      </div>
    </Link>
  );
}
