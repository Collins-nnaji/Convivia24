'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Loader2, Check, Wine, Music, UtensilsCrossed, RefreshCw, Upload } from 'lucide-react';

interface HubCampaign {
  id: string; brand_name: string; primary_color: string; bg_color: string; text_color: string;
  logo_url: string | null; headline: string | null; venue_name: string | null;
  voucher_enabled: boolean; voucher_label: string | null;
  lineup_text: string | null; menu_text: string | null; photowall_enabled: boolean;
  slug: string;
}

interface Photo {
  id: string; url: string; uploader_name: string | null; created_at: string;
}

type HubTab = 'voucher' | 'photo' | 'lineup';

function PhotoWall({ photos, primary }: { photos: Photo[]; primary: string }) {
  if (photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
        No photos yet. Be the first to upload!
      </div>
    );
  }
  return (
    <div style={{ columns: 2, gap: 8, padding: '0 4px' }}>
      {photos.map(p => (
        <div key={p.id} style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', breakInside: 'avoid', position: 'relative' }}>
          <img src={p.url} alt={p.uploader_name || 'Guest'} style={{ width: '100%', display: 'block', borderRadius: 12 }} />
          {p.uploader_name && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 10px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,.7)', fontSize: 10, color: '#fff', fontWeight: 600 }}>
              {p.uploader_name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LiveEventHub({ photowallSlug, passToken }: { photowallSlug: string; passToken?: string }) {
  const [campaign, setCampaign] = useState<HubCampaign | null>(null);
  const [pass, setPass] = useState<{ name: string; voucher_redeemed: boolean } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HubTab>('voucher');
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [hubRes, photoRes] = await Promise.all([
          fetch(`/api/portal/campaigns/hub/${photowallSlug}`),
          fetch(`/api/guest/photo?slug=${photowallSlug}&limit=30`),
        ]);
        if (hubRes.ok) setCampaign((await hubRes.json()).campaign);
        if (photoRes.ok) setPhotos((await photoRes.json()).photos || []);

        if (passToken) {
          const passRes = await fetch(`/api/guest/pass?token=${passToken}`);
          if (passRes.ok) {
            const d = await passRes.json();
            setPass({ name: d.pass?.name, voucher_redeemed: d.pass?.voucher_redeemed });
            setRedeemed(d.pass?.voucher_redeemed);
          }
        }
      } finally { setLoading(false); }
    }
    load();
  }, [photowallSlug, passToken]);

  const refreshPhotos = useCallback(async () => {
    const res = await fetch(`/api/guest/photo?slug=${photowallSlug}&limit=30`);
    if (res.ok) setPhotos((await res.json()).photos || []);
  }, [photowallSlug]);

  // Auto-refresh photos every 10s
  useEffect(() => {
    const interval = setInterval(refreshPhotos, 10000);
    return () => clearInterval(interval);
  }, [refreshPhotos]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !campaign) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('campaign_id', campaign.id);
      if (passToken) form.append('pass_token', passToken);
      if (pass?.name) form.append('uploader_name', pass.name);
      const res = await fetch('/api/guest/photo', { method: 'POST', body: form });
      if (res.ok) { setUploadDone(true); refreshPhotos(); setTimeout(() => setUploadDone(false), 3000); }
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function handleRedeem() {
    if (!passToken || !campaign?.voucher_enabled) return;
    setRedeeming(true);
    try {
      const res = await fetch('/api/guest/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass_token: passToken }),
      });
      const data = await res.json();
      if (data.valid) setRedeemed(true);
    } finally { setRedeeming(false); }
  }

  if (loading) {
    return <div style={{ minHeight: '100dvh', background: '#0d0c0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} color="rgba(250,246,238,.3)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>;
  }

  if (!campaign) {
    return <div style={{ minHeight: '100dvh', background: '#0d0c0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(250,246,238,.4)', fontSize: 14 }}>Hub not found.</div>;
  }

  const bg = campaign.bg_color || '#0d0c0a';
  const primary = campaign.primary_color || '#c0975a';
  const text = campaign.text_color || '#faf6ee';
  const faded = text + '88';

  const tabs: { id: HubTab; label: string; icon: React.ElementType; show: boolean }[] = [
    { id: 'voucher', label: campaign.voucher_label || 'Drink', icon: Wine, show: campaign.voucher_enabled },
    { id: 'photo', label: 'Photo wall', icon: Camera, show: campaign.photowall_enabled },
    { id: 'lineup', label: 'Lineup', icon: Music, show: !!(campaign.lineup_text || campaign.menu_text) },
  ].filter(t => t.show);

  return (
    <div style={{ minHeight: '100dvh', background: bg, color: text, fontFamily: 'var(--font-geist, system-ui)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0', borderBottom: `1px solid ${primary}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          {campaign.logo_url ? (
            <img src={campaign.logo_url} alt="" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: primary }}>{campaign.brand_name}</div>
          )}
          {pass && <div style={{ fontSize: 11, color: faded }}>Hey, {pass.name.split(' ')[0]} 👋</div>}
        </div>

        {/* Tab bar */}
        {tabs.length > 1 && (
          <div style={{ display: 'flex', gap: 2, padding: '3px', borderRadius: 12, background: 'rgba(255,255,255,.05)', marginBottom: 0 }}>
            {tabs.map(t => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
                flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: activeTab === t.id ? primary : 'transparent',
                color: activeTab === t.id ? '#fff' : faded,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'all .15s',
              }}>
                <t.icon size={11} /> {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* Voucher tab */}
        {activeTab === 'voucher' && campaign.voucher_enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {redeemed ? (
              <div style={{ padding: '28px', borderRadius: 16, background: '#22c55e12', border: '1px solid #22c55e28', textAlign: 'center' }}>
                <Check size={32} color="#22c55e" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>Voucher redeemed</div>
                <div style={{ fontSize: 12, color: faded }}>Your {campaign.voucher_label || 'drink'} has been claimed. Enjoy!</div>
              </div>
            ) : showVoucher ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '24px', borderRadius: 16, background: primary + '12', border: `1px solid ${primary}28`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: primary, marginBottom: 10 }}>Your voucher</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: text, marginBottom: 6 }}>🥂 {campaign.voucher_label || 'Free Welcome Drink'}</div>
                  <div style={{ fontSize: 11, color: faded, marginBottom: 16 }}>Show this to the bartender</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, color: primary, letterSpacing: '0.1em', padding: '8px 12px', background: 'rgba(255,255,255,.05)', borderRadius: 8 }}>
                    {passToken?.slice(0, 16).toUpperCase()}
                  </div>
                </div>
                {passToken && (
                  <button type="button" onClick={handleRedeem} disabled={redeeming} style={{
                    padding: '14px', borderRadius: 12, border: 'none', background: primary, color: '#fff',
                    fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    {redeeming ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Wine size={14} />}
                    {redeeming ? 'Confirming…' : 'Confirm redemption'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ padding: '28px 20px', borderRadius: 16, background: primary + '0f', border: `1px solid ${primary}20`, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🥂</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 6 }}>{campaign.voucher_label || 'Free Welcome Drink'}</div>
                <div style={{ fontSize: 12, color: faded, marginBottom: 20, lineHeight: 1.5 }}>Tap below to reveal your drink voucher. Show it to the bartender to claim.</div>
                <button type="button" onClick={() => setShowVoucher(true)} style={{
                  padding: '14px 28px', borderRadius: 99, border: 'none', background: primary, color: '#fff',
                  fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
                }}>
                  Reveal my voucher
                </button>
              </div>
            )}
          </div>
        )}

        {/* Photo wall tab */}
        {activeTab === 'photo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Upload area */}
            <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(255,255,255,.04)', border: `1px dashed ${primary}40`, textAlign: 'center' }}>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: 'none' }} />
              {uploadDone ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Check size={22} color="#22c55e" />
                  <span style={{ fontSize: 12, color: '#22c55e' }}>Photo uploaded to the live screen!</span>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  {uploading ? (
                    <Loader2 size={28} color={primary} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Upload size={28} color={primary} />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, color: text }}>{uploading ? 'Uploading…' : 'Upload to the live screen'}</span>
                  <span style={{ fontSize: 10, color: faded }}>Your photo appears on the venue screens</span>
                </button>
              )}
            </div>

            {/* Photo grid */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: faded }}>Live wall ({photos.length})</span>
              <button type="button" onClick={refreshPhotos} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <RefreshCw size={12} color={faded} />
              </button>
            </div>
            <PhotoWall photos={photos} primary={primary} />
          </div>
        )}

        {/* Lineup tab */}
        {activeTab === 'lineup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {campaign.lineup_text && (
              <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,.04)', border: `1px solid ${primary}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Music size={14} color={primary} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: primary }}>Tonight's Lineup</span>
                </div>
                <pre style={{ margin: 0, fontSize: 13, color: text, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{campaign.lineup_text}</pre>
              </div>
            )}
            {campaign.menu_text && (
              <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,.04)', border: `1px solid ${primary}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <UtensilsCrossed size={14} color={primary} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: primary }}>Menu & Offers</span>
                </div>
                <pre style={{ margin: 0, fontSize: 13, color: text, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{campaign.menu_text}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '10px', fontSize: 9, color: faded, letterSpacing: '0.12em' }}>
        Powered by Convivia24
      </div>
    </div>
  );
}
