'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { PriceBand } from '@/components/meetup/VenueCard';
import { VENUES, formatNaira } from '@/lib/dining/venues';
import { estimatePerHead } from '@/lib/split/compute';
import { createMeetup, newId } from '@/lib/meetup/store';

interface Draft {
  key: string;
  name: string;
  budget: string;
}

/** Tomorrow evening — the most likely answer, pre-filled. */
function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function NewMeetupForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [title, setTitle] = useState('');
  const [venueSlug, setVenueSlug] = useState(
    params.get('venue') && VENUES.some((v) => v.slug === params.get('venue'))
      ? params.get('venue')!
      : VENUES[0].slug,
  );
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState('19:30');
  const [note, setNote] = useState('');
  const [people, setPeople] = useState<Draft[]>([
    { key: newId('d'), name: 'You', budget: '' },
    { key: newId('d'), name: '', budget: '' },
  ]);
  const [error, setError] = useState('');

  const venue = VENUES.find((v) => v.slug === venueSlug)!;
  const named = people.filter((p) => p.name.trim());
  const estimate = estimatePerHead(venue);

  function setPerson(key: string, patch: Partial<Draft>) {
    setPeople((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (named.length === 0) {
      setError('Add at least one person — someone has to eat.');
      return;
    }
    const meetup = createMeetup({
      title: title.trim() || `${venue.name}, ${date}`,
      venueSlug,
      date,
      time,
      note: note.trim(),
      tipPct: 0,
      attendees: named.map((p) => {
        const budget = Number(p.budget.replace(/[^0-9]/g, ''));
        return {
          id: newId('p'),
          name: p.name.trim(),
          budget: Number.isFinite(budget) && budget > 0 ? budget : undefined,
        };
      }),
    });
    router.push(`/meetups/${meetup.id}`);
  }

  return (
    <div className="bg-paper min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-20 sm:pb-28">
        <Link
          href="/meetups"
          className="flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/40 hover:text-gold-dark transition-colors mb-8"
        >
          <ArrowLeft size={12} /> Meetups
        </Link>

        <SectionLabel variant="light">New meetup</SectionLabel>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-light italic text-obsidian tracking-tight mb-3">
          Who is eating,<br />and where?
        </h1>
        <p className="text-obsidian/55 text-base max-w-xl leading-relaxed mb-12">
          The order comes next. This is just the table.
        </p>

        {/* ── The place ── */}
        <Field label="The place" hint="Menus and prices come from here.">
          <div className="grid sm:grid-cols-2 gap-3">
            {VENUES.map((v) => {
              const selected = v.slug === venueSlug;
              return (
                <button
                  key={v.slug}
                  type="button"
                  onClick={() => setVenueSlug(v.slug)}
                  aria-pressed={selected}
                  className={`text-left p-5 border transition-colors ${
                    selected
                      ? 'border-gold bg-gold/10'
                      : 'border-obsidian/10 bg-cream hover:border-obsidian/30'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="font-display text-xl italic text-obsidian leading-none">{v.name}</span>
                    <PriceBand band={v.priceBand} className="text-obsidian shrink-0" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35 mb-2">
                    {v.area} &middot; {v.cuisine}
                  </p>
                  <p className="text-obsidian/50 text-xs">
                    About {formatNaira(estimatePerHead(v))} a head, all in
                  </p>
                </button>
              );
            })}
          </div>
        </Field>

        {/* ── When ── */}
        <Field label="When">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Date" type="date" value={date} onChange={setDate} required />
            <Input label="Time" type="time" value={time} onChange={setTime} required />
            <Input
              label="What to call it"
              value={title}
              onChange={setTitle}
              placeholder={`${venue.name}, Friday`}
            />
          </div>
        </Field>

        {/* ── The table ── */}
        <Field
          label="The table"
          hint="A budget is optional — but it is the whole point. Say it now and nobody has to say it later."
        >
          <div className="space-y-3">
            {people.map((p, i) => (
              <div key={p.key} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label={i === 0 ? 'Name' : ''}
                    value={p.name}
                    onChange={(v) => setPerson(p.key, { name: v })}
                    placeholder={i === 0 ? 'You' : 'Their name'}
                  />
                </div>
                <div className="w-32 sm:w-44">
                  <Input
                    label={i === 0 ? 'Budget tonight' : ''}
                    value={p.budget}
                    onChange={(v) => setPerson(p.key, { budget: v })}
                    placeholder="₦ optional"
                    inputMode="numeric"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPeople((prev) => prev.filter((x) => x.key !== p.key))}
                  disabled={people.length <= 1}
                  aria-label={`Remove ${p.name || 'person'}`}
                  className="p-3 text-obsidian/30 hover:text-red-600 disabled:opacity-20 disabled:hover:text-obsidian/30 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setPeople((prev) => [...prev, { key: newId('d'), name: '', budget: '' }])}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark hover:text-obsidian transition-colors pt-1"
            >
              <Plus size={14} /> Add someone
            </button>
          </div>
        </Field>

        {/* ── Note ── */}
        <Field label="Anything else" hint="Reservation name, who is running late, the dress code.">
          <Input label="" value={note} onChange={setNote} placeholder="Booked under Amara. Table by the rail." />
        </Field>

        {/* ── Submit ── */}
        <div className="border-t border-obsidian/10 pt-8 mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <p className="text-obsidian/50 text-sm">
            {named.length || 'No'} {named.length === 1 ? 'person' : 'people'} at {venue.name} &mdash; roughly{' '}
            <span className="text-obsidian font-medium">{formatNaira(estimate * named.length)}</span> across the table,
            before anyone has ordered.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] transition-colors shrink-0"
          >
            Build the order <ArrowRight size={14} />
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </form>
    </div>
  );
}

/* ── form primitives ─────────────────────────────────────────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-obsidian/60 border-b border-obsidian/10 pb-2 mb-2">
        {label}
      </h2>
      {hint && <p className="text-obsidian/40 text-xs mb-4 max-w-lg">{hint}</p>}
      <div className={hint ? '' : 'mt-4'}>{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: 'numeric';
}) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/35 mb-1.5">{label}</span>
      )}
      <input
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 text-sm px-4 py-3 outline-none focus:ring-0 transition-colors"
      />
    </label>
  );
}

export default function NewMeetupPage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-screen" />}>
      <NewMeetupForm />
    </Suspense>
  );
}
