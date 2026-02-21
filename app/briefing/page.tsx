'use client';

import React, { useState } from 'react';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function BriefingPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDisabled = status === 'saving';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to save right now.');
      }

      setStatus('saved');
      setForm(INITIAL_STATE);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Request failed.');
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-black text-zinc-900">Request a follow-up</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Share your goals and we’ll route your inquiry to the right team. No chat required.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-semibold text-zinc-700">
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Your name"
                className="mt-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none"
              />
            </label>
            <label className="flex flex-col text-sm font-semibold text-zinc-700">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="you@email.com"
                required
                className="mt-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none"
              />
            </label>
          </div>
          <label className="flex flex-col text-sm font-semibold text-zinc-700">
            Subject
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              disabled={isDisabled}
              placeholder="Summary of what you’d like to discuss"
              className="mt-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-sm font-semibold text-zinc-700">
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              disabled={isDisabled}
              required
              rows={4}
              placeholder="How can we help you?"
              className="mt-1 min-h-[140px] rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none resize-none"
            />
          </label>
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={isDisabled}
              className="inline-flex items-center justify-center rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              {status === 'saving' ? 'Saving…' : 'Send inquiry'}
            </button>
            {status === 'saved' && (
              <p className="text-xs uppercase tracking-wide text-red-700">Message saved—expect follow-up soon.</p>
            )}
            {status === 'error' && (
              <p className="text-xs uppercase tracking-wide text-red-700">
                Error saving your message{errorMessage ? `: ${errorMessage}` : '.'}
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
