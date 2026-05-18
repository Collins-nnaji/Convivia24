'use client';

import { useEffect, useState } from 'react';
import {
  Loader2, ArrowRight, CheckCircle, XCircle, AlertCircle,
  Calendar, MapPin, Shirt, Users, Gift, QrCode,
} from 'lucide-react';
import { ACCENT_COLORS, ACCENT_SOFT } from '@/components/convivia24/primitives';
import type { EventType } from '@/components/convivia24/primitives';

interface PublicEvent {
  id: string; slug: string | null; title: string; event_type: string;
  host_name: string; event_date: string | null; event_time: string | null;
  city: string | null; venue: string | null; address: string | null;
  dress_code: string | null; invite_direction: string;
  cover_url: string | null; rsvp_deadline: string | null;
  invite_live: boolean;
}
interface PublicGift {
  id: string; title: string; kind: string; amount_target: number | null;
  amount_pledged: number; claimed: boolean; image_label: string | null;
}
interface Stats { in: number; maybe: number; total: number }

type Step = 'invite' | 'rsvp' | 'gifts' | 'pass';

const LS_KEY = (slug: string) => `cv24_pass_${slug}`;

interface PageProps { params: { slug: string } }

export default function PublicEventPage({ params }: PageProps) {
  const { slug } = params;

  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [stats, setStats] = useState<Stats>({ in: 0, maybe: 0, total: 0 });
  const [gifts, setGifts] = useState<PublicGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('invite');
  const [passToken, setPassToken] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');

  // RSVP form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rsvpState, setRsvpState] = useState<'in' | 'maybe' | 'out'>('in');
  const [partySize, setPartySize] = useState(1);
  const [dietary, setDietary] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Gift state
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [pledging, setPledging] = useState(false);

  useEffect(() => {
    // Check if user already RSVPed for this event
    try {
      const stored = localStorage.getItem(LS_KEY(slug));
      if (stored) {
        const { token, name: n } = JSON.parse(stored);
        if (token) { setPassToken(token); setGuestName(n || ''); setStep('pass'); }
      }
    } catch {}

    fetch(`/api/convivia24/events/public/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setEvent(d.event); setStats(d.stats); setGifts(d.gifts || []); })
      .catch(() => setError('This event page is not available.'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function submitRSVP() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/convivia24/events/public/${slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), email: email.trim() || null,
          rsvp_state: rsvpState, party_size: partySize,
          dietary: dietary || null, song_request: songRequest || null, message: message || null,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPassToken(data.pass_token);
      setGuestName(data.guest_name || name.trim());
      setStats(s => ({ ...s, in: rsvpState === 'in' ? s.in + 1 : s.in, total: s.total + 1 }));
      try { localStorage.setItem(LS_KEY(slug), JSON.stringify({ token: data.pass_token, name: name.trim() })); } catch {}
      // Show gifts if they said yes/maybe and gifts exist
      if (rsvpState !== 'out' && gifts.filter(g => !g.claimed).length > 0) {
        setStep('gifts');
      } else {
        setStep('pass');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function pledgeSelectedGift() {
    if (!selectedGift || pledging) return;
    setPledging(true);
    try {
      const gift = gifts.find(g => g.id === selectedGift);
      const amount = gift?.kind === 'fund' && gift.amount_target ? gift.amount_target : 1;
      await fetch(`/api/convivia24/events/public/${slug}/pledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_id: selectedGift, amount }),
      });
      setGifts(prev => prev.map(g => g.id === selectedGift ? { ...g, claimed: true } : g));
    } catch {}
    setStep('pass');
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee' }}>
      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} color="#a89e8e" />
    </div>
  );

  if (error || !event) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6ee', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 24, color: '#1a1714', marginBottom: 8 }}>Not available.</div>
        <p style={{ color: '#756c5e', fontSize: 14 }}>{error || 'This event page could not be found.'}</p>
      </div>
    </div>
  );

  const accent = ACCENT_COLORS[event.event_type as EventType] || '#c0975a';
  const accentSoft = ACCENT_SOFT[event.event_type as EventType] || 'rgba(192,151,90,.10)';
  const isBold = (event.invite_direction || 'editorial') === 'bold';
  const bg = isBold ? '#1a1714' : '#f4ede0';
  const fg = isBold ? '#faf6ee' : '#1a1714';
  const fgMuted = isBold ? 'rgba(250,246,238,.55)' : 'rgba(26,23,20,.5)';
  const border = isBold ? 'rgba(255,255,255,.12)' : 'rgba(26,23,20,.15)';
  const panelBg = isBold ? 'rgba(0,0,0,.35)' : 'rgba(244,237,224,.92)';

  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const deadlineStr = event.rsvp_deadline
    ? new Date(event.rsvp_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : null;

  const rsvpUrl = `https://convivia24.com/rsvp/${passToken}`;
  const availableGifts = gifts.filter(g => !g.claimed);

  // ── Guest pass ─────────────────────────────────────────────────
  if (step === 'pass' && passToken) return (
    <div style={{ minHeight: '100dvh', background: '#1a1714', display: 'flex', flexDirection: 'column', padding: '40px 24px' }}>
      <div style={{ maxWidth: 360, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <img src="/Logo2.png" alt="Convivia24" style={{ height: 28, width: 'auto', opacity: 0.6 }} />

        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: accent, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 14, height: 1, background: 'currentColor', display: 'inline-block' }} />
            Guest pass
          </div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 38, lineHeight: .94, color: '#faf6ee' }}>
            {guestName}.
          </div>
          <div style={{ fontSize: 13, color: 'rgba(250,246,238,.5)', marginTop: 6 }}>
            {event.host_name} · {dateStr || event.title}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(rsvpUrl)}`}
            alt="Guest pass QR"
            width={200} height={200}
            style={{ borderRadius: 8, display: 'block' }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: '#756c5e', letterSpacing: '0.12em' }}>
              {passToken.slice(0, 16).toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: '#a89e8e', marginTop: 3 }}>Show this at the door</div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,.10)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, color: '#faf6ee', fontSize: 12.5, marginBottom: dateStr ? 12 : 0 }}>
            {dateStr && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,246,238,.4)', marginBottom: 4 }}>When</div>
                {dateStr}<br />{event.event_time || ''}
              </div>
            )}
            {(event.venue || event.city) && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(250,246,238,.4)', marginBottom: 4 }}>Where</div>
                {event.venue || '—'}<br />{event.city || '—'}
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: 'rgba(250,246,238,.3)', textAlign: 'center', lineHeight: 1.5 }}>
          Add this page to your home screen for quick door access.
        </p>
        <p style={{ fontSize: 11, color: 'rgba(250,246,238,.25)', textAlign: 'center' }}>
          This link is yours — bookmark it to update your RSVP any time.
        </p>
      </div>
    </div>
  );

  // ── Gifts ──────────────────────────────────────────────────────
  if (step === 'gifts') return (
    <div style={{ minHeight: '100dvh', background: '#faf6ee', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <img src="/convivia24.png" alt="Convivia24" style={{ height: 28, width: 'auto', marginBottom: 28, opacity: 0.7 }} />

        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1, background: 'currentColor', display: 'inline-block' }} />
          Gift registry · {event.host_name}
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 32, lineHeight: .96, color: '#1a1714', marginBottom: 6 }}>
          Give a gift?
        </h1>
        <p style={{ fontSize: 13, color: '#756c5e', marginBottom: 24, lineHeight: 1.5 }}>
          Entirely optional — choose something from the registry, or skip.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {availableGifts.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGift(selectedGift === g.id ? null : g.id)}
              style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                background: selectedGift === g.id ? accentSoft : '#fff',
                border: `1.5px solid ${selectedGift === g.id ? accent : 'rgba(26,23,20,.10)'}`,
                transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Gift size={15} color={selectedGift === g.id ? accent : '#a89e8e'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1714' }}>{g.title}</div>
                  {g.kind === 'fund' && g.amount_target && (
                    <div style={{ fontSize: 11, color: '#a89e8e', marginTop: 2 }}>
                      Fund · {g.amount_pledged} / {g.amount_target} pledged
                    </div>
                  )}
                </div>
                {selectedGift === g.id && <CheckCircle size={16} color={accent} />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={pledgeSelectedGift}
          disabled={!selectedGift || pledging}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 99, border: 'none', marginBottom: 12,
            background: selectedGift ? accent : 'rgba(26,23,20,.12)',
            color: selectedGift ? '#fff' : 'rgba(26,23,20,.35)',
            fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
            cursor: selectedGift && !pledging ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s',
          }}
        >
          {pledging ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <>Claim this gift <ArrowRight size={13} /></>}
        </button>
        <button
          onClick={() => setStep('pass')}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#a89e8e', padding: '8px 0' }}
        >
          Skip — view my guest pass
        </button>
      </div>
    </div>
  );

  // ── RSVP form ──────────────────────────────────────────────────
  if (step === 'rsvp') return (
    <div style={{ minHeight: '100dvh', background: '#faf6ee', padding: '40px 20px 60px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <img src="/convivia24.png" alt="Convivia24" style={{ height: 28, width: 'auto', marginBottom: 28, opacity: 0.7 }} />

        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1, background: 'currentColor', display: 'inline-block' }} />
          Your RSVP · {event.host_name}
        </div>
        <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 34, lineHeight: .96, color: '#1a1714', marginBottom: 24 }}>
          Are you<br /><em style={{ color: accent }}>coming</em>?
        </h1>

        {/* Name + email */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>Your name</div>
          <input
            className="cv-input"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ '--cv-accent': accent } as React.CSSProperties}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>Email <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#b8aea0' }}>(optional — to receive your pass link)</span></div>
          <input
            className="cv-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ '--cv-accent': accent } as React.CSSProperties}
          />
        </div>

        {/* Attending */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 10 }}>Are you attending?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { id: 'in' as const, label: "Yes, I'm in", Icon: CheckCircle },
              { id: 'maybe' as const, label: 'Maybe', Icon: AlertCircle },
              { id: 'out' as const, label: "Can't make it", Icon: XCircle },
            ]).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setRsvpState(id)} style={{
                flex: 1, padding: '12px 6px', borderRadius: 12, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: rsvpState === id ? '#1a1714' : '#fff',
                color: rsvpState === id ? '#faf6ee' : '#1a1714',
                border: `1px solid ${rsvpState === id ? '#1a1714' : 'rgba(26,23,20,.12)'}`,
                transition: 'all .15s',
              }}>
                <Icon size={18} color={rsvpState === id ? accent : 'currentColor'} />
                <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {rsvpState !== 'out' && (
          <>
            {/* Party size */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 8 }}>How many in your party?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setPartySize(n)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    background: partySize === n ? '#1a1714' : '#fff',
                    color: partySize === n ? '#faf6ee' : '#1a1714',
                    border: `1px solid ${partySize === n ? '#1a1714' : 'rgba(26,23,20,.12)'}`,
                    fontWeight: 700, fontSize: 14, transition: 'all .15s',
                  }}>{n}</button>
                ))}
                <button onClick={() => setPartySize(p => p < 20 ? p + 1 : p)} style={{
                  width: 40, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  background: partySize > 5 ? '#1a1714' : '#fff',
                  color: partySize > 5 ? '#faf6ee' : '#1a1714',
                  border: `1px solid ${partySize > 5 ? '#1a1714' : 'rgba(26,23,20,.12)'}`,
                  fontWeight: 700, fontSize: 12,
                }}>{partySize > 5 ? partySize : '+'}</button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>Dietary requirements</div>
              <input className="cv-input" placeholder="None, vegetarian, halal, no nuts…" value={dietary} onChange={e => setDietary(e.target.value)} style={{ '--cv-accent': accent } as React.CSSProperties} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>Song request <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
              <input className="cv-input" placeholder="A song you'd love to hear on the night" value={songRequest} onChange={e => setSongRequest(e.target.value)} style={{ '--cv-accent': accent } as React.CSSProperties} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a89e8e', marginBottom: 6 }}>A note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></div>
              <textarea className="cv-input" placeholder="Anything you'd like the host to know" value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{ resize: 'none', '--cv-accent': accent } as React.CSSProperties} />
            </div>
          </>
        )}

        <button
          onClick={submitRSVP}
          disabled={submitting || !name.trim()}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 99, border: 'none',
            background: name.trim() ? (rsvpState === 'out' ? '#5a6573' : accent) : 'rgba(26,23,20,.12)',
            color: name.trim() ? '#fff' : 'rgba(26,23,20,.35)',
            fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
            cursor: name.trim() && !submitting ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all .15s',
          }}
        >
          {submitting
            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : rsvpState === 'out' ? 'Send my regrets' : 'Confirm my place'
          }
        </button>
        <button onClick={() => setStep('invite')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#a89e8e', padding: '12px 0' }}>
          Back
        </button>
      </div>
    </div>
  );

  // ── Invite / event detail ──────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: bg, display: 'flex', flexDirection: 'column' }}>

      {/* Hero */}
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
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: isBold ? 'rgba(250,246,238,.7)' : accent, marginBottom: 20 }}>
            {!isBold && <span style={{ width: 18, height: 1, background: 'currentColor', display: 'inline-block' }} />}
            {event.event_type} · {event.city || 'an occasion'}
          </div>

          {/* Title */}
          <div style={{
            fontFamily: isBold ? 'var(--font-geist, sans-serif)' : 'var(--font-instrument, serif)',
            fontStyle: isBold ? 'normal' : 'italic',
            fontWeight: isBold ? 900 : 400,
            fontSize: 52, lineHeight: 0.96,
            letterSpacing: isBold ? '-0.04em' : '-0.02em',
            color: fg, wordBreak: 'break-word', marginBottom: 12,
          }}>
            {event.title}.
          </div>
          <div style={{ fontSize: 13, color: fgMuted, marginBottom: 28 }}>Hosted by {event.host_name}</div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {dateStr && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: fg }}>
                <Calendar size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{dateStr}{event.event_time ? ` · ${event.event_time}` : ''}</span>
              </div>
            )}
            {(event.venue || event.city) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: fg }}>
                <MapPin size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{[event.venue, event.city].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {event.dress_code && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: fg }}>
                <Shirt size={14} color={accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{event.dress_code}</span>
              </div>
            )}
            {stats.in > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: accent }}>
                <Users size={14} color={accent} style={{ flexShrink: 0 }} />
                <span>{stats.in} {stats.in === 1 ? 'person' : 'people'} going{stats.maybe > 0 ? ` · ${stats.maybe} maybe` : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ padding: '24px 28px 48px', borderTop: `1px solid ${border}`, background: panelBg }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {deadlineStr && (
            <p style={{ fontSize: 11, color: fgMuted, marginBottom: 14, textAlign: 'center', letterSpacing: '0.08em' }}>
              RSVP by {deadlineStr}
            </p>
          )}
          {event.invite_live ? (
            <>
              <button
                onClick={() => setStep('rsvp')}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 99, border: 'none',
                  background: accent, color: '#fff',
                  fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                RSVP to this event <ArrowRight size={13} />
              </button>
              {availableGifts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 11, color: fgMuted }}>
                  <Gift size={11} />
                  <span>Gift registry available</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <p style={{ fontSize: 12, color: fgMuted, margin: 0 }}>RSVP opens soon — check back shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
