'use client';

import { useEffect, useState } from 'react';
import { Loader2, ArrowRight, Check, MapPin, Calendar, Shirt } from 'lucide-react';
import { ACCENT_COLORS, ACCENT_SOFT } from '@/components/convivia24/primitives';
import type { EventType } from '@/components/convivia24/primitives';

interface PublicEvent {
  id: string;
  slug: string | null;
  title: string;
  event_type: string;
  host_name: string;
  event_date: string | null;
  event_time: string | null;
  city: string | null;
  venue: string | null;
  address: string | null;
  dress_code: string | null;
  invite_direction: string;
  cover_url: string | null;
  rsvp_deadline: string | null;
}

interface PageProps { params: { slug: string } }

export default function PublicEventPage({ params }: PageProps) {
  const { slug } = params;
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<'view' | 'request' | 'sent'>('view');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/convivia24/events/public/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setEvent(d.event))
      .catch(() => setError('This event page is not available.'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function requestInvite() {
    if (!event || !name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/convivia24/events/public/${slug}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      setStep('sent');
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} color="#a89e8e" />
    </div>
  );

  if (error || !event) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 24, color: '#1a1714', marginBottom: 8 }}>
          Not available.
        </div>
        <p style={{ color: '#756c5e', fontSize: 14 }}>
          {error || 'This event page could not be found.'}
        </p>
      </div>
    </div>
  );

  const accent = ACCENT_COLORS[event.event_type as EventType] || '#c0975a';
  const accentSoft = ACCENT_SOFT[event.event_type as EventType] || 'rgba(192,151,90,.10)';
  const direction = event.invite_direction || 'editorial';
  const isBold = direction === 'bold';

  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const deadlineStr = event.rsvp_deadline
    ? new Date(event.rsvp_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : null;

  if (step === 'sent') return (
    <div style={{ minHeight: '100dvh', background: '#faf6ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Check size={22} color={accent} />
        </div>
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 28, color: '#1a1714', lineHeight: 1.1, marginBottom: 10 }}>
          Request sent.
        </div>
        <p style={{ fontSize: 13.5, color: '#756c5e', lineHeight: 1.6 }}>
          {event.host_name} will be in touch with your personal invite link.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', background: isBold ? '#1a1714' : '#f4ede0', display: 'flex', flexDirection: 'column' }}>

      {/* Cover / Hero */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', padding: '60px 28px 40px' }}>
        {!isBold && (
          <svg width="100%" height="100%" viewBox="0 0 360 600" style={{ position: 'absolute', inset: 0, opacity: 0.45, pointerEvents: 'none' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <ellipse key={i} cx="300" cy="100" rx={20 + i * 26} ry={14 + i * 11} fill="none" stroke={accent} strokeWidth="0.4" opacity={0.12 + i * 0.04} />
            ))}
          </svg>
        )}
        {isBold && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: accent }} />}
        {event.cover_url && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <img src={event.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
          </div>
        )}

        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontWeight: 700, fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: isBold ? 'rgba(250,246,238,.7)' : accent,
            marginBottom: 20,
          }}>
            {!isBold && <span style={{ width: 18, height: 1, background: 'currentColor', display: 'inline-block' }} />}
            {event.event_type} · {event.city || 'an occasion'}
          </div>

          <div style={{
            fontFamily: isBold ? 'var(--font-geist, sans-serif)' : 'var(--font-instrument, serif)',
            fontStyle: isBold ? 'normal' : 'italic',
            fontWeight: isBold ? 900 : 400,
            fontSize: 52,
            lineHeight: 0.96,
            letterSpacing: isBold ? '-0.04em' : '-0.02em',
            color: isBold ? '#faf6ee' : '#1a1714',
            wordBreak: 'break-word',
            marginBottom: 16,
          }}>
            {event.title}.
          </div>

          <div style={{ fontSize: 13, color: isBold ? 'rgba(250,246,238,.55)' : 'rgba(26,23,20,.5)', marginBottom: 32 }}>
            Hosted by {event.host_name}
          </div>

          {/* Key details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dateStr && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: isBold ? '#faf6ee' : '#1a1714' }}>
                <Calendar size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{dateStr}{event.event_time ? ` · ${event.event_time}` : ''}</span>
              </div>
            )}
            {(event.venue || event.city) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: isBold ? '#faf6ee' : '#1a1714' }}>
                <MapPin size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{[event.venue, event.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {event.dress_code && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: isBold ? '#faf6ee' : '#1a1714' }}>
                <Shirt size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{event.dress_code}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        padding: '24px 28px 48px',
        borderTop: `1px solid ${isBold ? 'rgba(255,255,255,.12)' : 'rgba(26,23,20,.15)'}`,
        background: isBold ? 'rgba(0,0,0,.35)' : 'rgba(244,237,224,.9)',
        maxWidth: '100%',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {step === 'view' && (
            <>
              {deadlineStr && (
                <p style={{ fontSize: 11, color: isBold ? 'rgba(250,246,238,.45)' : 'rgba(26,23,20,.45)', marginBottom: 16, textAlign: 'center', letterSpacing: '0.08em' }}>
                  RSVP by {deadlineStr}
                </p>
              )}
              <button
                onClick={() => setStep('request')}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 99, border: 'none',
                  background: accent, color: '#fff',
                  fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                Request an invite <ArrowRight size={13} />
              </button>
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: isBold ? 'rgba(250,246,238,.3)' : 'rgba(26,23,20,.35)' }}>
                Your host will send a personal link to reply
              </p>
            </>
          )}

          {step === 'request' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: accent, marginBottom: 4 }}>
                Your details
              </div>
              <input
                className="cv-input"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ '--cv-accent': accent } as React.CSSProperties}
              />
              <input
                className="cv-input"
                type="email"
                placeholder="Email (optional — for your invite link)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ '--cv-accent': accent } as React.CSSProperties}
              />
              <button
                onClick={requestInvite}
                disabled={submitting || !name.trim()}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 99, border: 'none',
                  background: name.trim() ? accent : 'rgba(26,23,20,.15)',
                  color: name.trim() ? '#fff' : 'rgba(26,23,20,.4)',
                  fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
                  cursor: name.trim() && !submitting ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .15s',
                }}
              >
                {submitting
                  ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <>Send request <ArrowRight size={13} /></>
                }
              </button>
              <button
                onClick={() => setStep('view')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: isBold ? 'rgba(250,246,238,.4)' : 'rgba(26,23,20,.4)', padding: '4px 0' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
