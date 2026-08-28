'use client';

import { useState } from 'react';
import { Check, Megaphone } from 'lucide-react';
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  ENQUIRY_GOALS,
  GOAL_LABELS,
} from '@/lib/trivia/enquiries';

/**
 * Brands land on /trivia because their competitors are already there. This is the way in —
 * sponsor a round, get poured at an event, or get into a party package.
 */
export default function BrandEnquiryForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/trivia/brand-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: form.get('brand'),
          contactName: form.get('contactName'),
          email: form.get('email'),
          phone: form.get('phone'),
          goal: form.get('goal'),
          budgetBand: form.get('budgetBand'),
          message: form.get('message'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to send that enquiry.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send that enquiry.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-obsidian/20 focus:border-ember focus:ring-0 text-obsidian text-sm py-2.5 px-0 placeholder-obsidian/25';
  const labelClass = 'text-[10px] uppercase tracking-wider text-obsidian/40';

  return (
    <section id="brands" className="bg-paper border-t border-obsidian/10 py-14 sm:py-20 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-ember mb-3">
              <Megaphone size={12} /> For brands
            </p>
            <h2 className="font-wordmark text-base sm:text-lg text-obsidian mb-3">
              Put your bottle in front of people already buying one.
            </h2>
            <p className="text-sm text-obsidian/60 leading-relaxed mb-5">
              Every person here is planning a party or stocking a bar. Sponsor a trivia round, get
              poured at our events, or ride along inside a party package — and reach them at the
              moment they are choosing what to order.
            </p>
            <ul className="space-y-2.5 text-xs text-obsidian/55">
              {[
                'Sponsored rounds carry your brand story and a prize draw.',
                'Sampling and pouring slots at Convivia24 nights.',
                'Placement inside the event packages people order by name.',
                'Straight shop listing with nationwide delivery behind it.',
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-ember mt-0.5">·</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {sent ? (
            <div className="bg-white border border-obsidian/10 p-6 self-start">
              <p className="inline-flex items-center gap-2 text-ember text-[10px] uppercase tracking-wider mb-2">
                <Check size={14} /> Enquiry sent
              </p>
              <h3 className="font-semibold text-obsidian mb-2">We will be in touch.</h3>
              <p className="text-sm text-obsidian/55 leading-relaxed">
                Someone from the team will reply to the email you gave us, usually within two working
                days, with what we can do and what it costs.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white border border-obsidian/10 p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block">
                  <span className={labelClass}>Brand</span>
                  <input name="brand" required className={inputClass} placeholder="e.g. Hennessy" />
                </label>
                <label className="block">
                  <span className={labelClass}>Your name</span>
                  <input name="contactName" required className={inputClass} placeholder="Ada Nwosu" />
                </label>
                <label className="block">
                  <span className={labelClass}>Work email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                    placeholder="you@brand.com"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Phone</span>
                  <input name="phone" className={inputClass} placeholder="+234 803 000 0000" />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <label className="block">
                  <span className={labelClass}>What are you after?</span>
                  <select name="goal" defaultValue="trivia-round" className={inputClass}>
                    {ENQUIRY_GOALS.map((g) => (
                      <option key={g} value={g}>
                        {GOAL_LABELS[g]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>Budget</span>
                  <select name="budgetBand" defaultValue="unsure" className={inputClass}>
                    {BUDGET_BANDS.map((b) => (
                      <option key={b} value={b}>
                        {BUDGET_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Anything else</span>
                <textarea
                  name="message"
                  rows={3}
                  maxLength={2000}
                  className={inputClass}
                  placeholder="Campaign dates, cities, SKUs you want pushed…"
                />
              </label>

              {error && <p className="text-sm text-ember">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-brand text-[11px] font-black uppercase tracking-[0.14em] px-6 py-3 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send enquiry'}
              </button>
              <p className="text-[10px] text-obsidian/35 leading-relaxed">
                We only use these details to reply about brand promotion.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
