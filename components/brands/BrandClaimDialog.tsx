'use client';

import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, X } from 'lucide-react';
import type { Brand } from '@/lib/brands/catalog';

/**
 * A brand asking to take over its page.
 *
 * The form records a request. It grants nothing — the copy says so plainly,
 * because a claim that looks like instant access would be a promise the
 * verification step does not keep.
 */
export default function BrandClaimDialog({ brand, onClose }: { brand: Brand; onClose: () => void }) {
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/brands/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.slug,
          contactName,
          email,
          role,
          phone,
          website,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not record your claim.');
        return;
      }
      setDone(true);
    } catch {
      setError('Could not record your claim.');
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    'w-full border border-obsidian/12 focus:border-ember focus:ring-0 text-sm py-2.5 px-3 bg-white placeholder-obsidian/25';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-obsidian/55 backdrop-blur-[2px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Claim ${brand.name}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative w-full sm:max-w-lg bg-white shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-obsidian/35 hover:text-obsidian z-10"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="p-6 sm:p-8">
            <BadgeCheck size={26} className="text-ember" />
            <h2 className="text-xl font-bold mt-3">Claim received</h2>
            <p className="text-sm text-obsidian/55 mt-2 leading-relaxed">
              We&apos;ll verify you work for {brand.name} and come back to the email you gave us. The page
              stays under Convivia24 management until that is done.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3 btn-brand text-[11px] font-black uppercase tracking-[0.14em]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ember">Brand ownership</p>
            <h2 className="text-xl font-bold mt-2">Claim {brand.name}</h2>
            <p className="text-sm text-obsidian/55 mt-2 leading-relaxed">
              This page is written and run by Convivia24. Tell us who you are at the house and we&apos;ll
              verify the claim before handing over the story, imagery and campaigns.
            </p>

            <div className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Your name</span>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className={inputClass}
                    placeholder="Ada Nwosu"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">Work email</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@brand.com"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
                    Your role <span className="text-obsidian/30 font-normal">(optional)</span>
                  </span>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={inputClass}
                    placeholder="Brand manager, West Africa"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
                    Phone <span className="text-obsidian/30 font-normal">(optional)</span>
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+234 800 000 0000"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
                  Company website <span className="text-obsidian/30 font-normal">(optional)</span>
                </span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="https://"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold text-obsidian/60 block mb-1.5">
                  Anything else <span className="text-obsidian/30 font-normal">(optional)</span>
                </span>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass}
                  placeholder="What you'd want to run on the page."
                />
              </label>
            </div>

            {error && <p className="text-sm text-ember mt-4">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="mt-6 w-full py-3.5 btn-brand text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Submit claim'}
            </button>
            <p className="text-[11px] text-obsidian/40 mt-3 leading-relaxed">
              Submitting records a request. It does not change who manages the page — we verify with the
              house first.
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
