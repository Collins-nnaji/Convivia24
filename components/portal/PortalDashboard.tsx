'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3, Users, QrCode, Image, Plus, ChevronRight,
  TrendingUp, Clock, MapPin, Circle, ArrowUpRight,
  Settings, LogOut, Zap, RefreshCw, Eye,
} from 'lucide-react';
import { signOutAndRedirect } from '@/lib/auth/sign-out-client';

// ─── Design tokens (dark portal theme) ────────────────────────
const ink   = '#0d0c0a';
const ink2  = '#171512';
const gold  = '#c0975a';
const ivory = '#faf6ee';
const muted = 'rgba(250,246,238,.45)';
const muted2 = 'rgba(250,246,238,.20)';
const hairline = 'rgba(250,246,238,.07)';
const success = '#22c55e';
const warning = '#f59e0b';

// ─── Types ────────────────────────────────────────────────────
interface Campaign {
  id: string; name: string; brand_name: string; slug: string; status: string;
  primary_color: string; venue_name: string | null; city: string;
  event_date: string | null; start_time: string | null;
  total_guests: number; redeemed_count: number; photo_count: number;
  total_scans: number; voucher_enabled: boolean;
}

interface Totals {
  total_campaigns: number; active_campaigns: number;
  total_guests: number; total_redemptions: number; total_photos: number;
}

interface ActivityItem {
  name: string; checked_in_at: string | null; voucher_redeemed_at: string | null;
  created_at: string; brand_name: string; venue_name: string | null; primary_color: string;
}

// ─── Metric card ─────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, accent }:
  { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) {
  const c = accent || gold;
  return (
    <div style={{
      padding: '24px 22px', borderRadius: 16,
      background: ink2, border: `1px solid ${hairline}`,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: c + '18', border: `1px solid ${c}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={c} />
        </div>
        <TrendingUp size={13} color={success} opacity={0.6} />
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1, color: ivory,
          letterSpacing: '-0.02em', marginBottom: 4,
        }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: muted }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: muted2, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Campaign row ─────────────────────────────────────────────
function CampaignRow({ c }: { c: Campaign }) {
  const isActive = c.status === 'active';
  const redemptionRate = c.total_guests > 0 ? Math.round((c.redeemed_count / c.total_guests) * 100) : 0;

  return (
    <Link href={`/portal/campaigns/${c.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        padding: '16px 20px', borderRadius: 12,
        background: ink2, border: `1px solid ${hairline}`,
        display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto',
        gap: 16, alignItems: 'center',
        transition: 'border-color .15s, background .15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = gold + '40';
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(192,151,90,.04)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = hairline;
        (e.currentTarget as HTMLDivElement).style.background = ink2;
      }}
      >
        {/* Brand + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 10, height: 10, borderRadius: 99, flexShrink: 0,
            background: c.primary_color,
            boxShadow: isActive ? `0 0 8px ${c.primary_color}80` : 'none',
          }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ivory, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.brand_name}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
          </div>
        </div>

        {/* Status */}
        <span style={{
          padding: '3px 10px', borderRadius: 99,
          background: isActive ? success + '1a' : muted2,
          border: `1px solid ${isActive ? success + '30' : 'transparent'}`,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: isActive ? success : muted,
          whiteSpace: 'nowrap',
        }}>{c.status}</span>

        {/* Guests */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: ivory }}>{c.total_guests.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Guests</div>
        </div>

        {/* Redemption rate */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.voucher_enabled ? ivory : muted2 }}>
            {c.voucher_enabled ? `${redemptionRate}%` : '—'}
          </div>
          <div style={{ fontSize: 9, color: muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Redeemed</div>
        </div>

        {/* Photos */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: ivory }}>{c.photo_count}</div>
          <div style={{ fontSize: 9, color: muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Photos</div>
        </div>

        <ChevronRight size={14} color={muted2} />
      </div>
    </Link>
  );
}

// ─── Activity feed ────────────────────────────────────────────
function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', fontSize: 12, color: muted }}>
        No activity yet. Activate a campaign to see live check-ins.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: i < items.length - 1 ? `1px solid ${hairline}` : 'none',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 99, flexShrink: 0,
            background: item.voucher_redeemed_at ? success : item.primary_color || gold,
            boxShadow: item.voucher_redeemed_at ? `0 0 6px ${success}60` : 'none',
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: ivory }}>{item.name}</span>
            <span style={{ fontSize: 11, color: muted, marginLeft: 6 }}>
              {item.voucher_redeemed_at ? 'redeemed drink' : 'checked in'}
            </span>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: muted2 }}>
              {item.venue_name || item.brand_name}
            </div>
            <div style={{ fontSize: 9, color: muted2, marginTop: 1 }}>
              {new Date(item.voucher_redeemed_at || item.checked_in_at || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main portal dashboard ────────────────────────────────────
export function PortalDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function loadData(silent = false) {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [campaignsRes, statsRes] = await Promise.all([
        fetch('/api/portal/campaigns', { credentials: 'include' }),
        fetch('/api/portal/stats', { credentials: 'include' }),
      ]);
      if (campaignsRes.ok) setCampaigns((await campaignsRes.json()).campaigns || []);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setTotals(data.totals);
        setActivity(data.activity || []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Auto-refresh every 30s when there are active campaigns
  useEffect(() => {
    const hasActive = campaigns.some(c => c.status === 'active');
    if (!hasActive) return;
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [campaigns]);

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    setSigningOut(true);
    await signOutAndRedirect();
  }

  const hasActive = campaigns.some(c => c.status === 'active');

  return (
    <div style={{
      minHeight: '100dvh', background: ink,
      color: ivory, fontFamily: 'var(--font-geist, system-ui)',
    }}>
      {/* Top nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: `1px solid ${hairline}`,
        background: 'rgba(13,12,10,.95)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)',
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: ivory, letterSpacing: '-0.01em' }}>
                Convivia<span style={{ color: gold }}>24</span>
              </span>
            </Link>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: 'Overview', href: '/portal', active: true },
                { label: 'Configurator', href: '/portal/configurator', active: false },
              ].map(({ label, href, active }) => (
                <Link key={label} href={href} style={{
                  padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
                  background: active ? 'rgba(250,246,238,.08)' : 'transparent',
                  fontSize: 11, fontWeight: 700, color: active ? ivory : muted,
                  letterSpacing: '0.04em', transition: 'background .15s, color .15s',
                }}>{label}</Link>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {hasActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 99, background: success + '1a', border: `1px solid ${success}28` }}>
                <Circle size={6} fill={success} color={success} style={{ animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', color: success, textTransform: 'uppercase' }}>Live</span>
              </div>
            )}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${hairline}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={13} color={muted} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${hairline}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut size={13} color={muted} />
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px) 80px' }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 120 }}>
            <RefreshCw size={24} color={muted} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(24px, 4vw, 40px)', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: gold, marginBottom: 6 }}>
                  Brand Partner Portal
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
                  fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1, color: ivory,
                  letterSpacing: '-0.02em',
                }}>
                  Campaign Overview
                </h1>
              </div>
              <Link href="/portal/configurator" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '11px 20px', borderRadius: 10,
                background: gold, color: '#fff', textDecoration: 'none',
                fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                <Plus size={13} /> New Campaign
              </Link>
            </div>

            {/* Metric cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12, marginBottom: 'clamp(24px, 4vw, 40px)',
            }}>
              <MetricCard icon={Zap} label="Active campaigns right now" value={totals?.active_campaigns ?? 0} sub={`of ${totals?.total_campaigns ?? 0} total`} accent={success} />
              <MetricCard icon={Users} label="Total unique consumer profiles" value={(totals?.total_guests ?? 0).toLocaleString()} />
              <MetricCard icon={QrCode} label="Voucher redemptions validated" value={(totals?.total_redemptions ?? 0).toLocaleString()} accent="#7c5bff" />
              <MetricCard icon={Image} label="Brand photos uploaded to live walls" value={(totals?.total_photos ?? 0).toLocaleString()} accent="#e09f3e" />
            </div>

            {/* Main grid — campaigns + activity */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20, alignItems: 'start',
            }}>
              {/* Campaigns */}
              <div style={{ gridColumn: campaigns.length > 0 ? '1 / -1' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: muted }}>
                    Campaigns ({campaigns.length})
                  </span>
                  <Link href="/portal/configurator" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: gold, textDecoration: 'none', fontWeight: 600 }}>
                    New <Plus size={10} />
                  </Link>
                </div>

                {campaigns.length === 0 ? (
                  <div style={{
                    padding: '48px', borderRadius: 16, textAlign: 'center',
                    border: `1px dashed ${hairline}`, background: ink2,
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ivory, marginBottom: 8 }}>No campaigns yet</div>
                    <div style={{ fontSize: 12, color: muted, marginBottom: 20, maxWidth: 280, margin: '0 auto 20px' }}>
                      Create your first brand activation campaign to start capturing consumer data.
                    </div>
                    <Link href="/portal/configurator" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '10px 20px', borderRadius: 99,
                      background: gold, color: '#fff', textDecoration: 'none',
                      fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                    }}>
                      <Plus size={12} /> Create campaign
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {/* Table header */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto',
                      gap: 16, padding: '0 20px 8px',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: muted2,
                    }}>
                      <span>Campaign</span>
                      <span>Status</span>
                      <span style={{ textAlign: 'right' }}>Guests</span>
                      <span style={{ textAlign: 'right' }}>Redeemed</span>
                      <span style={{ textAlign: 'right' }}>Photos</span>
                      <span />
                    </div>
                    {campaigns.map(c => <CampaignRow key={c.id} c={c} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Live activity feed */}
            {activity.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: muted }}>
                    Live Activity
                  </span>
                </div>
                <div style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: `1px solid ${hairline}`, background: ink2,
                }}>
                  <ActivityFeed items={activity} />
                </div>
              </div>
            )}

            {/* Quick links */}
            <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: Settings, label: 'Configurator', href: '/portal/configurator' },
                { icon: Eye, label: 'Validator App', href: '/validate/demo' },
                { icon: ArrowUpRight, label: 'View landing page', href: '/' },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={label} href={href} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 10,
                  border: `1px solid ${hairline}`, background: ink2,
                  fontSize: 11, fontWeight: 600, color: muted, textDecoration: 'none',
                  transition: 'color .15s, border-color .15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = ivory; (e.currentTarget as HTMLAnchorElement).style.borderColor = gold + '40'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = muted; (e.currentTarget as HTMLAnchorElement).style.borderColor = hairline; }}
                >
                  <Icon size={13} /> {label}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
