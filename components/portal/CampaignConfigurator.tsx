'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Eye, Copy, QrCode, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ink = '#0d0c0a'; const ink2 = '#171512'; const gold = '#c0975a';
const ivory = '#faf6ee'; const muted = 'rgba(250,246,238,.45)';
const hairline = 'rgba(250,246,238,.07)'; const muted2 = 'rgba(250,246,238,.18)';

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 9, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: gold, marginBottom: 7 }}>{children}</label>;
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', padding: '11px 14px', borderRadius: 10,
        border: `1px solid ${hairline}`, background: 'rgba(250,246,238,.04)',
        color: ivory, fontSize: 13, outline: 'none', boxSizing: 'border-box',
        fontFamily: 'var(--font-geist, system-ui)',
        transition: 'border-color .15s',
      }}
      onFocus={e => (e.target.style.borderColor = gold + '60')}
      onBlur={e => (e.target.style.borderColor = hairline)}
    />
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} style={{
      display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    }}>
      <div style={{
        width: 36, height: 20, borderRadius: 99,
        background: on ? gold : 'rgba(250,246,238,.12)',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 19 : 3, width: 14, height: 14,
          borderRadius: 99, background: on ? '#fff' : 'rgba(255,255,255,.4)',
          transition: 'left .2s',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: on ? ivory : muted }}>{label}</span>
    </button>
  );
}

// Live preview of the white-labeled guest pass
function GuestPreview({ brandName, headline, primaryColor, bgColor, textColor, logoUrl, voucherLabel, voucherEnabled }:
  { brandName: string; headline: string; primaryColor: string; bgColor: string; textColor: string; logoUrl: string; voucherLabel: string; voucherEnabled: boolean }) {
  return (
    <div style={{
      borderRadius: 24, overflow: 'hidden',
      border: `1px solid rgba(255,255,255,.08)`,
      boxShadow: '0 24px 60px rgba(0,0,0,.4)',
      width: '100%', maxWidth: 320, margin: '0 auto',
    }}>
      {/* Phone bar */}
      <div style={{ height: 28, background: bgColor || '#0d0c0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 60, height: 4, borderRadius: 99, background: 'rgba(255,255,255,.15)' }} />
      </div>

      {/* Guest pass screen */}
      <div style={{
        background: bgColor || '#0d0c0a', padding: '28px 22px',
        minHeight: 480, display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: `1px solid ${primaryColor}20` }}>
          {logoUrl ? (
            <img src={logoUrl} alt="brand" style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'inline-block' }} />
          ) : (
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: primaryColor }}>
              {brandName || 'BRAND NAME'}
            </div>
          )}
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: primaryColor, marginBottom: 8 }}>
            Your VIP Pass
          </div>
          <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 24, color: textColor || ivory, lineHeight: 1.15 }}>
            {headline || `Welcome to ${brandName || 'the event'}`}
          </div>
        </div>

        {/* Form mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 40, borderRadius: 8, border: `1px solid ${primaryColor}30`, background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>Your name</span>
          </div>
          <div style={{ height: 40, borderRadius: 8, border: `1px solid ${primaryColor}30`, background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>Phone / WhatsApp</span>
          </div>
          <div style={{ height: 40, borderRadius: 8, background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Claim my pass →</span>
          </div>
        </div>

        {/* Voucher badge */}
        {voucherEnabled && (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: primaryColor + '15', border: `1px solid ${primaryColor}28`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: primaryColor, marginBottom: 4 }}>Included</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: textColor || ivory }}>{voucherLabel || 'Free Welcome Drink'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CampaignConfigurator() {
  const router = useRouter();

  // Campaign details
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('Lagos');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('21:00');
  const [endTime, setEndTime] = useState('02:00');

  // Theme
  const [primaryColor, setPrimaryColor] = useState('#c0975a');
  const [bgColor, setBgColor] = useState('#0d0c0a');
  const [textColor, setTextColor] = useState('#faf6ee');
  const [logoUrl, setLogoUrl] = useState('');

  // Voucher
  const [voucherEnabled, setVoucherEnabled] = useState(false);
  const [voucherLabel, setVoucherLabel] = useState('Free Welcome Drink');
  const [voucherLimit, setVoucherLimit] = useState('500');
  const [voucherFrom, setVoucherFrom] = useState('21:00');
  const [voucherTo, setVoucherTo] = useState('02:00');

  // Features
  const [photowallEnabled, setPhotowallEnabled] = useState(true);
  const [lineupText, setLineupText] = useState('');
  const [menuText, setMenuText] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ slug: string; id: string } | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'theme' | 'voucher' | 'content'>('details');

  async function handleCreate() {
    if (!name.trim() || !brandName.trim()) { setError('Campaign name and brand name are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/portal/campaigns', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, brand_name: brandName, headline, subheadline,
          venue_name: venueName, city, event_date: eventDate || undefined,
          start_time: startTime, end_time: endTime,
          primary_color: primaryColor, bg_color: bgColor, text_color: textColor,
          logo_url: logoUrl || undefined,
          voucher_enabled: voucherEnabled, voucher_label: voucherLabel,
          voucher_limit: parseInt(voucherLimit) || 500,
          voucher_valid_from: voucherFrom, voucher_valid_to: voucherTo,
          photowall_enabled: photowallEnabled, lineup_text: lineupText, menu_text: menuText,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create campaign.'); return; }
      setCreated({ slug: data.campaign.slug, id: data.campaign.id });
    } finally { setSubmitting(false); }
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'theme', label: 'Theme & Brand' },
    { id: 'voucher', label: 'Voucher Engine' },
    { id: 'content', label: 'Content' },
  ] as const;

  const guestUrl = created ? `${typeof window !== 'undefined' ? window.location.origin : ''}/pass/${created.slug}` : '';

  return (
    <div style={{ minHeight: '100dvh', background: ink, color: ivory, fontFamily: 'var(--font-geist, system-ui)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: `1px solid ${hairline}`, background: 'rgba(13,12,10,.95)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: muted, fontSize: 12, fontWeight: 600 }}>
            <ArrowLeft size={14} /> Portal
          </Link>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: gold }}>
            Campaign Configurator
          </span>
          <div style={{ width: 80 }} />
        </div>
      </nav>

      {created ? (
        /* ── Success state ── */
        <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 99, background: '#22c55e1a', border: '1px solid #22c55e30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={24} color="#22c55e" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 36, color: ivory, marginBottom: 12 }}>
            Campaign created.
          </h2>
          <p style={{ fontSize: 14, color: muted, marginBottom: 32, lineHeight: 1.6 }}>
            Your activation is configured. Share the guest pass link or activate the campaign to go live.
          </p>

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            <div style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${hairline}`, background: ink2, display: 'flex', alignItems: 'center', gap: 10 }}>
              <QrCode size={16} color={gold} />
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted2, marginBottom: 3 }}>Guest pass URL</div>
                <div style={{ fontSize: 11, color: ivory, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guestUrl}</div>
              </div>
              <button onClick={() => navigator.clipboard.writeText(guestUrl)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Copy size={13} color={muted} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/portal/campaigns/${created.id}`} style={{ padding: '12px 22px', borderRadius: 99, background: gold, color: '#fff', textDecoration: 'none', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              View campaign <ArrowLeft size={11} style={{ transform: 'rotate(180deg)' }} />
            </Link>
            <Link href={guestUrl} target="_blank" style={{ padding: '12px 22px', borderRadius: 99, background: 'transparent', color: muted, border: `1px solid ${hairline}`, textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Eye size={11} /> Preview guest view
            </Link>
          </div>
        </div>
      ) : (
        /* ── Configurator form ── */
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px) 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32, alignItems: 'start' }}>

            {/* Left — form */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 40px)', color: ivory, marginBottom: 6, letterSpacing: '-0.02em' }}>
                Configure your activation
              </h1>
              <p style={{ fontSize: 13, color: muted, marginBottom: 28, lineHeight: 1.6 }}>
                Set up the guest experience, voucher rules, and brand assets for your campaign.
              </p>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 12, background: ink2, border: `1px solid ${hairline}`, marginBottom: 24 }}>
                {tabs.map(t => (
                  <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
                    flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: activeTab === t.id ? 'rgba(250,246,238,.10)' : 'transparent',
                    color: activeTab === t.id ? ivory : muted,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    transition: 'all .15s',
                  }}>{t.label}</button>
                ))}
              </div>

              {/* Tab: Details */}
              {activeTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><Label>Campaign name (internal)</Label><Input value={name} onChange={setName} placeholder="Heineken VIP Night Q3" /></div>
                  <div><Label>Brand name</Label><Input value={brandName} onChange={setBrandName} placeholder="Heineken" /></div>
                  <div><Label>Event headline (guest-facing)</Label><Input value={headline} onChange={setHeadline} placeholder="An evening with Heineken" /></div>
                  <div><Label>Subheadline (optional)</Label><Input value={subheadline} onChange={setSubheadline} placeholder="Exclusive VIP access · Victoria Island" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><Label>Venue</Label><Input value={venueName} onChange={setVenueName} placeholder="Quilox, VI" /></div>
                    <div><Label>City</Label>
                      <select value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${hairline}`, background: 'rgba(250,246,238,.04)', color: ivory, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }}>
                        {['Lagos', 'Abuja', 'Port Harcourt', 'London'].map(c => <option key={c} value={c} style={{ background: ink }}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div style={{ gridColumn: '1 / -1' }}><Label>Event date</Label><Input type="date" value={eventDate} onChange={setEventDate} /></div>
                    <div><Label>Doors open</Label><Input type="time" value={startTime} onChange={setStartTime} /></div>
                    <div><Label>Closes</Label><Input type="time" value={endTime} onChange={setEndTime} /></div>
                  </div>
                </div>
              )}

              {/* Tab: Theme */}
              {activeTab === 'theme' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(192,151,90,.08)', border: '1px solid rgba(192,151,90,.20)', fontSize: 11.5, color: muted, lineHeight: 1.5 }}>
                    <Palette size={13} style={{ display: 'inline', marginRight: 6 }} color={gold} />
                    The guest view is skinned entirely with your brand's colors. Use your campaign asset hex codes below.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <Label>Primary color</Label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none' }} />
                        <Input value={primaryColor} onChange={setPrimaryColor} placeholder="#c0975a" />
                      </div>
                    </div>
                    <div>
                      <Label>Background</Label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none' }} />
                        <Input value={bgColor} onChange={setBgColor} placeholder="#0d0c0a" />
                      </div>
                    </div>
                    <div>
                      <Label>Text color</Label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'none' }} />
                        <Input value={textColor} onChange={setTextColor} placeholder="#faf6ee" />
                      </div>
                    </div>
                  </div>
                  <div><Label>Brand logo URL (transparent PNG/SVG preferred)</Label><Input value={logoUrl} onChange={setLogoUrl} placeholder="https://cdn.yourbrand.com/logo.png" /></div>
                </div>
              )}

              {/* Tab: Voucher */}
              {activeTab === 'voucher' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Toggle on={voucherEnabled} onChange={setVoucherEnabled} label="Enable drink voucher / redemption tracking" />
                  {voucherEnabled && (
                    <>
                      <div><Label>Voucher label (shown to guest)</Label><Input value={voucherLabel} onChange={setVoucherLabel} placeholder="Free Smirnoff Ice" /></div>
                      <div><Label>Total voucher budget (max units)</Label><Input value={voucherLimit} onChange={setVoucherLimit} placeholder="500" type="number" /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><Label>Valid from</Label><Input type="time" value={voucherFrom} onChange={setVoucherFrom} /></div>
                        <div><Label>Valid until</Label><Input type="time" value={voucherTo} onChange={setVoucherTo} /></div>
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.16)', fontSize: 11.5, color: muted, lineHeight: 1.5 }}>
                        ✓ Redemptions are one-per-phone-number. Bartenders use the validator app to scan and confirm in &lt;3 seconds. Zero fraud.
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Content */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Toggle on={photowallEnabled} onChange={setPhotowallEnabled} label="Enable live photo wall (guest uploads)" />
                  <div>
                    <Label>DJ / Artist lineup (shown on guest hub)</Label>
                    <textarea value={lineupText} onChange={e => setLineupText(e.target.value)} placeholder="11 PM — DJ Spinall&#10;1 AM — Afrobeats Set" rows={4}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${hairline}`, background: 'rgba(250,246,238,.04)', color: ivory, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                  </div>
                  <div>
                    <Label>Cocktail menu / offers</Label>
                    <textarea value={menuText} onChange={e => setMenuText(e.target.value)} placeholder="Heineken 0.0 — Free&#10;Signature cocktails — ₦3,500" rows={4}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${hairline}`, background: 'rgba(250,246,238,.04)', color: ivory, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
                  </div>
                </div>
              )}

              {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.20)', fontSize: 12, color: '#f87171' }}>{error}</div>}

              <button type="button" onClick={handleCreate} disabled={submitting || !name.trim() || !brandName.trim()}
                style={{
                  marginTop: 24, width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: (!name.trim() || !brandName.trim()) ? 'rgba(250,246,238,.08)' : gold,
                  color: (!name.trim() || !brandName.trim()) ? muted : '#fff',
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: submitting ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                {submitting ? 'Creating…' : 'Create campaign'}
              </button>
            </div>

            {/* Right — live preview */}
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: muted, marginBottom: 16, textAlign: 'center' }}>
                Live preview — guest pass screen
              </div>
              <GuestPreview
                brandName={brandName}
                headline={headline}
                primaryColor={primaryColor}
                bgColor={bgColor}
                textColor={textColor}
                logoUrl={logoUrl}
                voucherLabel={voucherLabel}
                voucherEnabled={voucherEnabled}
              />
              <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10, color: muted }}>
                Updates in real time as you type
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
