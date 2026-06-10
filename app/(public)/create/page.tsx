'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Trash2, Wand2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';
import { useUser } from '@/components/auth/AuthProvider';

interface Tier { name: string; description: string; price: string; quantity: string; max_per_order: string; perks: string }

const BLANK_TIER: Tier = { name: '', description: '', price: '', quantity: '100', max_per_order: '10', perks: '' };

export default function CreateEventPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [form, setForm] = useState({
    title: '', tagline: '', description: '', category: 'party', organizer_name: '',
    venue: '', city: '', country: '', starts_at: '', ends_at: '',
    currency: 'NGN', capacity: '', age_restriction: '', lineup: '', cover_image: '',
  });
  const [tiers, setTiers] = useState<Tier[]>([{ ...BLANK_TIER, name: 'General', price: '10000' }]);
  const [aiVibe, setAiVibe] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(key: K, value: string) { setForm((f) => ({ ...f, [key]: value })); }
  function setTier(i: number, key: keyof Tier, value: string) {
    setTiers((t) => t.map((tier, idx) => (idx === i ? { ...tier, [key]: value } : tier)));
  }

  async function runAI() {
    if (!form.title.trim()) { setError('Add a working title before using the AI builder.'); return; }
    setAiLoading(true); setError(''); setAiNote('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, category: form.category, city: form.city, venue: form.venue, vibe: aiVibe }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'AI could not generate copy.'); return; }
      setForm((f) => ({
        ...f,
        tagline: data.tagline || f.tagline,
        description: data.description || f.description,
        lineup: Array.isArray(data.lineup_ideas) ? data.lineup_ideas.join(', ') : f.lineup,
      }));
      if (Array.isArray(data.ticket_suggestions) && data.ticket_suggestions.length) {
        setTiers(data.ticket_suggestions.map((s: { name: string; note?: string }, i: number) => ({
          ...BLANK_TIER,
          name: s.name || `Tier ${i + 1}`,
          description: s.note || '',
          price: String([8000, 15000, 50000][i] ?? 10000),
        })));
      }
      setAiNote(data.fallback ? 'Drafted with a starter template (add AI keys for richer copy).' : 'AI draft ready — tweak anything below.');
    } catch {
      setError('AI request failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.description.trim() || !form.starts_at) {
      setError('Title, description and start date/time are required.'); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
        lineup: form.lineup ? form.lineup.split(',').map((s) => s.trim()).filter(Boolean) : null,
        ai_generated: !!aiNote,
        status: 'published',
        ticket_types: tiers.filter((t) => t.name.trim()).map((t) => ({
          name: t.name, description: t.description, price: Number(t.price) || 0,
          quantity: Number(t.quantity) || 100, max_per_order: Number(t.max_per_order) || 10,
          perks: t.perks ? t.perks.split(',').map((s) => s.trim()).filter(Boolean) : null,
        })),
      };
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not create the event.'); return; }
      router.push(`/events/${data.slug}`);
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full bg-white border-b border-obsidian/20 focus:border-gold text-obsidian text-sm py-2.5 px-3 placeholder-obsidian/30 outline-none focus:ring-0';
  const labelCls = 'text-[9px] font-black uppercase tracking-[0.25em] text-gold-dark block mb-1.5';

  if (!authLoading && !user) {
    return (
      <section className="bg-paper min-h-screen py-16 sm:py-24">
        <div className="max-w-md mx-auto px-5 sm:px-8 text-center">
          <SectionLabel>Sell Tickets</SectionLabel>
          <h1 className="font-display text-4xl sm:text-5xl font-light italic text-obsidian tracking-tight mb-3">List your event.</h1>
          <p className="text-obsidian/55 mb-8">Sign in to create events and sell tickets on Convivia24.</p>
          <Link href="/signin?next=/create" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-7 py-3.5 transition-colors">
            Sign in to continue
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <SectionLabel>Sell Tickets</SectionLabel>
        <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight mb-3">List your event.</h1>
        <p className="text-obsidian/55 mb-10 leading-relaxed">Give it a title, let the AI co-pilot draft the rest, then publish. Your tickets go live instantly with QR + barcode entry.</p>

        <form onSubmit={submit} className="space-y-10">
          {/* BASICS */}
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Event title *</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Lagos After Dark" className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={`${inputCls} bg-white`}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-white">{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Organizer name</label>
                <input value={form.organizer_name} onChange={(e) => set('organizer_name', e.target.value)} placeholder="Your brand" className={inputCls} />
              </div>
            </div>
          </div>

          {/* AI BUILDER */}
          <div className="border border-gold/25 bg-gold/5 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 size={18} className="text-gold-dark" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian">AI Event Builder</p>
            </div>
            <p className="text-obsidian/55 text-sm mb-4">Describe the vibe in a few words and let AI write your tagline, description, lineup and ticket tiers.</p>
            <input value={aiVibe} onChange={(e) => setAiVibe(e.target.value)} placeholder="e.g. rooftop Afrobeats party, dress code, 600 capacity" className={`${inputCls} mb-4`} />
            <button type="button" onClick={runAI} disabled={aiLoading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors disabled:opacity-60">
              <Sparkles size={14} /> {aiLoading ? 'Drafting…' : 'Generate with AI'}
            </button>
            {aiNote && <p className="text-gold-dark text-xs mt-3">{aiNote}</p>}
          </div>

          {/* DETAILS */}
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Tagline</label>
              <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="One punchy line" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description *</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Sell the night…" className={`${inputCls} resize-none`} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className={labelCls}>Venue</label><input value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="The venue name" className={inputCls} /></div>
              <div><label className={labelCls}>City *</label><input required value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Any city in the world" className={inputCls} /></div>
              <div><label className={labelCls}>Country</label><input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" className={inputCls} /></div>
              <div><label className={labelCls}>Starts *</label><input type="datetime-local" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Ends</label><input type="datetime-local" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Currency</label>
                <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={`${inputCls} bg-white`}>
                  {['NGN', 'GBP', 'USD', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD', 'AED'].map((c) => <option key={c} className="bg-white">{c}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Age restriction</label><input value={form.age_restriction} onChange={(e) => set('age_restriction', e.target.value)} placeholder="18+" className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Lineup (comma separated)</label><input value={form.lineup} onChange={(e) => set('lineup', e.target.value)} placeholder="DJ One, Special Guest" className={inputCls} /></div>
            <div><label className={labelCls}>Cover image URL (optional)</label><input value={form.cover_image} onChange={(e) => set('cover_image', e.target.value)} placeholder="/Convivium.png or https://…" className={inputCls} /></div>
          </div>

          {/* TICKET TIERS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian">Ticket tiers</p>
              <button type="button" onClick={() => setTiers((t) => [...t, { ...BLANK_TIER }])} className="inline-flex items-center gap-1.5 text-gold-dark hover:text-gold text-[10px] font-black uppercase tracking-[0.2em]">
                <Plus size={13} /> Add tier
              </button>
            </div>
            <div className="space-y-4">
              {tiers.map((t, i) => (
                <div key={i} className="border border-obsidian/12 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold-dark">Tier {i + 1}</span>
                    {tiers.length > 1 && (
                      <button type="button" onClick={() => setTiers((ts) => ts.filter((_, idx) => idx !== i))} className="text-obsidian/30 hover:text-red-400"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Name</label><input value={t.name} onChange={(e) => setTier(i, 'name', e.target.value)} placeholder="General" className={inputCls} /></div>
                    <div><label className={labelCls}>Price ({form.currency})</label><input type="number" min="0" value={t.price} onChange={(e) => setTier(i, 'price', e.target.value)} placeholder="0 for free" className={inputCls} /></div>
                    <div><label className={labelCls}>Quantity</label><input type="number" min="1" value={t.quantity} onChange={(e) => setTier(i, 'quantity', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Max per order</label><input type="number" min="1" value={t.max_per_order} onChange={(e) => setTier(i, 'max_per_order', e.target.value)} className={inputCls} /></div>
                    <div className="sm:col-span-2"><label className={labelCls}>Description</label><input value={t.description} onChange={(e) => setTier(i, 'description', e.target.value)} placeholder="What's included" className={inputCls} /></div>
                    <div className="sm:col-span-2"><label className={labelCls}>Perks (comma separated)</label><input value={t.perks} onChange={(e) => setTier(i, 'perks', e.target.value)} placeholder="Skip the line, Free drink" className={inputCls} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[12px] font-black uppercase tracking-[0.2em] py-4 transition-colors disabled:opacity-60">
            {submitting ? 'Publishing…' : <>Publish event <ArrowRight size={15} /></>}
          </button>
        </form>
      </div>
    </section>
  );
}
