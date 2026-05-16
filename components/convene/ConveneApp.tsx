'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home, Users, Mail, Sparkles, Image, Plus, Bell, Share2, Copy,
  ArrowLeft, ArrowRight, Search, ChevronRight, Settings,
  Calendar, MapPin, Clock, Check, X, Loader2, Camera, QrCode,
  LayoutGrid, Utensils, Wine, Heart, Music, Gift, Phone,
  Send, Pencil, Trash2, CheckCircle, XCircle, AlertCircle,
  ScanLine, Eye, RefreshCw, LogOut, LogIn, Star, Zap,
} from 'lucide-react';
import {
  Avatar, Eyebrow, Tag, Chip, Btn, Bar, Dial, QRBlock,
  Card, Wordmark, MiddleDot, Hr,
  EVENT_TYPE_META, ACCENT_COLORS, ACCENT_SOFT, ACCENT_LINE,
  type EventType,
} from '@/components/convene/primitives';

// ─── Types ────────────────────────────────────────────────────
interface CvEvent {
  id: string; user_id: string; slug: string | null; title: string; event_type: string;
  host_name: string; event_date: string | null; event_time: string | null;
  city: string | null; venue: string | null; address: string | null;
  capacity: number; dress_code: string | null; invite_direction: string;
  invite_live: boolean; cover_url: string | null; rsvp_deadline: string | null;
  days_out: number | null; created_at: string; updated_at: string;
  // stats (client-computed)
  stats?: { in: number; maybe: number; out: number; pending: number; total: number; arrived: number };
}
interface CvGuest {
  id: string; event_id: string; name: string; email: string | null; phone: string | null;
  party_size: number; table_id: string | null; rsvp_state: string;
  dietary: string | null; relation: string | null; pass_token: string;
  arrived_at: string | null; invite_sent_at: string | null; created_at: string;
}
interface CvPhoto { id: string; event_id: string; url: string; uploader_name: string | null; caption: string | null; created_at: string; }

type Tab = 'event' | 'guests' | 'invite' | 'tonight' | 'after';
type Screen = 'home' | 'create' | 'guest-list' | 'seating' | 'invite-designer' | 'invite-preview' | 'scanner' | 'dashboard' | 'photos' | 'thankyou' | 'concierge';

// ─── Accent helpers ───────────────────────────────────────────
function accentVars(type: string) {
  const t = (type || 'wedding') as EventType;
  return {
    '--cv-accent': ACCENT_COLORS[t] || '#c0975a',
    '--cv-accent-soft': ACCENT_SOFT[t] || 'rgba(192,151,90,.10)',
    '--cv-accent-line': ACCENT_LINE[t] || 'rgba(192,151,90,.30)',
  } as React.CSSProperties;
}

// ─── Shared layout atoms ──────────────────────────────────────
function TopBar({ left, right, dark }: { left?: React.ReactNode; right?: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 56, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px',
      background: dark ? 'rgba(20,17,14,.90)' : 'rgba(250,246,238,.88)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--cv-hairline)',
    }}>
      <div>{left || <Wordmark tone={dark ? 'cream' : 'ink'} />}</div>
      <div style={{ display: 'flex', gap: 8 }}>{right}</div>
    </div>
  );
}

function IBtn({ icon: Icon, onClick, dark, dot, badge }: { icon: React.ElementType; onClick?: () => void; dark?: boolean; dot?: boolean; badge?: string }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 9999, flexShrink: 0,
      background: dark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.7)',
      border: '1px solid var(--cv-hairline)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: dark ? 'var(--cv-ivory)' : 'var(--cv-ink)', position: 'relative',
    }}>
      <Icon size={14} />
      {dot && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: 99, background: 'var(--cv-accent)', border: '2px solid var(--cv-ivory)' }} />}
      {badge && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 99, background: 'var(--cv-accent)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{badge}</span>}
    </button>
  );
}

function ScrollPane({ children, topPad = 56, bottomPad = 80, dark }: { children: React.ReactNode; topPad?: number; bottomPad?: number; dark?: boolean }) {
  return (
    <div className="cv-scrollbar" style={{
      position: 'absolute', inset: 0,
      paddingTop: topPad, paddingBottom: bottomPad,
      paddingLeft: 14, paddingRight: 14,
      overflowY: 'auto', overflowX: 'hidden',
      background: dark ? 'var(--cv-ink)' : 'var(--cv-ivory)',
    }}>
      {children}
    </div>
  );
}

function Dock({ active, onTab }: { active: Tab; onTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'event',   label: 'Event',  Icon: Home },
    { id: 'guests',  label: 'Guests', Icon: Users },
    { id: 'invite',  label: 'Invite', Icon: Mail },
    { id: 'tonight', label: 'Tonight',Icon: Sparkles },
    { id: 'after',   label: 'After',  Icon: Image },
  ];
  return (
    <div style={{ position: 'absolute', left: 10, right: 10, bottom: 12, zIndex: 100 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 5,
        background: 'rgba(255,255,255,.92)', borderRadius: 9999,
        border: '1px solid var(--cv-hairline)',
        boxShadow: '0 8px 28px rgba(26,23,20,.12)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTab(id)}
            style={{
              flex: 1, minHeight: 44, padding: 4,
              background: active === id ? 'var(--cv-accent-soft)' : 'transparent',
              border: 'none', cursor: 'pointer', borderRadius: 9999,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              color: active === id ? 'var(--cv-accent)' : 'var(--cv-muted-2)',
              fontFamily: 'var(--font-geist, system-ui)', fontWeight: 700,
              fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              transition: 'color .15s',
            }}
          >
            <Icon size={15} strokeWidth={active === id ? 2.2 : 1.6} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN: No events / onboarding ──────────────────────────
const EVENT_TYPES = Object.entries(EVENT_TYPE_META).map(([id, m]) => ({ id: id as EventType, ...m }));

function ScreenCreateEvent({ onCreated }: { onCreated: (ev: CvEvent) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [hostName, setHostName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('150');
  const [loading, setLoading] = useState(false);
  const accent = ACCENT_COLORS[eventType];

  async function handleCreate() {
    if (!hostName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/convene/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          host_name: hostName,
          title: hostName,
          city: city || null,
          event_date: date || null,
          venue: venue || null,
          capacity: parseInt(capacity) || 150,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onCreated(data.event);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cv-scrollbar" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--cv-ivory)', padding: '24px 18px 40px' }}>
      <div style={{ animation: 'cv-fade-up .35s ease both' }}>
        {step === 1 ? (
          <>
            <Eyebrow muted>Step 1 of 2 · The kind</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 36, lineHeight: .96, marginTop: 10, color: 'var(--cv-ink)' }}>
              What are you<br/>
              <em style={{ color: accent }}>throwing</em>?
            </h1>
            <p style={{ fontSize: 13, color: 'var(--cv-muted)', marginTop: 6, marginBottom: 20 }}>It changes the language, the look, the templates.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {EVENT_TYPES.map(et => (
                <button
                  key={et.id}
                  onClick={() => setEventType(et.id)}
                  style={{
                    padding: '14px 8px', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                    background: eventType === et.id ? 'var(--cv-ink)' : 'var(--cv-paper)',
                    color: eventType === et.id ? 'var(--cv-ivory)' : 'var(--cv-ink)',
                    border: `1px solid ${eventType === et.id ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
                    transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{et.icon}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600 }}>{et.label}</span>
                </button>
              ))}
            </div>

            <Btn fullWidth onClick={() => setStep(2)}>
              Continue <ArrowRight size={13} />
            </Btn>
          </>
        ) : (
          <>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cv-muted)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              <ArrowLeft size={13} /> Back
            </button>
            <Eyebrow muted>Step 2 of 2 · The details</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 34, lineHeight: .96, marginTop: 10, color: 'var(--cv-ink)', marginBottom: 20 }}>
              Set the stage.
            </h1>

            <Card style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 4 }}>Who is this for</div>
                  <input
                    className="cv-input"
                    placeholder={eventType === 'wedding' ? 'Adaeze & Marcus' : eventType === 'birthday' ? 'Tunde\'s 30th' : 'Name the event'}
                    value={hostName}
                    onChange={e => setHostName(e.target.value)}
                    style={{ '--cv-accent': accent } as React.CSSProperties}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 4 }}>Date</div>
                    <input className="cv-input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ '--cv-accent': accent } as React.CSSProperties} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 4 }}>City</div>
                    <input className="cv-input" placeholder="Lagos" value={city} onChange={e => setCity(e.target.value)} style={{ '--cv-accent': accent } as React.CSSProperties} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 4 }}>Venue (optional)</div>
                  <input className="cv-input" placeholder="Maroko House, Ikoyi" value={venue} onChange={e => setVenue(e.target.value)} style={{ '--cv-accent': accent } as React.CSSProperties} />
                </div>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 8 }}>Expected guests</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['~30', '~80', '~150', '~300', '500+'].map((s, i) => {
                      const vals = ['30', '80', '150', '300', '500'];
                      return (
                        <Chip key={s} on={capacity === vals[i]} onClick={() => setCapacity(vals[i])} style={{ flex: 1, justifyContent: 'center', padding: '8px 0', '--cv-accent': accent } as React.CSSProperties}>{s}</Chip>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Btn fullWidth onClick={handleCreate} style={{ '--cv-accent': accent, '--cv-ink': 'var(--cv-ink)' } as React.CSSProperties}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={13} /> Start planning</>}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: Event Home ───────────────────────────────────────
function ScreenEventHome({
  event, stats, onEdit, onConcierge,
}: {
  event: CvEvent;
  stats: { in: number; maybe: number; out: number; pending: number; total: number; arrived: number };
  onEdit: () => void;
  onConcierge: () => void;
}) {
  const replyRate = stats.total ? (stats.in + stats.out + stats.maybe) / stats.total : 0;
  const capacityRate = event.capacity ? stats.in / event.capacity : 0;
  const daysOut = event.days_out ?? 0;

  const typeLabel = EVENT_TYPE_META[event.event_type as EventType]?.label || event.event_type;

  return (
    <>
      <TopBar
        right={<>
          <IBtn icon={Pencil} onClick={onEdit} />
          <IBtn icon={Bell} dot />
        </>}
      />
      <ScrollPane topPad={64}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'cv-fade-up .35s ease both' }}>

          {/* Hero */}
          <section>
            <Eyebrow>{typeLabel.toUpperCase()}{event.city ? ` · ${event.city.toUpperCase()}` : ''}</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 36, lineHeight: .94, marginTop: 8, color: 'var(--cv-ink)' }}>
              {event.host_name}
            </h1>
            {event.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12.5, color: 'var(--cv-muted)' }}>
                <Calendar size={12} color="var(--cv-accent)" />
                {new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                <MiddleDot />
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{daysOut}</span> days out
              </div>
            )}
          </section>

          {/* Metrics card */}
          <Card style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Dial value={daysOut > 0 ? 1 - daysOut / 365 : 1} size={80} stroke={5}>
                <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--cv-ink)', fontVariantNumeric: 'tabular-nums' }}>{daysOut}</span>
                <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', fontWeight: 700 }}>days</span>
              </Dial>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--cv-muted)' }}>
                  <span>Replied</span><span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{Math.round(replyRate * 100)}%</span>
                </div>
                <Bar value={replyRate} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--cv-muted)', marginTop: 2 }}>
                  <span>Capacity</span><span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{stats.in}/{event.capacity}</span>
                </div>
                <Bar value={capacityRate} accent />
              </div>
            </div>
          </Card>

          {/* Four corners */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Guests', val: stats.total, sub: 'invited', v: Math.min(1, stats.total / Math.max(1, event.capacity)), Icon: Users },
              { label: 'Invite', val: event.invite_live ? 'LIVE' : 'DRAFT', sub: event.invite_live ? 'sent & tracking' : 'not sent yet', v: event.invite_live ? 0.95 : 0.10, Icon: Mail },
              { label: 'Coming', val: stats.in, sub: 'confirmed yes', v: Math.min(1, stats.in / Math.max(1, stats.total)), Icon: CheckCircle },
              { label: 'Pending', val: stats.pending, sub: 'no reply yet', v: stats.pending / Math.max(1, stats.total), Icon: Clock },
            ].map(({ label, val, sub, v, Icon: IconComp }) => (
              <Card key={label} style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--cv-muted-2)' }}>{label}</span>
                  <IconComp size={12} color="var(--cv-accent)" />
                </div>
                <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--cv-ink)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                <div style={{ fontSize: 10.5, color: 'var(--cv-muted)', marginTop: 3 }}>{sub}</div>
                <div style={{ height: 3, background: 'var(--cv-hairline)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${v * 100}%`, height: '100%', background: 'var(--cv-accent)', borderRadius: 99, transition: 'width .4s' }} />
                </div>
              </Card>
            ))}
          </div>

          {/* AI concierge card */}
          <Card tinted style={{ padding: 14 }} onClick={onConcierge}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Sparkles size={16} color="var(--cv-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--cv-ink)', marginBottom: 4 }}>The concierge is ready.</div>
                <p style={{ fontSize: 12.5, color: 'var(--cv-muted)' }}>Ask for venues, a theme, a timeline, vendor pitches, or weather forecasts. Tap to open.</p>
              </div>
              <ChevronRight size={16} color="var(--cv-muted-2)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            </div>
          </Card>

          {/* Invite live card */}
          {event.invite_live && event.slug && (
            <Card dark style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT_COLORS[event.event_type as EventType] || '#c0975a'} 50%, transparent)` }} />
              <Eyebrow style={{ color: 'var(--cv-accent)' }}>Live · convene.to/{event.slug}</Eyebrow>
              <h3 style={{ color: 'var(--cv-ivory)', fontSize: 19, margin: '8px 0', fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic' }}>The invite is in the world.</h3>
              <p style={{ color: 'rgba(250,246,238,.6)', fontSize: 12, marginBottom: 12 }}>
                {stats.total} sent · {stats.in + stats.maybe + stats.out} replied · {stats.in} said yes.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="accent" size="tiny" onClick={() => navigator.clipboard?.writeText(`https://convene.app/rsvp/${event.slug}`)}>
                  <Copy size={10} /> Copy link
                </Btn>
                <Btn size="tiny" style={{ background: 'rgba(255,255,255,.10)', color: 'var(--cv-ivory)' }}>
                  <Eye size={10} /> Preview
                </Btn>
              </div>
            </Card>
          )}

        </div>
      </ScrollPane>
    </>
  );
}

// ─── SCREEN: Guest List ───────────────────────────────────────
const RSVP_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  in:      { label: 'Coming',  color: 'var(--cv-accent)',  Icon: CheckCircle },
  maybe:   { label: 'Maybe',   color: 'var(--cv-muted)',   Icon: AlertCircle },
  out:     { label: 'Regrets', color: '#a8a8a8',           Icon: XCircle },
  pending: { label: 'Pending', color: 'var(--cv-muted-2)', Icon: Clock },
};

function ScreenGuestList({
  event, guests, stats, onBack, onAdd, onRefresh,
}: {
  event: CvEvent; guests: CvGuest[];
  stats: { in: number; maybe: number; out: number; pending: number; total: number; arrived: number };
  onBack: () => void; onAdd: () => void; onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRelation, setAddRelation] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = filter === 'all' ? guests : guests.filter(g => g.rsvp_state === filter);

  async function addGuest() {
    if (!addName.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/convene/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, name: addName, email: addEmail || null, relation: addRelation || null }),
      });
      setAddName(''); setAddEmail(''); setAddRelation('');
      setShowAdd(false);
      onRefresh();
    } finally { setSaving(false); }
  }

  async function nudgePending() {
    /* In production: trigger email/SMS to pending guests */
    alert(`Nudge sent to ${stats.pending} guests.`);
  }

  const replyRate = stats.total ? (stats.in + stats.out + stats.maybe) / stats.total : 0;

  return (
    <>
      <TopBar
        left={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onBack} style={{ width: 28, height: 28, borderRadius: 99, background: 'rgba(255,255,255,.7)', border: '1px solid var(--cv-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={13} />
          </button>
          <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18 }}>Guests</span>
        </div>}
        right={<>
          <IBtn icon={Search} />
          <IBtn icon={Plus} onClick={() => setShowAdd(true)} />
        </>}
      />
      <ScrollPane topPad={64}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'cv-fade-up .35s ease both' }}>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="cv-scrollbar">
            {[
              { id: 'all',     label: 'All',     count: stats.total },
              { id: 'in',      label: 'Coming',  count: stats.in },
              { id: 'maybe',   label: 'Maybe',   count: stats.maybe },
              { id: 'out',     label: 'Regrets', count: stats.out },
              { id: 'pending', label: 'Pending', count: stats.pending },
            ].map(c => (
              <Chip key={c.id} on={filter === c.id} onClick={() => setFilter(c.id)} style={{ padding: '8px 12px', gap: 7 }}>
                {c.label}
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: filter === c.id ? 'var(--cv-ivory)' : 'var(--cv-ink)' }}>{c.count}</span>
              </Chip>
            ))}
          </div>

          {/* Stats card */}
          <Card style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11, color: 'var(--cv-muted)' }}>
              <span>Reply rate</span><span style={{ fontWeight: 700 }}>{Math.round(replyRate * 100)}%</span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', background: 'var(--cv-hairline)' }}>
              <div style={{ flex: stats.in,      background: 'var(--cv-accent)', transition: 'flex .4s' }} />
              <div style={{ flex: stats.maybe,   background: '#d4cab4', transition: 'flex .4s' }} />
              <div style={{ flex: stats.out,     background: '#a8a8a8', transition: 'flex .4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--cv-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--cv-accent)', display: 'inline-block' }} />In · {stats.in}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#d4cab4', display: 'inline-block' }} />Maybe · {stats.maybe}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#a8a8a8', display: 'inline-block' }} />Regret · {stats.out}</span>
              <span style={{ color: 'var(--cv-muted-2)' }}>{stats.pending} silent</span>
            </div>
            <Hr />
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <Btn variant="cream" size="tiny" style={{ flex: 1 }} onClick={nudgePending}>
                <Send size={10} /> Nudge silent ({stats.pending})
              </Btn>
              <Btn variant="cream" size="tiny" style={{ flex: 1 }}>
                <ArrowRight size={10} /> Export
              </Btn>
            </div>
          </Card>

          {/* Add guest form */}
          {showAdd && (
            <Card style={{ padding: 14 }}>
              <Eyebrow muted style={{ marginBottom: 12 }}>Add a guest</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 3 }}>Full name</div>
                  <input className="cv-input" placeholder="Tunde Bakare" value={addName} onChange={e => setAddName(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 3 }}>Email (optional)</div>
                  <input className="cv-input" type="email" placeholder="tunde@example.com" value={addEmail} onChange={e => setAddEmail(e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 3 }}>Relation (optional)</div>
                  <input className="cv-input" placeholder="Family · Bride" value={addRelation} onChange={e => setAddRelation(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</Btn>
                  <Btn size="sm" style={{ flex: 1 }} onClick={addGuest}>
                    {saving ? <Loader2 size={12} className="animate-spin" /> : 'Add guest'}
                  </Btn>
                </div>
              </div>
            </Card>
          )}

          {/* Guest rows */}
          <div style={{ fontSize: 18, fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', color: 'var(--cv-ink)', marginTop: 4 }}>
            {filter === 'all' ? 'Everyone' : RSVP_META[filter]?.label || filter}
            <span style={{ fontSize: 12, color: 'var(--cv-muted)', fontFamily: 'var(--font-geist, sans-serif)', fontStyle: 'normal', marginLeft: 8 }}>({filtered.length})</span>
          </div>

          {filtered.length === 0 ? (
            <Card tinted style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--cv-muted)' }}>No guests here yet. Add one above.</p>
            </Card>
          ) : (
            <Card flat style={{ padding: 0 }}>
              {filtered.map((g, i) => {
                const m = RSVP_META[g.rsvp_state] || RSVP_META.pending;
                return (
                  <div key={g.id} style={{
                    padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--cv-hairline)' : 'none',
                  }}>
                    <Avatar initial={g.name[0]} index={i % 8} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: m.color }}>
                          <m.Icon size={11} /> {m.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--cv-muted-2)', marginTop: 2, display: 'flex', gap: 6 }}>
                        {g.relation && <span>{g.relation}</span>}
                        {g.dietary && <><MiddleDot /><span>{g.dietary}</span></>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </ScrollPane>
    </>
  );
}

// ─── SCREEN: Invite Designer ──────────────────────────────────
type InviteDir = 'editorial' | 'bold' | 'mono';

function InvitePreview({ event, direction, recipient = 'You' }: { event: CvEvent; direction: InviteDir; recipient?: string }) {
  const accent = ACCENT_COLORS[event.event_type as EventType] || '#c0975a';
  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  if (direction === 'bold') return (
    <div style={{ height: '100%', background: '#1a1714', color: '#faf6ee', padding: '44px 22px 22px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: accent }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-block', padding: '6px 10px', background: '#fff', color: '#000', fontWeight: 900, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 10 }}>
          {event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '--'} / {EVENT_TYPE_META[event.event_type as EventType]?.label?.toUpperCase() || 'EVENT'}
        </div>
        <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(250,246,238,.7)', marginBottom: 20 }}>For {recipient}</div>
        <div style={{ fontWeight: 900, fontSize: 64, letterSpacing: '-0.04em', lineHeight: .84, color: '#faf6ee', fontFamily: 'var(--font-geist, sans-serif)', wordBreak: 'break-word' }}>
          {event.host_name.toUpperCase()}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: '1px solid rgba(250,246,238,.15)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 11.5, color: '#faf6ee', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(250,246,238,.5)', marginBottom: 3 }}>When</div>
            {dateStr}<br/>{event.event_time || '—'}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(250,246,238,.5)', marginBottom: 3 }}>Where</div>
            {event.venue || '—'}<br/>{event.city || '—'}
          </div>
        </div>
        <button style={{ width: '100%', padding: '11px 0', borderRadius: 99, background: accent, border: 'none', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Reply →
        </button>
      </div>
    </div>
  );

  if (direction === 'mono') return (
    <div style={{ height: '100%', background: '#faf6ee', color: '#1a1714', padding: '44px 22px 22px', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-geist-mono, monospace)', position: 'relative' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.20em', color: 'rgba(26,23,20,.5)', marginBottom: 20 }}>
        doc/inv · {event.id?.slice(0, 8) || '00000000'}
        <br />for: {recipient}
      </div>
      <div style={{ fontSize: 11, letterSpacing: '0.10em', color: 'rgba(26,23,20,.55)', marginBottom: 6 }}>─── {event.event_type} ───</div>
      <div style={{ fontSize: 32, fontWeight: 400, color: '#1a1714', letterSpacing: '0.02em', lineHeight: 1.1, wordBreak: 'break-word' }}>
        {event.host_name}
      </div>
      <div style={{ height: 1, borderTop: '1px dashed rgba(26,23,20,.25)', margin: '16px 0' }} />
      <div style={{ fontSize: 11, color: 'rgba(26,23,20,.7)', lineHeight: 1.7 }}>
        {event.event_date ? `date: ${dateStr}` : 'date: tbc'}<br />
        {event.event_time ? `time: ${event.event_time}` : 'time: tbc'}<br />
        {event.venue ? `venue: ${event.venue}` : ''}<br />
        {event.city ? `city: ${event.city}` : ''}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <div style={{ height: 1, borderTop: '1px dashed rgba(26,23,20,.20)', marginBottom: 12 }} />
        <button style={{ width: '100%', padding: '10px 0', border: '1px solid rgba(26,23,20,.30)', background: 'transparent', color: '#1a1714', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', cursor: 'pointer' }}>
          [reply] →
        </button>
      </div>
    </div>
  );

  // Editorial (default)
  return (
    <div style={{ height: '100%', background: '#f4ede0', color: '#1a1714', padding: '44px 26px 26px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Ornament arcs */}
      <svg width="100%" height="100%" viewBox="0 0 360 720" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx="280" cy="120" rx={20 + i * 24} ry={14 + i * 10} fill="none" stroke={accent} strokeWidth="0.4" opacity={0.15 + i * 0.04} />
        ))}
      </svg>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: accent }}>
          <span style={{ width: 18, height: 1, background: 'currentColor' }} />
          {EVENT_TYPE_META[event.event_type as EventType]?.label || 'Event'}
          {event.city ? ` · ${event.city}` : ''}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, fontWeight: 500, color: 'rgba(26,23,20,.55)' }}>For</div>
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 44, lineHeight: .96, color: '#1a1714', letterSpacing: '-0.02em', marginTop: 2 }}>
          {recipient}.
        </div>
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(26,23,20,.5)' }}>From</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 46, color: '#1a1714', letterSpacing: '-0.02em', lineHeight: 1.02, wordBreak: 'break-word' }}>
            {event.host_name}.
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(26,23,20,.18)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 11.5, color: '#1a1714' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(26,23,20,.5)', marginBottom: 3 }}>When</div>
              {dateStr}<br />{event.event_time || ''}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(26,23,20,.5)', marginBottom: 3 }}>Where</div>
              {event.venue || '—'}<br />{event.city || '—'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(26,23,20,.5)' }}>
              {event.dress_code || (event.event_type === 'wedding' ? 'Black tie' : 'Smart casual')}
            </div>
            <button style={{ padding: '10px 18px', borderRadius: 99, background: '#1a1714', color: '#f4ede0', border: 'none', fontWeight: 700, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Reply →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenInvite({ event, onBack }: { event: CvEvent; onBack: () => void }) {
  const [direction, setDirection] = useState<InviteDir>((event.invite_direction as InviteDir) || 'editorial');
  const [saving, setSaving] = useState(false);

  const dirs: { id: InviteDir; label: string }[] = [
    { id: 'editorial', label: 'Editorial' },
    { id: 'bold', label: 'Bold' },
    { id: 'mono', label: 'Mono' },
  ];

  async function saveDirection() {
    setSaving(true);
    try {
      await fetch(`/api/convene/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_direction: direction }),
      });
    } finally { setSaving(false); }
  }

  async function goLive() {
    setSaving(true);
    try {
      await fetch(`/api/convene/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_direction: direction, invite_live: true }),
      });
      window.location.reload();
    } finally { setSaving(false); }
  }

  return (
    <>
      <TopBar
        left={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onBack} style={{ width: 28, height: 28, borderRadius: 99, background: 'rgba(255,255,255,.7)', border: '1px solid var(--cv-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={13} />
          </button>
          <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18 }}>Invite</span>
        </div>}
        right={<IBtn icon={Share2} />}
      />
      <ScrollPane topPad={64}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'cv-fade-up .35s ease both' }}>

          <div>
            <Eyebrow muted>Choose a direction</Eyebrow>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {dirs.map(d => (
                <Chip key={d.id} on={direction === d.id} onClick={() => setDirection(d.id)} style={{ flex: 1, justifyContent: 'center' }}>{d.label}</Chip>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ borderRadius: 18, overflow: 'hidden', height: 480, border: '1px solid var(--cv-hairline)', boxShadow: '0 8px 24px rgba(26,23,20,.10)' }}>
            <InvitePreview event={event} direction={direction} recipient="Guest" />
          </div>

          <Card tinted style={{ padding: 12 }}>
            <p style={{ fontSize: 12.5, color: 'var(--cv-muted)', margin: 0 }}>
              Each guest receives a unique version with their name. The invite lives at a shareable link and updates live.
            </p>
          </Card>

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" style={{ flex: 1 }} onClick={saveDirection}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : 'Save direction'}
            </Btn>
            <Btn style={{ flex: 1 }} onClick={goLive}>
              <Zap size={13} /> {event.invite_live ? 'Update live' : 'Go live'}
            </Btn>
          </div>

          {event.invite_live && (
            <Card dark style={{ padding: 14 }}>
              <Eyebrow style={{ color: 'var(--cv-accent)' }}>Live</Eyebrow>
              <p style={{ fontSize: 12.5, color: 'rgba(250,246,238,.7)', margin: '6px 0 10px' }}>
                Share this link with guests. Each person gets their own personalised pass.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                <span style={{ flex: 1, fontSize: 11, color: 'rgba(250,246,238,.7)', fontFamily: 'var(--font-geist-mono, monospace)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  convene.app/rsvp/{event.slug || event.id.slice(0, 8)}
                </span>
                <button onClick={() => navigator.clipboard?.writeText(`https://convene.app/rsvp/${event.slug || event.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cv-accent)' }}>
                  <Copy size={14} />
                </button>
              </div>
            </Card>
          )}
        </div>
      </ScrollPane>
    </>
  );
}

// ─── SCREEN: Tonight (Scanner + Live Dashboard) ───────────────
function ScreenScanner({ event, onBack }: { event: CvEvent; onBack: () => void }) {
  const [arrived, setArrived] = useState(0);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', color: '#faf6ee' }}>
      <TopBar dark
        left={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#e85d4b', display: 'inline-block' }} className="cv-pulse-dot" />
          <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18, color: '#faf6ee' }}>Door · live</span>
        </div>}
        right={<IBtn icon={Settings} dark />}
      />

      <div style={{ position: 'absolute', top: 56, left: 14, right: 14, bottom: 0, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { l: 'IN', n: arrived, c: 'var(--cv-accent)' },
            { l: 'EXPECTED', n: event.capacity, c: 'rgba(250,246,238,.5)' },
            { l: 'GATE', n: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), c: '#faf6ee' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(250,246,238,.5)', marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 22, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
            </div>
          ))}
        </div>

        {/* Scanner viewport */}
        <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,.10)', position: 'relative' }}>
          {/* Faux camera feed */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(192,151,90,.15) 0%, transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,.015) 0 1px, transparent 1px 3px)' }} />
          {/* Viewport frame */}
          <div style={{ position: 'absolute', inset: '20%', border: `2px solid ${ACCENT_COLORS[event.event_type as EventType] || '#c0975a'}`, borderRadius: 8 }}>
            {(['tl', 'tr', 'bl', 'br'] as const).map(k => (
              <span key={k} style={{
                position: 'absolute',
                ...(k.includes('t') ? { top: -2 } : { bottom: -2 }),
                ...(k.includes('l') ? { left: -2 } : { right: -2 }),
                width: 18, height: 18,
                borderTop: k.includes('t') ? '3px solid #fff' : 'none',
                borderBottom: k.includes('b') ? '3px solid #fff' : 'none',
                borderLeft: k.includes('l') ? '3px solid #fff' : 'none',
                borderRight: k.includes('r') ? '3px solid #fff' : 'none',
              }} />
            ))}
          </div>
          {/* Scanning line */}
          <div className="cv-scanner-line" style={{ position: 'absolute', left: '22%', right: '22%', height: 2, background: ACCENT_COLORS[event.event_type as EventType] || '#c0975a', boxShadow: `0 0 12px ${ACCENT_COLORS[event.event_type as EventType] || '#c0975a'}` }} />
          {/* Hint */}
          <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.14)', fontWeight: 700, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: '#faf6ee' }}>
              <QrCode size={12} color="var(--cv-accent)" /> Aim at guest's pass
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" style={{ flex: 1, background: 'rgba(255,255,255,.08)', color: '#faf6ee', borderColor: 'rgba(255,255,255,.15)' }} onClick={onBack}>
            <ArrowLeft size={12} /> Back
          </Btn>
          <Btn style={{ flex: 1 }} onClick={() => setArrived(a => a + 1)}>
            <Plus size={12} /> Walk-in
          </Btn>
        </div>
      </div>
    </div>
  );
}

function ScreenLiveDash({ event, stats, onScanner }: {
  event: CvEvent;
  stats: { in: number; maybe: number; out: number; pending: number; total: number; arrived: number };
  onScanner: () => void;
}) {
  const capacity = event.capacity || 150;
  const pct = Math.round((stats.arrived / capacity) * 100);

  return (
    <>
      <TopBar
        left={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#e85d4b', display: 'inline-block' }} className="cv-pulse-dot" />
          <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18 }}>Tonight</span>
        </div>}
        right={<>
          <IBtn icon={QrCode} onClick={onScanner} />
          <IBtn icon={Bell} dot />
        </>}
      />
      <ScrollPane topPad={64}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'cv-fade-up .35s ease both' }}>

          {/* Headline */}
          <Card style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Eyebrow muted>In the room</Eyebrow>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 64, lineHeight: 1, color: 'var(--cv-accent)', fontVariantNumeric: 'tabular-nums' }}>{stats.arrived}</span>
                  <span style={{ fontSize: 14, color: 'var(--cv-muted)' }}>/ {capacity}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginTop: 4 }}>{pct}% capacity</div>
              </div>
              <Dial value={pct / 100} size={64} stroke={5}>
                <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
              </Dial>
            </div>
          </Card>

          {/* Run of show */}
          <Card flat style={{ padding: 0 }}>
            <div style={{ padding: '12px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Eyebrow muted>Run of show</Eyebrow>
            </div>
            {[
              { t: '19:30', l: 'Ceremony begins', s: 'All guests seated' },
              { t: '20:00', l: 'Cocktail hour', s: 'Garden · live music' },
              { t: '20:30', l: 'Dinner service', s: '3 courses · catering briefed' },
              { t: '22:00', l: 'Toasts & speeches', s: '4 speakers · ~20 min' },
            ].map((r, i, a) => (
              <div key={i} style={{ padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center', borderBottom: i < a.length - 1 ? '1px solid var(--cv-hairline)' : 'none' }}>
                <span style={{ width: 44, fontSize: 12, fontWeight: 700, color: i === 0 ? 'var(--cv-accent)' : 'var(--cv-ink)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-geist-mono, monospace)' }}>{r.t}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.l}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--cv-muted)' }}>{r.s}</div>
                </div>
                {i === 0 && <Tag>NEXT</Tag>}
              </div>
            ))}
          </Card>

          <Btn fullWidth onClick={onScanner}>
            <QrCode size={13} /> Open door scanner
          </Btn>
        </div>
      </ScrollPane>
    </>
  );
}

// ─── SCREEN: After (Photo Wall + Thank Yous) ──────────────────
function ScreenAfter({
  event, photos, onBack, onUploadPhoto,
}: {
  event: CvEvent; photos: CvPhoto[];
  onBack: () => void;
  onUploadPhoto: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <TopBar
        left={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18 }}>After</span>
        </div>}
        right={<IBtn icon={Camera} onClick={() => fileRef.current?.click()} />}
      />
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onUploadPhoto(e.target.files[0])} />

      <ScrollPane topPad={64}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'cv-fade-up .35s ease both' }}>

          <Eyebrow muted>{event.host_name}</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 30, lineHeight: 1.02, color: 'var(--cv-ink)', marginTop: -4 }}>
            The night<br />in photographs.
          </h2>

          {photos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {photos.map((p, i) => (
                <div key={p.id} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--cv-hairline)', background: 'var(--cv-ivory-2)' }}>
                  <img src={p.url} alt={p.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          ) : (
            <Card tinted style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Camera size={24} color="var(--cv-muted-2)" />
              <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--cv-ink)' }}>Photos live here.</div>
              <p style={{ fontSize: 12.5, color: 'var(--cv-muted)' }}>Upload from the night. Guests can add theirs from their pass link.</p>
              <Btn onClick={() => fileRef.current?.click()}>
                <Camera size={13} /> Add first photo
              </Btn>
            </Card>
          )}

          {/* Thank you section */}
          <div style={{ paddingTop: 8 }}>
            <Hr />
            <div style={{ paddingTop: 14 }}>
              <Eyebrow muted>Thank yous</Eyebrow>
              <p style={{ fontSize: 13, color: 'var(--cv-muted)', marginTop: 8, marginBottom: 12 }}>
                The concierge can draft personalised notes for each guest. Open the concierge and ask it to write a thank-you.
              </p>
              <Card tinted style={{ padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--cv-ink)', marginBottom: 8 }}>
                  Dear Tunde,
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--cv-muted)', lineHeight: 1.6 }}>
                  Your presence on the night made the room what it was. Thank you for travelling, for the honeymoon fund — it's going towards Santorini in October — and for dancing until the very end.
                </p>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Chip style={{ padding: '6px 10px', fontSize: 10 }}>Warmer</Chip>
                  <Chip style={{ padding: '6px 10px', fontSize: 10 }}>Shorter</Chip>
                  <Chip style={{ padding: '6px 10px', fontSize: 10 }}>Mention the gift</Chip>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </ScrollPane>
    </>
  );
}

// ─── SCREEN: AI Concierge ─────────────────────────────────────
interface Message { role: 'user' | 'concierge'; text: string; }

function ScreenConcierge({ event, onClose }: { event: CvEvent; onClose: () => void }) {
  const [thread, setThread] = useState<Message[]>([
    { role: 'concierge', text: `I'm Convene — your planner. ${event.host_name}, ${event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'date TBC'}${event.city ? `, ${event.city}` : ''}. Tell me what to chase.` },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, busy]);

  const PROMPTS = [
    { l: 'Venue shortlist', q: `Suggest 3 venues for a ${event.event_type} with ${event.capacity} guests${event.city ? ` in ${event.city}` : ''}. Include price tier and one reason to pick each.` },
    { l: 'A theme', q: `Propose 3 theme directions for our ${event.event_type}. Name each in 2 words, 1-sentence description, suggested palette.` },
    { l: '12-week timeline', q: `Give me a 12-week countdown checklist for a ${event.capacity}-person ${event.event_type}. 5 items per week max.` },
    { l: 'Welcome copy', q: `Write 3 short welcome lines for our invite — warm, polished, second person. No exclamation marks.` },
    { l: 'Vendor brief', q: `Draft a brief I can send to a florist for our ${event.event_type}${event.city ? ` in ${event.city}` : ''}. Under 80 words.` },
    { l: 'Weather & plan B', q: `Expected weather for a ${event.event_type}${event.event_date ? ` on ${new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : ''}${event.city ? ` in ${event.city}` : ''}? What's a good plan B for outdoor ceremony?` },
  ];

  async function ask(prompt: string) {
    if (!prompt.trim() || busy) return;
    const userMsg: Message = { role: 'user', text: prompt };
    setThread(prev => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/convene/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...thread, userMsg].map(m => ({ role: m.role === 'concierge' ? 'assistant' : 'user', content: m.text })),
          event_context: `${event.event_type} · ${event.host_name} · ${event.capacity} guests${event.city ? ` · ${event.city}` : ''}`,
        }),
      });
      const data = await res.json();
      setThread(prev => [...prev, { role: 'concierge', text: data.reply || 'Let me try that again.' }]);
    } catch {
      setThread(prev => [...prev, { role: 'concierge', text: "I'm offline for a moment. Try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cv-ivory)' }}>
      <TopBar
        left={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--cv-ink)', color: 'var(--cv-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={13} color="var(--cv-accent)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1 }}>Concierge</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: busy ? 'var(--cv-muted-2)' : 'var(--cv-accent)' }}>{busy ? 'Thinking…' : 'Online · live'}</span>
          </div>
        </div>}
        right={<IBtn icon={X} onClick={onClose} />}
      />

      {/* Thread */}
      <div ref={scrollRef} className="cv-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '66px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {thread.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
            {m.role === 'concierge' && (
              <div style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--cv-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                <Sparkles size={11} color="var(--cv-accent)" />
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              background: m.role === 'user' ? 'var(--cv-ink)' : 'var(--cv-paper)',
              color: m.role === 'user' ? 'var(--cv-ivory)' : 'var(--cv-ink)',
              border: m.role === 'user' ? 'none' : '1px solid var(--cv-hairline)',
              fontSize: 13.5, lineHeight: 1.55,
              whiteSpace: 'pre-line',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--cv-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={11} color="var(--cv-accent)" />
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '4px 18px 18px 18px', background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--cv-muted-2)', animation: `cv-pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
            </div>
          </div>
        )}

        {thread.length <= 1 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cv-muted-2)' }}>Try one</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PROMPTS.map((p, i) => (
                <button key={i}
                  onClick={() => ask(p.q)}
                  disabled={busy}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '7px 11px', borderRadius: 9999,
                    background: 'var(--cv-paper)', color: 'var(--cv-muted)',
                    border: '1px solid var(--cv-hairline)',
                    fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  <Sparkles size={10} color="var(--cv-accent)" />{p.l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>

      {/* Composer */}
      <div style={{
        padding: '10px 12px 16px',
        background: 'rgba(250,246,238,.94)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--cv-hairline)',
      }}>
        <form onSubmit={e => { e.preventDefault(); ask(input); }} style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask the concierge…"
            disabled={busy}
            style={{
              flex: 1, background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
              borderRadius: 22, padding: '10px 14px', fontSize: 14,
              color: 'var(--cv-ink)', outline: 'none',
              fontFamily: 'var(--font-geist, sans-serif)',
            }}
          />
          <button type="submit" disabled={busy || !input.trim()} style={{
            width: 40, height: 40, borderRadius: 99,
            background: input.trim() ? 'var(--cv-ink)' : 'var(--cv-hairline)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: input.trim() ? 'var(--cv-ivory)' : 'var(--cv-muted-2)',
            transition: 'background .15s',
            flexShrink: 0,
          }}>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
interface ConveneAppProps { initialUser: Record<string, unknown> | null; }

export function ConveneApp({ initialUser }: ConveneAppProps) {
  const [events, setEvents] = useState<CvEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<CvEvent | null>(null);
  const [guests, setGuests] = useState<CvGuest[]>([]);
  const [photos, setPhotos] = useState<CvPhoto[]>([]);
  const [stats, setStats] = useState({ in: 0, maybe: 0, out: 0, pending: 0, total: 0, arrived: 0 });
  const [activeTab, setActiveTab] = useState<Tab>('event');
  const [screen, setScreen] = useState<Screen>('home');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showConcierge, setShowConcierge] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/convene/events');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEvents(data.events || []);
      if (data.events?.length > 0 && !activeEvent) {
        setActiveEvent(data.events[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEvents(false);
    }
  }, [activeEvent]);

  const loadGuests = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`/api/convene/guests?event_id=${eventId}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const gs: CvGuest[] = data.guests || [];
      setGuests(gs);
      setStats({
        in:      gs.filter(g => g.rsvp_state === 'in').length,
        maybe:   gs.filter(g => g.rsvp_state === 'maybe').length,
        out:     gs.filter(g => g.rsvp_state === 'out').length,
        pending: gs.filter(g => g.rsvp_state === 'pending').length,
        total:   gs.length,
        arrived: gs.filter(g => g.arrived_at).length,
      });
    } catch {}
  }, []);

  const loadPhotos = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`/api/convene/photos?event_id=${eventId}`);
      if (!res.ok) return;
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {}
  }, []);

  useEffect(() => { loadEvents(); }, []);

  useEffect(() => {
    if (activeEvent) {
      loadGuests(activeEvent.id);
      loadPhotos(activeEvent.id);
    }
  }, [activeEvent]);

  async function handleUploadPhoto(file: File) {
    if (!activeEvent) return;
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/convene/upload', { method: 'POST', body: formData });
    if (!uploadRes.ok) return;
    const { url } = await uploadRes.json();
    await fetch('/api/convene/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: activeEvent.id, url }),
    });
    loadPhotos(activeEvent.id);
  }

  const accent = activeEvent ? ACCENT_COLORS[activeEvent.event_type as EventType] || '#c0975a' : '#c0975a';
  const accentStyle = activeEvent ? accentVars(activeEvent.event_type) : {};

  if (loadingEvents) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cv-ivory)' }}>
        <Loader2 size={20} className="animate-spin" color="var(--cv-muted-2)" />
      </div>
    );
  }

  // No events — onboarding
  if (events.length === 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, ...accentStyle }}>
        <ScreenCreateEvent onCreated={ev => { setEvents([ev]); setActiveEvent(ev); }} />
      </div>
    );
  }

  const renderContent = () => {
    if (showConcierge && activeEvent) {
      return <ScreenConcierge event={activeEvent} onClose={() => setShowConcierge(false)} />;
    }

    if (activeTab === 'event') {
      if (screen === 'create') return <ScreenCreateEvent onCreated={ev => { loadEvents(); setActiveEvent(ev); setScreen('home'); }} />;
      return <ScreenEventHome event={activeEvent!} stats={stats} onEdit={() => {}} onConcierge={() => setShowConcierge(true)} />;
    }

    if (activeTab === 'guests') {
      if (screen === 'guest-list') return (
        <ScreenGuestList
          event={activeEvent!} guests={guests} stats={stats}
          onBack={() => setScreen('home')} onAdd={() => {}}
          onRefresh={() => loadGuests(activeEvent!.id)}
        />
      );
      return (
        <ScreenGuestList
          event={activeEvent!} guests={guests} stats={stats}
          onBack={() => setActiveTab('event')} onAdd={() => {}}
          onRefresh={() => loadGuests(activeEvent!.id)}
        />
      );
    }

    if (activeTab === 'invite') {
      return <ScreenInvite event={activeEvent!} onBack={() => setActiveTab('event')} />;
    }

    if (activeTab === 'tonight') {
      if (screen === 'scanner') return <ScreenScanner event={activeEvent!} onBack={() => setScreen('home')} />;
      return <ScreenLiveDash event={activeEvent!} stats={stats} onScanner={() => setScreen('scanner')} />;
    }

    if (activeTab === 'after') {
      return <ScreenAfter event={activeEvent!} photos={photos} onBack={() => setActiveTab('event')} onUploadPhoto={handleUploadPhoto} />;
    }

    return null;
  };

  return (
    <div
      data-app-shell
      style={{
        position: 'relative', width: '100%', height: '100%',
        background: 'var(--cv-ivory)',
        ...accentStyle,
      }}
    >
      {renderContent()}

      {/* Floating concierge FAB (unless concierge is open) */}
      {!showConcierge && activeEvent && !['scanner'].includes(screen) && (
        <button
          onClick={() => setShowConcierge(true)}
          style={{
            position: 'absolute', bottom: 80, right: 16, zIndex: 110,
            width: 44, height: 44, borderRadius: 9999,
            background: 'var(--cv-ink)', border: '1px solid var(--cv-hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(26,23,20,.20)',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={16} color={accent} />
        </button>
      )}

      {!showConcierge && (
        <Dock active={activeTab} onTab={t => { setActiveTab(t); setScreen('home'); }} />
      )}
    </div>
  );
}
