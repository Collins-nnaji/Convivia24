'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function VenuesPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fd.get('email'),
          fullName: fd.get('name'),
          company: `${fd.get('venue')} · ${fd.get('area')}`,
          source: 'footer',
        }),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="relative h-44 sm:h-56 overflow-hidden">
        <img src="/The Spaces2.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-obsidian/50 to-obsidian/40" />
        <div className="absolute bottom-0 inset-x-0 max-w-3xl mx-auto px-5 sm:px-8 pb-6">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-2">For venues</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Clubs &amp; lounges</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <p className="text-obsidian/55 leading-relaxed mb-10 max-w-lg">
          Stock the night without the storeroom headache. Convivia24 drops Champagne, spirits, and mixers to your
          floor — or lets guests order to their table via Party Crews.
        </p>

        {sent ? (
          <div className="bg-white border border-obsidian/8 p-8 shadow-sm">
            <p className="font-semibold text-obsidian mb-2">Thanks — we&apos;ll be in touch.</p>
            <Link href="/shop" className="inline-flex items-center gap-1 text-ember text-sm font-medium mt-2">
              Browse the catalog <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 bg-white border border-obsidian/8 p-6 sm:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Your name
                </label>
                <input
                  name="name"
                  required
                  className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                Venue name
              </label>
              <input
                name="venue"
                required
                className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                Area
              </label>
              <input
                name="area"
                className="w-full border-0 border-b border-obsidian/15 focus:border-ember focus:ring-0 text-sm py-2"
                placeholder="VI, Lekki, Ikeja…"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-obsidian/40 block mb-1">
                What do you need?
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full border border-obsidian/10 focus:border-ember focus:ring-0 text-sm p-3 mt-1"
                placeholder="Weekly restocks, table-side ordering, event nights…"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Inquire'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
