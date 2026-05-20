'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Store, MapPin, Plus, Check, Eye, RefreshCw, Loader2,
  X, Utensils, Wine, Music, Camera, LayoutGrid, Gift, Heart, Sparkles,
  ChevronRight, Trash2, ExternalLink, Bookmark,
} from 'lucide-react';
import { Eyebrow, Chip, Btn, Card, Tag, type EventType, EVENT_TYPE_META, ACCENT_COLORS } from '@/components/convivia24/primitives';

const DOCK_PAD = 'calc(92px + env(safe-area-inset-bottom, 0px))';

interface CvEvent {
  id: string;
  host_name: string;
  event_type: string;
  city: string | null;
  capacity: number;
}

interface MarketplaceVendor {
  id: string;
  business_name: string;
  business_type: string | null;
  city_name: string | null;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
}

interface SavedEventVendor {
  id: string;
  category: string;
  name: string;
  contact: string | null;
  status: string;
}

type VendorTab = 'browse' | 'saved' | 'needs';

const CATEGORY_META: Record<string, { icon: React.ElementType; label: string }> = {
  All:         { icon: Store,       label: 'All' },
  Catering:    { icon: Utensils,    label: 'Catering' },
  Florist:     { icon: Heart,       label: 'Florist' },
  DJ:          { icon: Music,       label: 'DJ' },
  Photography: { icon: Camera,      label: 'Photo' },
  Venue:       { icon: LayoutGrid,  label: 'Venue' },
  Cake:        { icon: Gift,        label: 'Cake' },
  Decor:       { icon: Wine,        label: 'Decor' },
};

const EVENT_VENDOR_NEEDS: Partial<Record<EventType, string[]>> = {
  wedding:   ['Venue', 'Catering', 'Florist', 'Photography', 'DJ', 'Cake'],
  birthday:  ['Venue', 'Catering', 'DJ', 'Cake', 'Decor'],
  engage:    ['Venue', 'Florist', 'Photography', 'Catering'],
  corporate: ['Venue', 'Catering', 'Photography', 'Decor'],
  club:      ['Venue', 'DJ', 'Decor'],
  dinner:    ['Venue', 'Catering', 'Wine'],
  festival:  ['Venue', 'Catering', 'DJ', 'Security'],
  baby:      ['Venue', 'Catering', 'Cake', 'Decor'],
  memorial:  ['Venue', 'Catering', 'Florist'],
};

export function ScreenVendorMarketplace({ event, onToast }: { event: CvEvent; onToast: (msg: string) => void }) {
  const [tab, setTab] = useState<VendorTab>('browse');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState<MarketplaceVendor[]>([]);
  const [saved, setSaved] = useState<SavedEventVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<MarketplaceVendor | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const accent = ACCENT_COLORS[(event.event_type || 'wedding') as EventType] || '#c0975a';
  const typeLabel = EVENT_TYPE_META[(event.event_type || 'wedding') as EventType]?.label || event.event_type;
  const needsList = EVENT_VENDOR_NEEDS[(event.event_type || 'wedding') as EventType] || ['Venue', 'Catering', 'Photography'];

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(`/api/convivia24/event-vendors?marketplace=1&city=${encodeURIComponent(event.city || '')}`, { credentials: 'include', cache: 'no-store' }),
        fetch(`/api/convivia24/event-vendors?eventId=${event.id}`, { credentials: 'include', cache: 'no-store' }),
      ]);
      if (mRes.ok) setMarketplace((await mRes.json()).vendors || []);
      if (sRes.ok) setSaved((await sRes.json()).vendors || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [event.id, event.city]);

  useEffect(() => { load(); }, [load]);

  async function saveVendor(v: MarketplaceVendor) {
    setSavingId(v.id);
    try {
      const res = await fetch('/api/convivia24/event-vendors', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          category: v.business_type || 'Vendor',
          name: v.business_name,
          notes: v.slug ? `/v/${v.slug}` : null,
        }),
      });
      if (res.ok) {
        onToast(`${v.business_name} saved`);
        setSelected(null);
        load(true);
      } else onToast('Could not save vendor');
    } finally {
      setSavingId(null);
    }
  }

  async function removeSaved(id: string, name: string) {
    if (!confirm(`Remove ${name} from your shortlist?`)) return;
    await fetch(`/api/convivia24/event-vendors?id=${id}&eventId=${event.id}`, { method: 'DELETE', credentials: 'include' });
    onToast('Removed from shortlist');
    load(true);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketplace.filter(v => {
      const catOk = category === 'All' || (v.business_type || '').toLowerCase().includes(category.toLowerCase());
      const qOk = !q || [v.business_name, v.business_type, v.city_name, v.description].some(f => (f || '').toLowerCase().includes(q));
      return catOk && qOk;
    });
  }, [marketplace, category, query]);

  const missingNeeds = needsList.filter(
    need => !saved.some(s => s.category.toLowerCase().includes(need.toLowerCase())),
  );

  const savedCount = saved.length;
  const needsCount = missingNeeds.length;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cv-ivory)' }}>
      {/* Sticky header */}
      <div style={{
        flexShrink: 0, zIndex: 20,
        padding: '12px 14px 0',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        background: 'rgba(250,246,238,.94)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--cv-hairline)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow muted>Vendors</Eyebrow>
            <h1 style={{
              fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic',
              fontSize: 'clamp(22px, 5vw, 28px)', lineHeight: 1.05, marginTop: 6, color: 'var(--cv-ink)',
            }}>
              {event.host_name}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--cv-muted)', marginTop: 4, lineHeight: 1.4 }}>
              {typeLabel}{event.city ? ` · ${event.city}` : ''} · {event.capacity} guests
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            aria-label="Refresh"
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} color="var(--cv-muted)" />
          </button>
        </div>

        {/* Tab bar — 44px touch targets */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, background: 'var(--cv-paper)', borderRadius: 12, padding: 4, border: '1px solid var(--cv-hairline)' }}>
          {([
            { id: 'browse' as VendorTab, label: 'Browse' },
            { id: 'saved' as VendorTab, label: 'Shortlist', badge: savedCount },
            { id: 'needs' as VendorTab, label: 'To book', badge: needsCount },
          ]).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, minHeight: 44, border: 'none', borderRadius: 9, cursor: 'pointer',
                background: tab === t.id ? 'var(--cv-ink)' : 'transparent',
                color: tab === t.id ? 'var(--cv-ivory)' : 'var(--cv-muted)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 99, padding: '0 5px',
                  background: tab === t.id ? accent : 'var(--cv-accent-soft)',
                  color: tab === t.id ? '#fff' : accent,
                  fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'browse' && (
          <>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search size={15} color="var(--cv-muted-2)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="cv-input"
                placeholder="Search vendors, cuisine, neighbourhood…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ paddingLeft: 40, minHeight: 48, fontSize: 16 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, WebkitOverflowScrolling: 'touch' }} className="cv-scrollbar">
              {Object.keys(CATEGORY_META).map(c => {
                const Icon = CATEGORY_META[c].icon;
                return (
                  <Chip key={c} on={category === c} onClick={() => setCategory(c)} style={{ flexShrink: 0, minHeight: 40, padding: '8px 14px' }}>
                    <Icon size={12} /> {CATEGORY_META[c].label}
                  </Chip>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Scrollable body */}
      <div className="cv-scrollbar" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 14px', paddingBottom: DOCK_PAD }}>

        {tab === 'needs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4, animation: 'cv-fade-up .3s ease both' }}>
            <Card tinted style={{ padding: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--cv-muted)', lineHeight: 1.5, margin: 0 }}>
                Typical vendors for a <strong style={{ color: 'var(--cv-ink)' }}>{typeLabel.toLowerCase()}</strong>. Tap a gap to browse matches.
              </p>
            </Card>
            {missingNeeds.length === 0 ? (
              <Card style={{ padding: 24, textAlign: 'center' }}>
                <Check size={28} color={accent} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 20 }}>Shortlist looks complete</div>
                <p style={{ fontSize: 12, color: 'var(--cv-muted)', marginTop: 6 }}>You have vendors across the main categories.</p>
              </Card>
            ) : (
              missingNeeds.map(need => {
                const Icon = CATEGORY_META[need]?.icon || Store;
                const matches = marketplace.filter(v => (v.business_type || '').toLowerCase().includes(need.toLowerCase())).length;
                return (
                  <button
                    key={need}
                    type="button"
                    onClick={() => { setTab('browse'); setCategory(need); setQuery(''); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 14,
                      border: '1px solid var(--cv-hairline)', background: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14, minHeight: 64,
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={accent} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cv-ink)' }}>Book {need}</div>
                      <div style={{ fontSize: 11, color: 'var(--cv-muted)', marginTop: 2 }}>{matches > 0 ? `${matches} in marketplace` : 'Browse all vendors'}</div>
                    </div>
                    <ChevronRight size={16} color="var(--cv-muted-2)" />
                  </button>
                );
              })
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4, animation: 'cv-fade-up .3s ease both' }}>
            {saved.length === 0 ? (
              <Card tinted style={{ padding: 28, textAlign: 'center' }}>
                <Bookmark size={28} color="var(--cv-muted-2)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--cv-ink)' }}>No vendors saved yet</div>
                <p style={{ fontSize: 12.5, color: 'var(--cv-muted)', marginTop: 8, lineHeight: 1.5 }}>Browse the marketplace and tap Save to build your shortlist.</p>
                <Btn style={{ marginTop: 16 }} onClick={() => setTab('browse')}>Browse vendors</Btn>
              </Card>
            ) : (
              saved.map((s, i) => (
                <Card key={s.id} style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', minHeight: 72 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg, ${accent}22, ${accent}44)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 22, color: accent,
                    }}>
                      {s.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <Tag style={{ marginTop: 6 }}>{s.category}</Tag>
                    </div>
                  </div>
                  <div style={{ display: 'flex', borderTop: '1px solid var(--cv-hairline)' }}>
                    {s.contact?.startsWith('/v/') && (
                      <a href={s.contact} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                        <button type="button" style={{
                          width: '100%', minHeight: 48, border: 'none', background: 'transparent', cursor: 'pointer',
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                          <ExternalLink size={13} /> Profile
                        </button>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSaved(s.id, s.name)}
                      style={{
                        flex: 1, minHeight: 48, border: 'none', borderLeft: '1px solid var(--cv-hairline)',
                        background: 'transparent', cursor: 'pointer',
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a33',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === 'browse' && (
          <div style={{ paddingTop: 4, animation: 'cv-fade-up .3s ease both' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 0' }}>
                <Loader2 size={24} className="animate-spin" color={accent} />
                <span style={{ fontSize: 12, color: 'var(--cv-muted)' }}>Loading marketplace…</span>
              </div>
            ) : filtered.length === 0 ? (
              <Card tinted style={{ padding: 28, textAlign: 'center' }}>
                <Store size={28} color="var(--cv-muted-2)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 13, color: 'var(--cv-muted)', lineHeight: 1.5 }}>
                  {query ? `No results for “${query}”.` : 'No vendors in this category yet.'}
                </p>
                <Btn variant="ghost" style={{ marginTop: 12 }} onClick={() => { setCategory('All'); setQuery(''); }}>Clear filters</Btn>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 11, color: 'var(--cv-muted-2)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {filtered.length} vendor{filtered.length !== 1 ? 's' : ''}
                </p>
                {filtered.map((v, i) => {
                  const already = saved.some(s => s.name === v.business_name);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelected(v)}
                      style={{
                        width: '100%', textAlign: 'left', padding: 0, cursor: 'pointer',
                        borderRadius: 16, background: '#fff', border: '1px solid var(--cv-hairline)',
                        boxShadow: '0 2px 12px rgba(26,23,20,.05)', overflow: 'hidden',
                      }}
                    >
                      <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', minHeight: 80 }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                          background: 'var(--cv-ivory-2)', border: '1px solid var(--cv-hairline)',
                          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 20, color: accent,
                        }}>
                          {v.logo_url
                            ? <img src={v.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : v.business_name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cv-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.business_name}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' }}>
                            {v.business_type && <span style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{v.business_type}</span>}
                            {v.city_name && (
                              <span style={{ fontSize: 11, color: 'var(--cv-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={10} /> {v.city_name}
                              </span>
                            )}
                          </div>
                          {v.description && (
                            <p style={{
                              fontSize: 12, color: 'var(--cv-muted)', marginTop: 6, lineHeight: 1.4,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {v.description}
                            </p>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          {already ? (
                            <span style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Saved</span>
                          ) : null}
                          <ChevronRight size={18} color="var(--cv-muted-2)" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vendor detail sheet */}
      {selected && (
        <div
          role="dialog"
          aria-modal
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(26,23,20,.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--cv-ivory)', borderRadius: '20px 20px 0 0',
              maxHeight: 'min(88vh, 640px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
              padding: '8px 16px', paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              boxShadow: '0 -12px 40px rgba(26,23,20,.2)',
              animation: 'cv-fade-up .25s ease both',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--cv-hairline)', margin: '6px auto 16px' }} />
            <button type="button" onClick={() => setSelected(null)} aria-label="Close" style={{
              position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 99,
              border: '1px solid var(--cv-hairline)', background: 'var(--cv-paper)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14, paddingRight: 44 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, background: `${accent}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: accent, overflow: 'hidden',
              }}>
                {selected.logo_url
                  ? <img src={selected.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : selected.business_name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-instrument, serif)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.05, margin: 0 }}>{selected.business_name}</h2>
                <p style={{ fontSize: 12, color: 'var(--cv-muted)', marginTop: 4 }}>{selected.business_type}{selected.city_name ? ` · ${selected.city_name}` : ''}</p>
              </div>
            </div>

            {selected.description && (
              <p style={{ fontSize: 14, color: 'var(--cv-muted)', lineHeight: 1.55, marginBottom: 16 }}>{selected.description}</p>
            )}

            <Card tinted style={{ padding: 12, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Sparkles size={16} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: 'var(--cv-muted)', margin: 0, lineHeight: 1.5 }}>
                Save to your shortlist, then ask the Planner to draft an inquiry email for this vendor.
              </p>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected.slug && (
                <a href={`/v/${selected.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Btn variant="ghost" fullWidth style={{ minHeight: 52 }}><Eye size={14} /> View full profile</Btn>
                </a>
              )}
              <Btn
                fullWidth
                style={{ minHeight: 52, '--cv-accent': accent } as React.CSSProperties}
                disabled={saved.some(s => s.name === selected.business_name) || savingId === selected.id}
                onClick={() => saveVendor(selected)}
              >
                {savingId === selected.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : saved.some(s => s.name === selected.business_name) ? (
                  <><Check size={14} /> On your shortlist</>
                ) : (
                  <><Plus size={14} /> Save to event</>
                )}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
