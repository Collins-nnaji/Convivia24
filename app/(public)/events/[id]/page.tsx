'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import { formatEventWhen } from '@/lib/events/catalog';
import { useEvent } from '@/lib/events/use-feed';
import { formatNgn } from '@/lib/drinks/catalog';
import { getWallet, isEnrolled, rsvpEvent } from '@/lib/loyalty/store';
import { useUser } from '@/components/auth/AuthProvider';

type LinkedCircle = {
  id: string;
  circleId: string;
  circleName: string;
  circleSlug: string;
  vibeTag: string;
  memberCount: number;
  note: string | null;
};

type CircleOption = {
  id: string;
  slug: string;
  name: string;
  vibeTag: string;
  joined: boolean;
};

export default function EventDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const event = useEvent(id);
  const { user } = useUser();
  const [msg, setMsg] = useState('');
  const [going, setGoing] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [linkedCircles, setLinkedCircles] = useState<LinkedCircle[]>([]);
  const [circles, setCircles] = useState<CircleOption[]>([]);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkNote, setLinkNote] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);

  useEffect(() => {
    const w = getWallet();
    setEnrolled(isEnrolled(w));
    if (event) setGoing(w.rsvps.includes(event.id));
  }, [event]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}/circles`)
      .then((r) => r.json())
      .then((d) => setLinkedCircles(d.linked || []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (showLinkPanel && circles.length === 0) {
      fetch('/api/circles')
        .then((r) => r.json())
        .then((d) => {
          setCircles(d.circles || []);
          if (d.circles?.length) setSelectedCircle(d.circles[0].id);
        })
        .catch(() => {});
    }
  }, [showLinkPanel, circles.length]);

  async function linkCircle() {
    if (!selectedCircle) return;
    setLinkBusy(true);
    const res = await fetch(`/api/events/${id}/circles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circleId: selectedCircle, note: linkNote || null }),
    });
    setLinkBusy(false);
    if (res.ok) {
      const circle = circles.find((c) => c.id === selectedCircle);
      if (circle) {
        setLinkedCircles((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            circleId: circle.id,
            circleName: circle.name,
            circleSlug: circle.slug,
            vibeTag: circle.vibeTag,
            memberCount: 0,
            note: linkNote || null,
          },
        ]);
      }
      setShowLinkPanel(false);
      setLinkNote('');
    }
  }

  if (!event) {
    return (
      <section className="bg-[#FAFAFA] min-h-[60vh] px-5 py-20">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-3 text-gray-900">Event not found</h1>
          <Link href="/events" className="text-ember text-sm font-medium">
            ← Back to events
          </Link>
        </div>
      </section>
    );
  }

  function rsvp() {
    const result = rsvpEvent(event!.id, event!.title);
    if ('error' in result) {
      setMsg(result.error);
      return;
    }
    setGoing(true);
    setMsg(`You're on the list · ${result.points.toLocaleString('en-NG')} pts earned`);
  }

  return (
    <section className="bg-[#FAFAFA] min-h-screen">
      {/* Hero */}
      <div className="relative h-52 sm:h-64 lg:h-72 bg-gradient-to-br from-ember/15 via-slate-100 to-obsidian/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center">
            <Calendar size={28} className="text-slate-400" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 max-w-6xl mx-auto px-5 sm:px-8 pb-6">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 backdrop-blur-sm rounded-full mb-2">
            {event.tag}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ember mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Events
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-12 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-5">{event.blurb}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-ember shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">When</p>
                  <p className="text-gray-900">{formatEventWhen(event)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-ember shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Where</p>
                  <p className="text-gray-900">{event.venue.name} · {event.venue.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue card */}
          <Link
            href={`/events/venues/${event.venue.slug}`}
            className="block bg-white rounded-xl p-5 border-2 border-ember/25 hover:border-ember transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                <ImageIcon size={20} className="text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ember uppercase tracking-wider mb-0.5">Venue</p>
                <p className="font-bold text-gray-900">{event.venue.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{event.venue.tagline}</p>
                {event.venue.cardPerk && (
                  <p className="text-xs text-ember mt-2">{event.venue.cardPerk}</p>
                )}
              </div>
            </div>
          </Link>

          {/* Circles linked to this event */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Users size={16} className="text-ember" />
                Circles discussing this
              </h2>
              {user && (
                <button
                  type="button"
                  onClick={() => setShowLinkPanel(!showLinkPanel)}
                  className="text-xs font-medium text-ember hover:text-ember-dark transition"
                >
                  + Link a circle
                </button>
              )}
            </div>

            {linkedCircles.length === 0 && !showLinkPanel && (
              <p className="text-sm text-gray-400">No circles linked yet. Be the first to share this with your circle.</p>
            )}

            {linkedCircles.length > 0 && (
              <div className="space-y-2 mb-4">
                {linkedCircles.map((lc) => (
                  <div key={lc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-ember/10 flex items-center justify-center text-xs font-bold text-ember">
                      {lc.circleName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{lc.circleName}</p>
                      <p className="text-xs text-gray-400">{lc.vibeTag} · {lc.memberCount} members</p>
                    </div>
                    {lc.note && <p className="text-xs text-gray-500 italic truncate max-w-[120px]">{lc.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {showLinkPanel && (
              <div className="space-y-3 p-4 bg-ember/6 rounded-lg">
                <p className="text-xs font-semibold text-gray-600">Share this event with a circle</p>
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ember/20"
                >
                  {circles.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.vibeTag})</option>
                  ))}
                </select>
                <input
                  value={linkNote}
                  onChange={(e) => setLinkNote(e.target.value)}
                  placeholder="Add a note (e.g. 'Let's go together!')"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-ember/20"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={linkCircle}
                    disabled={linkBusy || !selectedCircle}
                    className="px-4 py-2 btn-brand text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {linkBusy ? 'Linking...' : 'Link circle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkPanel(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <p className="text-xs text-gray-400 mt-2">
                <Link href={`/signin?next=/events/${id}`} className="text-ember">Sign in</Link> to link a circle.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
            {event.endsAt < new Date() ? (
              <>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-center mb-4">
                  <p className="text-sm font-semibold text-gray-500">This event has ended</p>
                  <p className="text-xs text-gray-400 mt-1">Bookings and RSVPs are closed.</p>
                </div>
                {event.coverNgn ? (
                  <p className="text-sm text-gray-400 mb-4">
                    Door was <span className="font-medium">{formatNgn(event.coverNgn)}</span> · {event.expected}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">{event.expected}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tonight&apos;s move</p>
                {event.coverNgn ? (
                  <p className="text-sm text-gray-600 mb-4">
                    Door from <span className="font-bold text-gray-900">{formatNgn(event.coverNgn)}</span> · {event.expected}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">{event.expected}</p>
                )}

                <button
                  type="button"
                  onClick={rsvp}
                  disabled={going}
                  className={`w-full py-3.5 text-sm font-semibold rounded-lg transition mb-3 ${
                    going
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'btn-brand'
                  } disabled:cursor-default`}
                >
                  {going ? '✓ You are on the list' : 'RSVP · earn 200 pts'}
                </button>

                {!enrolled && (
                  <p className="text-xs text-gray-400 mb-3">
                    <Link href="/guest-card" className="text-ember">Activate your Guest Card</Link>{' '}
                    to bank the points.
                  </p>
                )}

                <Link
                  href={`/checkout?event=${event.id}&venue=${encodeURIComponent(event.venue.name)}&area=${encodeURIComponent(event.venue.area)}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 border border-gray-200 text-sm font-medium rounded-lg hover:border-ember hover:text-ember transition"
                >
                  <ShoppingBag size={14} /> Order drinks to this venue
                </Link>
              </>
            )}

            {msg && <p className="text-sm text-ember mt-3 font-medium">{msg}</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}
