'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Trash2, Star, Save, Plus, ImagePlus,
  Calendar, MapPin, Ticket, Eye, EyeOff, Check, X, Loader2,
} from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';
import { priceLabel } from '@/lib/money';

const CURRENCIES = ['NGN', 'GBP', 'USD', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD', 'AED'];
const STATUSES = ['published', 'draft', 'cancelled', 'completed'] as const;

interface EventForm {
  id: string; slug: string; title: string; tagline: string; description: string;
  category: string; organizer_name: string; venue: string; address: string;
  city: string; country: string; starts_at: string; ends_at: string;
  cover_image: string; currency: string; capacity: string; age_restriction: string;
  lineup: string; tags: string; is_featured: boolean; status: string;
  guestlist_mode: string; theme_mode: string;
}
interface Tier {
  id: string; name: string; description: string | null; price: string; currency: string;
  quantity: number; sold: number; max_per_order: number; perks: string[] | null; is_active: boolean;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(+d)) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(+d) ? null : d.toISOString();
}

const input = 'w-full bg-white border border-obsidian/15 focus:border-gold text-obsidian text-sm py-2.5 px-3 placeholder-obsidian/30 outline-none focus:ring-0 transition-colors';
const label = 'text-[9px] font-black uppercase tracking-[0.25em] text-gold-dark block mb-1.5';
const card = 'bg-white border border-obsidian/10 p-5 sm:p-6';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<EventForm | null>(null);
  const [original, setOriginal] = useState<EventForm | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  function flash(kind: 'ok' | 'err', msg: string) { setToast({ kind, msg }); setTimeout(() => setToast(null), 3000); }
  function set<K extends keyof EventForm>(key: K, value: EventForm[K]) { setForm((f) => (f ? { ...f, [key]: value } : f)); }

  function hydrate(e: Record<string, unknown>): EventForm {
    return {
      id: String(e.id), slug: String(e.slug), title: String(e.title ?? ''), tagline: String(e.tagline ?? ''),
      description: String(e.description ?? ''), category: String(e.category ?? 'party'),
      organizer_name: String(e.organizer_name ?? ''), venue: String(e.venue ?? ''), address: String(e.address ?? ''),
      city: String(e.city ?? ''), country: String(e.country ?? ''),
      starts_at: toLocalInput(e.starts_at as string), ends_at: toLocalInput(e.ends_at as string | null),
      cover_image: String(e.cover_image ?? ''), currency: String(e.currency ?? 'NGN'),
      capacity: e.capacity != null ? String(e.capacity) : '', age_restriction: String(e.age_restriction ?? ''),
      lineup: Array.isArray(e.lineup) ? (e.lineup as string[]).join(', ') : '',
      tags: Array.isArray(e.tags) ? (e.tags as string[]).join(', ') : '',
      is_featured: !!e.is_featured, status: String(e.status ?? 'published'),
      guestlist_mode: String(e.guestlist_mode ?? 'open'),
      theme_mode: String(e.theme_mode ?? 'day'),
    };
  }

  function load() {
    fetch(`/api/events/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { const f = hydrate(d.event); setForm(f); setOriginal(f); setTiers(d.ticket_types ?? []); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }
  useEffect(load, [id]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(original), [form, original]);

  async function save() {
    if (!form) return;
    if (!form.title.trim() || !form.description.trim() || !form.starts_at) {
      flash('err', 'Title, description and start date are required.'); return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title, tagline: form.tagline, description: form.description, category: form.category,
        organizer_name: form.organizer_name, venue: form.venue, address: form.address,
        city: form.city, country: form.country,
        starts_at: fromLocalInput(form.starts_at), ends_at: fromLocalInput(form.ends_at),
        cover_image: form.cover_image, currency: form.currency,
        capacity: form.capacity ? Number(form.capacity) : null,
        age_restriction: form.age_restriction,
        lineup: form.lineup ? form.lineup.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        is_featured: form.is_featured, status: form.status,
        guestlist_mode: form.guestlist_mode, theme_mode: form.theme_mode,
      };
      const res = await fetch(`/api/events/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) { flash('err', d.error || 'Save failed.'); return; }
      const f = hydrate(d); setForm(f); setOriginal(f);
      flash('ok', 'Saved.');
    } catch { flash('err', 'Could not connect.'); } finally { setSaving(false); }
  }

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('context', 'event-cover');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok) { flash('err', d.error || 'Upload failed.'); return; }
      set('cover_image', d.url);
      flash('ok', 'Image uploaded.');
    } catch { flash('err', 'Upload failed.'); } finally { setUploading(false); }
  }

  async function remove() {
    if (!form) return;
    if (!confirm(`Delete "${form.title}"? This removes its tickets and orders.`)) return;
    await fetch(`/api/events/${form.id}`, { method: 'DELETE' });
    router.push('/admin/events');
  }

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-gold-dark" /></div>;
  if (notFound || !form) return (
    <div className="text-center py-24">
      <p className="font-display text-3xl italic text-obsidian mb-3">Event not found.</p>
      <Link href="/admin/events" className="text-[#a07c28] text-[11px] font-black uppercase tracking-[0.2em]">← Back to events</Link>
    </div>
  );

  const minPrice = tiers.filter((t) => t.is_active).reduce<number | null>((min, t) => {
    const p = Number(t.price); return min == null ? p : Math.min(min, p);
  }, null);

  return (
    <div className="max-w-6xl pb-28">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 flex items-center gap-2 px-4 py-2.5 text-sm shadow-lg ${toast.kind === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.kind === 'ok' ? <Check size={15} /> : <X size={15} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div className="min-w-0">
          <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-obsidian/50 hover:text-[#a07c28] text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <ArrowLeft size={12} /> Events
          </Link>
          <h1 className="text-2xl sm:text-3xl font-light italic text-obsidian truncate">{form.title || 'Untitled event'}</h1>
          <p className="text-obsidian/35 text-xs font-mono mt-0.5">/events/{form.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/events/${form.slug}`} target="_blank" className="inline-flex items-center gap-1.5 border border-obsidian/15 text-obsidian/70 text-[11px] font-black uppercase tracking-[0.15em] px-3.5 py-2.5 hover:border-gold transition-colors"><ExternalLink size={13} /> View</Link>
          <button onClick={remove} className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-[0.15em] px-3.5 py-2.5 hover:bg-red-50 transition-colors"><Trash2 size={13} /> Delete</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* LEFT — form */}
        <div className="space-y-5 order-2 lg:order-1">
          {/* Cover */}
          <div className={card}>
            <p className={label}>Cover image</p>
            <div className="flex gap-4">
              <div className="w-32 h-24 shrink-0 bg-paper border border-obsidian/10 overflow-hidden flex items-center justify-center">
                {form.cover_image ? <img src={form.cover_image} alt="" className="w-full h-full object-cover" /> : <ImagePlus size={20} className="text-obsidian/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <input value={form.cover_image} onChange={(e) => set('cover_image', e.target.value)} placeholder="Image URL, or upload →" className={input} />
                <label className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#a07c28] hover:text-gold cursor-pointer">
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />} {uploading ? 'Uploading…' : 'Upload image'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
                </label>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className={card}>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian mb-4">Details</h2>
            <div className="space-y-4">
              <div><label className={label}>Title *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} className={input} /></div>
              <div><label className={label}>Tagline</label><input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="One punchy line" className={input} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Category</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className={input}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div><label className={label}>Organizer</label><input value={form.organizer_name} onChange={(e) => set('organizer_name', e.target.value)} className={input} /></div>
              </div>
              <div><label className={label}>Description *</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} className={`${input} resize-none`} /></div>
            </div>
          </div>

          {/* When & where */}
          <div className={card}>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian mb-4 flex items-center gap-2"><Calendar size={14} className="text-gold-dark" /> When &amp; where</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={label}>Starts *</label><input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className={input} /></div>
              <div><label className={label}>Ends</label><input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} className={input} /></div>
              <div className="sm:col-span-2"><label className={label}>Venue</label><input value={form.venue} onChange={(e) => set('venue', e.target.value)} className={input} /></div>
              <div><label className={label}>City</label><input value={form.city} onChange={(e) => set('city', e.target.value)} className={input} /></div>
              <div><label className={label}>Country</label><input value={form.country} onChange={(e) => set('country', e.target.value)} className={input} /></div>
              <div><label className={label}>Age restriction</label><input value={form.age_restriction} onChange={(e) => set('age_restriction', e.target.value)} placeholder="18+" className={input} /></div>
              <div><label className={label}>Capacity</label><input type="number" min="0" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} className={input} /></div>
            </div>
          </div>

          {/* Extras */}
          <div className={card}>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian mb-4">Lineup &amp; tags</h2>
            <div className="space-y-4">
              <div><label className={label}>Lineup (comma separated)</label><input value={form.lineup} onChange={(e) => set('lineup', e.target.value)} placeholder="DJ One, Special Guest" className={input} /></div>
              <div><label className={label}>Tags (comma separated)</label><input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="afrobeats, rooftop" className={input} /></div>
            </div>
          </div>

          {/* Ticket tiers */}
          <TierManager eventId={form.id} currency={form.currency} tiers={tiers} setTiers={setTiers} flash={flash} />
        </div>

        {/* RIGHT — preview + visibility */}
        <div className="space-y-5 order-1 lg:order-2 lg:sticky lg:top-24">
          <div className={card}>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian mb-4">Visibility</h2>
            <label className={label}>Status</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => set('status', s)} className={`py-2 text-[10px] font-black uppercase tracking-[0.12em] border transition-colors ${form.status === s ? 'bg-obsidian text-cream border-obsidian' : 'bg-white border-obsidian/15 text-obsidian/55 hover:border-obsidian/40'}`}>{s}</button>
              ))}
            </div>
            <button onClick={() => set('is_featured', !form.is_featured)} className={`w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] border transition-colors ${form.is_featured ? 'bg-gold border-gold text-obsidian' : 'bg-white border-obsidian/15 text-obsidian/55 hover:border-gold/50'}`}>
              <Star size={13} className={form.is_featured ? 'fill-obsidian' : ''} /> {form.is_featured ? 'Featured' : 'Feature this event'}
            </button>
            <div className="mt-4 space-y-4">
              <div>
                <label className={label}>Guestlist mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['open', 'approval'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => set('guestlist_mode', m)} className={`py-2 text-[10px] font-black uppercase tracking-[0.12em] border transition-colors ${form.guestlist_mode === m ? 'bg-obsidian text-cream border-obsidian' : 'bg-white border-obsidian/15 text-obsidian/55'}`}>
                      {m === 'open' ? 'Open' : 'Approval'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={label}>Page theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['day', 'night'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => set('theme_mode', m)} className={`py-2 text-[10px] font-black uppercase tracking-[0.12em] border transition-colors ${form.theme_mode === m ? 'bg-obsidian text-cream border-obsidian' : 'bg-white border-obsidian/15 text-obsidian/55'}`}>
                      {m === 'day' ? 'Alabaster' : 'Velvet'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={label}>Currency</label>
                <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={input}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/35 mb-2">Preview</p>
            <div className="bg-white border border-obsidian/10 overflow-hidden">
              <div className="relative aspect-[16/10] bg-paper">
                {form.cover_image && <img src={form.cover_image} alt="" className="w-full h-full object-cover" />}
                <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-[0.2em] text-white drop-shadow">{CATEGORY_LABELS[form.category]}</span>
                {form.is_featured && <span className="absolute top-2 right-2 bg-gold text-obsidian text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1">Featured</span>}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl italic text-obsidian leading-tight">{form.title || 'Untitled'}</h3>
                {form.tagline && <p className="text-obsidian/45 text-xs mt-0.5 line-clamp-1">{form.tagline}</p>}
                <div className="flex items-center gap-1.5 text-obsidian/55 text-xs mt-2"><MapPin size={11} className="text-gold-dark" /> {form.venue ? form.venue + ', ' : ''}{form.city || '—'}</div>
                <div className="border-t border-obsidian/10 mt-3 pt-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/50">
                  {minPrice != null ? <>From <span className="text-gold-dark">{priceLabel(minPrice, form.currency)}</span></> : 'No tickets yet'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div className="fixed bottom-0 inset-x-0 lg:left-56 z-30 bg-white/95 backdrop-blur border-t border-obsidian/10 px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
          <p className="text-obsidian/55 text-sm">You have unsaved changes.</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setForm(original)} className="text-obsidian/50 hover:text-obsidian text-[11px] font-black uppercase tracking-[0.15em] px-3 py-2.5">Discard</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] px-5 py-2.5 transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Ticket tier manager ─── */
function TierManager({ eventId, currency, tiers, setTiers, flash }: {
  eventId: string; currency: string; tiers: Tier[];
  setTiers: React.Dispatch<React.SetStateAction<Tier[]>>;
  flash: (k: 'ok' | 'err', m: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  async function addTier() {
    setAdding(true);
    try {
      const res = await fetch(`/api/events/${eventId}/tickets`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New tier', price: 0, quantity: 100, max_per_order: 10 }),
      });
      const d = await res.json();
      if (!res.ok) { flash('err', d.error || 'Could not add tier.'); return; }
      setTiers((t) => [...t, d]);
    } catch { flash('err', 'Could not connect.'); } finally { setAdding(false); }
  }

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian flex items-center gap-2"><Ticket size={14} className="text-gold-dark" /> Ticket tiers</h2>
        <button onClick={addTier} disabled={adding} className="inline-flex items-center gap-1.5 text-[#a07c28] hover:text-gold text-[10px] font-black uppercase tracking-[0.15em] disabled:opacity-60">
          {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add tier
        </button>
      </div>
      {tiers.length === 0 ? (
        <p className="text-obsidian/35 text-sm">No tiers yet — add one so people can buy.</p>
      ) : (
        <div className="space-y-3">
          {tiers.map((t) => <TierRow key={t.id} tier={t} currency={currency} setTiers={setTiers} flash={flash} />)}
        </div>
      )}
    </div>
  );
}

function TierRow({ tier, currency, setTiers, flash }: {
  tier: Tier; currency: string;
  setTiers: React.Dispatch<React.SetStateAction<Tier[]>>;
  flash: (k: 'ok' | 'err', m: string) => void;
}) {
  const [draft, setDraft] = useState({
    name: tier.name, description: tier.description ?? '', price: String(tier.price),
    quantity: String(tier.quantity), max_per_order: String(tier.max_per_order),
    perks: (tier.perks ?? []).join(', '), is_active: tier.is_active,
  });
  const [busy, setBusy] = useState(false);

  const dirty = draft.name !== tier.name || draft.description !== (tier.description ?? '') ||
    draft.price !== String(tier.price) || draft.quantity !== String(tier.quantity) ||
    draft.max_per_order !== String(tier.max_per_order) || draft.perks !== (tier.perks ?? []).join(', ') ||
    draft.is_active !== tier.is_active;

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/ticket-types/${tier.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name, description: draft.description, price: Number(draft.price) || 0,
          quantity: Number(draft.quantity) || 0, max_per_order: Number(draft.max_per_order) || 1,
          perks: draft.perks ? draft.perks.split(',').map((s) => s.trim()).filter(Boolean) : [],
          is_active: draft.is_active,
        }),
      });
      const d = await res.json();
      if (!res.ok) { flash('err', d.error || 'Save failed.'); return; }
      setTiers((list) => list.map((x) => (x.id === tier.id ? d : x)));
      flash('ok', 'Tier saved.');
    } catch { flash('err', 'Could not connect.'); } finally { setBusy(false); }
  }

  async function del() {
    if (!confirm(`Delete the "${tier.name}" tier?`)) return;
    const res = await fetch(`/api/ticket-types/${tier.id}`, { method: 'DELETE' });
    const d = await res.json();
    if (!res.ok) { flash('err', d.error || 'Delete failed.'); return; }
    setTiers((list) => list.filter((x) => x.id !== tier.id));
  }

  const tInput = 'w-full bg-white border border-obsidian/15 focus:border-gold text-obsidian text-sm py-2 px-2.5 outline-none focus:ring-0';
  const tLabel = 'text-[8px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1';

  return (
    <div className={`border p-4 transition-colors ${draft.is_active ? 'border-obsidian/12' : 'border-obsidian/8 bg-paper/60'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg italic text-obsidian">{tier.name}</span>
          <span className="text-[9px] font-black uppercase tracking-wider text-obsidian/40">{tier.sold}/{tier.quantity} sold</span>
        </div>
        <div className="flex items-center gap-1">
          <button title={draft.is_active ? 'Active' : 'Hidden'} onClick={() => setDraft((d) => ({ ...d, is_active: !d.is_active }))} className="p-1.5 text-obsidian/40 hover:text-[#a07c28]">
            {draft.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button title="Delete tier" onClick={del} className="p-1.5 text-obsidian/40 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-1"><label className={tLabel}>Name</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={tInput} /></div>
        <div><label className={tLabel}>Price ({currency})</label><input type="number" min="0" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={tInput} /></div>
        <div><label className={tLabel}>Quantity</label><input type="number" min={tier.sold} value={draft.quantity} onChange={(e) => setDraft({ ...draft, quantity: e.target.value })} className={tInput} /></div>
        <div><label className={tLabel}>Max / order</label><input type="number" min="1" value={draft.max_per_order} onChange={(e) => setDraft({ ...draft, max_per_order: e.target.value })} className={tInput} /></div>
        <div className="col-span-2 sm:col-span-4"><label className={tLabel}>Description</label><input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={tInput} /></div>
        <div className="col-span-2 sm:col-span-4"><label className={tLabel}>Perks (comma separated)</label><input value={draft.perks} onChange={(e) => setDraft({ ...draft, perks: e.target.value })} placeholder="Skip the line, Free drink" className={tInput} /></div>
      </div>
      {dirty && (
        <div className="flex justify-end mt-3">
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-gold hover:bg-gold-light text-obsidian text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 transition-colors disabled:opacity-60">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save tier
          </button>
        </div>
      )}
    </div>
  );
}
