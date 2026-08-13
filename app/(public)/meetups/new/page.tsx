'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, UserPlus, X } from 'lucide-react';
import { PriceBand } from '@/components/meetup/VenueCard';
import { VENUES, formatNaira } from '@/lib/dining/venues';
import { estimatePerHead } from '@/lib/split/compute';
import { createMeetup, newId, useContacts, useProfile } from '@/lib/meetup/store';

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
  const profile = useProfile();
  const contacts = useContacts();

  const [title, setTitle] = useState('');
  const [venueSlug, setVenueSlug] = useState(
    params.get('venue') && VENUES.some((v) => v.slug === params.get('venue'))
      ? params.get('venue')!
      : VENUES[0].slug,
  );
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState('19:30');
  const [note, setNote] = useState('');
  const [people, setPeople] = useState<Draft[]>([{ key: newId('d'), name: '', budget: '' }]);
  const [error, setError] = useState('');

  // Fill row one from the device profile once it has loaded from storage.
  useEffect(() => {
    if (!profile.name) return;
    setPeople((prev) => {
      if (prev[0].name) return prev;
      const [first, ...rest] = prev;
      return [
        { ...first, name: profile.name, budget: profile.defaultBudget ? String(profile.defaultBudget) : '' },
        ...rest,
      ];
    });
  }, [profile.name, profile.defaultBudget]);

  const venue = VENUES.find((v) => v.slug === venueSlug)!;
  const named = people.filter((p) => p.name.trim());
  const estimate = estimatePerHead(venue);

  const atTable = new Set(named.map((p) => p.name.trim().toLowerCase()));
  const suggestions = contacts.filter((c) => !atTable.has(c.name.toLowerCase())).slice(0, 6);

  function setPerson(key: string, patch: Partial<Draft>) {
    setPeople((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function addPerson(name = '', budget = '') {
    setPeople((prev) => [...prev, { key: newId('d'), name, budget }]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (named.length === 0) {
      setError('Add at least one person — someone has to eat.');
      return;
    }
    const day = new Date(`${date}T${time || '00:00'}`);
    const fallbackTitle = Number.isNaN(day.getTime())
      ? venue.name
      : `${venue.name}, ${day.toLocaleDateString('en-GB', { weekday: 'long' })}`;

    const meetup = createMeetup({
      title: title.trim() || fallbackTitle,
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
    // Row one is the person holding the phone, so their share leads the screen.
    router.push(`/meetups/${meetup.id}`);
  }

  return (
    <div className="bg-paper min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 md:pt-16 pb-[calc(7rem+env(safe-area-inset-bottom))]"
      >
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-4xl sm:text-6xl font-light italic text-obsidian tracking-tight mb-3 leading-none">
            Who is eating,<br />and where?
          </h1>
          <p className="text-obsidian/50 text-sm max-w-xl leading-relaxed mb-10">
            The order comes next. This is just the table.
          </p>
        </motion.div>

        {/* ── The place ── */}
        <Field label="The place" hint="Menus and prices come from here.">
          <div className="grid sm:grid-cols-2 gap-2.5">
            {VENUES.map((v) => {
              const selected = v.slug === venueSlug;
              return (
                <button
                  key={v.slug}
                  type="button"
                  onClick={() => setVenueSlug(v.slug)}
                  aria-pressed={selected}
                  className={`text-left p-4 border active:scale-[0.98] transition-all ${
                    selected ? 'border-gold bg-gold/10' : 'border-obsidian/10 bg-cream'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="font-display text-xl italic text-obsidian leading-none">{v.name}</span>
                    <PriceBand band={v.priceBand} className="text-obsidian shrink-0" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-obsidian/35 mb-1.5">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Input label="Date" type="date" value={date} onChange={setDate} required />
            <Input label="Time" type="time" value={time} onChange={setTime} required />
            <div className="col-span-2 sm:col-span-1">
              <Input label="What to call it" value={title} onChange={setTitle} placeholder={`${venue.name}, Friday`} />
            </div>
          </div>
        </Field>

        {/* ── The table ── */}
        <Field
          label="The table"
          hint="A budget is optional — but it is the whole point. Say it now and nobody has to say it later."
        >
          <div className="space-y-2.5">
            {people.map((p, i) => (
              <div key={p.key} className="flex gap-2 items-end">
                <div className="flex-1 min-w-0">
                  <Input
                    label={i === 0 ? 'Name' : ''}
                    value={p.name}
                    onChange={(v) => setPerson(p.key, { name: v })}
                    placeholder={i === 0 ? 'You' : 'Their name'}
                  />
                </div>
                <div className="w-28 sm:w-44">
                  <Input
                    label={i === 0 ? 'Budget' : ''}
                    value={p.budget}
                    onChange={(v) => setPerson(p.key, { budget: v })}
                    placeholder="₦"
                    inputMode="numeric"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPeople((prev) => prev.filter((x) => x.key !== p.key))}
                  disabled={people.length <= 1}
                  aria-label={`Remove ${p.name || 'person'}`}
                  className="p-3 text-obsidian/25 active:text-red-600 disabled:opacity-20 active:scale-90 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addPerson()}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold-dark active:scale-95 transition-transform pt-1"
            >
              <Plus size={14} /> Add someone
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-6 pt-5 border-t border-obsidian/10">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-obsidian/40 mb-3">
                <UserPlus size={11} className="inline mr-1.5 -mt-0.5" />
                People you have eaten with
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => addPerson(c.name, c.budget ? String(c.budget) : '')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-obsidian/20 text-obsidian/60 text-xs active:bg-obsidian active:text-cream active:scale-95 transition-all"
                  >
                    <Plus size={11} /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Field>

        {/* ── Note ── */}
        <Field label="Anything else" hint="Reservation name, who is running late, the dress code.">
          <Input label="" value={note} onChange={setNote} placeholder="Booked under Amara. Table by the rail." />
        </Field>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        {/* ── Sticky commit bar ── */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-obsidian border-t border-gold/25 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cream/35 mb-0.5">
                {named.length || 'No'} {named.length === 1 ? 'person' : 'people'} &middot; {venue.name}
              </p>
              <p className="font-display text-xl italic text-gold leading-none tabular-nums">
                ≈ {formatNaira(estimate * named.length)}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold active:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.2em] active:scale-[0.97] transition-transform shrink-0"
            >
              Build the order <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── form primitives ─────────────────────────────────────────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
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
        className="w-full bg-cream border border-obsidian/15 focus:border-gold text-obsidian placeholder:text-obsidian/25 px-4 py-3 outline-none focus:ring-0 transition-colors"
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
