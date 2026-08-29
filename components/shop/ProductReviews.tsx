'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BadgeCheck, Star } from 'lucide-react';
import Stars from '@/components/shop/Stars';

type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  verifiedBuyer: boolean;
  createdAt: string;
  mine?: boolean;
};

type Summary = {
  average: number;
  count: number;
  breakdown: Record<string, number>;
};

const EMPTY: Summary = { average: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`;
  return `${Math.floor(days / 365)} year${days < 730 ? '' : 's'} ago`;
}

export default function ProductReviews({
  slug,
  onSummary,
}: {
  slug: string;
  /** Lets the page header show the same average without a second fetch. */
  onSummary?: (summary: Summary) => void;
}) {
  const pathname = usePathname();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/shop/reviews?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setReviews(data.reviews || []);
        setSummary(data.summary || EMPTY);
        setSignedIn(Boolean(data.signedIn));
        onSummary?.(data.summary || EMPTY);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const alreadyReviewed = reviews.some((r) => r.mine);
  const shown = showAll ? reviews : reviews.slice(0, 3);

  function onPosted(review: Review, next: Summary) {
    setReviews((prev) => [review, ...prev]);
    setSummary(next);
    onSummary?.(next);
    setWriting(false);
  }

  return (
    <div className="bg-white border border-obsidian/8 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <h2 className="text-lg font-bold">Customer reviews</h2>
        {signedIn && !alreadyReviewed && !writing && (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="px-4 py-2.5 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em] hover:border-ember hover:text-ember transition-colors"
          >
            Write a review
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-obsidian/40 py-6">Loading reviews…</p>
      ) : summary.count === 0 ? (
        <EmptyState signedIn={signedIn} pathname={pathname || '/shop'} onWrite={() => setWriting(true)} />
      ) : (
        <div className="grid sm:grid-cols-[200px_1fr] gap-6 sm:gap-8">
          <div>
            <p className="font-logo font-black text-4xl leading-none tabular-nums">
              {summary.average.toFixed(1)}
            </p>
            <Stars value={summary.average} size={16} className="mt-2" />
            <p className="text-[12px] text-obsidian/45 mt-2">
              Based on {summary.count} review{summary.count === 1 ? '' : 's'}
            </p>

            <ul className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = Number(summary.breakdown?.[String(star)] ?? 0);
                const pct = summary.count > 0 ? (n / summary.count) * 100 : 0;
                return (
                  <li key={star} className="flex items-center gap-2 text-[11px] text-obsidian/50">
                    <span className="w-6 tabular-nums flex items-center gap-0.5">
                      {star}
                      <Star size={9} className="text-amber-400" fill="currentColor" />
                    </span>
                    <span className="flex-1 h-1.5 bg-obsidian/8 overflow-hidden">
                      <motion.span
                        className="block h-full bg-ember"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </span>
                    <span className="w-7 text-right tabular-nums">{n}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="divide-y divide-obsidian/8 sm:border-l sm:border-obsidian/8 sm:pl-8">
            {shown.map((review) => (
              <li key={review.id} className="py-4 first:pt-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    {review.authorName}
                    {review.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                        <BadgeCheck size={12} /> Verified buyer
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-obsidian/35">{timeAgo(review.createdAt)}</p>
                </div>
                <Stars value={review.rating} size={12} className="mt-1.5" />
                <p className="text-sm text-obsidian/60 leading-relaxed mt-2">{review.body}</p>
              </li>
            ))}
            {reviews.length > 3 && (
              <li className="pt-4">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="text-[11px] font-black uppercase tracking-[0.12em] text-ember"
                >
                  {showAll ? 'Show fewer' : `View all ${reviews.length} reviews`}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {writing && (
        <ReviewForm slug={slug} onPosted={onPosted} onCancel={() => setWriting(false)} />
      )}
    </div>
  );
}

function EmptyState({
  signedIn,
  pathname,
  onWrite,
}: {
  signedIn: boolean;
  pathname: string;
  onWrite: () => void;
}) {
  return (
    <div className="py-8 text-center">
      <Stars value={0} size={18} className="justify-center" />
      <p className="text-sm text-obsidian/55 mt-3">No reviews yet — be the first to rate this bottle.</p>
      {signedIn ? (
        <button
          type="button"
          onClick={onWrite}
          className="mt-4 px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
        >
          Write a review
        </button>
      ) : (
        <Link
          href={`/signin?next=${encodeURIComponent(pathname)}`}
          className="mt-4 inline-block px-5 py-2.5 btn-brand text-[10px] font-black uppercase tracking-[0.14em]"
        >
          Sign in to review
        </Link>
      )}
    </div>
  );
}

function ReviewForm({
  slug,
  onPosted,
  onCancel,
}: {
  slug: string;
  onPosted: (review: Review, summary: Summary) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/shop/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rating, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not save your review.');
        return;
      }
      onPosted(data.review, data.summary);
    } catch {
      setError('Could not save your review.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 pt-6 border-t border-obsidian/8">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 mb-2">Your rating</p>
      <div className="flex items-center gap-1 mb-4" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i} star${i === 1 ? '' : 's'}`}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            className="p-0.5"
          >
            <Star
              size={22}
              className={(hover || rating) >= i ? 'text-amber-400' : 'text-obsidian/15'}
              fill="currentColor"
            />
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
          How does it drink?
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
          className="w-full border border-obsidian/12 focus:border-ember focus:ring-0 text-sm p-3 bg-transparent"
          placeholder="Neat, mixed, at what occasion — whatever the next person would want to know."
        />
      </label>

      {error && <p className="text-sm text-ember mt-2">{error}</p>}

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={sending || rating === 0}
          className="px-5 py-3 btn-brand text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
        >
          {sending ? 'Posting…' : 'Post review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 border border-obsidian/15 text-[10px] font-black uppercase tracking-[0.12em]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
