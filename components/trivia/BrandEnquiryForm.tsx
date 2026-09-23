'use client';

import { useState } from 'react';
import { Check, ChevronDown, Megaphone } from 'lucide-react';
import {
  BUDGET_BANDS,
  BUDGET_LABELS,
  ENQUIRY_GOALS,
  GOAL_LABELS,
} from '@/lib/trivia/enquiries';

/**
 * Commercial enquiry form on the Brands page — closed by default so the directory
 * stays the focus; open it when a brand wants to sponsor a round.
 */
export default function BrandEnquiryForm() {
  const [open, setOpen] = useState(false);
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
    <section id="brands-enquiry" className="rounded-2xl border border-obsidian/10 bg-white scroll-mt-20">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-5 py-5 text-left sm:px-7 sm:py-6"
      >
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/8 text-ember">
          <Megaphone size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-ember">For brands</span>
          <span className="mt-1 block font-wordmark text-xl text-obsidian sm:text-2xl">Sponsor a round</span>
          <span className="mt-1.5 block text-[14px] leading-relaxed text-obsidian/55">
            Trivia week, prize bottle, campaign page — reach people while they are choosing what to order.
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`mt-1 shrink-0 text-obsidian/35 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-obsidian/8 px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
          {sent ? (
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-ember text-[10px] uppercase tracking-wider mb-2">
                <Check size={14} /> Enquiry sent
              </p>
              <h3 className="font-semibold text-obsidian mb-2">We will be in touch.</h3>
              <p className="text-sm text-obsidian/55 leading-relaxed">
                Someone from the team will reply to the email you gave us, usually within two working days,
                with what we can do and what it costs.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="max-w-2xl space-y-5">
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
      )}
    </section>
  );
}
