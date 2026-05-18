'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight, Camera, QrCode, UserPlus } from 'lucide-react';
import { ACCENT_COLORS, ACCENT_SOFT } from '@/components/convivia24/primitives';
import type { EventType } from '@/components/convivia24/primitives';

interface RsvpData {
  event: {
    id: string; title: string; host_name: string; event_type: string;
    event_date: string | null; event_time: string | null; city: string | null;
    venue: string | null; address: string | null; dress_code: string | null;
    invite_direction: string; capacity: number;
  };
  guest: {
    id: string; name: string; rsvp_state: string; party_size: number;
    dietary: string | null; pass_token: string;
  };
}

interface PageProps { params: { token: string } }

export default function RSVPPage({ params }: PageProps) {
  const { token } = params;
  const [data, setData] = useState<RsvpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'invite' | 'rsvp-form' | 'confirmed' | 'account' | 'pass'>('invite');
  const [rsvpState, setRsvpState] = useState<'in' | 'maybe' | 'out'>('in');
  const [partySize, setPartySize] = useState(1);
  const [dietary, setDietary] = useState('');
  const [message, setMessage] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/convivia24/rsvp/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(d => {
        setData(d);
        if (d.guest.rsvp_state !== 'pending') setStep('pass');
      })
      .catch(() => setError('This invitation link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function submitRSVP() {
    if (!data) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/convivia24/rsvp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: rsvpState,
          party_size: partySize,
          dietary: dietary || null,
          message: message || null,
          song_request: songRequest || null,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setData(prev => prev ? { ...prev, guest: { ...prev.guest, rsvp_state: rsvpState } } : prev);
      setStep(rsvpState === 'out' ? 'confirmed' : 'account');
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

  if (error || !data) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 24, color: '#1a1714', marginBottom: 8 }}>Not found.</div>
        <p style={{ color: '#756c5e', fontSize: 14 }}>{error || 'This invitation could not be found.'}</p>
      </div>
    </div>
  );

  const { event, guest } = data;
  const accent = ACCENT_COLORS[event.event_type as EventType] || '#c0975a';
  const accentSoft = ACCENT_SOFT[event.event_type as EventType] || 'rgba(192,151,90,.10)';
  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
  const direction = event.invite_direction || 'editorial';

  // ── Invite screen ────────────────────────────────────────────
  if (step === 'invite') return (
    <div style={{ minHeight: '100dvh', background: direction === 'bold' ? '#1a1714' : '#f4ede0', display: 'flex', flexDirection: 'column' }}>
      {/* The invitation */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '60px 28px 28px' }}>
        {direction !== 'bold' && (
          <svg width="100%" height="100%" viewBox="0 0 360 700" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <ellipse key={i} cx="280" cy="120" rx={20 + i * 24} ry={14 + i * 10} fill="none" stroke={accent} strokeWidth="0.4" opacity={0.15 + i * 0.04} />
            ))}
          </svg>
        )}
        {direction === 'bold' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: accent }} />}

        <div style={{ position: 'relative' }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: direction === 'bold' ? 'rgba(250,246,238,.7)' : accent, marginBottom: 16 }}>
            {direction !== 'bold' && <span style={{ width: 18, height: 1, background: 'currentColor', display: 'inline-block' }} />}
            {event.event_type} · {event.city || 'an occasion'}
          </div>

          {/* For */}
          <div style={{ fontSize: 11, fontWeight: 500, color: direction === 'bold' ? 'rgba(250,246,238,.6)' : 'rgba(26,23,20,.55)', marginBottom: 4 }}>For</div>
          <div style={{
            fontFamily: direction === 'bold' ? 'var(--font-geist, sans-serif)' : 'var(--font-instrument, serif)',
            fontStyle: direction === 'bold' ? 'normal' : 'italic',
            fontWeight: direction === 'bold' ? 900 : 400,
            fontSize: direction === 'bold' ? 52 : 52,
            lineHeight: .96, letterSpacing: direction === 'bold' ? '-0.04em' : '-0.02em',
            color: direction === 'bold' ? '#faf6ee' : '#1a1714',
            wordBreak: 'break-word', marginBottom: 32,
          }}>
            {guest.name}.
          </div>

          {/* From */}
          <div style={{ fontSize: 11, fontWeight: 500, color: direction === 'bold' ? 'rgba(250,246,238,.55)' : 'rgba(26,23,20,.5)', marginBottom: 4 }}>From</div>
          <div style={{
            fontFamily: direction === 'bold' ? 'var(--font-geist, sans-serif)' : 'var(--font-instrument, serif)',
            fontStyle: 'italic',
            fontWeight: direction === 'bold' ? 900 : 400,
            fontSize: direction === 'bold' ? 46 : 46,
            lineHeight: 1.02, letterSpacing: '-0.02em',
            color: direction === 'bold' ? '#faf6ee' : '#1a1714',
            wordBreak: 'break-word',
          }}>
            {event.host_name}.
          </div>
        </div>
      </div>

      {/* Bottom details + CTA */}
      <div style={{
        padding: '20px 28px 40px',
        borderTop: `1px solid ${direction === 'bold' ? 'rgba(255,255,255,.12)' : 'rgba(26,23,20,.18)'}`,
        background: direction === 'bold' ? 'rgba(0,0,0,.4)' : 'rgba(244,237,224,.92)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20, color: direction === 'bold' ? '#faf6ee' : '#1a1714', fontSize: 12.5 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: direction === 'bold' ? 'rgba(250,246,238,.5)' : 'rgba(26,23,20,.5)', marginBottom: 4 }}>When</div>
            {dateStr}<br />{event.event_time || ''}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: direction === 'bold' ? 'rgba(250,246,238,.5)' : 'rgba(26,23,20,.5)', marginBottom: 4 }}>Where</div>
            {event.venue || '—'}<br />{event.city || '—'}
          </div>
        </div>
        {event.dress_code && (
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: direction === 'bold' ? 'rgba(250,246,238,.55)' : 'rgba(26,23,20,.55)', marginBottom: 16 }}>
            {event.dress_code}
          </div>
        )}
        <button
          onClick={() => setStep('rsvp-form')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 99, border: 'none',
            background: accent, color: '#fff',
            fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Reply to this invitation <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );

  // ── RSVP form ────────────────────────────────────────────────
  if (step === 'rsvp-form') return (
    <div style={{ minHeight: '100dvh', background: '#faf6ee', padding: '40px 20px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <img src="/convivia24.png" alt="Convivia24" style={{ height: 28, width: 'auto', marginBottom: 32, opacity: 0.7 }} />

        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1, background: 'currentColor', display: 'inline-block' }} />
          Your RSVP · {event.host_name}
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 34, lineHeight: .96, color: '#1a1714', marginBottom: 24 }}>
          Are you<br /><em style={{ color: accent }}>coming</em>?
        </h1>

        {/* Yes / Maybe / No */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {([
            { id: 'in' as const,    label: 'Yes, I\'m in',   Icon: CheckCircle },
            { id: 'maybe' as const, label: 'Maybe',          Icon: AlertCircle },
            { id: 'out' as const,   label: 'I can\'t make it', Icon: XCircle },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setRsvpState(id)}
              style={{
                flex: 1, padding: '12px 6px', borderRadius: 12, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: rsvpState === id ? '#1a1714' : '#fff',
                color: rsvpState === id ? '#faf6ee' : '#1a1714',
                border: `1px solid ${rsvpState === id ? '#1a1714' : 'rgba(26,23,20,.12)'}`,
                transition: 'all .15s',
              }}
            >
              <Icon size={18} color={rsvpState === id ? accent : 'currentColor'} />
              <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
            </button>
          ))}
        </div>

        {rsvpState !== 'out' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 8 }}>How many in your party?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setPartySize(n)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                      background: partySize === n ? '#1a1714' : '#fff',
                      color: partySize === n ? '#faf6ee' : '#1a1714',
                      border: `1px solid ${partySize === n ? '#1a1714' : 'rgba(26,23,20,.12)'}`,
                      fontWeight: 700, fontSize: 14, transition: 'all .15s',
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPartySize(p => p < 20 ? p + 1 : p)}
                  style={{
                    width: 40, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    background: partySize > 5 ? '#1a1714' : '#fff',
                    color: partySize > 5 ? '#faf6ee' : '#1a1714',
                    border: `1px solid ${partySize > 5 ? '#1a1714' : 'rgba(26,23,20,.12)'}`,
                    fontWeight: 700, fontSize: 12,
                  }}
                >
                  {partySize > 5 ? partySize : '+'}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>Dietary requirements</div>
              <input
                className="cv-input"
                placeholder="None, vegetarian, halal, no nuts…"
                value={dietary}
                onChange={e => setDietary(e.target.value)}
                style={{ '--cv-accent': accent } as React.CSSProperties}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>Song request (optional)</div>
              <input
                className="cv-input"
                placeholder="Song you'd love to hear on the night"
                value={songRequest}
                onChange={e => setSongRequest(e.target.value)}
                style={{ '--cv-accent': accent } as React.CSSProperties}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>A note (optional)</div>
              <textarea
                className="cv-input"
                placeholder="Anything you'd like the hosts to know"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                style={{ resize: 'none', '--cv-accent': accent } as React.CSSProperties}
              />
            </div>
          </>
        )}

        <button
          onClick={submitRSVP}
          disabled={submitting}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 99, border: 'none',
            background: rsvpState === 'out' ? '#5a6573' : accent, color: '#fff',
            fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
            cursor: submitting ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {submitting
            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : rsvpState === 'out' ? 'Send my regrets' : 'Confirm my place'
          }
        </button>
      </div>
    </div>
  );

  // ── Regrets confirmed ────────────────────────────────────────
  if (step === 'confirmed' && rsvpState === 'out') return (
    <div style={{ minHeight: '100dvh', background: '#faf6ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <img src="/convivia24.png" alt="Convivia24" style={{ height: 28, width: 'auto', margin: '0 auto 28px', opacity: 0.6 }} />
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 30, color: '#1a1714', lineHeight: 1.1, marginBottom: 12 }}>
          Your regrets<br />have been sent.
        </div>
        <p style={{ fontSize: 13.5, color: '#756c5e', lineHeight: 1.6 }}>
          {event.host_name} will be sorry to miss you. Thank you for letting them know.
        </p>
      </div>
    </div>
  );

  // ── Account prompt ───────────────────────────────────────────
  if (step === 'account') {
    const signInUrl = `/auth/sign-in?next=${encodeURIComponent(`/rsvp/${token}`)}`;
    const signUpUrl = `/auth/sign-up?next=${encodeURIComponent(`/rsvp/${token}`)}`;
    return (
      <div style={{ minHeight: '100dvh', background: '#faf6ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <img src="/convivia24.png" alt="Convivia24" style={{ height: 28, width: 'auto', margin: '0 auto 32px', opacity: 0.6 }} />
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <UserPlus size={24} color="#fff" />
          </div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 30, lineHeight: 1.05, color: '#1a1714', marginBottom: 12 }}>
            You&rsquo;re on the list.
          </div>
          <p style={{ fontSize: 13.5, color: '#756c5e', lineHeight: 1.6, marginBottom: 28 }}>
            Create a free account to access your guest pass, track your invite, and get event updates from {event.host_name}.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href={signUpUrl}
              style={{
                display: 'block', width: '100%', padding: '14px 0', borderRadius: 99,
                background: accent, color: '#fff', textDecoration: 'none',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              Create an account
            </a>
            <a
              href={signInUrl}
              style={{
                display: 'block', width: '100%', padding: '14px 0', borderRadius: 99,
                background: '#fff', color: '#1a1714', textDecoration: 'none',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
                textAlign: 'center', border: '1px solid rgba(26,23,20,.15)',
              }}
            >
              Sign in
            </a>
            <button
              onClick={() => setStep('pass')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#a89e8e', marginTop: 4, padding: '8px 0',
              }}
            >
              Skip — view my guest pass
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Guest pass (QR) ──────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: '#1a1714', display: 'flex', flexDirection: 'column', padding: '40px 24px' }}>
      <div style={{ maxWidth: 360, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <img src="/Logo2.png" alt="Convivia24" style={{ height: 28, width: 'auto', opacity: 0.6 }} />

        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: accent, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 14, height: 1, background: 'currentColor', display: 'inline-block' }} />
            Guest pass
          </div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 38, lineHeight: .94, color: '#faf6ee' }}>
            {guest.name}.
          </div>
          <div style={{ fontSize: 13, color: 'rgba(250,246,238,.55)', marginTop: 6 }}>
            {event.host_name} · {dateStr}
          </div>
        </div>

        {/* QR — real scannable code encoding the RSVP URL */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(`https://convivia24.com/rsvp/${guest.pass_token}`)}`}
            alt="Guest pass QR code"
            width={200}
            height={200}
            style={{ borderRadius: 8, display: 'block' }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: '#756c5e', letterSpacing: '0.12em' }}>
              {guest.pass_token.slice(0, 16).toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: '#a89e8e', marginTop: 3 }}>Show this at the door</div>
          </div>
        </div>

        {/* Event details */}
        <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,.10)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, color: '#faf6ee', fontSize: 12.5, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,246,238,.5)', marginBottom: 4 }}>When</div>
              {dateStr}<br />{event.event_time || ''}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,246,238,.5)', marginBottom: 4 }}>Where</div>
              {event.venue || '—'}<br />{event.city || '—'}
            </div>
          </div>
          {guest.dietary && (
            <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 11.5, color: 'rgba(250,246,238,.6)' }}>
              <span style={{ fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 9, color: 'rgba(250,246,238,.4)' }}>Dietary · </span>
              {guest.dietary}
            </div>
          )}
        </div>

        <p style={{ fontSize: 11.5, color: 'rgba(250,246,238,.35)', textAlign: 'center', lineHeight: 1.5 }}>
          Add this page to your home screen for quick door access.
        </p>
      </div>
    </div>
  );
}
