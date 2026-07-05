'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const INTENTS = ['A stay', 'Spa & wellness', 'A table', 'An event', 'Private hire'];

export default function InquirePage() {
  const [intent, setIntent] = useState(INTENTS[0]);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Placeholder submit — swap for POST /api/inquiries when wired up.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSent(true);
  }

  return (
    <section className="bg-paper min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-20 sm:pt-20">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="mb-10">
          <motion.div variants={fadeUp}><SectionLabel>Reservations &amp; Enquiries</SectionLabel></motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-6xl font-light brand-text leading-[0.98] mb-4">
            Let&rsquo;s plan
            <br />
            your <em className="italic">escape.</em>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-obsidian/60 max-w-lg leading-relaxed">
            Tell us what you have in mind &mdash; a night away, a treatment, a table, or a whole celebration. We reply within one working day.
          </motion.p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-cream rounded-2xl p-10 sm:p-12 text-center"
          >
            <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-gold text-obsidian mb-6">
              <Check size={26} strokeWidth={2.5} />
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-obsidian mb-3">Enquiry received</h2>
            <p className="text-obsidian/60 max-w-md mx-auto leading-relaxed">
              Thank you. A member of the Convivia24 team will be in touch within one working day to confirm the details.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-cream rounded-2xl p-7 sm:p-9 space-y-6">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/50 mb-3">I&rsquo;m enquiring about</label>
              <div className="flex flex-wrap gap-2">
                {INTENTS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIntent(opt)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      intent === opt ? 'bg-obsidian text-cream' : 'bg-paper-dark text-obsidian/60 hover:text-obsidian'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" />
              <Field label="Preferred date" name="date" type="date" />
            </div>

            <Field label="Number of guests" name="guests" type="number" />

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/50 mb-2">Tell us more</label>
              <textarea
                name="message"
                rows={4}
                placeholder="What are you planning? Anything we should know?"
                className="w-full rounded-xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian placeholder:text-obsidian/35 focus:border-gold focus:ring-gold"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-brand w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {submitting ? 'Sending…' : 'Send enquiry'} <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] font-black uppercase tracking-[0.2em] text-obsidian/50 mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian placeholder:text-obsidian/35 focus:border-gold focus:ring-gold"
      />
    </div>
  );
}
