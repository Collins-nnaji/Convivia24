'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check, MapPin, Calendar, Clock } from 'lucide-react';
import { QRBlock } from '@/components/convivia24/primitives';

interface Campaign {
  brand_name: string; headline: string | null; subheadline: string | null;
  venue_name: string | null; city: string; event_date: string | null;
  start_time: string | null; end_time: string | null;
  primary_color: string; bg_color: string; text_color: string; logo_url: string | null;
  voucher_enabled: boolean; voucher_label: string | null; photowall_slug: string | null;
  slug: string;
}

interface Pass {
  id: string; name: string; pass_token: string; status: string;
  voucher_redeemed: boolean; checked_in: boolean;
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function GuestPassView({ campaignSlug }: { campaignSlug: string }) {
  const [step, setStep] = useState<'loading' | 'register' | 'pass' | 'error'>('loading');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pass, setPass] = useState<Pass | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(`/api/portal/campaigns/public/${campaignSlug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.campaign) {
          setCampaign(data.campaign);
          setStep('register');
        } else setStep('error');
      })
      .catch(() => setStep('error'));
  }, [campaignSlug]);

  async function handleClaim() {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true); setErrorMsg('');
    try {
      const res = await fetch('/api/guest/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_slug: campaignSlug, name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Could not claim pass.'); return; }
      setPass(data.pass);
      setStep('pass');
    } finally { setSubmitting(false); }
  }

  if (step === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0c0a' }}>
        <Loader2 size={24} color="rgba(250,246,238,.4)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (step === 'error' || !campaign) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d0c0a', gap: 12, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36 }}>❌</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(250,246,238,.8)' }}>Campaign not found</div>
        <div style={{ fontSize: 12, color: 'rgba(250,246,238,.4)' }}>This pass link may be invalid or the campaign has ended.</div>
      </div>
    );
  }

  const bg = campaign.bg_color || '#0d0c0a';
  const primary = campaign.primary_color || '#c0975a';
  const text = campaign.text_color || '#faf6ee';
  const textFaded = text + 'AA';

  if (step === 'pass' && pass) {
    return (
      <div style={{ minHeight: '100dvh', background: bg, color: text, fontFamily: 'var(--font-geist, system-ui)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '28px 20px 20px', textAlign: 'center', borderBottom: `1px solid ${primary}20` }}>
          {campaign.logo_url ? (
            <img src={campaign.logo_url} alt={campaign.brand_name} style={{ height: 32, width: 'auto', objectFit: 'contain', marginBottom: 0 }} />
          ) : (
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: primary }}>
              {campaign.brand_name}
            </div>
          )}
        </div>

        {/* Pass body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px', gap: 20 }}>
          {/* Success badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: '#22c55e18', border: '1px solid #22c55e30' }}>
            <Check size={13} color="#22c55e" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#22c55e' }}>Pass confirmed</span>
          </div>

          {/* Guest name */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: textFaded, marginBottom: 4 }}>Welcome,</div>
            <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 'clamp(32px, 8vw, 48px)', color: text, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {pass.name}
            </div>
          </div>

          {/* QR code */}
          <div style={{ padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,.05)', border: `1px solid ${primary}20` }}>
            <QRBlock size={180} bg="#fff" fg="#1a1714" />
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: textFaded, textTransform: 'uppercase' }}>
              {pass.pass_token.slice(0, 12).toUpperCase()}
            </div>
          </div>

          {/* Event details */}
          <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {campaign.venue_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textFaded }}>
                <MapPin size={13} color={primary} /> {campaign.venue_name}, {campaign.city}
              </div>
            )}
            {campaign.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textFaded }}>
                <Calendar size={13} color={primary} /> {formatDate(campaign.event_date)}
              </div>
            )}
            {campaign.start_time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: textFaded }}>
                <Clock size={13} color={primary} /> Doors open at {campaign.start_time}
              </div>
            )}
          </div>

          {/* Voucher badge */}
          {campaign.voucher_enabled && (
            <div style={{ width: '100%', maxWidth: 340, padding: '14px 16px', borderRadius: 12, background: primary + '18', border: `1px solid ${primary}30`, textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: primary, marginBottom: 5 }}>Included with your pass</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: text }}>🥂 {campaign.voucher_label || 'Free Welcome Drink'}</div>
              <div style={{ fontSize: 10, color: textFaded, marginTop: 4 }}>Show your QR to the bartender to claim</div>
            </div>
          )}

          {/* Enter hub */}
          {campaign.photowall_slug && (
            <a href={`/hub/${campaign.photowall_slug}?pass=${pass.pass_token}`} style={{
              width: '100%', maxWidth: 340, padding: '14px', borderRadius: 12, border: 'none',
              background: primary, color: '#fff', textDecoration: 'none', textAlign: 'center',
              fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
              display: 'block',
            }}>
              Enter the event hub →
            </a>
          )}

          <div style={{ fontSize: 10, color: textFaded, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
            Screenshot or keep this tab open. Show the QR code at the door.
          </div>
        </div>
      </div>
    );
  }

  // Register step
  return (
    <div style={{ minHeight: '100dvh', background: bg, color: text, fontFamily: 'var(--font-geist, system-ui)', display: 'flex', flexDirection: 'column' }}>
      {/* Brand header */}
      <div style={{ padding: '32px 20px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none', backgroundImage: `radial-gradient(circle, ${primary} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: 9999, background: `radial-gradient(circle, ${primary}, transparent 70%)`, opacity: 0.08, pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          {campaign.logo_url ? (
            <img src={campaign.logo_url} alt={campaign.brand_name} style={{ height: 40, width: 'auto', objectFit: 'contain', marginBottom: 20 }} />
          ) : (
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.32em', textTransform: 'uppercase', color: primary, marginBottom: 20 }}>
              {campaign.brand_name}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 8vw, 42px)', lineHeight: 1.05, color: text, marginBottom: 8, letterSpacing: '-0.02em' }}>
            {campaign.headline || `Welcome to ${campaign.brand_name}`}
          </div>
          {campaign.subheadline && (
            <div style={{ fontSize: 12, color: textFaded, lineHeight: 1.5 }}>{campaign.subheadline}</div>
          )}
        </div>
      </div>

      {/* Event meta */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 20px 20px', flexWrap: 'wrap' }}>
        {campaign.venue_name && <span style={{ fontSize: 11, color: textFaded, display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={11} color={primary} /> {campaign.venue_name}</span>}
        {campaign.event_date && <span style={{ fontSize: 11, color: textFaded, display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={11} color={primary} /> {formatDate(campaign.event_date)}</span>}
        {campaign.start_time && <span style={{ fontSize: 11, color: textFaded, display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={11} color={primary} /> From {campaign.start_time}</span>}
      </div>

      {/* Registration form */}
      <div style={{ flex: 1, padding: '4px 20px 48px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: primary, textAlign: 'center', marginBottom: 4 }}>
          Claim your entry pass
        </div>

        {campaign.voucher_enabled && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: primary + '10', border: `1px solid ${primary}20`, textAlign: 'center', fontSize: 11, color: textFaded }}>
            🥂 Includes: <strong style={{ color: text }}>{campaign.voucher_label || 'Free Welcome Drink'}</strong>
          </div>
        )}

        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Your full name"
          style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${primary}30`, background: 'rgba(255,255,255,.04)', color: text, fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
        <input
          type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="Phone / WhatsApp number"
          style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${primary}30`, background: 'rgba(255,255,255,.04)', color: text, fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />

        {errorMsg && <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center' }}>{errorMsg}</div>}

        <button
          type="button" onClick={handleClaim}
          disabled={submitting || !name.trim() || !phone.trim()}
          style={{
            padding: '16px', borderRadius: 12, border: 'none',
            background: !name.trim() || !phone.trim() ? 'rgba(255,255,255,.08)' : primary,
            color: !name.trim() || !phone.trim() ? 'rgba(255,255,255,.3)' : '#fff',
            fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: submitting ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%',
          }}
        >
          {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {submitting ? 'Claiming…' : 'Get my pass →'}
        </button>

        <div style={{ fontSize: 10, color: textFaded, textAlign: 'center', lineHeight: 1.5 }}>
          By claiming your pass you agree to receive event communications. Data used only for this event.
        </div>
      </div>

      {/* Powered by */}
      <div style={{ textAlign: 'center', padding: '12px', fontSize: 9, color: textFaded, letterSpacing: '0.12em' }}>
        Powered by Convivia24
      </div>
    </div>
  );
}
