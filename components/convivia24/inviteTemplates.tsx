'use client';

import React from 'react';
import { EVENT_TYPE_META, ACCENT_COLORS, type EventType } from '@/components/convivia24/primitives';
import {
  type InviteTemplateId,
  type InviteCustomization,
  type InviteEventFields,
  DEFAULT_INVITE_CUSTOMIZATION,
  parseInviteCustomization,
} from '@/lib/invite';

export type { InviteTemplateId, InviteCustomization };
export {
  INVITE_TEMPLATE_META,
  DEFAULT_INVITE_CUSTOMIZATION,
  parseInviteCustomization,
  normalizeInviteTemplate,
} from '@/lib/invite';

function formatDate(event: InviteEventFields) {
  return event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';
}

function eyebrowText(event: InviteEventFields, customization: InviteCustomization) {
  if (customization.tagline?.trim()) return customization.tagline.trim();
  const typeLabel = EVENT_TYPE_META[event.event_type as EventType]?.label || event.event_type;
  return `${typeLabel}${event.city ? ` · ${event.city}` : ''}`;
}

function defaultDress(event: InviteEventFields) {
  return event.dress_code || (event.event_type === 'wedding' ? 'Black tie' : 'Smart casual');
}

function DetailsGrid({
  event,
  customization,
  accent,
  fg,
  fgMuted,
  dark,
}: {
  event: InviteEventFields;
  customization: InviteCustomization;
  accent: string;
  fg: string;
  fgMuted: string;
  dark?: boolean;
}) {
  const dateStr = formatDate(event);
  const showWhen = customization.showDate !== false;
  const showWhere = customization.showVenue !== false && (event.venue || event.city);
  if (!showWhen && !showWhere) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showWhen && showWhere ? '1fr 1fr' : '1fr',
      gap: 14,
      fontSize: 11.5,
      color: fg,
      marginBottom: customization.showDressCode !== false && event.dress_code ? 10 : 0,
    }}>
      {showWhen && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: fgMuted, marginBottom: 3 }}>When</div>
          {dateStr}<br />{event.event_time || ''}
        </div>
      )}
      {showWhere && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: fgMuted, marginBottom: 3 }}>Where</div>
          {event.venue || '—'}<br />{event.city || '—'}
        </div>
      )}
    </div>
  );
}

function CtaButton({ label, accent, dark }: { label: string; accent: string; dark?: boolean }) {
  if (dark) {
    return (
      <div style={{ width: '100%', padding: '11px 0', borderRadius: 99, background: accent, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase' }}>
        {label}
      </div>
    );
  }
  return (
    <div style={{ padding: '10px 18px', borderRadius: 99, background: '#1a1714', color: '#f4ede0', fontWeight: 700, fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase', display: 'inline-block' }}>
      {label}
    </div>
  );
}

function WelcomeNote({ text, color }: { text: string; color: string }) {
  if (!text.trim()) return null;
  return (
    <p style={{ fontSize: 12, lineHeight: 1.55, color, margin: '12px 0 0', fontStyle: 'italic' }}>{text}</p>
  );
}

export function InvitePreview({
  event,
  template,
  customization: customizationIn,
  recipient = 'You',
  showCta = true,
}: {
  event: InviteEventFields;
  template: InviteTemplateId;
  customization?: InviteCustomization;
  recipient?: string;
  showCta?: boolean;
}) {
  const customization = { ...DEFAULT_INVITE_CUSTOMIZATION, ...customizationIn };
  const accent = ACCENT_COLORS[event.event_type as EventType] || '#c0975a';
  const dateStr = formatDate(event);
  const eyebrow = eyebrowText(event, customization);
  const cta = customization.ctaLabel || 'Reply →';
  const dress = defaultDress(event);

  const shell: React.CSSProperties = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  if (template === 'bold') {
    return (
      <div style={{ ...shell, background: '#1a1714', color: '#faf6ee', padding: '44px 22px 22px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: accent }} />
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-block', padding: '6px 10px', background: '#fff', color: '#000', fontWeight: 900, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 10 }}>
            {event.event_date ? new Date(event.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '--'} / {EVENT_TYPE_META[event.event_type as EventType]?.label?.toUpperCase() || 'EVENT'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(250,246,238,.7)', marginBottom: 16 }}>For {recipient}</div>
          <div style={{ fontWeight: 900, fontSize: 56, letterSpacing: '-0.04em', lineHeight: .88, fontFamily: 'var(--font-geist, sans-serif)', wordBreak: 'break-word' }}>
            {event.host_name.toUpperCase()}
          </div>
          <WelcomeNote text={customization.welcomeNote || ''} color="rgba(250,246,238,.65)" />
        </div>
        <div style={{ paddingTop: 16, borderTop: '1px solid rgba(250,246,238,.15)' }}>
          <DetailsGrid event={event} customization={customization} accent={accent} fg="#faf6ee" fgMuted="rgba(250,246,238,.5)" dark />
          {customization.showDressCode !== false && (
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(250,246,238,.55)', marginBottom: 10 }}>{dress}</div>
          )}
          {showCta && <CtaButton label={cta} accent={accent} dark />}
        </div>
      </div>
    );
  }

  if (template === 'mono') {
    return (
      <div style={{ ...shell, background: '#faf6ee', color: '#1a1714', padding: '44px 22px 22px', fontFamily: 'var(--font-geist-mono, monospace)' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.20em', color: 'rgba(26,23,20,.5)', marginBottom: 16 }}>
          doc/inv · {event.id?.slice(0, 8) || '00000000'}<br />for: {recipient}
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.10em', color: 'rgba(26,23,20,.55)', marginBottom: 6 }}>─── {eyebrow} ───</div>
        <div style={{ fontSize: 30, lineHeight: 1.1, wordBreak: 'break-word', flex: 1 }}>{event.host_name}</div>
        <WelcomeNote text={customization.welcomeNote || ''} color="rgba(26,23,20,.65)" />
        <div style={{ height: 1, borderTop: '1px dashed rgba(26,23,20,.25)', margin: '14px 0' }} />
        <div style={{ fontSize: 11, color: 'rgba(26,23,20,.7)', lineHeight: 1.7 }}>
          {customization.showDate !== false && event.event_date && <>date: {dateStr}<br /></>}
          {event.event_time && <>time: {event.event_time}<br /></>}
          {customization.showVenue !== false && event.venue && <>venue: {event.venue}<br /></>}
          {event.city && <>city: {event.city}</>}
        </div>
        {customization.showDressCode !== false && (
          <div style={{ fontSize: 9, marginTop: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{dress}</div>
        )}
        {showCta && (
          <div style={{ marginTop: 12, width: '100%', padding: '10px 0', border: '1px solid rgba(26,23,20,.30)', textAlign: 'center', fontSize: 10, letterSpacing: '0.20em', textTransform: 'uppercase' }}>
            [{cta.replace('→', '').trim()} →]
          </div>
        )}
      </div>
    );
  }

  if (template === 'garden') {
    return (
      <div style={{ ...shell, background: 'linear-gradient(165deg, #eef4e8 0%, #f8f4eb 55%, #f4ede0 100%)', color: '#2a3d28', padding: '40px 24px 24px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none', background: `radial-gradient(circle at 90% 10%, ${accent}33 0%, transparent 45%), radial-gradient(circle at 10% 90%, ${accent}22 0%, transparent 40%)` }} />
        <div style={{ position: 'relative', flex: 1, border: `1px solid ${accent}44`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>{eyebrow}</div>
          <div style={{ fontSize: 11, color: 'rgba(42,61,40,.6)', marginBottom: 4 }}>Dear {recipient},</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 40, lineHeight: 1, color: '#2a3d28', wordBreak: 'break-word' }}>{event.host_name}</div>
          <WelcomeNote text={customization.welcomeNote || 'You are warmly invited to celebrate with us.'} color="rgba(42,61,40,.7)" />
          <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${accent}33` }}>
            <DetailsGrid event={event} customization={customization} accent={accent} fg="#2a3d28" fgMuted="rgba(42,61,40,.5)" />
            {customization.showDressCode !== false && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginTop: 8 }}>{dress}</div>}
            {showCta && <div style={{ marginTop: 12 }}><CtaButton label={cta} accent={accent} dark /></div>}
          </div>
        </div>
      </div>
    );
  }

  if (template === 'minimal') {
    return (
      <div style={{ ...shell, background: '#fff', color: '#1a1714', padding: '48px 28px 28px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--cv-muted-2)', marginBottom: 24 }}>{eyebrow}</div>
          <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 8 }}>{recipient}</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 42, lineHeight: .95, letterSpacing: '-0.03em' }}>{event.host_name}</div>
          <WelcomeNote text={customization.welcomeNote || ''} color="var(--cv-muted)" />
        </div>
        <div style={{ borderTop: '1px solid var(--cv-hairline)', paddingTop: 16 }}>
          <DetailsGrid event={event} customization={customization} accent={accent} fg="#1a1714" fgMuted="var(--cv-muted-2)" />
          {showCta && <div style={{ marginTop: 12, textAlign: 'left' }}><CtaButton label={cta} accent={accent} /></div>}
        </div>
      </div>
    );
  }

  if (template === 'festive') {
    return (
      <div style={{ ...shell, background: `linear-gradient(145deg, ${accent} 0%, #1a1714 42%, #2d2925 100%)`, color: '#faf6ee', padding: '40px 22px 22px' }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} style={{
            position: 'absolute', left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%`,
            width: 4, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.25)',
          }} />
        ))}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.30em', textTransform: 'uppercase', color: 'rgba(250,246,238,.75)', marginBottom: 14 }}>{eyebrow}</div>
          <div style={{ fontSize: 11, color: 'rgba(250,246,238,.6)', marginBottom: 8 }}>For {recipient}</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 44, lineHeight: .95, maxWidth: '100%', wordBreak: 'break-word' }}>{event.host_name}</div>
          <WelcomeNote text={customization.welcomeNote || ''} color="rgba(250,246,238,.7)" />
        </div>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <DetailsGrid event={event} customization={customization} accent={accent} fg="#faf6ee" fgMuted="rgba(250,246,238,.5)" dark />
          {showCta && <div style={{ marginTop: 12 }}><CtaButton label={cta} accent={accent} dark /></div>}
        </div>
      </div>
    );
  }

  if (template === 'classic') {
    return (
      <div style={{ ...shell, background: '#f4ede0', color: '#1a1714', padding: '36px 24px 24px', textAlign: 'center' }}>
        <div style={{ border: `2px solid ${accent}`, padding: '28px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: accent, marginBottom: 16 }}>{eyebrow}</div>
          <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginBottom: 6 }}>The honour of your presence is requested</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 38, lineHeight: 1.05, marginBottom: 8 }}>{recipient}</div>
          <div style={{ fontSize: 11, color: 'var(--cv-muted)', margin: '12px 0' }}>at the celebration of</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 42, lineHeight: 1.02 }}>{event.host_name}</div>
          <WelcomeNote text={customization.welcomeNote || ''} color="var(--cv-muted)" />
          <div style={{ marginTop: 20, textAlign: 'left' }}>
            <DetailsGrid event={event} customization={customization} accent={accent} fg="#1a1714" fgMuted="var(--cv-muted-2)" />
          </div>
          {customization.showDressCode !== false && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, marginTop: 12 }}>{dress}</div>}
          {showCta && <div style={{ marginTop: 14 }}><CtaButton label={cta} accent={accent} /></div>}
        </div>
      </div>
    );
  }

  // editorial (default)
  return (
    <div style={{ ...shell, background: '#f4ede0', color: '#1a1714', padding: '44px 26px 26px' }}>
      <svg width="100%" height="100%" viewBox="0 0 360 720" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx="280" cy="120" rx={20 + i * 24} ry={14 + i * 10} fill="none" stroke={accent} strokeWidth="0.4" opacity={0.15 + i * 0.04} />
        ))}
      </svg>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase', color: accent }}>
          <span style={{ width: 18, height: 1, background: 'currentColor' }} />
          {eyebrow}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, fontWeight: 500, color: 'rgba(26,23,20,.55)' }}>For</div>
        <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 40, lineHeight: .96, marginTop: 2 }}>{recipient}.</div>
        <div style={{ marginTop: 24, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(26,23,20,.5)' }}>From</div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 44, lineHeight: 1.02, wordBreak: 'break-word' }}>{event.host_name}.</div>
          <WelcomeNote text={customization.welcomeNote || ''} color="rgba(26,23,20,.6)" />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(26,23,20,.18)' }}>
          <DetailsGrid event={event} customization={customization} accent={accent} fg="#1a1714" fgMuted="rgba(26,23,20,.5)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            {customization.showDressCode !== false && (
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(26,23,20,.5)' }}>{dress}</div>
            )}
            {showCta && <CtaButton label={cta} accent={accent} />}
          </div>
        </div>
      </div>
    </div>
  );
}
