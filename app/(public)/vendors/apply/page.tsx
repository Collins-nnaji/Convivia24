'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Store, Loader2 } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS } from '@/lib/vendors';

const CURRENCIES = ['NGN', 'GBP', 'USD', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD', 'AED'];

const inputCls = 'w-full bg-white border border-obsidian/15 focus:border-gold text-obsidian text-sm py-2.5 px-3 placeholder-obsidian/30 outline-none focus:ring-0 transition-colors';
const labelCls = 'text-[9px] font-black uppercase tracking-[0.25em] text-gold-dark block mb-1.5';

const BLANK = {
  business_name: '', category: 'catering', contact_name: '', email: '', phone: '',
  whatsapp: '', website: '', instagram: '', city: '', country: '', description: '',
  services: '', price_from: '', currency: 'NGN', logo_url: '',
};

export default function VendorApplyPage() {
  const [form, setForm] = useState({ ...BLANK });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.business_name.trim() || !form.email.trim()) {
      setError('Business name and a contact email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not submit your listing.'); return; }
      setDone(data.message || 'Your listing has been submitted for review.');
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="bg-paper min-h-screen py-16 sm:py-24">
        <div className="max-w-md mx-auto px-5 sm:px-8 text-center">
          <CheckCircle2 size={44} className="text-emerald-600 mx-auto mb-5" />
          <h1 className="font-display text-4xl sm:text-5xl font-light italic text-obsidian tracking-tight mb-3">You&apos;re on the list.</h1>
          <p className="text-obsidian/55 mb-8 leading-relaxed">{done}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setForm({ ...BLANK }); setDone(null); }}
              className="inline-flex items-center justify-center gap-2 border border-obsidian/15 text-obsidian/70 text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3.5 hover:border-gold transition-colors"
            >
              Add another vendor
            </button>
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-7 py-3.5 transition-colors">
              Back to Convivia24
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <SectionLabel>For event vendors &amp; suppliers</SectionLabel>
        <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight mb-3">List your services.</h1>
        <p className="text-obsidian/55 mb-10 leading-relaxed max-w-2xl">
          Caterers, photographers, DJs, décor, security, venues and more — join the Convivia24 vendor directory.
          Approved listings are visible to our event organisers, who can reach out to book you for their events.
        </p>

        <form onSubmit={submit} className="space-y-10">
          {/* BUSINESS */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Store size={18} className="text-gold-dark" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian">Your business</p>
            </div>
            <div>
              <label className={labelCls}>Business name *</label>
              <input value={form.business_name} onChange={(e) => set('business_name', e.target.value)} placeholder="e.g. Golden Spoon Catering" className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Service category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={`${inputCls} bg-white`}>
                  {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{VENDOR_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Contact person</label>
                <input value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} placeholder="Who should we ask for?" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>What you offer</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Tell organisers what makes your service stand out…" className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Key services (comma separated)</label>
              <input value={form.services} onChange={(e) => set('services', e.target.value)} placeholder="Buffet, Small chops, Live cooking station" className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Starting price (optional)</label>
                <input type="number" min="0" value={form.price_from} onChange={(e) => set('price_from', e.target.value)} placeholder="e.g. 150000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={`${inputCls} bg-white`}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* CONTACT & REACH */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-obsidian">How organisers reach you</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="bookings@yourbrand.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234 …" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+234 …" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Instagram</label>
                <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@yourbrand" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Logo / photo URL</label>
                <input value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} placeholder="https://… (optional)" className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className={labelCls}>City</label><input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Lagos" className={inputCls} /></div>
              <div><label className={labelCls}>Country</label><input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Nigeria" className={inputCls} /></div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] px-7 py-3.5 transition-colors disabled:opacity-60">
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit listing'}
            </button>
            <p className="text-obsidian/40 text-xs">We review every listing before it goes live.</p>
          </div>
        </form>
      </div>
    </section>
  );
}
