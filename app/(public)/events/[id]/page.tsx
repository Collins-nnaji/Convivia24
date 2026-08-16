'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, ShoppingBag, Star } from 'lucide-react';
import { formatEventWhen, getEvent } from '@/lib/events/catalog';
import { venueRating } from '@/lib/venues/reviews';
import { formatNgn } from '@/lib/drinks/catalog';
import { getWallet, isEnrolled, rsvpEvent } from '@/lib/loyalty/store';
import { GraphicBanner } from '@/components/graphics/NightArt';
import { tagToArt } from '@/components/graphics/NightArt';

export default function EventDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const event = useMemo(() => getEvent(id), [id]);
  const [msg, setMsg] = useState('');
  const [going, setGoing] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const w = getWallet();
    setEnrolled(isEnrolled(w));
    if (event) setGoing(w.rsvps.includes(event.id));
  }, [event]);

  if (!event) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-3">Event not found</h1>
          <Link href="/events" className="text-ember text-sm font-medium">
            ← Back to events
          </Link>
        </div>
      </section>
    );
  }

  const rating = venueRating(event.venue.slug);

  function rsvp() {
    const result = rsvpEvent(event!.id, event!.title);
    if ('error' in result) {
      setMsg(result.error);
      return;
    }
    setGoing(true);
    setMsg(`You're on the list · ${result.points.toLocaleString('en-NG')} pts on your card`);
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <GraphicBanner kicker={event.tag} title={event.title} kind={tagToArt(event.tag)} />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45 hover:text-ember mb-6"
        >
          <ArrowLeft size={12} /> Events
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <p className="text-sm text-obsidian/55 leading-relaxed mb-6">{event.blurb}</p>
          <dl className="space-y-3 text-sm mb-8">
            <div className="flex gap-3">
              <CalendarDays size={16} className="text-ember mt-0.5" />
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">When</dt>
                <dd>{formatEventWhen(event)}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin size={16} className="text-ember mt-0.5" />
              <div>
                <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-obsidian/40">Where</dt>
                <dd>
                  {event.venue.name} · {event.venue.address}
                </dd>
              </div>
            </div>
          </dl>

          <Link
            href={`/events/venues/${event.venue.slug}`}
            className="block bg-white border border-obsidian/8 p-4 hover:border-ember/35 transition-colors"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-ember mb-1">Venue</p>
            <p className="font-semibold">{event.venue.name}</p>
            <p className="text-xs text-obsidian/50 mt-1">{event.venue.tagline}</p>
            <p className="text-[11px] text-obsidian/45 mt-2 flex items-center gap-1">
              <Star size={11} className="text-ember" fill="currentColor" />
              {rating.avg.toFixed(1)} · {rating.count} reviews
            </p>
            <p className="text-[11px] text-ember mt-2">{event.venue.cardPerk}</p>
          </Link>
        </div>

        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-obsidian/8 p-6 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">Tonight&apos;s move</p>
            {event.coverNgn ? (
              <p className="text-sm text-obsidian/60 mb-4">
                Door from <span className="font-semibold text-obsidian">{formatNgn(event.coverNgn)}</span> · {event.expected}
              </p>
            ) : (
              <p className="text-sm text-obsidian/60 mb-4">{event.expected}</p>
            )}
            <button
              type="button"
              onClick={rsvp}
              disabled={going}
              className="w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60 mb-3"
            >
              {going ? 'You are on the list' : 'RSVP · earn 200 pts'}
            </button>
            {!enrolled && (
              <p className="text-[11px] text-obsidian/40 mb-3">
                <Link href="/card" className="text-ember">
                  Activate your Guest Card
                </Link>{' '}
                to bank the points.
              </p>
            )}
            <Link
              href={`/checkout?event=${event.id}&venue=${encodeURIComponent(event.venue.name)}&area=${encodeURIComponent(event.venue.area)}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.14em] hover:border-ember hover:text-ember"
            >
              <ShoppingBag size={14} /> Order drinks to this venue
            </Link>
            {msg && <p className="text-xs text-ember mt-3">{msg}</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}
