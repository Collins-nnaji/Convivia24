'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, MapPin, Calendar, Users, Plus, ChevronRight,
  Sparkles, X, Check, Clock, Filter, Send, Globe,
  Music, Dumbbell, Briefcase, Utensils, Plane, Palette,
  Trophy, GraduationCap, Moon, PartyPopper,
  ArrowLeft, Heart, CheckCircle, Loader2,
} from 'lucide-react';
import { Avatar, Eyebrow, Chip, Btn, Card, Hr } from '@/components/convivia24/primitives';

// ─── Types ────────────────────────────────────────────────────

interface DiscoverListing {
  id: string;
  user_id: string;
  title: string;
  event_type: string;
  venue: string | null;
  event_date: string;
  event_time: string | null;
  city: string;
  vibe_tags: string[];
  description: string | null;
  max_group_size: number;
  is_open: boolean;
  cover_emoji: string;
  ticket_url: string | null;
  slug: string | null;
  created_at: string;
  host_name: string;
  host_avatar: string | null;
  host_verified: boolean;
  host_interests: string[];
  host_vibe: string | null;
  accepted_count: number;
  pending_count: number;
  my_request_status: string | null;
  is_mine: boolean;
}

interface MyListing extends DiscoverListing {
  pending_requests?: PendingRequest[];
}

interface PendingRequest {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  verified: boolean;
  interest_tags: string[];
}

// ─── Constants ────────────────────────────────────────────────

const EVENT_TYPE_META: Record<string, { label: string; emoji: string; icon: React.ElementType; color: string }> = {
  concert:     { label: 'Concert',      emoji: '🎵', icon: Music,         color: '#7c5bff' },
  sports:      { label: 'Sports',       emoji: '🏆', icon: Trophy,        color: '#e85d4b' },
  festival:    { label: 'Festival',     emoji: '🎪', icon: PartyPopper,   color: '#e09f3e' },
  networking:  { label: 'Networking',   emoji: '🤝', icon: Briefcase,     color: '#2a4870' },
  conference:  { label: 'Conference',   emoji: '🎤', icon: Briefcase,     color: '#5a6573' },
  nightlife:   { label: 'Nightlife',    emoji: '🌙', icon: Moon,          color: '#8b2535' },
  university:  { label: 'University',   emoji: '🎓', icon: GraduationCap, color: '#8aa085' },
  fitness:     { label: 'Fitness',      emoji: '💪', icon: Dumbbell,      color: '#e85d4b' },
  travel:      { label: 'Travel',       emoji: '✈️', icon: Plane,         color: '#c0975a' },
  dining:      { label: 'Dining',       emoji: '🍽️', icon: Utensils,      color: '#8b2535' },
  arts:        { label: 'Arts',         emoji: '🎨', icon: Palette,       color: '#d97b9c' },
  other:       { label: 'Other',        emoji: '🎉', icon: Globe,         color: '#5a6573' },
};

const CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'London', 'all'];
const VIBE_OPTIONS = ['chill','hype','social','adventurous','creative','spontaneous','laid-back','focused'];
const INTEREST_SUGGESTIONS = [
  'Afrobeats','Hip-hop','Football','Basketball','Tennis','Fashion','Food & Drink',
  'Tech','Art','Film','Travel','Fitness','Gaming','Books','Photography',
  'Jazz','EDM','Comedy','Networking','Nature','Wellness',
];

// ─── Utility ──────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function spotsLeft(listing: DiscoverListing) {
  return listing.max_group_size - 1 - (listing.accepted_count || 0);
}

// ─── Sub-components ───────────────────────────────────────────

function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'xs' | 'sm' }) {
  const meta = EVENT_TYPE_META[type] || EVENT_TYPE_META.other;
  const fs = size === 'xs' ? 9 : 10;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: size === 'xs' ? '2px 7px' : '3px 9px',
      borderRadius: 99,
      background: meta.color + '18',
      border: `1px solid ${meta.color}30`,
      fontSize: fs, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
      color: meta.color,
    }}>
      {meta.emoji} {meta.label}
    </span>
  );
}

function VibeTag({ tag }: { tag: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99,
      background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
      fontSize: 10, fontWeight: 500, color: 'var(--cv-muted)',
    }}>
      {tag}
    </span>
  );
}

function SpotsBar({ listing }: { listing: DiscoverListing }) {
  const spots = spotsLeft(listing);
  const total = listing.max_group_size - 1;
  const filled = total - spots;
  const pct = total > 0 ? (filled / total) * 100 : 0;
  const full = spots <= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'var(--cv-hairline)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: full ? '#e85d4b' : '#c0975a', borderRadius: 99, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: full ? '#e85d4b' : 'var(--cv-muted)', whiteSpace: 'nowrap' }}>
        {full ? 'Full' : `${spots} spot${spots === 1 ? '' : 's'} left`}
      </span>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────

function ListingCard({
  listing, onClick,
}: {
  listing: DiscoverListing;
  onClick: () => void;
}) {
  const meta = EVENT_TYPE_META[listing.event_type] || EVENT_TYPE_META.other;
  const spots = spotsLeft(listing);
  const full = spots <= 0;
  const requested = !!listing.my_request_status;
  const accepted = listing.my_request_status === 'accepted';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: 0,
        background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        transition: 'box-shadow .15s, transform .15s',
        boxShadow: '0 2px 8px rgba(26,23,20,.06)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(26,23,20,.10)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(26,23,20,.06)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Header strip */}
      <div style={{
        padding: '14px 16px 10px',
        background: `linear-gradient(135deg, ${meta.color}12, ${meta.color}05)`,
        borderBottom: `1px solid ${meta.color}18`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 6 }}>{listing.cover_emoji}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cv-ink)', lineHeight: 1.3, marginBottom: 5 }}>
            {listing.title}
          </div>
          <TypeBadge type={listing.event_type} />
        </div>
        {accepted && (
          <span style={{
            flexShrink: 0, padding: '3px 8px', borderRadius: 99,
            background: '#22c55e18', border: '1px solid #22c55e30',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#16a34a', textTransform: 'uppercase',
          }}>In group</span>
        )}
        {requested && !accepted && (
          <span style={{
            flexShrink: 0, padding: '3px 8px', borderRadius: 99,
            background: '#f59e0b18', border: '1px solid #f59e0b30',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: '#d97706', textTransform: 'uppercase',
          }}>Pending</span>
        )}
        {listing.is_mine && (
          <span style={{
            flexShrink: 0, padding: '3px 8px', borderRadius: 99,
            background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--cv-muted)', textTransform: 'uppercase',
          }}>Your post</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--cv-muted)' }}>
            <Calendar size={11} /> {formatDate(listing.event_date)}{listing.event_time ? ` · ${listing.event_time}` : ''}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--cv-muted)' }}>
            <MapPin size={11} /> {listing.venue ? `${listing.venue}, ` : ''}{listing.city}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--cv-muted)' }}>
            <Users size={11} /> Up to {listing.max_group_size} going
          </span>
        </div>

        {/* Spots bar */}
        <SpotsBar listing={listing} />

        {/* Vibe tags */}
        {listing.vibe_tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {listing.vibe_tags.slice(0, 4).map(t => <VibeTag key={t} tag={t} />)}
          </div>
        )}

        {/* Host row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Avatar
              initial={(listing.host_name || 'A')[0].toUpperCase()}
              size={24}
              index={listing.event_type === 'concert' ? 4 : listing.event_type === 'sports' ? 1 : 0}
            />
            <span style={{ fontSize: 11.5, color: 'var(--cv-muted)', fontWeight: 500 }}>
              {listing.host_name}
              {listing.host_verified && (
                <span style={{ marginLeft: 4, color: '#2a4870', fontSize: 10 }}>✓</span>
              )}
            </span>
          </div>
          <ChevronRight size={13} color="var(--cv-muted-2)" />
        </div>
      </div>
    </button>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────

function ListingDetail({
  listingId,
  onBack,
  onToast,
}: {
  listingId: string;
  onBack: () => void;
  onToast: (msg: string) => void;
}) {
  const [data, setData] = useState<{
    listing: DiscoverListing & { host_bio?: string; host_rating?: number };
    accepted: PendingRequest[];
    pending: PendingRequest[];
    my_request: { id: string; status: string; message: string | null } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discover/${listingId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId]);

  async function handleJoin() {
    setJoining(true);
    try {
      const res = await fetch(`/api/discover/${listingId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() || undefined }),
      });
      const body = await res.json();
      if (!res.ok) { onToast(body.error || 'Failed to send request'); return; }
      onToast('Request sent!');
      setShowJoinForm(false);
      setMessage('');
      const refreshed = await fetch(`/api/discover/${listingId}`, { credentials: 'include' }).then(r => r.json());
      setData(refreshed);
    } finally {
      setJoining(false);
    }
  }

  async function handleRespond(requestId: string, status: 'accepted' | 'declined') {
    setRespondingId(requestId);
    try {
      const res = await fetch(`/api/discover/${listingId}/join`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, status }),
      });
      if (!res.ok) { onToast('Failed to respond'); return; }
      onToast(status === 'accepted' ? 'Accepted!' : 'Declined');
      const refreshed = await fetch(`/api/discover/${listingId}`, { credentials: 'include' }).then(r => r.json());
      setData(refreshed);
    } finally {
      setRespondingId(null);
    }
  }

  async function handleWithdraw() {
    const res = await fetch(`/api/discover/${listingId}/join`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      onToast('Request withdrawn');
      const refreshed = await fetch(`/api/discover/${listingId}`, { credentials: 'include' }).then(r => r.json());
      setData(refreshed);
    }
  }

  if (loading) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cv-ivory)' }}>
        <Loader2 size={24} color="var(--cv-muted)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--cv-muted)' }}>Could not load this event.</span>
        <Btn label="Go back" onClick={onBack} />
      </div>
    );
  }

  const { listing, accepted, pending, my_request } = data;
  const meta = EVENT_TYPE_META[listing.event_type] || EVENT_TYPE_META.other;
  const spots = spotsLeft(listing);
  const isMine = listing.is_mine;
  const hasRequest = !!my_request;
  const isAccepted = my_request?.status === 'accepted';
  const isPending = my_request?.status === 'pending';

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--cv-ivory)' }}>
      {/* Back bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, height: 56,
        display: 'flex', alignItems: 'center', padding: '0 14px',
        background: 'rgba(250,246,238,.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--cv-hairline)',
      }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cv-ink)', fontWeight: 700, fontSize: 13 }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div style={{ padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Hero */}
        <div style={{
          padding: '24px 20px 20px',
          background: `linear-gradient(135deg, ${meta.color}16, ${meta.color}06)`,
          border: `1px solid ${meta.color}22`,
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{listing.cover_emoji}</div>
          <TypeBadge type={listing.event_type} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cv-ink)', margin: '10px 0 8px', lineHeight: 1.2 }}>
            {listing.title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cv-muted)' }}>
              <Calendar size={12} /> {formatDate(listing.event_date)}{listing.event_time ? ` at ${listing.event_time}` : ''}
            </span>
            {(listing.venue || listing.city) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cv-muted)' }}>
                <MapPin size={12} /> {[listing.venue, listing.city].filter(Boolean).join(', ')}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cv-muted)' }}>
              <Users size={12} /> Group of up to {listing.max_group_size}
            </span>
          </div>
          {listing.description && (
            <p style={{ fontSize: 13, color: 'var(--cv-muted)', lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>
              {listing.description}
            </p>
          )}
          {listing.vibe_tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
              {listing.vibe_tags.map(t => <VibeTag key={t} tag={t} />)}
            </div>
          )}
        </div>

        {/* Spots */}
        <Card style={{ padding: '14px 16px' }}>
          <Eyebrow>Group capacity</Eyebrow>
          <SpotsBar listing={listing} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {accepted.map((m, i) => (
              <div key={m.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Avatar initial={(m.name || 'A')[0].toUpperCase()} size={30} index={i} />
                <span style={{ fontSize: 9, color: 'var(--cv-muted)', maxWidth: 40, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name.split(' ')[0]}</span>
              </div>
            ))}
            {spots > 0 && Array.from({ length: Math.min(spots, 4) }).map((_, i) => (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: 9999, border: '1.5px dashed var(--cv-hairline)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Plus size={10} color="var(--cv-muted-2)" />
              </div>
            ))}
          </div>
        </Card>

        {/* Host */}
        <Card style={{ padding: '14px 16px' }}>
          <Eyebrow>Your host</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 8 }}>
            <Avatar initial={(listing.host_name || 'A')[0].toUpperCase()} size={44} index={0} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cv-ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {listing.host_name}
                {listing.host_verified && <span style={{ fontSize: 10, color: '#2a4870', fontWeight: 700 }}>✓ Verified</span>}
              </div>
              {listing.host_vibe && (
                <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginTop: 2 }}>Vibe: {listing.host_vibe}</div>
              )}
              {(listing as any).host_bio && (
                <div style={{ fontSize: 12, color: 'var(--cv-muted)', marginTop: 6, lineHeight: 1.4 }}>{(listing as any).host_bio}</div>
              )}
              {listing.host_interests?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {listing.host_interests.slice(0, 5).map(t => <VibeTag key={t} tag={t} />)}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Host pending requests */}
        {isMine && pending.length > 0 && (
          <div>
            <Eyebrow style={{ marginBottom: 8 }}>Join requests ({pending.length})</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pending.map(req => (
                <Card key={req.id} style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Avatar initial={(req.name || 'A')[0].toUpperCase()} size={36} index={1} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--cv-ink)' }}>{req.name}</div>
                      {req.interest_tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {req.interest_tags.slice(0, 3).map(t => <VibeTag key={t} tag={t} />)}
                        </div>
                      )}
                      {req.message && (
                        <p style={{ fontSize: 12, color: 'var(--cv-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>"{req.message}"</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleRespond(req.id, 'accepted')}
                      disabled={respondingId === req.id}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
                        fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      }}
                    >
                      <Check size={12} /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(req.id, 'declined')}
                      disabled={respondingId === req.id}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer',
                        background: 'var(--cv-paper)', color: 'var(--cv-muted)',
                        border: '1px solid var(--cv-hairline)',
                        fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      }}
                    >
                      <X size={12} /> Decline
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Join action */}
        {!isMine && listing.is_open && (
          <div>
            {isAccepted && (
              <div style={{
                padding: '14px 18px', borderRadius: 16,
                background: '#22c55e12', border: '1px solid #22c55e30',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <CheckCircle size={18} color="#16a34a" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>You're in the group!</div>
                  <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginTop: 2 }}>The host has accepted your request. See you there.</div>
                </div>
              </div>
            )}
            {isPending && (
              <div style={{
                padding: '14px 18px', borderRadius: 16,
                background: '#f59e0b10', border: '1px solid #f59e0b28',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={18} color="#d97706" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>Request pending</div>
                    <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginTop: 2 }}>The host will respond soon.</div>
                  </div>
                </div>
                <button type="button" onClick={handleWithdraw} style={{ fontSize: 10, fontWeight: 700, color: 'var(--cv-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Withdraw
                </button>
              </div>
            )}
            {!hasRequest && spots > 0 && !showJoinForm && (
              <button
                type="button"
                onClick={() => setShowJoinForm(true)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
                  fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(26,23,20,.18)',
                }}
              >
                <Heart size={15} /> Request to join this group
              </button>
            )}
            {!hasRequest && spots <= 0 && (
              <div style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: 'var(--cv-muted)', border: '1px solid var(--cv-hairline)', borderRadius: 14 }}>
                This group is full.
              </div>
            )}
            {showJoinForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <textarea
                  placeholder="Say a little about yourself and why you'd like to join… (optional)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={300}
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)',
                    fontSize: 13, color: 'var(--cv-ink)', resize: 'none', outline: 'none',
                    fontFamily: 'var(--font-geist, system-ui)', lineHeight: 1.5,
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 12,
                      background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
                      fontSize: 12, fontWeight: 700, color: 'var(--cv-muted)', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={joining}
                    style={{
                      flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                      background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
                      fontSize: 12, fontWeight: 700, cursor: joining ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      opacity: joining ? 0.6 : 1,
                    }}
                  >
                    {joining ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                    {joining ? 'Sending…' : 'Send request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {listing.ticket_url && (
          <a
            href={listing.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', width: '100%', padding: '13px', borderRadius: 14, textAlign: 'center',
              background: 'var(--cv-paper)', border: '1px solid var(--cv-hairline)',
              fontSize: 12, fontWeight: 700, color: 'var(--cv-ink)', textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            Get tickets →
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Post Listing Form ────────────────────────────────────────

function PostAttendanceForm({
  onSuccess,
  onCancel,
  onToast,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  onToast: (msg: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('concert');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [city, setCity] = useState('Lagos');
  const [description, setDescription] = useState('');
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [vibeInput, setVibeInput] = useState('');
  const [maxGroup, setMaxGroup] = useState(6);
  const [coverEmoji, setCoverEmoji] = useState('🎉');
  const [submitting, setSubmitting] = useState(false);

  const emojiOptions = ['🎵','🏆','🎪','🎤','🌙','🎓','💪','✈️','🍽️','🎨','🎉','🎸','🏀','⚽','🎭','🎬','🔥','💫'];

  function toggleVibe(tag: string) {
    setVibeTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 6 ? [...prev, tag] : prev);
  }

  async function handleSubmit() {
    if (!title.trim() || !eventDate || !city.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          event_type: eventType,
          venue: venue.trim() || null,
          event_date: eventDate,
          event_time: eventTime || null,
          city: city.trim(),
          description: description.trim() || null,
          vibe_tags: vibeTags,
          max_group_size: maxGroup,
          cover_emoji: coverEmoji,
        }),
      });
      const body = await res.json();
      if (!res.ok) { onToast(body.error || 'Could not post'); return; }
      onToast('Posted! Others can now find you.');
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--cv-ivory)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
        background: 'rgba(250,246,238,.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--cv-hairline)',
      }}>
        <button type="button" onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cv-ink)', fontWeight: 700, fontSize: 13 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cv-ink)' }}>
          Post your plans
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ padding: '20px 16px 100px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{
          padding: '16px', borderRadius: 16,
          background: 'rgba(192,151,90,.08)', border: '1px solid rgba(192,151,90,.22)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#c0975a', marginBottom: 4 }}>Find your people before the event</div>
          <div style={{ fontSize: 11.5, color: 'var(--cv-muted)', lineHeight: 1.5 }}>
            Tell others you're attending. Form a group, coordinate, and meet people with the same plans.
          </div>
        </div>

        {/* Emoji picker */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 8 }}>
            Cover emoji
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {emojiOptions.map(e => (
              <button key={e} type="button" onClick={() => setCoverEmoji(e)} style={{
                width: 38, height: 38, borderRadius: 10, border: `2px solid ${coverEmoji === e ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
                background: coverEmoji === e ? 'var(--cv-ink)' : 'var(--cv-paper)',
                fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>
            Event name *
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Burna Boy at O2 Arena"
            maxLength={100}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)',
              fontSize: 14, color: 'var(--cv-ink)', outline: 'none',
              fontFamily: 'var(--font-geist, system-ui)', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Type */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>
            Event type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(EVENT_TYPE_META).map(([id, meta]) => (
              <button
                key={id}
                type="button"
                onClick={() => { setEventType(id); setCoverEmoji(meta.emoji); }}
                style={{
                  padding: '6px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
                  background: eventType === id ? meta.color : 'var(--cv-paper)',
                  border: `1px solid ${eventType === id ? meta.color : 'var(--cv-hairline)'}` as any,
                  color: eventType === id ? '#fff' : 'var(--cv-muted)',
                  fontSize: 11, fontWeight: 700,
                  transition: 'all .15s',
                }}
              >
                {meta.emoji} {meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>Date *</label>
            <input type="date" value={eventDate} min={today} onChange={e => setEventDate(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)', fontSize: 13, color: 'var(--cv-ink)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>Time</label>
            <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 12, border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)', fontSize: 13, color: 'var(--cv-ink)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Venue & City */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>Venue</label>
          <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Eko Hotel, O2 Arena" maxLength={100} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)', fontSize: 13, color: 'var(--cv-ink)', outline: 'none', fontFamily: 'var(--font-geist, system-ui)', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>City *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CITIES.filter(c => c !== 'all').map(c => (
              <button key={c} type="button" onClick={() => setCity(c)} style={{
                padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
                background: city === c ? 'var(--cv-ink)' : 'var(--cv-paper)',
                border: `1px solid ${city === c ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
                color: city === c ? 'var(--cv-ivory)' : 'var(--cv-muted)',
                fontSize: 11, fontWeight: 700,
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Vibe tags */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>
            Vibe tags <span style={{ fontWeight: 500, textTransform: 'none' }}>(up to 6)</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {VIBE_OPTIONS.map(t => (
              <button key={t} type="button" onClick={() => toggleVibe(t)} style={{
                padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
                background: vibeTags.includes(t) ? 'var(--cv-ink)' : 'var(--cv-paper)',
                border: `1px solid ${vibeTags.includes(t) ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
                color: vibeTags.includes(t) ? 'var(--cv-ivory)' : 'var(--cv-muted)',
                fontSize: 11, fontWeight: 600,
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Group size */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>
            Max group size: {maxGroup}
          </label>
          <input type="range" min={2} max={24} value={maxGroup} onChange={e => setMaxGroup(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--cv-ink)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--cv-muted-2)', marginTop: 2 }}>
            <span>2</span><span>24</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 6 }}>About this plan</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell people what to expect, who you're looking to meet, or what makes this event special…"
            maxLength={400}
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)',
              fontSize: 13, color: 'var(--cv-ink)', resize: 'none', outline: 'none',
              fontFamily: 'var(--font-geist, system-ui)', lineHeight: 1.5, boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !eventDate || !city.trim()}
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            background: (!title.trim() || !eventDate || !city.trim()) ? 'var(--cv-hairline)' : 'var(--cv-ink)',
            color: (!title.trim() || !eventDate || !city.trim()) ? 'var(--cv-muted)' : 'var(--cv-ivory)',
            fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', cursor: submitting ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: submitting ? 0.7 : 1,
            transition: 'background .15s',
          }}
        >
          {submitting ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
          {submitting ? 'Posting…' : 'Post my plans'}
        </button>
      </div>
    </div>
  );
}

// ─── Interest Setup Modal ─────────────────────────────────────

function InterestSetup({ onDone }: { onDone: () => void }) {
  const [interests, setInterests] = useState<string[]>([]);
  const [vibe, setVibe] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleInterest(tag: string) {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 12 ? [...prev, tag] : prev);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/profile/interests', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interest_tags: interests, social_vibe: vibe || undefined }),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--cv-ivory)', zIndex: 50 }}>
      <div style={{ padding: '56px 20px 100px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--cv-ink)', marginBottom: 8 }}>Set up your social profile</div>
          <div style={{ fontSize: 13, color: 'var(--cv-muted)', lineHeight: 1.5 }}>
            Help us match you with like-minded people at events.
          </div>
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 8 }}>
            Your interests (pick up to 12)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {INTEREST_SUGGESTIONS.map(tag => (
              <button key={tag} type="button" onClick={() => toggleInterest(tag)} style={{
                padding: '7px 13px', borderRadius: 99, cursor: 'pointer',
                background: interests.includes(tag) ? 'var(--cv-ink)' : 'var(--cv-paper)',
                border: `1px solid ${interests.includes(tag) ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
                color: interests.includes(tag) ? 'var(--cv-ivory)' : 'var(--cv-muted)',
                fontSize: 12, fontWeight: 600, transition: 'all .12s',
              }}>{tag}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--cv-muted)', display: 'block', marginBottom: 8 }}>
            Your social vibe
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {VIBE_OPTIONS.map(v => (
              <button key={v} type="button" onClick={() => setVibe(vibe === v ? '' : v)} style={{
                padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
                background: vibe === v ? 'var(--cv-ink)' : 'var(--cv-paper)',
                border: `1px solid ${vibe === v ? 'var(--cv-ink)' : 'var(--cv-hairline)'}`,
                color: vibe === v ? 'var(--cv-ivory)' : 'var(--cv-muted)',
                fontSize: 12, fontWeight: 600, transition: 'all .12s',
              }}>{v}</button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || interests.length === 0}
          style={{
            padding: '15px', borderRadius: 14, border: 'none',
            background: interests.length === 0 ? 'var(--cv-hairline)' : 'var(--cv-ink)',
            color: interests.length === 0 ? 'var(--cv-muted)' : 'var(--cv-ivory)',
            fontSize: 13, fontWeight: 800, cursor: saving ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {interests.length === 0 ? 'Pick at least one interest' : 'Save my profile →'}
        </button>

        <button type="button" onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--cv-muted)', textAlign: 'center' }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Main Discover Screen ─────────────────────────────────────

type DiscoverView = 'feed' | 'detail' | 'post' | 'interests';

export function ScreenDiscover({ onToast }: { onToast: (msg: string) => void }) {
  const [view, setView] = useState<DiscoverView>('feed');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listings, setListings] = useState<DiscoverListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Lagos');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showInterestSetup, setShowInterestSetup] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ city, limit: '30' });
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/discover?${params}`, { credentials: 'include' });
      const data = await res.json();
      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [city, typeFilter]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  if (showInterestSetup) {
    return (
      <InterestSetup onDone={() => { setShowInterestSetup(false); loadFeed(); }} />
    );
  }

  if (view === 'detail' && selectedId) {
    return (
      <ListingDetail
        listingId={selectedId}
        onBack={() => { setView('feed'); loadFeed(); }}
        onToast={onToast}
      />
    );
  }

  if (view === 'post') {
    return (
      <PostAttendanceForm
        onSuccess={() => { setView('feed'); loadFeed(); }}
        onCancel={() => setView('feed')}
        onToast={onToast}
      />
    );
  }

  const myListings = listings.filter(l => l.is_mine);
  const otherListings = listings.filter(l => !l.is_mine);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cv-ivory)' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '0 14px', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(250,246,238,.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--cv-hairline)',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--cv-ink)', letterSpacing: '-0.01em' }}>Discover</div>
          <div style={{ fontSize: 10, color: 'var(--cv-muted)', marginTop: 1 }}>Find your people at events</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setShowInterestSetup(true)}
            style={{
              height: 32, padding: '0 10px', borderRadius: 10, border: '1px solid var(--cv-hairline)',
              background: 'var(--cv-paper)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, fontWeight: 700, color: 'var(--cv-muted)', letterSpacing: '0.06em',
            }}
          >
            <Sparkles size={11} /> My interests
          </button>
          <button
            type="button"
            onClick={() => setView('post')}
            style={{
              height: 32, padding: '0 12px', borderRadius: 10, border: 'none',
              background: 'var(--cv-ink)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, fontWeight: 700, color: 'var(--cv-ivory)', letterSpacing: '0.06em',
            }}
          >
            <Plus size={11} /> Post plans
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="cv-scrollbar" style={{
        position: 'absolute', inset: 0,
        paddingTop: 58, paddingBottom: 80,
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {/* City filter */}
        <div style={{
          padding: '10px 14px 0',
          display: 'flex', gap: 6, overflowX: 'auto',
        }}>
          {CITIES.map(c => (
            <button key={c} type="button" onClick={() => setCity(c)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: city === c ? 'var(--cv-ink)' : 'var(--cv-paper)',
              border: `1px solid ${city === c ? 'var(--cv-ink)' : 'var(--cv-hairline)'}` as any,
              color: city === c ? 'var(--cv-ivory)' : 'var(--cv-muted)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'all .12s',
            }}>
              {c === 'all' ? 'All cities' : c}
            </button>
          ))}
        </div>

        {/* Event type filter */}
        <div style={{
          padding: '8px 14px 0',
          display: 'flex', gap: 6, overflowX: 'auto',
        }}>
          <button type="button" onClick={() => setTypeFilter(null)} style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: !typeFilter ? 'var(--cv-ink)' : 'var(--cv-paper)',
            border: `1px solid ${!typeFilter ? 'var(--cv-ink)' : 'var(--cv-hairline)'}` as any,
            color: !typeFilter ? 'var(--cv-ivory)' : 'var(--cv-muted)',
            fontSize: 10, fontWeight: 700,
          }}>All</button>
          {Object.entries(EVENT_TYPE_META).map(([id, meta]) => (
            <button key={id} type="button" onClick={() => setTypeFilter(typeFilter === id ? null : id)} style={{
              flexShrink: 0, padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: typeFilter === id ? meta.color : 'var(--cv-paper)',
              border: `1px solid ${typeFilter === id ? meta.color : 'var(--cv-hairline)'}` as any,
              color: typeFilter === id ? '#fff' : 'var(--cv-muted)',
              fontSize: 10, fontWeight: 700, transition: 'all .12s',
            }}>
              {meta.emoji} {meta.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* My listings */}
          {myListings.length > 0 && (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>Your plans</Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myListings.map(l => (
                  <ListingCard key={l.id} listing={l} onClick={() => { setSelectedId(l.id); setView('detail'); }} />
                ))}
              </div>
              {otherListings.length > 0 && <Hr style={{ margin: '14px 0 2px' }} />}
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
              <Loader2 size={22} color="var(--cv-muted)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : otherListings.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            }}>
              <div style={{ fontSize: 40 }}>🎪</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cv-ink)' }}>
                No events posted yet in {city === 'all' ? 'any city' : city}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cv-muted)', lineHeight: 1.5, maxWidth: 260 }}>
                Be the first to post your plans. Others will find you and ask to join.
              </div>
              <button
                type="button"
                onClick={() => setView('post')}
                style={{
                  marginTop: 4, padding: '12px 24px', borderRadius: 99, border: 'none',
                  background: 'var(--cv-ink)', color: 'var(--cv-ivory)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <Plus size={13} /> Post your plans
              </button>
            </div>
          ) : (
            <div>
              <Eyebrow style={{ marginBottom: 8 }}>
                {otherListings.length} plan{otherListings.length === 1 ? '' : 's'} in {city === 'all' ? 'all cities' : city}
              </Eyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {otherListings.map(l => (
                  <ListingCard key={l.id} listing={l} onClick={() => { setSelectedId(l.id); setView('detail'); }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
