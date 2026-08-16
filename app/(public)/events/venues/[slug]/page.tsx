'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { getVenue, VENUE_KIND_LABELS } from '@/lib/venues/catalog';
import { addReview, reviewsForVenue, venueRating } from '@/lib/venues/reviews';
import { eventsAtVenue, formatEventWhen } from '@/lib/events/catalog';
import { checkInVenue, earnReview, getWallet, isEnrolled } from '@/lib/loyalty/store';
import { formatNgn } from '@/lib/drinks/catalog';
import { GraphicBanner } from '@/components/graphics/NightArt';
import NightArt from '@/components/graphics/NightArt';

export default function VenueDetailPage() {
  const params = useParams();
  const slug = String(params.slug || '');
  const venue = useMemo(() => getVenue(slug), [slug]);
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState('');
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [stars, setStars] = useState(5);

  const reviews = useMemo(() => (venue ? reviewsForVenue(venue.slug) : []), [venue, tick]);
  const rating = useMemo(() => (venue ? venueRating(venue.slug) : { avg: 0, count: 0 }), [venue, tick]);
  const upcoming = useMemo(() => (venue ? eventsAtVenue(venue.slug) : []), [venue]);

  if (!venue) {
    return (
      <section className="bg-paper min-h-[60vh] px-5 py-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-3">Venue not found</h1>
          <Link href="/events?tab=venues" className="text-ember text-sm font-medium">
            ← Back to venues
          </Link>
        </div>
      </section>
    );
  }

  function onCheckIn() {
    const result = checkInVenue(venue!.slug, venue!.name);
    if ('error' in result) setMsg(result.error);
    else setMsg(`Checked in · ${result.points.toLocaleString('en-NG')} pts`);
  }

  function onReview(e: FormEvent) {
    e.preventDefault();
    const review = addReview({ venueSlug: venue!.slug, author: author || getWallet().name, rating: stars, body });
    if (!review) {
      setMsg('Write a short review first.');
      return;
    }
    earnReview(venue!.slug, venue!.name);
    setBody('');
    setTick((n) => n + 1);
    setMsg('Review posted.');
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <GraphicBanner
        kicker={VENUE_KIND_LABELS[venue.kind]}
        title={venue.name}
        kind={venue.kind}
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        <Link
          href="/events?tab=venues"
          className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.14em] text-obsidian/45 hover:text-ember mb-6"
        >
          <ArrowLeft size={12} /> Venues
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <p className="text-sm text-obsidian/55 leading-relaxed">{venue.about}</p>
            <p className="text-xs text-obsidian/40 mt-3 flex items-center gap-1">
              <MapPin size={12} /> {venue.address} · {venue.hours}
            </p>
            <p className="text-sm text-ember mt-3 font-medium">Card perk · {venue.cardPerk}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([venue.kind, 'lounge', 'club'] as const).map((kind, i) => (
              <NightArt key={`${kind}-${i}`} kind={kind} className="aspect-[4/3]" />
            ))}
          </div>

          <div>
            <h2 className="font-bold text-obsidian mb-4">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-obsidian/45">No listed nights this week.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((ev) => (
                  <li key={ev.id}>
                    <Link
                      href={`/events/${ev.id}`}
                      className="flex items-center justify-between gap-4 bg-white border border-obsidian/8 p-3 hover:border-ember/35"
                    >
                      <div>
                        <p className="text-sm font-semibold">{ev.title}</p>
                        <p className="text-[11px] text-obsidian/45">{formatEventWhen(ev)}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-ember">Open</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="font-bold text-obsidian mb-1 flex items-center gap-2">
              Reviews
              <span className="text-sm font-normal text-obsidian/45 flex items-center gap-1">
                <Star size={13} className="text-ember" fill="currentColor" />
                {rating.avg.toFixed(1)} · {rating.count}
              </span>
            </h2>
            <ul className="space-y-3 mt-4">
              {reviews.map((r) => (
                <li key={r.id} className="bg-white border border-obsidian/8 p-4">
                  <p className="text-sm font-semibold">
                    {r.author}{' '}
                    <span className="text-ember font-normal text-xs">{'★'.repeat(r.rating)}</span>
                  </p>
                  <p className="text-sm text-obsidian/60 mt-1 leading-relaxed">{r.body}</p>
                </li>
              ))}
            </ul>

            <form onSubmit={onReview} className="mt-6 bg-white border border-obsidian/8 p-4 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40">Write a review</p>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    className={n <= stars ? 'text-ember' : 'text-obsidian/20'}
                    aria-label={`${n} stars`}
                  >
                    <Star size={16} fill={n <= stars ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="How was the room?"
                className="w-full border border-obsidian/10 focus:border-ember focus:ring-0 text-sm p-2"
              />
              <button type="submit" className="px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]">
                Post review · 150 pts
              </button>
            </form>
          </div>
        </div>

        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-obsidian/8 p-6 shadow-sm">
            {venue.coverNgn ? (
              <p className="text-sm text-obsidian/55 mb-4">
                Typical door <span className="font-semibold text-obsidian">{formatNgn(venue.coverNgn)}</span>
              </p>
            ) : (
              <p className="text-sm text-obsidian/55 mb-4">No cover most nights.</p>
            )}
            <button
              type="button"
              onClick={onCheckIn}
              className="w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] mb-3"
            >
              Check in · 100 pts
            </button>
            <Link
              href={`/checkout?venue=${encodeURIComponent(venue.name)}&area=${encodeURIComponent(venue.area)}`}
              className="w-full inline-flex items-center justify-center py-3.5 border border-obsidian/15 text-[11px] font-black uppercase tracking-[0.14em] hover:border-ember hover:text-ember"
            >
              Order drinks here
            </Link>
            {!isEnrolled() && (
              <p className="text-[11px] text-obsidian/40 mt-3">
                <Link href="/card" className="text-ember">
                  Activate your Guest Card
                </Link>{' '}
                for {venue.cardDiscountPct}% off table bottles.
              </p>
            )}
            {msg && <p className="text-xs text-ember mt-3">{msg}</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}
