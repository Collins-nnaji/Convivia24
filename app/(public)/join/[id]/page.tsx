'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, MapPin, Clock, Users, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { buildHangoutInviteMessage, whatsAppSendPrefilledUrl } from '@/lib/hangout-invite-share';

export default function JoinHangoutInvitePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [hangout, setHangout] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== 'undefined' && id ? `${window.location.origin}/join/${id}` : '';
  const openInAppUrl = id ? `/?join=${id}` : '/';

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErr('Invalid link.');
      return;
    }
    let cancelled = false;
    fetch(`/api/hangouts/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Not found');
        if (!cancelled) setHangout(data.hangout);
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message || 'Could not load this table.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const copyLink = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [inviteUrl]);

  const share = useCallback(async () => {
    if (!inviteUrl || !hangout) return;
    const title = String(hangout.title || 'Join my table');
    try {
      await navigator.share({
        title,
        text: `You're invited — ${title}`,
        url: inviteUrl,
      });
    } catch {
      /* dismissed or unsupported */
    }
  }, [inviteUrl, hangout]);

  const shareWhatsApp = useCallback(() => {
    if (!inviteUrl || !hangout) return;
    const title = String(hangout.title || 'Join my table');
    const msg = buildHangoutInviteMessage(title, inviteUrl);
    window.open(whatsAppSendPrefilledUrl(msg), '_blank', 'noopener,noreferrer');
  }, [inviteUrl, hangout]);

  const spotsLeft =
    hangout &&
    Math.max(
      0,
      Number(hangout.max_guests || 0) - Number(hangout.current_guests || 0),
    );

  return (
    <main className="mobile-scroll-screen mobile-safe-screen bg-white text-neutral-900 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700 hover:text-red-800 mb-8 inline-block"
        >
          Convivia24
        </Link>

        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 text-red-700 animate-spin" />
          </div>
        )}

        {!loading && err && (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
            <p className="text-neutral-600 mb-4">{err}</p>
            <Link
              href="/"
              className="text-red-700 font-semibold text-sm underline-offset-4 hover:underline"
            >
              Open the app
            </Link>
          </div>
        )}

        {!loading && hangout && (
          <div className="rounded-[28px] border border-neutral-200 shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden">
            {hangout.cover_image ? (
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={String(hangout.cover_image)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-28 bg-gradient-to-br from-red-100 to-neutral-100" />
            )}
            <div className="p-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">
                You&apos;re invited
              </p>
              <h1 className="font-display text-3xl italic leading-tight text-neutral-900">
                {String(hangout.title)}
              </h1>
              {hangout.vibe ? (
                <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                  {String(hangout.vibe)}
                </p>
              ) : null}
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-red-700" />
                  {String(hangout.formatted_time)} · {String(hangout.formatted_date)}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="shrink-0 mt-0.5 text-red-700" />
                  <span>{String(hangout.location)}</span>
                </div>
                {typeof spotsLeft === 'number' && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="shrink-0 text-red-700" />
                    {spotsLeft === 0 ? (
                      <span className="text-amber-800">This table is full</span>
                    ) : (
                      <span>
                        {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
                      </span>
                    )}
                  </div>
                )}
                {hangout.host_name ? (
                  <p className="text-xs text-neutral-500 pt-1">
                    Hosted by <span className="font-semibold text-neutral-700">{String(hangout.host_name)}</span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href={openInAppUrl}
                  className="w-full text-center py-3.5 rounded-full bg-red-700 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-800 transition-colors"
                >
                  Join in app
                </Link>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={share}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-neutral-300 text-[11px] font-black uppercase tracking-widest text-neutral-700 hover:border-red-400 hover:text-red-800 transition-colors"
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-emerald-600/40 bg-emerald-50 text-[11px] font-black uppercase tracking-widest text-emerald-900 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-neutral-500 hover:text-red-800 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-600" /> Link copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy invite link
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
