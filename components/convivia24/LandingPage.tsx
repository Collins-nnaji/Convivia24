'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Mail, Camera, QrCode } from 'lucide-react';
import { ACCENT_COLORS, type EventType } from '@/components/convivia24/primitives';

const FEATURES = [
  { icon: Mail,     title: 'Beautiful invites',    desc: 'Three editorial directions. Every guest gets a personalised link with their name.' },
  { icon: Users,    title: 'Guest management',     desc: 'Add guests, track RSVPs, collect dietary notes — all in one place.' },
  { icon: QrCode,   title: 'Door scanner',         desc: 'QR-code check-in on the night. Know who\'s arrived in real time.' },
  { icon: Camera,   title: 'Photo wall',           desc: 'Guests upload memories from their pass link. Your gallery builds itself.' },
  { icon: Sparkles, title: 'AI concierge',         desc: 'Ask for venues, themes, timelines, vendor briefs. Answers in seconds.' },
];

const EVENT_EXAMPLES = [
  { type: 'wedding' as EventType,   label: 'Weddings' },
  { type: 'birthday' as EventType,  label: 'Birthdays' },
  { type: 'corporate' as EventType, label: 'Corporate' },
  { type: 'club' as EventType,      label: 'Club nights' },
  { type: 'dinner' as EventType,    label: 'Private dinners' },
  { type: 'festival' as EventType,  label: 'Festivals' },
];

export function LandingPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--cv-ivory)',
      color: 'var(--cv-ink)',
      fontFamily: 'var(--font-geist, system-ui)',
      overflowX: 'hidden',
    }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56,
        background: 'rgba(250,246,238,.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--cv-hairline)',
      }}>
        <img src="/convivia24.png" alt="Convivia24" style={{ height: 28, width: 'auto', objectFit: 'contain', display: 'block' }} draggable={false} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth/sign-in" style={{
            padding: '8px 14px', borderRadius: 99,
            background: 'transparent', color: 'var(--cv-muted)',
            border: '1px solid var(--cv-hairline)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>
            Sign in
          </Link>
          <Link href="/auth/sign-up" style={{
            padding: '8px 16px', borderRadius: 99,
            background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Get started <ArrowRight size={11} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 640, margin: '0 auto',
        padding: '72px 24px 56px',
        textAlign: 'center',
        animation: 'cv-fade-up .5s ease both',
      }}>
        {/* Logo mark */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <img
            src="/convivia24.png"
            alt="Convivia24"
            style={{ height: 40, width: 'auto', objectFit: 'contain', opacity: 0.9 }}
            draggable={false}
          />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px', borderRadius: 99,
          background: 'rgba(192,151,90,.10)', border: '1px solid rgba(192,151,90,.30)',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#c0975a', marginBottom: 20,
        }}>
          <span style={{ width: 12, height: 1, background: 'currentColor', display: 'inline-block' }} />
          Party planning, reimagined
        </div>

        <h1 style={{
          fontFamily: 'var(--font-instrument, serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(40px, 10vw, 68px)',
          lineHeight: .92,
          letterSpacing: '-0.02em',
          color: 'var(--cv-ink)',
          marginBottom: 24,
        }}>
          Throw it.<br />
          <em style={{ color: '#c0975a' }}>Plan it.</em><br />
          Remember it.
        </h1>

        <p style={{
          fontSize: 16, lineHeight: 1.65,
          color: 'var(--cv-muted)',
          maxWidth: 420, margin: '0 auto 36px',
        }}>
          Beautiful digital invites, guest management, QR check-in, and a photo wall — one platform for the whole life of a gathering.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/sign-up" style={{
            padding: '14px 28px', borderRadius: 99,
            background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(26,23,20,.18)',
          }}>
            Plan your event <ArrowRight size={13} />
          </Link>
          <Link href="/auth/sign-in" style={{
            padding: '14px 24px', borderRadius: 99,
            background: 'transparent', color: 'var(--cv-ink)',
            border: '1px solid var(--cv-hairline-strong)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Event type pills */}
      <section style={{ padding: '0 20px 56px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
          {EVENT_EXAMPLES.map(({ type, label }) => (
            <span key={type} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 99,
              background: 'var(--cv-paper)',
              border: '1px solid var(--cv-hairline)',
              fontSize: 12, fontWeight: 500, color: 'var(--cv-muted)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: ACCENT_COLORS[type], display: 'inline-block', flexShrink: 0 }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Invite preview mockup */}
      <section style={{ padding: '0 20px 64px', maxWidth: 440, margin: '0 auto' }}>
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          border: '1px solid var(--cv-hairline)',
          boxShadow: '0 24px 60px rgba(26,23,20,.12)',
          background: '#f4ede0',
          padding: '40px 28px 28px',
          position: 'relative',
        }}>
          {/* Ornament */}
          <svg width="100%" height="100%" viewBox="0 0 360 400" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <ellipse key={i} cx="310" cy="80" rx={18 + i * 22} ry={12 + i * 9} fill="none" stroke="#c0975a" strokeWidth="0.5" opacity={0.12 + i * 0.04} />
            ))}
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c0975a', marginBottom: 12 }}>
              <span style={{ width: 16, height: 1, background: 'currentColor', display: 'inline-block' }} />
              Wedding · Lagos
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(26,23,20,.5)', marginBottom: 4 }}>For</div>
            <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 48, lineHeight: .94, color: '#1a1714', letterSpacing: '-0.02em', marginBottom: 28 }}>
              Tunde.
            </div>
            <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 13, color: 'rgba(26,23,20,.45)', marginBottom: 4 }}>From</div>
            <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 38, color: '#1a1714', letterSpacing: '-0.02em', lineHeight: 1.02, marginBottom: 24 }}>
              Adaeze & Marcus.
            </div>
            <div style={{ borderTop: '1px solid rgba(26,23,20,.16)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(26,23,20,.4)', marginBottom: 3 }}>When</div>
                <div style={{ fontSize: 12 }}>Saturday, 14 June 2026</div>
              </div>
              <div style={{ padding: '10px 18px', borderRadius: 99, background: '#1a1714', color: '#f4ede0', fontWeight: 700, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase' }}>
                Reply →
              </div>
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--cv-muted-2)', marginTop: 14, letterSpacing: '0.06em' }}>
          Editorial invite — each guest gets their own
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: '0 20px 80px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 6vw, 42px)', color: 'var(--cv-ink)', marginBottom: 10 }}>
            Everything in one place.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--cv-muted)' }}>From the first invite to the last thank-you.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '16px 18px', borderRadius: 16,
              background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--cv-ivory-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#c0975a" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cv-ink)', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--cv-muted)', lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section style={{
        textAlign: 'center', padding: '48px 24px 60px',
        background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
      }}>
        <img src="/Logo2.png" alt="Convivia24" style={{ height: 32, width: 'auto', margin: '0 auto 24px', opacity: 0.7, display: 'block' }} draggable={false} />
        <h2 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 'clamp(26px, 6vw, 40px)', lineHeight: 1.05, marginBottom: 16 }}>
          Ready to throw<br />something unforgettable?
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(250,246,238,.6)', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
          Free to start. No credit card required.
        </p>
        <Link href="/auth/sign-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 28px', borderRadius: 99,
          background: '#c0975a', color: '#fff',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          Create your event <ArrowRight size={13} />
        </Link>
        <div style={{ marginTop: 32, fontSize: 11, color: 'rgba(250,246,238,.3)', display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
        </div>
      </section>
    </div>
  );
}
