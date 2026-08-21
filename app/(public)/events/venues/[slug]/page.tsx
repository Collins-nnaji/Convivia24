'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Heart,
  Image as ImageIcon,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Globe,
  Users,
} from 'lucide-react';
import { useUser } from '@/components/auth/AuthProvider';
import { formatEventWhen, type ResolvedEvent } from '@/lib/events/catalog';
import { useEventFeed } from '@/lib/events/use-feed';
import { formatNgn } from '@/lib/drinks/catalog';

type VenueData = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  area: string;
  address: string;
  tagline: string;
  about: string;
  hours: string;
  coverNgn: number | null;
  cardPerk: string;
  cardDiscountPct: number;
  photoUrl: string | null;
  gallery: string[];
  phone: string | null;
  instagram: string | null;
  website: string | null;
  followerCount: number;
  reviewCount: number;
  avgRating: number;
  followed: boolean;
};

type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export default function VenueDetailPage() {
  const params = useParams();
  const slug = String(params.slug || '');
  const { user } = useUser();
  const feed = useEventFeed();
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [body, setBody] = useState('');
  const [stars, setStars] = useState(5);
  const [reviewMsg, setReviewMsg] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const upcoming = useMemo(
    () => feed.filter((e) => e.venueSlug === slug && e.endsAt > new Date()),
    [feed, slug]
  );

  useEffect(() => {
    setLoading(true);
    fetch(`/api/venues/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.venue) {
          setVenue(data.venue);
          setFollowing(data.venue.followed);
        }
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function toggleFollow() {
    if (!user || !venue) return;
    setFollowBusy(true);
    const method = following ? 'DELETE' : 'POST';
    const res = await fetch(`/api/venues/${slug}/follow`, { method });
    setFollowBusy(false);
    if (res.ok) {
      setFollowing(!following);
      setVenue((v) => v ? { ...v, followerCount: v.followerCount + (following ? -1 : 1) } : v);
    }
  }

  async function onReview(e: FormEvent) {
    e.preventDefault();
    if (!user || !venue) return;
    if (!body.trim() || body.trim().length < 3) {
      setReviewMsg('Write a short review first.');
      return;
    }
    setSubmittingReview(true);
    const res = await fetch(`/api/venues/${slug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: stars, body: body.trim() }),
    });
    const data = await res.json();
    setSubmittingReview(false);
    if (res.ok && data.review) {
      setReviews((prev) => [data.review, ...prev]);
      setBody('');
      setReviewMsg('Review posted!');
      setTimeout(() => setReviewMsg(''), 3000);
    } else {
      setReviewMsg(data.error || 'Could not post review.');
    }
  }

  if (loading) {
    return (
      <section className="bg-[#FAFAFA] min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </section>
    );
  }

  if (!venue) {
    return (
      <section className="bg-[#FAFAFA] min-h-[60vh] px-5 py-20">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-3 text-gray-900">Venue not found</h1>
          <Link href="/events?tab=venues" className="text-ember text-sm font-medium">
            ← Back to venues
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAFAFA] min-h-screen">
      {/* Hero photo */}
      <div className="relative h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
        {venue.photoUrl ? (
          <img src={venue.photoUrl} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center">
              <ImageIcon size={32} className="text-gray-400" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 max-w-6xl mx-auto px-5 sm:px-8 pb-6">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-sm rounded-full mb-2 capitalize">
            {venue.kind}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{venue.name}</h1>
          <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
            <MapPin size={13} /> {venue.area} · {venue.address}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        <Link
          href="/events?tab=venues"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ember mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to venues
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-12 grid lg:grid-cols-12 gap-8">
        {/* Main content */}
        <div className="lg:col-span-7 space-y-8">
          {/* About */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-700 leading-relaxed">{venue.about || venue.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              {venue.hours && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-ember" /> {venue.hours}
                </span>
              )}
              {venue.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={14} className="text-ember" /> {venue.phone}
                </span>
              )}
              {venue.instagram && (
                <a href={`https://instagram.com/${venue.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ember">
                  <Instagram size={14} className="text-ember" /> @{venue.instagram}
                </a>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ember">
                  <Globe size={14} className="text-ember" /> Website
                </a>
              )}
            </div>
          </div>

          {/* Gallery */}
          {venue.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {venue.gallery.map((url, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {venue.gallery.length === 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ImageIcon size={20} className="text-gray-300" />
                </div>
              ))}
            </div>
          )}

          {/* Upcoming events */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={16} className="text-ember" />
              Upcoming Events
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-400">No listed events this week.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((ev) => (
                  <li key={ev.id}>
                    <Link
                      href={`/events/${ev.id}`}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-400">{formatEventWhen(ev)}</p>
                      </div>
                      <span className="text-xs font-semibold text-ember">View</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <MessageCircle size={16} className="text-ember" />
              Reviews
              <span className="text-sm font-normal text-gray-400 flex items-center gap-1 ml-2">
                <Star size={12} className="text-amber-400" fill="currentColor" />
                {venue.avgRating.toFixed(1)} · {venue.reviewCount}
              </span>
            </h2>

            {reviews.length > 0 && (
              <ul className="space-y-3 mt-4">
                {reviews.map((r) => (
                  <li key={r.id} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-ember/10 flex items-center justify-center text-xs font-bold text-ember">
                        {r.authorName[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{r.authorName}</span>
                      <span className="text-amber-400 text-xs">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-9">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}

            {user ? (
              <form onSubmit={onReview} className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Write a review</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setStars(n)}
                      className={`transition-colors ${n <= stars ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      <Star size={18} fill={n <= stars ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  placeholder="How was your experience?"
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ember/20 focus:border-ember resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 btn-brand text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {submittingReview ? 'Posting...' : 'Post review'}
                </button>
                {reviewMsg && <p className="text-xs text-ember">{reviewMsg}</p>}
              </form>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                  <Link href={`/signin?next=/events/venues/${slug}`} className="text-ember font-medium">
                    Sign in
                  </Link>{' '}
                  to leave a review.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
            {/* Follow + stats */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Heart size={14} className={following ? 'text-rose-500 fill-current' : ''} />
                <span className="font-medium">{venue.followerCount} followers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star size={14} className="text-amber-400" fill="currentColor" />
                <span className="font-medium">{venue.avgRating.toFixed(1)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleFollow}
              disabled={!user || followBusy}
              className={`w-full py-3 text-sm font-semibold rounded-lg transition mb-3 ${
                following
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'btn-brand'
              } disabled:opacity-50`}
            >
              {followBusy ? '...' : following ? 'Following' : 'Follow this venue'}
            </button>

            {venue.coverNgn ? (
              <p className="text-sm text-gray-500 mb-4">
                Typical cover <span className="font-semibold text-gray-900">{formatNgn(venue.coverNgn)}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No cover most nights.</p>
            )}

            {venue.cardPerk && (
              <div className="p-3 bg-ember/6 rounded-lg mb-4">
                <p className="text-xs font-semibold text-ember uppercase tracking-wider mb-1">Card perk</p>
                <p className="text-sm text-gray-700">{venue.cardPerk}</p>
              </div>
            )}

            <Link
              href={`/checkout?venue=${encodeURIComponent(venue.name)}&area=${encodeURIComponent(venue.area)}`}
              className="w-full inline-flex items-center justify-center py-3 border border-gray-200 text-sm font-medium rounded-lg hover:border-ember hover:text-ember transition"
            >
              Order drinks here
            </Link>

            {!user && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                <Link href="/signin" className="text-ember">Sign in</Link> to follow and review.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
