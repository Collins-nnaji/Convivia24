import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import NightArt, { tagToArt } from '@/components/graphics/NightArt';
import { formatEventWhen, type ResolvedEvent } from '@/lib/events/catalog';
import { formatKm, haversineKm } from '@/lib/geo/lagos';

export default function EventDisplayCard({
  event,
  here,
}: {
  event: ResolvedEvent;
  here?: { lat: number; lng: number } | null;
}) {
  const km = here ? haversineKm(here, event.venue) : null;
  return (
    <Link
      href={`/events/${event.id}`}
      className="group bg-white border border-obsidian/8 hover:border-ember/35 transition-colors overflow-hidden shadow-sm flex flex-col"
    >
      <NightArt kind={tagToArt(event.tag)} label={event.tag} className="aspect-[16/10]" />
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-ember mb-1 flex items-center gap-1">
          <CalendarDays size={11} /> {formatEventWhen(event)}
        </p>
        <h3 className="font-semibold text-obsidian leading-snug">{event.title}</h3>
        <p className="text-xs text-obsidian/50 mt-1.5 leading-relaxed line-clamp-2">{event.blurb}</p>
        <p className="text-xs text-obsidian/45 mt-auto pt-3 flex items-center gap-1">
          <MapPin size={11} /> {event.venue.name} · {event.venue.area}
          {km != null && <span className="text-obsidian/35">· {formatKm(km)}</span>}
        </p>
      </div>
    </Link>
  );
}
